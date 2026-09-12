'use client';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Alert,
  Paper,
  Stack,
  Table,
  Button,
  Divider,
  Checkbox,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  ToggleButton,
  DialogActions,
  TableContainer,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';

import {
  formatGrNumber,
  findOnboardingProfile,
  isAssignmentModeAllowed,
  getDefaultAssignmentMode,
  isApprovalTriggerRequired,
  defaultOnboardingSettings,
  getDivisionAssignmentMode,
  getEffectiveReadinessRules,
  isGrConfigurationApplicable,
  findRollNumberConfiguration,
  findDivisionChangeConfiguration,
} from '../onboarding-settings-model';

import type { StudentOnboardingItem } from './student-onboarding-model';
import type {
  DivisionChangeRules,
  RollNumberConfiguration,
  DivisionChangeConfiguration,
  OnboardingConfigurationScope,
  OnboardingSettingsConfiguration,
} from '../onboarding-settings-model';

export type StudentAssignmentType = 'division' | 'gr-number' | 'roll-number';

type AssignmentMode = 'automatic' | 'manual';

type StudentAssignmentDialogProps = {
  assignmentType: StudentAssignmentType | null;
  students: StudentOnboardingItem[];
  configuration?: OnboardingSettingsConfiguration;
  configurationScope?: OnboardingConfigurationScope;
  onClose: () => void;
};

const assignmentMeta: Record<
  StudentAssignmentType,
  { title: string; singularLabel: string; icon: string; helpText: string }
> = {
  division: {
    title: 'Assign Division',
    singularLabel: 'Division',
    icon: 'mdi:google-classroom',
    helpText: 'Review capacity and placement before confirming a division assignment.',
  },
  'gr-number': {
    title: 'Assign GR No.',
    singularLabel: 'GR No.',
    icon: 'mdi:identifier',
    helpText: 'Use the published identifier series or enter an authorized manual value.',
  },
  'roll-number': {
    title: 'Assign Roll No.',
    singularLabel: 'Roll No.',
    icon: 'mdi:format-list-numbered',
    helpText: 'Apply the configured class ordering rule or enter student-wise roll numbers.',
  },
};

const fallbackDivisionOptions = ['A', 'B', 'C'];

type DivisionCapacityStatus = 'eligible' | 'warning' | 'approval' | 'blocked';

const getDivisionOptions = (student: StudentOnboardingItem) =>
  student.divisionPlacementOptions?.map((option) => option.divisionName) ?? fallbackDivisionOptions;

const buildAutomaticDivisionValues = (
  students: StudentOnboardingItem[],
  rules: DivisionChangeRules
) => {
  const proposedValues: Record<string, string> = {};
  const groupCounts = new Map<string, Map<string, number>>();

  students.forEach((student) => {
    const options =
      student.divisionPlacementOptions ??
      fallbackDivisionOptions.map((divisionName) => ({
        divisionName,
        currentStudentCount: 0,
        capacity: null,
      }));
    const counts =
      groupCounts.get(student.standardName) ??
      new Map(options.map((option) => [option.divisionName, option.currentStudentCount]));
    groupCounts.set(student.standardName, counts);
    const sorted = [...options].sort(
      (first, second) =>
        (counts.get(first.divisionName) ?? first.currentStudentCount) -
        (counts.get(second.divisionName) ?? second.currentStudentCount)
    );
    const hasSeat = (option: (typeof options)[number]) =>
      option.capacity === null ||
      (counts.get(option.divisionName) ?? option.currentStudentCount) < option.capacity;
    const available = sorted.filter(hasSeat);
    const candidates = available.length ? available : sorted;
    let selected = candidates[0];

    if (rules.automaticStrategy === 'sequential' || rules.automaticStrategy === 'next-available') {
      selected = options.find(hasSeat) ?? sorted[0];
    } else if (rules.automaticStrategy === 'preserve-preferred') {
      selected =
        options.find(
          (option) => option.divisionName === student.preferredDivisionName && hasSeat(option)
        ) ?? candidates[0];
    } else if (rules.automaticStrategy === 'balance-tolerance') {
      const minimumCount = counts.get(sorted[0]?.divisionName) ?? 0;
      const withinTolerance = candidates.filter(
        (option) =>
          (counts.get(option.divisionName) ?? option.currentStudentCount) <=
          minimumCount + rules.balanceTolerance
      );
      selected =
        withinTolerance.find((option) => option.divisionName === student.preferredDivisionName) ??
        withinTolerance[0] ??
        candidates[0];
    }

    const divisionName = selected?.divisionName ?? '';
    proposedValues[student.id] = divisionName;
    if (divisionName) counts.set(divisionName, (counts.get(divisionName) ?? 0) + 1);
  });

  return proposedValues;
};

const buildDivisionCapacityStatuses = (
  students: StudentOnboardingItem[],
  proposedValues: Record<string, string>,
  rules: DivisionChangeRules
) => {
  const statuses = new Map<string, DivisionCapacityStatus>();
  const assignedCounts = new Map<string, number>();

  students.forEach((student) => {
    const divisionName = String(proposedValues[student.id] ?? '');
    const option = student.divisionPlacementOptions?.find(
      (item) => item.divisionName === divisionName
    );
    const groupKey = `${student.standardName}-${divisionName}`;
    const assignmentOffset = assignedCounts.get(groupKey) ?? 0;
    assignedCounts.set(groupKey, assignmentOffset + 1);

    if (!option || option.capacity === null) {
      statuses.set(student.id, rules.capacityRequired ? 'blocked' : 'eligible');
      return;
    }

    const projectedCount = option.currentStudentCount + assignmentOffset + 1;
    if (projectedCount > option.capacity) {
      statuses.set(student.id, rules.overCapacityBehavior === 'block' ? 'blocked' : 'approval');
      return;
    }

    const remainingSeats = option.capacity - projectedCount;
    statuses.set(
      student.id,
      remainingSeats <= rules.capacityWarningThreshold ? 'warning' : 'eligible'
    );
  });

  return statuses;
};

const getCurrentValue = (student: StudentOnboardingItem, type: StudentAssignmentType) => {
  if (type === 'division') return student.divisionName;
  if (type === 'gr-number') return student.grNo ?? student.grPreview ?? '';
  return student.rollNo ?? '';
};

const buildManualValues = (
  students: StudentOnboardingItem[],
  type: StudentAssignmentType
): Record<string, string> =>
  Object.fromEntries(
    students.map((student) => [student.id, String(getCurrentValue(student, type) ?? '')])
  );

const resolveRollRule = (
  configurations: RollNumberConfiguration[],
  student: StudentOnboardingItem
) =>
  findRollNumberConfiguration(
    configurations,
    student.standardName,
    undefined,
    student.boardId ?? undefined,
    student.standardId ?? undefined
  );

const resolveDivisionRule = (
  configurations: DivisionChangeConfiguration[],
  student: StudentOnboardingItem
) =>
  findDivisionChangeConfiguration(
    configurations,
    student.standardName,
    undefined,
    student.boardId ?? undefined,
    student.standardId ?? undefined
  );

export default function StudentAssignmentDialog({
  assignmentType,
  students,
  configuration = defaultOnboardingSettings,
  configurationScope,
  onClose,
}: StudentAssignmentDialogProps) {
  const [mode, setMode] = useState<AssignmentMode>('automatic');
  const [confirmed, setConfirmed] = useState(false);
  const [manualValues, setManualValues] = useState<Record<string, string>>({});
  const [rollLocks, setRollLocks] = useState<Record<string, boolean>>({});
  const [identifierSeriesId, setIdentifierSeriesId] = useState(
    configuration.grNumber.configurations[0]?.id ?? ''
  );
  const [manualReason, setManualReason] = useState('');

  const applicableGrConfigurations = useMemo(
    () =>
      configuration.grNumber.configurations
        .filter((item) =>
          students.every((student) => {
            const profile = findOnboardingProfile(
              configuration.onboardingProfiles,
              student.admissionRoute
            );
            return isGrConfigurationApplicable(
              item,
              profile?.id,
              undefined,
              student.boardId ?? undefined
            );
          })
        )
        .sort(
          (first, second) =>
            Number(second.boardMode === 'selected') - Number(first.boardMode === 'selected')
        ),
    [configuration.grNumber.configurations, configuration.onboardingProfiles, students]
  );
  const selectedGrConfiguration =
    applicableGrConfigurations.find((item) => item.id === identifierSeriesId) ??
    applicableGrConfigurations[0];

  const applicableDivisionConfigurations = useMemo(
    () =>
      Array.from(
        new Map(
          students.map((student) => {
            const rule = resolveDivisionRule(configuration.divisionChange.configurations, student);
            return [rule.id, rule];
          })
        ).values()
      ),
    [configuration.divisionChange.configurations, students]
  );

  const assignmentPolicy =
    assignmentType === 'division'
      ? getDivisionAssignmentMode(applicableDivisionConfigurations)
      : assignmentType === 'gr-number'
        ? configuration.grNumber.assignmentMode
        : configuration.rollNumber.assignmentMode;

  useEffect(() => {
    if (!assignmentType) return;
    setMode(getDefaultAssignmentMode(assignmentPolicy));
    setConfirmed(false);
    setManualReason('');
    setManualValues(buildManualValues(students, assignmentType));
    setRollLocks(
      Object.fromEntries(students.map((student) => [student.id, Boolean(student.rollNumberLocked)]))
    );
    setIdentifierSeriesId((current) =>
      applicableGrConfigurations.some((item) => item.id === current)
        ? current
        : (applicableGrConfigurations[0]?.id ?? '')
    );
  }, [applicableGrConfigurations, assignmentPolicy, assignmentType, students]);

  const automaticDivisionValues = useMemo(() => {
    const groupedStudents = new Map<
      string,
      { rule: DivisionChangeConfiguration; students: StudentOnboardingItem[] }
    >();
    students.forEach((student) => {
      const rule = resolveDivisionRule(configuration.divisionChange.configurations, student);
      const group = groupedStudents.get(rule.id) ?? { rule, students: [] };
      groupedStudents.set(rule.id, { ...group, students: [...group.students, student] });
    });

    return Object.assign(
      {},
      ...Array.from(groupedStudents.values()).map(({ rule, students: ruleStudents }) =>
        buildAutomaticDivisionValues(ruleStudents, rule)
      )
    ) as Record<string, string>;
  }, [configuration.divisionChange.configurations, students]);

  const automaticValues = useMemo(() => {
    if (!assignmentType) return {};

    if (assignmentType === 'roll-number') {
      const groupedStudents = new Map<
        string,
        { configuration: RollNumberConfiguration; students: StudentOnboardingItem[] }
      >();

      students.forEach((student) => {
        const rollConfiguration = resolveRollRule(
          configuration.rollNumber.configurations,
          student
        );
        const groupKey =
          rollConfiguration.numberingScope === 'class'
            ? `${rollConfiguration.id}-${student.standardName}`
            : `${rollConfiguration.id}-${student.standardName}-${student.divisionName}`;
        const group = groupedStudents.get(groupKey) ?? {
          configuration: rollConfiguration,
          students: [],
        };
        groupedStudents.set(groupKey, { ...group, students: [...group.students, student] });
      });

      const proposedRollNumbers: Record<string, string> = {};

      groupedStudents.forEach(({ configuration: rollConfiguration, students: groupStudents }) => {
        const orderingRules = rollConfiguration.orderingRules.length
          ? rollConfiguration.orderingRules
          : [
              {
                field: rollConfiguration.arrangeBy,
                direction: rollConfiguration.arrangeType,
              },
            ];
        const getArrangeValue = (student: StudentOnboardingItem, field: string) => {
          if (field === 'admissionDate') return student.admissionDate ?? '';
          if (field === 'admissionNumber') return student.applicationNumber;
          if (field === 'grNumber') return String(student.grNo ?? student.grPreview ?? '');
          return student.studentName;
        };
        const orderedStudents = [...groupStudents].sort((first, second) => {
          const comparison = orderingRules.reduce((resolvedResult, rule) => {
            if (resolvedResult) return resolvedResult;
            const ruleResult = getArrangeValue(first, rule.field).localeCompare(
              getArrangeValue(second, rule.field),
              undefined,
              { numeric: true, sensitivity: 'base' }
            );
            return rule.direction === 'descending' ? -ruleResult : ruleResult;
          }, 0);
          return comparison || first.id.localeCompare(second.id);
        });
        let nextRollNumber = rollConfiguration.startingNumber;
        const recalculateForMidYear =
          rollConfiguration.midYearHandling === 'insert-and-recalculate' &&
          groupStudents.some((student) => student.admissionRoute === 'Mid-year admission');

        if (rollConfiguration.preserveExisting && !recalculateForMidYear) {
          groupStudents.forEach((student) => {
            if (student.rollNo === undefined || student.rollNo === null) return;
            nextRollNumber = Math.max(nextRollNumber, student.rollNo + 1);
          });
        }

        orderedStudents.forEach((student) => {
          const isLocked =
            rollLocks[student.id] && student.rollNo !== null && student.rollNo !== undefined;
          const requiresManualMidYear =
            student.admissionRoute === 'Mid-year admission' &&
            rollConfiguration.midYearHandling === 'manual';
          if (requiresManualMidYear) {
            proposedRollNumbers[student.id] = '';
            return;
          }
          if (
            (isLocked || (rollConfiguration.preserveExisting && !recalculateForMidYear)) &&
            student.rollNo !== undefined &&
            student.rollNo !== null
          ) {
            proposedRollNumbers[student.id] = String(student.rollNo);
            return;
          }

          proposedRollNumbers[student.id] = String(nextRollNumber);
          nextRollNumber += 1;
        });
      });

      return proposedRollNumbers;
    }

    let nextGrOffset = 0;

    return Object.fromEntries(
      students.map((student) => {
        if (assignmentType === 'division') {
          return [student.id, automaticDivisionValues[student.id] ?? ''];
        }
        if (assignmentType === 'gr-number') {
          if (student.grNo || student.grPreview) {
            return [student.id, String(student.grNo ?? student.grPreview)];
          }
          const nextNumber = selectedGrConfiguration
            ? selectedGrConfiguration.startingNumber + nextGrOffset
            : null;
          if (
            nextNumber === null ||
            (selectedGrConfiguration.maximumNumber !== null &&
              nextNumber > selectedGrConfiguration.maximumNumber)
          ) {
            return [student.id, ''];
          }
          const value = formatGrNumber(selectedGrConfiguration, nextGrOffset, {
            academicYearName: configurationScope?.academicYearName,
            schoolCode: configurationScope?.schoolCode,
          });
          nextGrOffset += 1;
          return [student.id, value];
        }

        return [student.id, ''];
      })
    );
  }, [
    assignmentType,
    automaticDivisionValues,
    configurationScope?.academicYearName,
    configurationScope?.schoolCode,
    configuration.rollNumber.configurations,
    rollLocks,
    selectedGrConfiguration,
    students,
  ]);

  if (!assignmentType) return null;

  const meta = assignmentMeta[assignmentType];
  const automaticAllowed =
    isAssignmentModeAllowed(assignmentPolicy, 'automatic') &&
    (assignmentType !== 'division' ||
      applicableDivisionConfigurations.every((rule) =>
        isAssignmentModeAllowed(rule.assignmentMode, 'automatic')
      )) &&
    (assignmentType !== 'gr-number' || Boolean(selectedGrConfiguration));
  const manualAllowed =
    isAssignmentModeAllowed(assignmentPolicy, 'manual') &&
    (assignmentType !== 'division' ||
      applicableDivisionConfigurations.every((rule) =>
        isAssignmentModeAllowed(rule.assignmentMode, 'manual')
      )) &&
    (assignmentType !== 'gr-number' || Boolean(selectedGrConfiguration?.manualEntryAllowed));
  const applicableRollConfigurations = Array.from(
    new Map(
      students.map((student) => {
        const rule = resolveRollRule(configuration.rollNumber.configurations, student);
        return [rule.id, rule];
      })
    ).values()
  );
  const manualReasonRequired =
    assignmentType === 'division'
      ? applicableDivisionConfigurations.some((rule) => rule.requireReason)
      : assignmentType === 'gr-number'
        ? Boolean(selectedGrConfiguration?.requireManualReason)
        : applicableRollConfigurations.some((rule) => rule.requireChangeReason);
  const profileApprovalRequired = students.some((student) => {
    const rules = getEffectiveReadinessRules(configuration, student.admissionRoute);
    if (assignmentType === 'division') {
      return isApprovalTriggerRequired(rules, 'division-change');
    }
    if (mode === 'manual') {
      return isApprovalTriggerRequired(rules, 'manual-identifier');
    }
    return false;
  });
  const assignmentRequiresApproval =
    (assignmentType === 'division' &&
      applicableDivisionConfigurations.some(
        (rule) =>
          rule.requireApproval ||
          Boolean(
            rule.approvalRequiredAfter &&
              (rule.effectiveDate || new Date().toISOString().slice(0, 10)) >=
                rule.approvalRequiredAfter
          )
      )) ||
    (assignmentType === 'gr-number' &&
      mode === 'manual' &&
      Boolean(selectedGrConfiguration?.requireManualApproval)) ||
    (assignmentType === 'roll-number' &&
      applicableRollConfigurations.some((rule) => rule.requireApproval)) ||
    profileApprovalRequired;
  const proposedValues = mode === 'automatic' ? automaticValues : manualValues;
  const missingIds = students
    .filter((student) => !String(proposedValues[student.id] ?? '').trim())
    .map((student) => student.id);
  const invalidIds = students
    .filter((student) => {
      const value = String(proposedValues[student.id] ?? '').trim();
      if (!value) return false;
      if (assignmentType === 'division') return !getDivisionOptions(student).includes(value);
      if (assignmentType === 'roll-number') {
        const number = Number(value);
        return !Number.isInteger(number) || number < 1;
      }
      return false;
    })
    .map((student) => student.id);
  const duplicateIds = new Set<string>();
  const duplicateGroups = new Map<string, string>();

  if (assignmentType !== 'division') {
    students.forEach((student) => {
      const value = String(proposedValues[student.id] ?? '')
        .trim()
        .toLowerCase();
      if (!value) return;
      const scope =
        assignmentType === 'roll-number'
          ? (() => {
              const rule = resolveRollRule(configuration.rollNumber.configurations, student);
              return rule.numberingScope === 'class'
                ? `${student.standardName}-${value}`
                : `${student.standardName}-${student.divisionName}-${value}`;
            })()
          : value;
      const existingId = duplicateGroups.get(scope);
      if (existingId) {
        duplicateIds.add(existingId);
        duplicateIds.add(student.id);
      } else {
        duplicateGroups.set(scope, student.id);
      }
    });
  }

  const divisionCapacityStatuses = new Map<string, DivisionCapacityStatus>();
  if (assignmentType === 'division') {
    const groupedStudents = new Map<
      string,
      { rule: DivisionChangeConfiguration; students: StudentOnboardingItem[] }
    >();
    students.forEach((student) => {
      const rule = resolveDivisionRule(configuration.divisionChange.configurations, student);
      const group = groupedStudents.get(rule.id) ?? { rule, students: [] };
      groupedStudents.set(rule.id, { ...group, students: [...group.students, student] });
    });
    groupedStudents.forEach(({ rule, students: ruleStudents }) => {
      buildDivisionCapacityStatuses(ruleStudents, proposedValues, rule).forEach((status, id) =>
        divisionCapacityStatuses.set(id, status)
      );
    });
  }
  const timingBlockedIds = students
    .filter((student) => {
      if (assignmentType !== 'roll-number') return false;
      const rule = resolveRollRule(configuration.rollNumber.configurations, student);
      if (rule.assignmentTiming === 'after-division') {
        return !student.divisionName || student.divisionName === '—';
      }
      if (rule.assignmentTiming === 'during-activation') {
        return student.status !== 'ready-to-activate';
      }
      if (rule.assignmentTiming === 'first-academic-day') return true;
      return rule.assignmentTiming === 'manual-bulk' && mode !== 'manual';
    })
    .map((student) => student.id);
  const midYearManualIds = students
    .filter((student) => {
      if (assignmentType !== 'roll-number' || mode !== 'automatic') return false;
      const rule = resolveRollRule(configuration.rollNumber.configurations, student);
      return student.admissionRoute === 'Mid-year admission' && rule.midYearHandling === 'manual';
    })
    .map((student) => student.id);
  const capacityBlockedIds = students
    .filter((student) => divisionCapacityStatuses.get(student.id) === 'blocked')
    .map((student) => student.id);
  const capacityApprovalIds = students
    .filter((student) => divisionCapacityStatuses.get(student.id) === 'approval')
    .map((student) => student.id);
  const blockedIds = new Set([
    ...missingIds,
    ...invalidIds,
    ...duplicateIds,
    ...timingBlockedIds,
    ...midYearManualIds,
    ...capacityBlockedIds,
  ]);
  const preservedIds = students
    .filter(
      (student) =>
        String(getCurrentValue(student, assignmentType) ?? '') ===
        String(proposedValues[student.id] ?? '')
    )
    .map((student) => student.id);
  const changedIds = students
    .filter((student) => !blockedIds.has(student.id) && !preservedIds.includes(student.id))
    .map((student) => student.id);
  const approvalRequiredIds = new Set([
    ...capacityApprovalIds,
    ...(assignmentRequiresApproval
      ? students.filter((student) => !blockedIds.has(student.id)).map((student) => student.id)
      : []),
  ]);

  const unresolvedGrTokens =
    assignmentType === 'gr-number' && selectedGrConfiguration
      ? [
          selectedGrConfiguration.formatPattern.includes('{SCHOOL_CODE}') &&
          !configurationScope?.schoolCode
            ? 'school code'
            : null,
          (selectedGrConfiguration.formatPattern.includes('{YEAR}') ||
            selectedGrConfiguration.formatPattern.includes('{YEAR_SHORT}')) &&
          !configurationScope?.academicYearName
            ? 'academic year'
            : null,
        ].filter(Boolean)
      : [];

  const canConfirm =
    students.length > 0 &&
    (mode === 'automatic' ? automaticAllowed : manualAllowed) &&
    !unresolvedGrTokens.length &&
    !blockedIds.size &&
    (mode === 'automatic' || !manualReasonRequired || manualReason.trim().length >= 5);
  const multipleAcademicGroups =
    new Set(
      students.map((student) => {
        const rule = resolveRollRule(configuration.rollNumber.configurations, student);
        return rule.numberingScope === 'class'
          ? student.standardName
          : `${student.standardName}-${student.divisionName}`;
      })
    ).size > 1;
  const grSeriesUnavailable = assignmentType === 'gr-number' && !selectedGrConfiguration;
  const grSeriesRangeExhausted =
    assignmentType === 'gr-number' &&
    mode === 'automatic' &&
    selectedGrConfiguration?.maximumNumber !== null &&
    selectedGrConfiguration?.maximumNumber !== undefined &&
    missingIds.length > 0;
  const divisionRecalculatesRoll = applicableDivisionConfigurations.some(
    (rule) => rule.recalculateRollNumber
  );
  const divisionEffectiveDates = Array.from(
    new Set(applicableDivisionConfigurations.map((rule) => rule.effectiveDate).filter(Boolean))
  );
  const divisionNotifiesTeacher = applicableDivisionConfigurations.some(
    (rule) => rule.notifyClassTeacher
  );

  return (
    <CustomDialog
      open
      handleClose={onClose}
      title={meta.title}
      maxWidth="md"
      hasForm={false}
      paperProps={{ sx: { minHeight: { sm: 620 } } }}
    >
      <DialogScrollContent>
        <Stack spacing={2}>
          <Alert severity="info">
            Frontend preview only. Final values must come from the backend assignment and conflict
            validation APIs.
          </Alert>

          <Paper variant="outlined" sx={{ p: 1.5 }}>
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: 'background.neutral',
                  color: 'primary.main',
                  flexShrink: 0,
                }}
              >
                <Iconify icon={meta.icon} width={21} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2">
                  {students.length} student{students.length === 1 ? '' : 's'} selected
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {meta.helpText}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {assignmentType === 'gr-number' ? (
            <Stack spacing={1}>
              <TextField
                select
                fullWidth
                size="small"
                label="Applicable identifier series"
                value={identifierSeriesId}
                onChange={(event) => {
                  setIdentifierSeriesId(event.target.value);
                  const nextSeries = applicableGrConfigurations.find(
                    (item) => item.id === event.target.value
                  );
                  if (mode === 'manual' && !nextSeries?.manualEntryAllowed) {
                    setMode('automatic');
                  }
                  setConfirmed(false);
                }}
                disabled={!applicableGrConfigurations.length}
                helperText="Only active series applicable to every selected student's onboarding profile are shown."
              >
                {applicableGrConfigurations.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    {item.name} ·{' '}
                    {formatGrNumber(item, 0, {
                      academicYearName: configurationScope?.academicYearName,
                      schoolCode: configurationScope?.schoolCode,
                    })}
                  </MenuItem>
                ))}
              </TextField>
              {selectedGrConfiguration ? (
                <Typography variant="caption" color="text.secondary">
                  {selectedGrConfiguration.sequenceScope === 'school'
                    ? 'School-wide sequence'
                    : 'Academic-year sequence'}{' '}
                  ·{' '}
                  {selectedGrConfiguration.resetPolicy === 'continuous'
                    ? 'never resets'
                    : 'resets each academic year'}
                  {selectedGrConfiguration.maximumNumber !== null
                    ? ` · stops at ${selectedGrConfiguration.maximumNumber}`
                    : ''}
                </Typography>
              ) : null}
            </Stack>
          ) : null}

          {grSeriesUnavailable ? (
            <Alert severity="error" variant="outlined">
              No active GR series applies to every selected student. Change the selection or update
              Identifier Series settings before assigning a GR number.
            </Alert>
          ) : null}

          {unresolvedGrTokens.length ? (
            <Alert severity="error" variant="outlined">
              The selected series needs {unresolvedGrTokens.join(' and ')} context before it can
              generate final GR numbers. Select the required academic context or connect the school
              code source.
            </Alert>
          ) : null}

          <Box>
            <Typography id="assignment-method-label" variant="subtitle2" gutterBottom>
              Assignment method
            </Typography>
            <ToggleButtonGroup
              exclusive
              fullWidth
              value={mode}
              aria-labelledby="assignment-method-label"
              onChange={(_event, value: AssignmentMode | null) => {
                if (!value) return;
                setMode(value);
                setConfirmed(false);
              }}
              sx={{
                '& .MuiToggleButton-root': { minHeight: 44, gap: 0.75, textTransform: 'none' },
              }}
            >
              {automaticAllowed ? (
                <ToggleButton value="automatic">
                  <Iconify icon="mdi:auto-fix" width={18} />
                  Automatic
                </ToggleButton>
              ) : null}
              {manualAllowed ? (
                <ToggleButton value="manual">
                  <Iconify icon="mdi:pencil-outline" width={18} />
                  Manual
                </ToggleButton>
              ) : null}
            </ToggleButtonGroup>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mt: 0.75 }}
            >
              Available methods are controlled by Numbering & Placement settings.
            </Typography>
          </Box>

          {mode === 'automatic' ? (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                gap: 1.25,
              }}
            >
              {assignmentType === 'division' ? (
                <Paper variant="outlined" sx={{ p: 1.5, gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Applied Division {applicableDivisionConfigurations.length === 1 ? 'policy' : 'policies'}
                  </Typography>
                  <Stack spacing={0.75}>
                    {applicableDivisionConfigurations.map((rule) => (
                      <Typography key={rule.id} variant="body2" color="text.secondary">
                        {rule.name}: {rule.automaticStrategy} · tolerance {rule.balanceTolerance} ·{' '}
                        {rule.capacityRequired ? 'capacity required' : 'capacity optional'} ·{' '}
                        over-capacity {rule.overCapacityBehavior}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              ) : null}
              {assignmentType === 'roll-number' ? (
                <Paper variant="outlined" sx={{ p: 1.5, gridColumn: '1 / -1' }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Applied class rules
                  </Typography>
                  <Stack spacing={0.75}>
                    {applicableRollConfigurations.map((item) => (
                      <Typography key={item.id} variant="body2" color="text.secondary">
                        {item.className}: {item.numberingScope} · {item.assignmentTiming} ·{' '}
                        {item.midYearHandling} · starts at {item.startingNumber} ·{' '}
                        {item.preserveExisting ? 'preserve existing' : 'recalculate existing'}
                      </Typography>
                    ))}
                  </Stack>
                </Paper>
              ) : null}
            </Box>
          ) : (
            <Stack spacing={1.25}>
              <Alert severity="warning" variant="outlined">
                Manual bulk assignment requires a separate value for every student. Existing values
                are prefilled and all changes require backend permission, validation, and audit.
              </Alert>
              {manualReasonRequired ? (
                <TextField
                  fullWidth
                  size="small"
                  required
                  label="Reason for manual assignment"
                  value={manualReason}
                  onChange={(event) => {
                    setManualReason(event.target.value);
                    setConfirmed(false);
                  }}
                  error={Boolean(manualReason) && manualReason.trim().length < 5}
                  helperText="Required for the audit history; enter at least 5 characters."
                />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  A reason is optional under the applied policy.
                </Typography>
              )}
            </Stack>
          )}

          {assignmentType === 'division' ? (
            <Alert severity={assignmentRequiresApproval ? 'warning' : 'info'} variant="outlined">
              {assignmentRequiresApproval
                ? 'The applied policy requires approval before a division change can take effect.'
                : 'The applied policy allows an authorized division change without a separate approval.'}{' '}
              {divisionRecalculatesRoll
                ? 'A new roll-number preview is required where the resolved rule recalculates it.'
                : 'All resolved rules preserve the existing roll number.'}{' '}
              {divisionEffectiveDates.length
                ? `Effective date${divisionEffectiveDates.length === 1 ? '' : 's'}: ${divisionEffectiveDates.join(', ')}.`
                : 'Effective immediately after confirmation.'}{' '}
              {divisionNotifiesTeacher
                ? 'The class teacher is included in the notification policy.'
                : ''}
            </Alert>
          ) : null}

          {assignmentType === 'roll-number' && mode === 'manual' && profileApprovalRequired ? (
            <Alert severity="warning" variant="outlined">
              At least one selected student&apos;s onboarding profile requires approval for manual
              identifier assignment.
            </Alert>
          ) : null}

          {assignmentType === 'gr-number' && mode === 'manual' && assignmentRequiresApproval ? (
            <Alert severity="warning" variant="outlined">
              The applied GR series or onboarding profile requires approval for this manual
              assignment.
            </Alert>
          ) : null}

          {grSeriesRangeExhausted ? (
            <Alert severity="error" variant="outlined">
              The selected GR series does not have enough numbers remaining for this selection.
              Reduce the selection or update its maximum number.
            </Alert>
          ) : null}

          {timingBlockedIds.length ? (
            <Alert severity="error" variant="outlined">
              {timingBlockedIds.length} student{timingBlockedIds.length === 1 ? '' : 's'} cannot be
              assigned at the current Roll-number timing. Review the applied class rule or use the
              required workflow stage.
            </Alert>
          ) : null}

          {midYearManualIds.length ? (
            <Alert severity="warning" variant="outlined">
              The applied mid-year policy requires manual Roll-number assignment for{' '}
              {midYearManualIds.length} selected student{midYearManualIds.length === 1 ? '' : 's'}.
            </Alert>
          ) : null}

          {capacityBlockedIds.length ? (
            <Alert severity="error" variant="outlined">
              {capacityBlockedIds.length} Division assignment
              {capacityBlockedIds.length === 1 ? ' is' : 's are'} blocked by missing or exhausted
              capacity.
            </Alert>
          ) : null}

          {capacityApprovalIds.length ? (
            <Alert severity="warning" variant="outlined">
              {capacityApprovalIds.length} over-capacity assignment
              {capacityApprovalIds.length === 1 ? ' requires' : 's require'} approval.
            </Alert>
          ) : null}

          {multipleAcademicGroups && assignmentType === 'roll-number' ? (
            <Alert severity="warning" variant="outlined">
              The selection contains multiple class/division groups. Roll numbering will restart
              independently according to each rule&apos;s configured numbering scope.
            </Alert>
          ) : null}

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
              gap: 1,
              overflowX: 'auto',
              pb: 0.5,
            }}
          >
            {[
              ['Eligible', students.length - blockedIds.size, 'success'],
              ['Blocked', blockedIds.size, blockedIds.size ? 'error' : 'default'],
              [
                'Approval',
                approvalRequiredIds.size,
                approvalRequiredIds.size ? 'warning' : 'default',
              ],
              ['Will change', changedIds.length, 'info'],
              ['Preserved', preservedIds.length, 'default'],
            ].map(([label, value, color]) => (
              <Paper key={String(label)} variant="outlined" sx={{ p: 1.25, minWidth: 112 }}>
                <Typography variant="h6">{value}</Typography>
                <Label color={color as 'success' | 'error' | 'warning' | 'info' | 'default'}>
                  {label}
                </Label>
              </Paper>
            ))}
          </Box>

          <Divider />
          <Box>
            <Typography variant="subtitle2">Assignment preview</Typography>
            <Typography variant="caption" color="text.secondary">
              Current and proposed values are shown before any backend command is allowed.
            </Typography>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table size="small" aria-label={`${meta.title} preview`}>
              <TableHead>
                <TableRow>
                  <TableCell>Student</TableCell>
                  <TableCell>Class / Division</TableCell>
                  <TableCell>Current</TableCell>
                  <TableCell sx={{ minWidth: 190 }}>Proposed {meta.singularLabel}</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((student) => {
                  const isMissing = missingIds.includes(student.id);
                  const isInvalid = invalidIds.includes(student.id);
                  const isDuplicate = duplicateIds.has(student.id);
                  const isTimingBlocked = timingBlockedIds.includes(student.id);
                  const isMidYearManual = midYearManualIds.includes(student.id);
                  const capacityStatus = divisionCapacityStatuses.get(student.id);
                  const isBlocked = blockedIds.has(student.id);
                  const requiresApproval = approvalRequiredIds.has(student.id);
                  const isPreserved = preservedIds.includes(student.id);
                  const currentValue = getCurrentValue(student, assignmentType);
                  const proposedValue = String(proposedValues[student.id] ?? '');
                  const rollRule =
                    assignmentType === 'roll-number'
                      ? resolveRollRule(configuration.rollNumber.configurations, student)
                      : null;
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} noWrap>
                          {student.studentName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" noWrap>
                          {student.applicationNumber}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {student.standardName} / {student.divisionName}
                      </TableCell>
                      <TableCell>{currentValue || 'Not assigned'}</TableCell>
                      <TableCell>
                        {mode === 'manual' ? (
                          assignmentType === 'division' ? (
                            <TextField
                              select
                              fullWidth
                              size="small"
                              inputProps={{ 'aria-label': `Division for ${student.studentName}` }}
                              value={proposedValue}
                              onChange={(event) => {
                                setManualValues((current) => ({
                                  ...current,
                                  [student.id]: event.target.value,
                                }));
                                setConfirmed(false);
                              }}
                            >
                              {getDivisionOptions(student).map((division) => (
                                <MenuItem key={division} value={division}>
                                  Division {division}
                                </MenuItem>
                              ))}
                            </TextField>
                          ) : (
                            <Stack spacing={0.5}>
                              <TextField
                                fullWidth
                                size="small"
                                type={assignmentType === 'roll-number' ? 'number' : 'text'}
                                value={proposedValue}
                                disabled={
                                  assignmentType === 'roll-number' &&
                                  rollLocks[student.id] &&
                                  Boolean(currentValue)
                                }
                                inputProps={{
                                  'aria-label': `${meta.singularLabel} for ${student.studentName}`,
                                  ...(assignmentType === 'roll-number' ? { min: 1 } : {}),
                                }}
                                onChange={(event) => {
                                  setManualValues((current) => ({
                                    ...current,
                                    [student.id]: event.target.value,
                                  }));
                                  setConfirmed(false);
                                }}
                              />
                            </Stack>
                          )
                        ) : (
                          <Typography variant="body2" fontWeight={600}>
                            {proposedValue || 'Not available'}
                          </Typography>
                        )}
                        {assignmentType === 'roll-number' && rollRule?.allowIndividualLocks ? (
                          <FormControlLabel
                            sx={{ mt: 0.25, ml: 0 }}
                            control={
                              <Checkbox
                                size="small"
                                checked={Boolean(rollLocks[student.id])}
                                onChange={(event) => {
                                  setRollLocks((current) => ({
                                    ...current,
                                    [student.id]: event.target.checked,
                                  }));
                                  setConfirmed(false);
                                }}
                                inputProps={{
                                  'aria-label': `Lock Roll No. for ${student.studentName}`,
                                }}
                              />
                            }
                            label="Lock Roll No."
                          />
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Label
                          color={
                            isBlocked
                              ? 'error'
                              : requiresApproval
                                ? 'warning'
                                : capacityStatus === 'warning'
                                  ? 'info'
                                  : isPreserved
                                    ? 'default'
                                    : 'success'
                          }
                        >
                          {isTimingBlocked
                            ? 'Timing blocked'
                            : isMidYearManual
                              ? 'Manual required'
                              : capacityStatus === 'blocked'
                                ? 'Capacity blocked'
                                : isMissing
                                  ? 'Required'
                                  : isInvalid
                                    ? 'Invalid'
                                    : isDuplicate
                                      ? 'Duplicate'
                                      : requiresApproval
                                        ? 'Approval required'
                                        : capacityStatus === 'warning'
                                          ? 'Capacity warning'
                                          : isPreserved
                                            ? 'Preserved'
                                            : 'Will change'}
                        </Label>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {confirmed ? (
            <Alert severity="success">
              Preview confirmed. No student records were changed because the assignment API is not
              connected.
            </Alert>
          ) : null}
        </Stack>
      </DialogScrollContent>
      <DialogActions sx={{ px: 2, pb: 2 }}>
        <Button color="inherit" onClick={onClose}>
          Close
        </Button>
        <Button
          variant="contained"
          disabled={!canConfirm || confirmed}
          onClick={() => setConfirmed(true)}
        >
          Confirm preview
        </Button>
      </DialogActions>
    </CustomDialog>
  );
}
