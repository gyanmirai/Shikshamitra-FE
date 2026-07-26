'use client';

import type { ComponentProps } from 'react';
import type { RootState } from 'src/redux/store';
import type { LabelColor } from 'src/components/label';
import type { IColumn, IParams } from 'src/components/customizabaleTable/types';
import type { AdmissionCrmEntranceExamDto } from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { shikshaMitraToast } from 'src/components/toast';
import { LoadingButton } from 'src/components/loading-button';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { memo, useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Chip,
  Link,
  Alert,
  Stack,
  Paper,
  Button,
  Dialog,
  Switch,
  Divider,
  Checkbox,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';
import {
  EntranceExamStatusEnum,
  AdmissionCrmEligibilityDecision,
  AdmissionCrmExamAttendanceStatus,
  useGetAdmissionCrmEntranceExamsQuery,
  useUploadAdmissionCrmExamResultMutation,
  useDecideAdmissionCrmEligibilityMutation,
  useGetAdmissionCrmEligibilityHandoffQuery,
  useMarkAdmissionCrmExamAttendanceMutation,
  useGetAdmissionCrmQuickInquiryOptionsQuery,
  useBulkUploadAdmissionCrmExamResultsMutation,
  useBulkMarkAdmissionCrmExamAttendanceMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { EnrollmentWorkspaceHeader } from './workspace-header';
import { admissionCrmEligibilityLabels } from './admissions-crm-utils';
import { useEnrollmentWorkspace } from './enrollment-workspace-context';
import { useWorkspaceTableSessionState } from './workspace-table-session-state';
import { resolveAdmissionCrmExamActionPermissions } from './admission-action-permissions';
import {
  readExamResultImportFile,
  downloadExamResultTemplate,
} from './exam-result-import';
import {
  createApplicantRowNavigationProps,
  createApplicantLinkNavigationProps,
} from './applicant-row-navigation';
import {
  enrollmentActionsColumn,
  enrollmentTableWrapperSx,
  enrollmentWorkspaceRootSx,
  EnrollmentTableEmptyState,
  enrollmentTableContainerSx,
  EnrollmentWorkspaceErrorState,
} from './workspace-table-patterns';

import type { ExamResultImportPreview } from './exam-result-import';
import type { ApplicantWorkspaceTab } from './applicant-workspace-page';

const pageSize = 50;
const attendanceLabels: Record<AdmissionCrmExamAttendanceStatus, string> = {
  [AdmissionCrmExamAttendanceStatus.NotMarked]: 'Not Marked',
  [AdmissionCrmExamAttendanceStatus.Present]: 'Present',
  [AdmissionCrmExamAttendanceStatus.Absent]: 'Absent',
};
const resultLabels: Record<EntranceExamStatusEnum, string> = {
  [EntranceExamStatusEnum.Pending]: 'Pending',
  [EntranceExamStatusEnum.Pass]: 'Pass',
  [EntranceExamStatusEnum.Fail]: 'Fail',
  [EntranceExamStatusEnum.Absent]: 'Absent',
};
const attendanceColors: Record<AdmissionCrmExamAttendanceStatus, LabelColor> = {
  [AdmissionCrmExamAttendanceStatus.NotMarked]: 'default',
  [AdmissionCrmExamAttendanceStatus.Present]: 'success',
  [AdmissionCrmExamAttendanceStatus.Absent]: 'error',
};
const resultColors: Record<EntranceExamStatusEnum, LabelColor> = {
  [EntranceExamStatusEnum.Pending]: 'default',
  [EntranceExamStatusEnum.Pass]: 'success',
  [EntranceExamStatusEnum.Fail]: 'error',
  [EntranceExamStatusEnum.Absent]: 'warning',
};
const eligibilityColors: Record<AdmissionCrmEligibilityDecision, LabelColor> = {
  [AdmissionCrmEligibilityDecision.Pending]: 'default',
  [AdmissionCrmEligibilityDecision.Eligible]: 'success',
  [AdmissionCrmEligibilityDecision.Waitlisted]: 'warning',
  [AdmissionCrmEligibilityDecision.Rejected]: 'error',
};
const dateTimeFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});
const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const accessibleStatusSx = { color: 'text.primary' } as const;
type BulkExamResultForm = {
  totalMarks: string;
  passingMarks: string;
  obtainedMarks: string;
  meritRank: string;
};

const parseBulkExamNumber = (value: string) => {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const isValidBulkExamResultForm = (form: BulkExamResultForm | undefined) => {
  if (!form) return false;
  const totalMarks = parseBulkExamNumber(form.totalMarks);
  const passingMarks = parseBulkExamNumber(form.passingMarks);
  const obtainedMarks = parseBulkExamNumber(form.obtainedMarks);
  const meritRank = form.meritRank.trim() ? parseBulkExamNumber(form.meritRank) : null;

  return (
    totalMarks != null &&
    totalMarks > 0 &&
    passingMarks != null &&
    passingMarks >= 0 &&
    passingMarks <= totalMarks &&
    obtainedMarks != null &&
    obtainedMarks >= 0 &&
    obtainedMarks <= totalMarks &&
    (!form.meritRank.trim() || (meritRank != null && Number.isInteger(meritRank) && meritRank > 0))
  );
};

const getLatestEnumFilter = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  return filter ? Number(filter.value) : undefined;
};

const getLatestStringFilter = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  return filter?.value ? String(filter.value) : undefined;
};

const getDateFilterBounds = (filters: IParams['filters'], column: string) => {
  const filter = [...filters].reverse().find((item) => item.column === column);
  if (!filter || typeof filter.value !== 'string') return {};
  const [day, month, year] = filter.value.split('-').map(Number);
  if (!day || !month || !year) return {};
  const value = new Date(Date.UTC(year, month - 1, day));
  if (filter.type === 'after') {
    value.setUTCDate(value.getUTCDate() + 1);
    return { from: value.toISOString() };
  }
  if (filter.type === 'before') {
    value.setUTCDate(value.getUTCDate() - 1);
    return { until: value.toISOString() };
  }
  const iso = value.toISOString();
  return { from: iso, until: iso };
};

type ExamRowActionsProps = {
  exam: AdmissionCrmEntranceExamDto;
  openApplicant: (leadId: string, tab?: ApplicantWorkspaceTab) => void;
  setSelectedExam: (exam: AdmissionCrmEntranceExamDto) => void;
  setHandoffExamId: (examId: string) => void;
};

type ThreeDotsActionRenderer = NonNullable<ComponentProps<typeof ThreeDotsActions>['actions']>;

const ExamRowActions = memo(
  ({ exam, openApplicant, setSelectedExam, setHandoffExamId }: ExamRowActionsProps) => {
    const renderActions = useCallback<ThreeDotsActionRenderer>(
      ({ popover }) => (
        <MenuList>
          <MenuItem
            onClick={() => {
              popover.onClose();
              setHandoffExamId(exam.id);
            }}
          >
            <Iconify icon="mdi:account-arrow-right-outline" />
            Eligibility Handoff
          </MenuItem>
          {exam.eligibilityDecision === AdmissionCrmEligibilityDecision.Eligible ? (
            <MenuItem
              onClick={() => {
                popover.onClose();
                openApplicant(exam.leadId, 'registration');
              }}
            >
              <Iconify icon="mdi:file-document-edit-outline" />
              Open Registration
            </MenuItem>
          ) : null}
        </MenuList>
      ),
      [exam, openApplicant, setHandoffExamId]
    );

    return (
      <ThreeDotsActions
        placement="right-top"
        showViewIcon
        viewLabel="Open Exam"
        handleViewClick={() => setSelectedExam(exam)}
        showEditIcon
        editLabel="Manage Exam"
        handleEditClick={() => setSelectedExam(exam)}
        onEditMouseDown={() => setSelectedExam(exam)}
        actions={renderActions}
      />
    );
  }
);

type InlineExamMarksProps = {
  exam: AdmissionCrmEntranceExamDto;
  canChange: boolean;
  canCorrect: boolean;
  onOpenCorrection: (exam: AdmissionCrmEntranceExamDto) => void;
};

const InlineExamMarks = memo(
  ({ exam, canChange, canCorrect, onOpenCorrection }: InlineExamMarksProps) => {
    const [value, setValue] = useState('');
    const [uploadResult, uploadState] = useUploadAdmissionCrmExamResultMutation();
    const totalMarks = exam.totalMarks || 100;
    const passingMarks = exam.passingMarks ?? Math.min(40, totalMarks);
    const parsedValue = Number(value);
    const canSave =
      canChange &&
      exam.attendanceStatus === AdmissionCrmExamAttendanceStatus.Present &&
      value.trim() !== '' &&
      Number.isFinite(parsedValue) &&
      parsedValue >= 0 &&
      parsedValue <= totalMarks;

    if (exam.obtainedMarks != null) {
      return canCorrect ? (
        <Button
          size="small"
          variant="text"
          aria-label={`Edit marks for ${exam.applicantName}`}
          onClick={(event) => {
            event.stopPropagation();
            onOpenCorrection(exam);
          }}
          sx={{ minWidth: 0, px: 0.5, fontVariantNumeric: 'tabular-nums' }}
        >
          {exam.obtainedMarks}/{totalMarks}
        </Button>
      ) : (
        <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
          {exam.obtainedMarks}/{totalMarks}
        </Typography>
      );
    }

    return (
      <Stack
        direction="row"
        gap={0.25}
        alignItems="center"
        onClick={(event) => event.stopPropagation()}
      >
        <TextField
          size="small"
          type="number"
          name={`marks-${exam.id}`}
          value={value}
          disabled={
            !canChange ||
            exam.attendanceStatus !== AdmissionCrmExamAttendanceStatus.Present ||
            uploadState.isLoading
          }
          placeholder="0"
          inputProps={{
            'aria-label': `Marks for ${exam.applicantName}`,
            min: 0,
            max: totalMarks,
          }}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && canSave) {
              event.preventDefault();
              event.currentTarget.blur();
              uploadResult({
                examRecordId: exam.id,
                body: {
                  totalMarks,
                  passingMarks,
                  obtainedMarks: parsedValue,
                },
              })
                .unwrap()
                .then(() => {
                  setValue('');
                  shikshaMitraToast.success({ message: 'Exam result recorded.' });
                })
                .catch(() =>
                  shikshaMitraToast.error({
                    message: 'Marks could not be saved. Review the value and retry.',
                  })
                );
            }
          }}
          sx={{ width: 72 }}
        />
        <IconButton
          size="small"
          aria-label={`Save marks for ${exam.applicantName}`}
          disabled={!canSave || uploadState.isLoading}
          onClick={() => {
            uploadResult({
              examRecordId: exam.id,
              body: {
                totalMarks,
                passingMarks,
                obtainedMarks: parsedValue,
              },
            })
              .unwrap()
              .then(() => {
                setValue('');
                shikshaMitraToast.success({ message: 'Exam result recorded.' });
              })
              .catch(() =>
                shikshaMitraToast.error({
                  message: 'Marks could not be saved. Review the value and retry.',
                })
              );
          }}
        >
          <Iconify icon="mdi:check" width={18} />
        </IconButton>
      </Stack>
    );
  }
);

export function ExamsWorkspace() {
  const permissions = useSelector((root: RootState) => root.auth.permissions);
  const {
    academicYearId,
    sessionIdentity,
    state,
    updateState,
    getApplicantHref,
    openApplicant,
  } = useEnrollmentWorkspace();
  const page = Math.max(0, state.page - 1);
  const {
    search,
    setSearch,
    filters: columnFilters,
    setFilters: setColumnFilters,
  } = useWorkspaceTableSessionState(
    `exams:${academicYearId || 'none'}:${sessionIdentity}`
  );
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  const [selectedExam, setSelectedExam] = useState<AdmissionCrmEntranceExamDto | null>(null);
  const [bulkMarksOpen, setBulkMarksOpen] = useState(false);
  const [resultImportOpen, setResultImportOpen] = useState(false);
  const [resultImportMode, setResultImportMode] = useState<'spreadsheet' | 'omr'>('spreadsheet');
  const [resultImportFileName, setResultImportFileName] = useState('');
  const [resultImportPreview, setResultImportPreview] =
    useState<ExamResultImportPreview | null>(null);
  const [isReadingResultFile, setIsReadingResultFile] = useState(false);
  const [bulkCorrectionReason, setBulkCorrectionReason] = useState('');
  const [handoffExamId, setHandoffExamId] = useState('');
  const [attendance, setAttendance] = useState(AdmissionCrmExamAttendanceStatus.NotMarked);
  const [totalMarks, setTotalMarks] = useState('100');
  const [passingMarks, setPassingMarks] = useState('40');
  const [obtainedMarks, setObtainedMarks] = useState('');
  const [meritRank, setMeritRank] = useState('');
  const [resultCorrectionReason, setResultCorrectionReason] = useState('');
  const [eligibility, setEligibility] = useState(AdmissionCrmEligibilityDecision.Pending);
  const [decisionReason, setDecisionReason] = useState('');
  const [overrideDecision, setOverrideDecision] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [bulkTotalMarks, setBulkTotalMarks] = useState('100');
  const [bulkPassingMarks, setBulkPassingMarks] = useState('40');
  const [bulkMarksByExamId, setBulkMarksByExamId] = useState<Record<string, BulkExamResultForm>>(
    {}
  );

  const examsQuery = useGetAdmissionCrmEntranceExamsQuery(
    {
      academicYearId: academicYearId || '',
      filterText: search.trim() || undefined,
      applicantSearch: getLatestStringFilter(columnFilters, 'applicantName'),
      examStartFrom: getDateFilterBounds(columnFilters, 'examStartTime').from,
      examStartUntil: getDateFilterBounds(columnFilters, 'examStartTime').until,
      attendanceStatus: state.attendance,
      examStatus: state.examStatus,
      eligibilityDecision: state.eligibility,
      skipCount: page * pageSize,
      maxResultCount: pageSize,
      sorting: state.sorting || 'ExamStartTime ASC',
    },
    { skip: !academicYearId }
  );
  const [markAttendance, markAttendanceState] = useMarkAdmissionCrmExamAttendanceMutation();
  const [bulkMarkAttendance, bulkAttendanceState] = useBulkMarkAdmissionCrmExamAttendanceMutation();
  const [bulkUploadResults, bulkResultsState] = useBulkUploadAdmissionCrmExamResultsMutation();
  const [uploadResult, uploadResultState] = useUploadAdmissionCrmExamResultMutation();
  const [decideEligibility, decideEligibilityState] = useDecideAdmissionCrmEligibilityMutation();
  const handoffQuery = useGetAdmissionCrmEligibilityHandoffQuery(
    { examRecordId: handoffExamId },
    { skip: !handoffExamId }
  );
  const operationalOptionsQuery = useGetAdmissionCrmQuickInquiryOptionsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const entranceExamRequired = operationalOptionsQuery.data?.entranceExamRequired !== false;
  const {
    canChangeExamResult,
    canOverrideExamResult,
    canOverrideEligibility,
    canBulkChangeExamResult,
    canBulkChangeExamAttendance,
    canCorrectExamResult,
  } = resolveAdmissionCrmExamActionPermissions(permissions);

  useEffect(() => {
    if (!selectedExam) return;
    setAttendance(selectedExam.attendanceStatus);
    setTotalMarks(selectedExam.totalMarks?.toString() || '100');
    setPassingMarks(selectedExam.passingMarks?.toString() || '40');
    setObtainedMarks(selectedExam.obtainedMarks?.toString() || '');
    setMeritRank(selectedExam.meritRank?.toString() || '');
    setResultCorrectionReason('');
    setEligibility(selectedExam.eligibilityDecision);
    setDecisionReason(selectedExam.eligibilityDecisionReason || '');
    setOverrideDecision(false);
    setOverrideReason('');
  }, [selectedExam]);

  useEffect(() => {
    setSelectedExamIds([]);
  }, [state.page, state.attendance, state.examStatus, state.eligibility]);

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      const updated = (await action()) as AdmissionCrmEntranceExamDto;
      setSelectedExam(updated);
      shikshaMitraToast.success({ message });
    } catch {
      shikshaMitraToast.error({
        message: 'The exam record could not be updated. Review the fields and retry.',
      });
    }
  };

  const tableFilters = useMemo<IParams['filters']>(
    () => [
      ...(state.attendance == null
        ? []
        : [
            {
              column: 'attendanceStatus',
              type: 'equals',
              value: state.attendance,
              valueType: 'enum',
              label: 'Attendance',
              displayValue: attendanceLabels[state.attendance as AdmissionCrmExamAttendanceStatus],
            },
          ]),
      ...(state.examStatus == null
        ? []
        : [
            {
              column: 'examStatus',
              type: 'equals',
              value: state.examStatus,
              valueType: 'enum',
              label: 'Result',
              displayValue: resultLabels[state.examStatus as EntranceExamStatusEnum],
            },
          ]),
      ...(state.eligibility == null
        ? []
        : [
            {
              column: 'eligibilityDecision',
              type: 'equals',
              value: state.eligibility,
              valueType: 'enum',
              label: 'Eligibility',
              displayValue:
                admissionCrmEligibilityLabels[state.eligibility as AdmissionCrmEligibilityDecision],
            },
          ]),
    ],
    [state.attendance, state.eligibility, state.examStatus]
  );

  const exams = useMemo(() => examsQuery.data?.items || [], [examsQuery.data?.items]);
  const selectedExamSet = useMemo(() => new Set(selectedExamIds), [selectedExamIds]);
  const selectedExams = useMemo(
    () => exams.filter((exam) => selectedExamSet.has(exam.id)),
    [exams, selectedExamSet]
  );

  const openBulkMarksDialog = () => {
    setBulkCorrectionReason('');
    setBulkMarksByExamId(
      selectedExams.reduce<Record<string, BulkExamResultForm>>((acc, exam) => {
        acc[exam.id] = {
          totalMarks: exam.totalMarks?.toString() || bulkTotalMarks,
          passingMarks: exam.passingMarks?.toString() || bulkPassingMarks,
          obtainedMarks: exam.obtainedMarks?.toString() || '',
          meritRank: exam.meritRank?.toString() || '',
        };
        return acc;
      }, {})
    );
    setBulkMarksOpen(true);
  };

  const selectedHasExistingResults = selectedExams.some(
    (exam) => exam.obtainedMarks != null
  );

  const openResultImport = (mode: 'spreadsheet' | 'omr') => {
    setResultImportMode(mode);
    setResultImportFileName('');
    setResultImportPreview(null);
    setBulkCorrectionReason('');
    setResultImportOpen(true);
  };

  const handleResultImportFile = async (file?: File) => {
    if (!file) return;
    setResultImportFileName(file.name);
    setIsReadingResultFile(true);
    try {
      setResultImportPreview(
        await readExamResultImportFile(file, new Set(selectedExams.map((exam) => exam.id)))
      );
    } catch {
      setResultImportPreview({
        items: [],
        errors: ['The result file could not be read. Check its format and retry.'],
      });
    } finally {
      setIsReadingResultFile(false);
    }
  };

  const updateBulkExamResult = (examId: string, field: keyof BulkExamResultForm, value: string) => {
    setBulkMarksByExamId((current) => {
      const form: BulkExamResultForm = current[examId]
        ? { ...current[examId] }
        : {
            totalMarks: bulkTotalMarks,
            passingMarks: bulkPassingMarks,
            obtainedMarks: '',
            meritRank: '',
          };

      return {
        ...current,
        [examId]: { ...form, [field]: value },
      };
    });
  };

  const bulkMarksReady =
    selectedExams.length > 0 &&
    selectedExams.length === selectedExamIds.length &&
    selectedExams.every((exam) => isValidBulkExamResultForm(bulkMarksByExamId[exam.id])) &&
    (!selectedHasExistingResults ||
      (canOverrideExamResult && Boolean(bulkCorrectionReason.trim())));

  const markSelectedAttendance = async (value: AdmissionCrmExamAttendanceStatus) => {
    if (!academicYearId || selectedExamIds.length === 0) return;
    try {
      const result = await bulkMarkAttendance({
        academicYearId,
        examRecordIds: selectedExamIds,
        attendanceStatus: value,
      }).unwrap();
      if (result.failedCount > 0) {
        setSelectedExamIds(
          result.items.filter((item) => !item.success).map((item) => item.entityId)
        );
        shikshaMitraToast.error({
          message: `${result.succeededCount} updated; ${result.failedCount} failed and remain selected.`,
        });
        return;
      }
      setSelectedExamIds([]);
      shikshaMitraToast.success({
        message: `${result.succeededCount} exam attendance record${result.succeededCount === 1 ? '' : 's'} updated.`,
      });
    } catch {
      shikshaMitraToast.error({ message: 'The selected exam attendance could not be updated.' });
    }
  };

  const uploadSelectedResults = async () => {
    if (!academicYearId || selectedExamIds.length === 0 || !bulkMarksReady) return;
    try {
      const result = await bulkUploadResults({
        academicYearId,
        items: selectedExams.map((exam) => {
          const form = bulkMarksByExamId[exam.id] || {
            totalMarks: bulkTotalMarks,
            passingMarks: bulkPassingMarks,
            obtainedMarks: '',
            meritRank: '',
          };
          const bulkMeritRank = form.meritRank.trim() ? Number(form.meritRank) : undefined;
          return {
            examRecordId: exam.id,
            totalMarks: Number(form.totalMarks),
            passingMarks: Number(form.passingMarks),
            obtainedMarks: Number(form.obtainedMarks),
            meritRank: bulkMeritRank,
            correctionReason:
              exam.obtainedMarks != null ? bulkCorrectionReason.trim() || undefined : undefined,
          };
        }),
      }).unwrap();
      if (result.failedCount > 0) {
        setSelectedExamIds(
          result.items.filter((item) => !item.success).map((item) => item.entityId)
        );
        shikshaMitraToast.error({
          message: `${result.succeededCount} updated; ${result.failedCount} failed and remain selected.`,
        });
        return;
      }
      setBulkMarksOpen(false);
      setBulkMarksByExamId({});
      setSelectedExamIds([]);
      shikshaMitraToast.success({
        message: `${result.succeededCount} exam result${result.succeededCount === 1 ? '' : 's'} recorded.`,
      });
    } catch {
      shikshaMitraToast.error({ message: 'The selected exam results could not be recorded.' });
    }
  };

  const uploadImportedResults = async () => {
    if (
      !academicYearId ||
      !resultImportPreview ||
      resultImportPreview.items.length === 0 ||
      resultImportPreview.errors.length > 0 ||
      (selectedHasExistingResults &&
        (!canOverrideExamResult || !bulkCorrectionReason.trim()))
    ) {
      return;
    }
    try {
      const result = await bulkUploadResults({
        academicYearId,
        items: resultImportPreview.items.map((item) => ({
          ...item,
          correctionReason: selectedExams.some(
            (exam) => exam.id === item.examRecordId && exam.obtainedMarks != null
          )
            ? bulkCorrectionReason.trim() || undefined
            : undefined,
        })),
      }).unwrap();
      if (result.failedCount > 0) {
        setSelectedExamIds(
          result.items.filter((item) => !item.success).map((item) => item.entityId)
        );
        shikshaMitraToast.error({
          message: `${result.succeededCount} imported; ${result.failedCount} failed and remain selected.`,
        });
        return;
      }
      setResultImportOpen(false);
      setResultImportPreview(null);
      setSelectedExamIds([]);
      shikshaMitraToast.success({
        message: `${result.succeededCount} ${resultImportMode === 'omr' ? 'OMR ' : ''}result${result.succeededCount === 1 ? '' : 's'} imported.`,
      });
    } catch {
      shikshaMitraToast.error({
        message: 'The result file could not be applied. Review the preview and retry.',
      });
    }
  };

  const columns = useMemo<IColumn[]>(
    () => [
      {
        id: 'selection',
        label: '',
        width: 56,
        minWidth: 56,
        maxWidth: 56,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        isSort: false,
        isFilter: false,
        excludeFromExport: true,
        renderColumn: () => (
          <Checkbox
            size="small"
            checked={exams.length > 0 && exams.every((exam) => selectedExamSet.has(exam.id))}
            indeterminate={
              selectedExamIds.length > 0 && !exams.every((exam) => selectedExamSet.has(exam.id))
            }
            onChange={(_event, checked) =>
              setSelectedExamIds(checked ? exams.map((exam) => exam.id) : [])
            }
            inputProps={{ 'aria-label': 'Select visible entrance exams' }}
          />
        ),
        render: (_value, row) => {
          const exam = row as AdmissionCrmEntranceExamDto;
          return (
            <Checkbox
              size="small"
              checked={selectedExamSet.has(exam.id)}
              onClick={(event) => event.stopPropagation()}
              onChange={() =>
                setSelectedExamIds((current) =>
                  current.includes(exam.id)
                    ? current.filter((id) => id !== exam.id)
                    : [...current, exam.id]
                )
              }
              inputProps={{ 'aria-label': `Select ${exam.applicantName}` }}
            />
          );
        },
      },
      {
        id: 'applicantName',
        originalId: 'ApplicantName',
        label: 'Applicant',
        width: 190,
        minWidth: 180,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        filterType: 'string',
        render: (value, row) => {
          const exam = row as AdmissionCrmEntranceExamDto;
          return (
            <Stack spacing={0.25} sx={{ minWidth: 0 }}>
              <Typography variant="subtitle2" noWrap>
                <Link
                  {...createApplicantLinkNavigationProps({
                    href: getApplicantHref(exam.leadId, 'exam'),
                    onOpen: () => openApplicant(exam.leadId, 'exam'),
                  })}
                  color="inherit"
                  underline="hover"
                  sx={{ textAlign: 'left' }}
                >
                  {value}
                </Link>
              </Typography>
              <Typography variant="caption" color="text.primary" noWrap>
                {exam.slotNameSnapshot || 'Exam slot'}
              </Typography>
            </Stack>
          );
        },
      },
      {
        id: 'examStartTime',
        label: 'Exam schedule',
        width: 190,
        minWidth: 180,
        filterType: 'date',
        render: (value, row) => {
          const exam = row as AdmissionCrmEntranceExamDto;
          return (
            <Stack spacing={0.5}>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Iconify icon="solar:clock-circle-bold-duotone" width={18} aria-hidden="true" />
                <Typography variant="body2">{dateTimeFormatter.format(new Date(value))}</Typography>
              </Stack>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Iconify icon="solar:door-2-bold-duotone" width={18} aria-hidden="true" />
                <Typography variant="caption" color="text.primary">
                  Room {exam.examRoomNo}
                </Typography>
              </Stack>
            </Stack>
          );
        },
      },
      {
        id: 'attendanceStatus',
        label: 'Attendance',
        width: 130,
        minWidth: 125,
        filterType: 'enum',
        enumOptions: Object.entries(attendanceLabels).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        render: (value) => (
          <Label
            color={attendanceColors[value as AdmissionCrmExamAttendanceStatus]}
            sx={accessibleStatusSx}
          >
            {attendanceLabels[value as AdmissionCrmExamAttendanceStatus]}
          </Label>
        ),
      },
      {
        id: 'examStatus',
        label: 'Result',
        width: 100,
        minWidth: 95,
        filterType: 'enum',
        enumOptions: Object.entries(resultLabels).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        render: (value) => (
          <Label color={resultColors[value as EntranceExamStatusEnum]} sx={accessibleStatusSx}>
            {resultLabels[value as EntranceExamStatusEnum]}
          </Label>
        ),
      },
      {
        id: 'obtainedMarks',
        label: 'Marks',
        width: 128,
        minWidth: 120,
        isFilter: false,
        render: (_value, row) => {
          const exam = row as AdmissionCrmEntranceExamDto;
          return (
            <InlineExamMarks
              exam={exam}
              canChange={canChangeExamResult}
              canCorrect={canCorrectExamResult}
              onOpenCorrection={setSelectedExam}
            />
          );
        },
      },
      {
        id: 'eligibilityDecision',
        label: 'Admission status',
        width: 150,
        minWidth: 145,
        sticky: true,
        stickyPosition: 'right',
        stickyOnMobile: false,
        headerSx: { px: 1.5 },
        cellSx: { px: 1.5 },
        filterType: 'enum',
        enumOptions: Object.entries(admissionCrmEligibilityLabels).map(([value, label]) => ({
          value: Number(value),
          label,
        })),
        render: (value) => (
          <Label
            color={eligibilityColors[value as AdmissionCrmEligibilityDecision]}
            sx={accessibleStatusSx}
          >
            {admissionCrmEligibilityLabels[value as AdmissionCrmEligibilityDecision]}
          </Label>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        ...enrollmentActionsColumn,
        isSort: false,
        isFilter: false,
        render: (_value, row) => {
          const exam = row as AdmissionCrmEntranceExamDto;
          return (
            <ExamRowActions
              exam={exam}
              openApplicant={openApplicant}
              setSelectedExam={setSelectedExam}
              setHandoffExamId={setHandoffExamId}
            />
          );
        },
      },
    ],
    [
      canChangeExamResult,
      canCorrectExamResult,
      exams,
      getApplicantHref,
      openApplicant,
      selectedExamIds.length,
      selectedExamSet,
    ]
  );

  if (!academicYearId) {
    return (
      <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
        <EnrollmentWorkspaceHeader
          title="Entrance Exams"
          description="Process attendance, results, merit, and eligibility decisions from one queue."
        />
        <Alert severity="info">Select an academic year to open Entrance Exams.</Alert>
      </Stack>
    );
  }

  return (
    <Stack spacing={1.5} sx={enrollmentWorkspaceRootSx}>
      <EnrollmentWorkspaceHeader
        title="Entrance Exams"
        description="Process attendance, results, merit, and eligibility decisions from one queue."
      />

      {!entranceExamRequired ? (
        <Alert severity="info">
          Entrance exams are disabled for this admissions cycle. Applicants follow the exam-waived
          registration and admission readiness path.
        </Alert>
      ) : null}

      {entranceExamRequired && selectedExamIds.length > 0 ? (
        <Paper variant="outlined" role="region" aria-label="Bulk exam actions" sx={{ p: 1 }}>
          <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
            <Chip color="primary" label={`${selectedExamIds.length} selected`} />
            {canBulkChangeExamAttendance ? (
              <>
                <LoadingButton
                  size="small"
                  loading={bulkAttendanceState.isLoading}
                  onClick={() => markSelectedAttendance(AdmissionCrmExamAttendanceStatus.Present)}
                >
                  Mark present
                </LoadingButton>
                <LoadingButton
                  size="small"
                  color="warning"
                  loading={bulkAttendanceState.isLoading}
                  onClick={() => markSelectedAttendance(AdmissionCrmExamAttendanceStatus.Absent)}
                >
                  Mark absent
                </LoadingButton>
              </>
            ) : null}
            {canBulkChangeExamResult ? (
              <>
                <Button size="small" onClick={openBulkMarksDialog}>
                  Give Marks
                </Button>
                <Button size="small" onClick={() => openResultImport('spreadsheet')}>
                  Upload Results
                </Button>
                <Button size="small" onClick={() => openResultImport('omr')}>
                  OMR Import
                </Button>
              </>
            ) : null}
            <Button size="small" color="inherit" onClick={() => setSelectedExamIds([])}>
              Clear selection
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {entranceExamRequired && examsQuery.isError ? (
        <EnrollmentWorkspaceErrorState
          message="Entrance exams are unavailable."
          onRetry={() => examsQuery.refetch()}
        />
      ) : entranceExamRequired ? (
        <CustomizableTable
          tableId="student-enrollment-entrance-exams"
          tableTitle="Entrance Exams"
          columns={columns}
          data={exams}
          isLoading={examsQuery.isLoading}
          serverSide
          serverSidePagination
          serverSideSearch
          serverSideSort
          serverSideFilter
          defaultSearchTerm={search}
          searchFieldProps={{
            placeholder: 'Search applicant or exam slot',
            inputProps: { 'aria-label': 'Search entrance exams' },
          }}
          filters={[...tableFilters, ...columnFilters]}
          totalCount={examsQuery.data?.totalCount || 0}
          page={page}
          rowsPerPage={pageSize}
          defaultRowsPerPage={pageSize}
          rowsPerPageOptions={[pageSize]}
          onServerSearch={(value) => {
            setSearch(value);
            updateState({ page: 1 }, 'replace');
          }}
          onServerPagination={(nextPage) => updateState({ page: nextPage }, 'push')}
          onServerSort={(_column, sorts) => {
            const sort = sorts[0];
            updateState(
              {
                sorting: sort ? `${sort.originalId || sort.column} ${sort.direction}` : undefined,
                page: 1,
              },
              'push'
            );
          }}
          onServerFilter={(filters) => {
            const stateColumns = new Set(['attendanceStatus', 'examStatus', 'eligibilityDecision']);
            setColumnFilters(filters.filter((filter) => !stateColumns.has(filter.column)));
            updateState(
              {
                attendance: getLatestEnumFilter(filters, 'attendanceStatus'),
                examStatus: getLatestEnumFilter(filters, 'examStatus'),
                eligibility: getLatestEnumFilter(filters, 'eligibilityDecision'),
                page: 1,
              },
              'push'
            );
          }}
          noDataText={
            <EnrollmentTableEmptyState
              title="No matching exams"
              description="Change the column filters or schedule an exam from Pipeline."
            />
          }
          rowProps={(row) => ({
            ...createApplicantRowNavigationProps({
              applicantName: row.applicantName,
              onOpen: () => openApplicant(row.leadId, 'exam'),
            }),
            'data-testid': 'student-enrollment-exam-row',
            'data-exam-id': row.id,
          })}
          wrapperProps={{ sx: enrollmentTableWrapperSx }}
          tableContainerProps={{ sx: enrollmentTableContainerSx }}
        />
      ) : null}

      <Dialog open={bulkMarksOpen} onClose={() => setBulkMarksOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Give Marks</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            <Alert severity="info">
              Enter individual marks for each selected applicant. Total and passing marks can stay
              shared unless a specific exam needs a different value.
            </Alert>
            {selectedHasExistingResults && !canOverrideExamResult ? (
              <Alert severity="error">
                Your role cannot replace recorded results. Remove those exams from the selection or
                ask an administrator for the exam-result override permission.
              </Alert>
            ) : selectedHasExistingResults ? (
              <TextField
                required
                label="Correction Reason"
                value={bulkCorrectionReason}
                onChange={(event) => setBulkCorrectionReason(event.target.value)}
                helperText="Required because at least 1 selected exam already has a recorded result."
                multiline
                minRows={2}
              />
            ) : null}
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                fullWidth
                label="Default total marks"
                type="number"
                value={bulkTotalMarks}
                onChange={(event) => {
                  const { value } = event.target;
                  setBulkTotalMarks(value);
                  setBulkMarksByExamId((current) =>
                    Object.fromEntries(
                      Object.entries(current).map(([examId, form]) => [
                        examId,
                        { ...form, totalMarks: value },
                      ])
                    )
                  );
                }}
              />
              <TextField
                fullWidth
                label="Default passing marks"
                type="number"
                value={bulkPassingMarks}
                onChange={(event) => {
                  const { value } = event.target;
                  setBulkPassingMarks(value);
                  setBulkMarksByExamId((current) =>
                    Object.fromEntries(
                      Object.entries(current).map(([examId, form]) => [
                        examId,
                        { ...form, passingMarks: value },
                      ])
                    )
                  );
                }}
              />
            </Stack>
            <Stack spacing={1}>
              {selectedExams.map((exam) => {
                const form = bulkMarksByExamId[exam.id] || {
                  totalMarks: bulkTotalMarks,
                  passingMarks: bulkPassingMarks,
                  obtainedMarks: '',
                  meritRank: '',
                };

                return (
                  <Paper key={exam.id} variant="outlined" sx={{ p: 1, borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        justifyContent="space-between"
                        gap={1}
                      >
                        <Typography variant="subtitle2">{exam.applicantName}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {dateTimeFormatter.format(new Date(exam.examStartTime))}
                        </Typography>
                      </Stack>
                      <Box
                        sx={{
                          display: 'grid',
                          gap: 1,
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(4, minmax(0, 1fr))',
                          },
                        }}
                      >
                        <TextField
                          label="Total marks"
                          type="number"
                          value={form.totalMarks}
                          onChange={(event) =>
                            updateBulkExamResult(exam.id, 'totalMarks', event.target.value)
                          }
                        />
                        <TextField
                          label="Passing marks"
                          type="number"
                          value={form.passingMarks}
                          onChange={(event) =>
                            updateBulkExamResult(exam.id, 'passingMarks', event.target.value)
                          }
                        />
                        <TextField
                          label="Obtained marks"
                          type="number"
                          value={form.obtainedMarks}
                          onChange={(event) =>
                            updateBulkExamResult(exam.id, 'obtainedMarks', event.target.value)
                          }
                        />
                        <TextField
                          label="Merit rank"
                          type="number"
                          value={form.meritRank}
                          onChange={(event) =>
                            updateBulkExamResult(exam.id, 'meritRank', event.target.value)
                          }
                        />
                      </Box>
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkMarksOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={bulkResultsState.isLoading}
            disabled={!bulkMarksReady}
            onClick={uploadSelectedResults}
          >
            Save Marks
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={resultImportOpen}
        onClose={() => setResultImportOpen(false)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {resultImportMode === 'omr' ? 'Import OMR Results' : 'Upload Exam Results'}
        </DialogTitle>
        <DialogContent dividers>
          <Stack spacing={1.5}>
            <Alert severity="info">
              {resultImportMode === 'omr'
                ? 'Upload the CSV or Excel result file exported by your OMR scanner. ShikshaMitra validates every selected applicant before saving.'
                : 'Download the selected-exam template, enter individual marks, then upload the completed CSV or Excel file.'}
            </Alert>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="mdi:file-download-outline" />}
                onClick={() => downloadExamResultTemplate(selectedExams)}
              >
                Download Template
              </Button>
              <Button
                component="label"
                variant="contained"
                startIcon={<Iconify icon="mdi:file-upload-outline" />}
                disabled={isReadingResultFile}
              >
                {isReadingResultFile ? 'Reading File…' : 'Choose Result File'}
                <input
                  hidden
                  type="file"
                  name="exam-result-file"
                  accept=".csv,.xls,.xlsx,text/csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                  onChange={(event) => handleResultImportFile(event.target.files?.[0])}
                />
              </Button>
            </Stack>
            {resultImportFileName ? (
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                Selected: {resultImportFileName}
              </Typography>
            ) : null}
            {isReadingResultFile ? (
              <LinearProgress aria-label="Reading exam result file" />
            ) : null}
            {resultImportPreview?.errors.length ? (
              <Alert severity="error">
                <Typography variant="subtitle2">Fix these rows before importing:</Typography>
                <Box component="ul" sx={{ my: 0.5, pl: 2.5 }}>
                  {resultImportPreview.errors.slice(0, 10).map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </Box>
                {resultImportPreview.errors.length > 10
                  ? `${resultImportPreview.errors.length - 10} more errors are not shown.`
                  : null}
              </Alert>
            ) : null}
            {resultImportPreview && resultImportPreview.errors.length === 0 ? (
              <Alert severity="success">
                {resultImportPreview.items.length} result
                {resultImportPreview.items.length === 1 ? '' : 's'} validated and ready to import.
              </Alert>
            ) : null}
            {selectedHasExistingResults && !canOverrideExamResult ? (
              <Alert severity="error">
                Your role cannot replace recorded results. Import a selection without existing
                results or ask an administrator for the exam-result override permission.
              </Alert>
            ) : selectedHasExistingResults ? (
              <TextField
                required
                label="Correction Reason"
                value={bulkCorrectionReason}
                onChange={(event) => setBulkCorrectionReason(event.target.value)}
                helperText="Required because the selected set contains an existing result."
                multiline
                minRows={2}
              />
            ) : null}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setResultImportOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={bulkResultsState.isLoading}
            disabled={
              !resultImportPreview ||
              resultImportPreview.items.length === 0 ||
              resultImportPreview.errors.length > 0 ||
              (selectedHasExistingResults &&
                (!canOverrideExamResult || !bulkCorrectionReason.trim()))
            }
            onClick={uploadImportedResults}
          >
            Import Results
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(selectedExam)}
        onClose={() => setSelectedExam(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Manage Entrance Exam</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ pt: 1 }}>
            {selectedExam && (
              <Alert severity="info">
                {selectedExam.applicantName} ·{' '}
                {dateTimeFormatter.format(new Date(selectedExam.examStartTime))}
              </Alert>
            )}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Attendance
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextField
                  select
                  fullWidth
                  label="Attendance status"
                  value={attendance}
                  disabled={!canChangeExamResult}
                  onChange={(event) => setAttendance(Number(event.target.value))}
                >
                  {attendance === AdmissionCrmExamAttendanceStatus.NotMarked ? (
                    <MenuItem value={AdmissionCrmExamAttendanceStatus.NotMarked} disabled>
                      Not marked
                    </MenuItem>
                  ) : null}
                  {Object.entries(attendanceLabels)
                    .filter(
                      ([value]) =>
                        Number(value) !== AdmissionCrmExamAttendanceStatus.NotMarked
                    )
                    .map(([value, label]) => (
                      <MenuItem key={value} value={Number(value)}>
                        {label}
                      </MenuItem>
                    ))}
                </TextField>
                <LoadingButton
                  variant="outlined"
                  loading={markAttendanceState.isLoading}
                  disabled={
                    !canChangeExamResult ||
                    attendance === AdmissionCrmExamAttendanceStatus.NotMarked
                  }
                  onClick={() =>
                    selectedExam &&
                    run(
                      () =>
                        markAttendance({
                          examRecordId: selectedExam.id,
                          body: { attendanceStatus: attendance },
                        }).unwrap(),
                      'Attendance recorded.'
                    )
                  }
                >
                  Save Attendance
                </LoadingButton>
              </Stack>
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Marks & Merit
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextField
                  label="Total marks"
                  type="number"
                  value={totalMarks}
                  disabled={
                    !canChangeExamResult ||
                    (selectedExam?.obtainedMarks != null && !canOverrideExamResult)
                  }
                  onChange={(event) => setTotalMarks(event.target.value)}
                />
                <TextField
                  label="Passing marks"
                  type="number"
                  value={passingMarks}
                  disabled={
                    !canChangeExamResult ||
                    (selectedExam?.obtainedMarks != null && !canOverrideExamResult)
                  }
                  onChange={(event) => setPassingMarks(event.target.value)}
                />
                <TextField
                  label="Obtained marks"
                  type="number"
                  value={obtainedMarks}
                  disabled={
                    !canChangeExamResult ||
                    (selectedExam?.obtainedMarks != null && !canOverrideExamResult)
                  }
                  onChange={(event) => setObtainedMarks(event.target.value)}
                />
                <TextField
                  label="Merit rank"
                  type="number"
                  value={meritRank}
                  disabled={
                    !canChangeExamResult ||
                    (selectedExam?.obtainedMarks != null && !canOverrideExamResult)
                  }
                  onChange={(event) => setMeritRank(event.target.value)}
                />
              </Stack>
              {selectedExam?.obtainedMarks != null && !canOverrideExamResult ? (
                <Alert severity="error" sx={{ mt: 1.25 }}>
                  Your role can record new results but cannot replace an existing result.
                </Alert>
              ) : selectedExam?.obtainedMarks != null ? (
                <TextField
                  required
                  fullWidth
                  label="Correction Reason"
                  value={resultCorrectionReason}
                  onChange={(event) => setResultCorrectionReason(event.target.value)}
                  helperText="Required when replacing a previously recorded result."
                  multiline
                  minRows={2}
                  sx={{ mt: 1.25 }}
                />
              ) : null}
              {canChangeExamResult &&
              (selectedExam?.obtainedMarks == null || canOverrideExamResult) ? (
                <LoadingButton
                  variant="outlined"
                  loading={uploadResultState.isLoading}
                  disabled={
                    !totalMarks ||
                    !passingMarks ||
                    !obtainedMarks ||
                    (selectedExam?.obtainedMarks != null && !resultCorrectionReason.trim())
                  }
                  onClick={() =>
                    selectedExam &&
                    run(
                      () =>
                        uploadResult({
                          examRecordId: selectedExam.id,
                          body: {
                            totalMarks: Number(totalMarks),
                            passingMarks: Number(passingMarks),
                            obtainedMarks: Number(obtainedMarks),
                            meritRank: meritRank ? Number(meritRank) : undefined,
                            correctionReason: resultCorrectionReason.trim() || undefined,
                          },
                        }).unwrap(),
                      selectedExam.obtainedMarks == null
                        ? 'Exam result recorded.'
                        : 'Exam result correction recorded.'
                    )
                  }
                  sx={{ mt: 1.25 }}
                >
                  Save Result
                </LoadingButton>
              ) : null}
            </Box>
            <Divider />
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Eligibility Decision
              </Typography>
              <Stack spacing={1.25}>
                <TextField
                  select
                  label="Decision"
                  value={eligibility}
                  disabled={!canChangeExamResult}
                  onChange={(event) => setEligibility(Number(event.target.value))}
                >
                  {eligibility === AdmissionCrmEligibilityDecision.Pending ? (
                    <MenuItem value={AdmissionCrmEligibilityDecision.Pending} disabled>
                      Select a decision
                    </MenuItem>
                  ) : null}
                  {Object.entries(admissionCrmEligibilityLabels)
                    .filter(
                      ([value]) =>
                        Number(value) !== AdmissionCrmEligibilityDecision.Pending
                    )
                    .map(([value, label]) => (
                      <MenuItem key={value} value={Number(value)}>
                        {label}
                      </MenuItem>
                    ))}
                </TextField>
                <TextField
                  required
                  label="Decision reason"
                  value={decisionReason}
                  disabled={!canChangeExamResult}
                  onChange={(event) => setDecisionReason(event.target.value)}
                  multiline
                  minRows={2}
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={overrideDecision}
                      disabled={!canChangeExamResult || !canOverrideEligibility}
                      onChange={(_, checked) => setOverrideDecision(checked)}
                    />
                  }
                  label="Override the calculated decision"
                />
                {canChangeExamResult && !canOverrideEligibility ? (
                  <Typography variant="caption" color="text.secondary">
                    Eligibility override permission is required to replace the calculated decision.
                  </Typography>
                ) : null}
                {overrideDecision && (
                  <TextField
                    required
                    label="Override reason"
                    value={overrideReason}
                    disabled={!canChangeExamResult || !canOverrideEligibility}
                    onChange={(event) => setOverrideReason(event.target.value)}
                    multiline
                    minRows={2}
                  />
                )}
                <LoadingButton
                  variant="contained"
                  loading={decideEligibilityState.isLoading}
                  disabled={
                    !canChangeExamResult ||
                    eligibility === AdmissionCrmEligibilityDecision.Pending ||
                    !decisionReason.trim() ||
                    (overrideDecision &&
                      (!canOverrideEligibility || !overrideReason.trim()))
                  }
                  onClick={() =>
                    selectedExam &&
                    run(
                      () =>
                        decideEligibility({
                          examRecordId: selectedExam.id,
                          body: {
                            decision: eligibility,
                            reason: decisionReason.trim(),
                            meritRank: meritRank ? Number(meritRank) : undefined,
                            overrideDecision,
                            overrideReason: overrideDecision ? overrideReason.trim() : undefined,
                          },
                        }).unwrap(),
                      'Eligibility decision recorded.'
                    )
                  }
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Save Eligibility
                </LoadingButton>
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedExam(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(handoffExamId)}
        onClose={() => setHandoffExamId('')}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Eligibility Handoff</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            {handoffQuery.isFetching && <LinearProgress aria-label="Loading eligibility handoff" />}
            {handoffQuery.isError && (
              <Alert severity="error">Eligibility handoff details are unavailable.</Alert>
            )}
            {handoffQuery.data && (
              <>
                <Alert severity={handoffQuery.data.canStartAdmission ? 'success' : 'warning'}>
                  {handoffQuery.data.canStartAdmission
                    ? 'Eligible for admission handoff'
                    : 'Review before admission handoff'}
                </Alert>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography variant="subtitle2">{handoffQuery.data.applicantName}</Typography>
                      <Chip
                        size="small"
                        variant="outlined"
                        label={admissionCrmEligibilityLabels[handoffQuery.data.eligibilityDecision]}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {handoffQuery.data.desiredClassName || 'Class not captured'} -{' '}
                      {handoffQuery.data.admissionIntent}
                    </Typography>
                    {handoffQuery.data.dateOfBirth && (
                      <Typography variant="body2" color="text.secondary">
                        DOB: {dateFormatter.format(new Date(handoffQuery.data.dateOfBirth))}
                      </Typography>
                    )}
                    <Divider />
                    <Typography variant="body2">
                      {handoffQuery.data.primaryContactNo ||
                        handoffQuery.data.email ||
                        'No contact captured'}
                    </Typography>
                    <Typography variant="body2">
                      Marks:{' '}
                      {handoffQuery.data.obtainedMarks != null &&
                      handoffQuery.data.totalMarks != null
                        ? `${handoffQuery.data.obtainedMarks}/${handoffQuery.data.totalMarks}`
                        : 'Not recorded'}
                    </Typography>
                    {handoffQuery.data.missingAdmissionFields.length > 0 && (
                      <Alert severity="warning">
                        Missing: {handoffQuery.data.missingAdmissionFields.join(', ')}
                      </Alert>
                    )}
                  </Stack>
                </Paper>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          {handoffQuery.data?.eligibilityDecision === AdmissionCrmEligibilityDecision.Eligible ? (
            <Button
              variant="contained"
              onClick={() => {
                openApplicant(handoffQuery.data!.leadId, 'registration');
                setHandoffExamId('');
              }}
            >
              Continue to Registration
            </Button>
          ) : null}
          <Button onClick={() => setHandoffExamId('')}>Close</Button>
        </DialogActions>
      </Dialog>

    </Stack>
  );
}
