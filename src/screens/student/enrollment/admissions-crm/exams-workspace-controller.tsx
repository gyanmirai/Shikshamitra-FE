'use client';

import type { ComponentProps } from 'react';

import type { RootState } from 'src/redux/store';

import type { LabelColor } from 'src/components/label';

import type { IColumn, IParams } from 'src/components/customizabaleTable/types';

import type { AdmissionCrmEntranceExamDto } from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import { useSelector } from 'react-redux';

import { Label } from 'src/components/label';

import { Iconify } from 'src/components/iconify';

import { shikshaMitraToast } from 'src/components/toast';

import { studentPaths } from 'src/constants/student-menu';

import ThreeDotsActions from 'src/components/three-dots-actions';

import { memo, useRef, useMemo, useState, useEffect, useCallback } from 'react';

import {
  Link,
  Stack,
  Button,
  Checkbox,
  MenuItem,
  MenuList,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import {
  EntranceExamStatusEnum,
  AdmissionCrmEligibilityDecision,
  AdmissionCrmExamAttendanceStatus,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import {
  useGetAdmissionCrmEntranceExamsQuery,
  useUploadAdmissionCrmExamResultMutation,
  useDecideAdmissionCrmEligibilityMutation,
  useGetAdmissionCrmEntranceExamByLeadQuery,
  useGetAdmissionCrmEligibilityHandoffQuery,
  useMarkAdmissionCrmExamAttendanceMutation,
  useBulkUploadAdmissionCrmExamResultsMutation,
  useBulkMarkAdmissionCrmExamAttendanceMutation,
} from 'src/redux/student/admissions-crm/communication-exams-events-api';

import { useGetAdmissionCrmQuickInquiryOptionsQuery } from 'src/redux/student/admissions-crm/core-leads-api';

import { formatApplicantNumber } from './enrollment-display';

import { getExamBulkFailures } from './bulk-operation-errors';

import { admissionCrmEligibilityLabels } from './admissions-crm-utils';

import { getEnrollmentApiErrorMessage } from './enrollment-api-errors';

import { useEnrollmentWorkspace } from './enrollment-workspace-context';

import { useWorkspaceTableSessionState } from './workspace-table-session-state';

import { resolveAdmissionCrmExamActionPermissions } from './admission-action-permissions';

import { readExamResultImportFile } from './exam-result-import';

import { isValidExamResultValues, validateExamResultValues } from './exam-result-validation';

import {
  createEnrollmentQueryScopeKey,
  getEnrollmentFilterQueryScope,
} from './enrollment-query-scope';

import { createApplicantLinkNavigationProps } from './applicant-row-navigation';

import {
  useApplicantWorkspaceDirtyState,
  useApplicantWorkspaceTransition,
} from './applicant-workspace-dirty-context';

import { enrollmentActionsColumn } from './workspace-table-patterns';

import type { ExamResultValues } from './exam-result-validation';

import type { ExamResultImportPreview } from './exam-result-import';

import type { EnrollmentBulkFailure } from './bulk-operation-errors';

import type { ApplicantWorkspaceTab } from './applicant-workspace-page';

const pageSize = 50;

const attendanceLabels: Record<AdmissionCrmExamAttendanceStatus, string> = {
  [AdmissionCrmExamAttendanceStatus.NotMarked]: 'Not Marked',
  [AdmissionCrmExamAttendanceStatus.Present]: 'Present',
  [AdmissionCrmExamAttendanceStatus.Absent]: 'Absent',
  [AdmissionCrmExamAttendanceStatus.NoShow]: 'No-show',
  [AdmissionCrmExamAttendanceStatus.Excused]: 'Excused',
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
  [AdmissionCrmExamAttendanceStatus.NoShow]: 'warning',
  [AdmissionCrmExamAttendanceStatus.Excused]: 'info',
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

const accessibleStatusSx = { color: 'text.primary' } as const;

type BulkExamResultForm = ExamResultValues;

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

export function useExamsWorkspaceController() {
  const permissions = useSelector((root: RootState) => root.auth.permissions);

  const { academicYearId, sessionIdentity, state, updateState, getApplicantHref, openApplicant } =
    useEnrollmentWorkspace();

  const page = Math.max(0, state.page - 1);

  const {
    search,
    setSearch,
    filters: columnFilters,
    setFilters: setColumnFilters,
  } = useWorkspaceTableSessionState(`exams:${academicYearId || 'none'}:${sessionIdentity}`);

  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);

  const [selectedExam, setSelectedExam] = useState<AdmissionCrmEntranceExamDto | null>(null);

  const [bulkMarksOpen, setBulkMarksOpen] = useState(false);

  const [resultImportOpen, setResultImportOpen] = useState(false);

  const [resultImportMode, setResultImportMode] = useState<'spreadsheet' | 'omr'>('spreadsheet');

  const [resultImportFileName, setResultImportFileName] = useState('');

  const [resultImportPreview, setResultImportPreview] = useState<ExamResultImportPreview | null>(
    null
  );

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

  const [initializedExamId, setInitializedExamId] = useState('');

  const handledTargetRef = useRef('');

  const { requestTransition } = useApplicantWorkspaceTransition();

  const selectedExamDirty = Boolean(
    selectedExam &&
    initializedExamId === selectedExam.id &&
    (attendance !== selectedExam.attendanceStatus ||
      totalMarks !== (selectedExam.totalMarks?.toString() || '100') ||
      passingMarks !== (selectedExam.passingMarks?.toString() || '40') ||
      obtainedMarks !== (selectedExam.obtainedMarks?.toString() || '') ||
      meritRank !== (selectedExam.meritRank?.toString() || '') ||
      resultCorrectionReason !== '' ||
      eligibility !== selectedExam.eligibilityDecision ||
      decisionReason !== (selectedExam.eligibilityDecisionReason || '') ||
      overrideDecision ||
      overrideReason !== '')
  );

  useApplicantWorkspaceDirtyState('entrance-exam-review', selectedExamDirty);

  const [bulkFailures, setBulkFailures] = useState<EnrollmentBulkFailure[]>([]);

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

  const targetExamQuery = useGetAdmissionCrmEntranceExamByLeadQuery(
    { leadId: state.applicant || '' },
    { skip: !state.applicant }
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
    setInitializedExamId(selectedExam.id);
  }, [selectedExam]);

  const examResultValues = useMemo<ExamResultValues>(
    () => ({ totalMarks, passingMarks, obtainedMarks, meritRank }),
    [meritRank, obtainedMarks, passingMarks, totalMarks]
  );

  const examResultErrors = useMemo(
    () => validateExamResultValues(examResultValues),
    [examResultValues]
  );

  const examResultReady = Object.keys(examResultErrors).length === 0;

  useEffect(() => {
    const targetKey = `${state.applicant || ''}:${state.examAction || ''}`;
    if (!state.applicant || !targetExamQuery.data || handledTargetRef.current === targetKey) return;
    handledTargetRef.current = targetKey;
    setSelectedExam(targetExamQuery.data);
  }, [state.applicant, state.examAction, targetExamQuery.data]);

  useEffect(() => {
    if (!selectedExam || !state.examAction) return undefined;
    const sectionId = {
      'record-result': 'exam-results-section',
      'review-eligibility': 'exam-eligibility-section',
      'review-absence': 'exam-attendance-section',
    }[state.examAction];
    const frame = window.requestAnimationFrame(() => {
      const section = document.getElementById(sectionId);
      section?.focus({ preventScroll: true });
      section?.scrollIntoView({
        block: 'start',
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [selectedExam, state.examAction]);

  const targetActionLabel = state.examAction
    ? {
        'record-result': 'Record Exam Result',
        'review-eligibility': 'Review Eligibility',
        'review-absence': 'Review Exam Absence',
      }[state.examAction]
    : undefined;

  const closeSelectedExam = () =>
    requestTransition(() => {
      setInitializedExamId('');
      setSelectedExam(null);
    });

  const applicantReturnHref = state.applicant
    ? (() => {
        const params = new URLSearchParams();
        if (academicYearId) params.set('cycle', academicYearId);
        params.set('tab', 'exam');
        if (state.applicantReturn) params.set('return', state.applicantReturn);
        return `${studentPaths.enrollment.applicant(state.applicant)}?${params.toString()}`;
      })()
    : undefined;

  const selectionScopeKey = createEnrollmentQueryScopeKey({
    academicYearId,
    search: search.trim(),
    filters: getEnrollmentFilterQueryScope(columnFilters),
    attendanceStatus: state.attendance,
    examStatus: state.examStatus,
    eligibilityDecision: state.eligibility,
    page: state.page,
    sorting: state.sorting || 'ExamStartTime ASC',
  });

  useEffect(() => {
    setSelectedExamIds([]);
    setBulkMarksOpen(false);
    setBulkMarksByExamId({});
  }, [selectionScopeKey]);

  const run = async (action: () => Promise<unknown>, message: string) => {
    try {
      const updated = (await action()) as AdmissionCrmEntranceExamDto;
      setSelectedExam(updated);
      shikshaMitraToast.success({ message });
    } catch (error) {
      shikshaMitraToast.error({
        message: getEnrollmentApiErrorMessage(
          error,
          'The exam record could not be updated. Review the fields and retry.'
        ),
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
    setBulkFailures([]);
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

  const selectedHasExistingResults = selectedExams.some((exam) => exam.obtainedMarks != null);

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
    setBulkFailures((current) => current.filter((failure) => failure.entityId !== examId));
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
    selectedExams.every((exam) => isValidExamResultValues(bulkMarksByExamId[exam.id])) &&
    (!selectedHasExistingResults ||
      (canOverrideExamResult && Boolean(bulkCorrectionReason.trim())));

  const markSelectedAttendance = async (value: AdmissionCrmExamAttendanceStatus) => {
    if (!academicYearId || selectedExamIds.length === 0) return;
    setBulkFailures([]);
    try {
      const result = await bulkMarkAttendance({
        academicYearId,
        examRecordIds: selectedExamIds,
        attendanceStatus: value,
      }).unwrap();
      if (result.failedCount > 0) {
        setBulkFailures(getExamBulkFailures(result, selectedExams));
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
    } catch (error) {
      shikshaMitraToast.error({
        message: getEnrollmentApiErrorMessage(
          error,
          'The selected exam attendance could not be updated.'
        ),
      });
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
        setBulkFailures(getExamBulkFailures(result, selectedExams));
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
      setBulkFailures([]);
      setSelectedExamIds([]);
      shikshaMitraToast.success({
        message: `${result.succeededCount} exam result${result.succeededCount === 1 ? '' : 's'} recorded.`,
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: getEnrollmentApiErrorMessage(
          error,
          'The selected exam results could not be recorded.'
        ),
      });
    }
  };

  const uploadImportedResults = async () => {
    if (
      !academicYearId ||
      !resultImportPreview ||
      resultImportPreview.items.length === 0 ||
      resultImportPreview.errors.length > 0 ||
      (selectedHasExistingResults && (!canOverrideExamResult || !bulkCorrectionReason.trim()))
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
            inputProps={{ 'aria-label': 'Select visible assessments' }}
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
        id: 'applicantNumber',
        originalId: 'ApplicantNumber',
        label: 'Applicant ID',
        width: 120,
        minWidth: 120,
        maxWidth: 120,
        sticky: true,
        stickyPosition: 'left',
        stickyOnMobile: false,
        isFilter: false,
        render: (value) => (
          <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
            {formatApplicantNumber(value as number)}
          </Typography>
        ),
      },
      {
        id: 'applicantName',
        originalId: 'ApplicantName',
        label: 'Applicant',
        width: 190,
        minWidth: 180,
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

  return {
    state: {
      academicYearId,
      applicantReturnHref,
      attendance,
      bulkCorrectionReason,
      bulkFailures,
      bulkMarksByExamId,
      bulkMarksOpen,
      bulkMarksReady,
      bulkPassingMarks,
      bulkTotalMarks,
      columns,
      decisionReason,
      eligibility,
      entranceExamRequired,
      examResultReady,
      exams,
      handoffExamId,
      meritRank,
      obtainedMarks,
      overrideDecision,
      overrideReason,
      page,
      passingMarks,
      resultCorrectionReason,
      resultImportFileName,
      resultImportMode,
      resultImportOpen,
      resultImportPreview,
      search,
      selectedExam,
      selectedExamIds,
      selectedExams,
      selectedHasExistingResults,
      state,
      targetActionLabel,
      totalMarks,
    },
    actions: {
      closeSelectedExam,
      decideEligibility,
      decideEligibilityState,
      handleResultImportFile,
      markAttendance,
      markAttendanceState,
      markSelectedAttendance,
      openApplicant,
      openBulkMarksDialog,
      openResultImport,
      run,
      setAttendance,
      setBulkCorrectionReason,
      setBulkFailures,
      setBulkMarksByExamId,
      setBulkMarksOpen,
      setBulkPassingMarks,
      setBulkTotalMarks,
      setColumnFilters,
      setDecisionReason,
      setEligibility,
      setHandoffExamId,
      setMeritRank,
      setObtainedMarks,
      setOverrideDecision,
      setOverrideReason,
      setPassingMarks,
      setResultCorrectionReason,
      setResultImportOpen,
      setSearch,
      setSelectedExam,
      setSelectedExamIds,
      setTotalMarks,
      updateBulkExamResult,
      updateState,
      uploadImportedResults,
      uploadResult,
      uploadResultState,
      uploadSelectedResults,
    },
    meta: {
      bulkAttendanceState,
      bulkResultsState,
      canBulkChangeExamAttendance,
      canBulkChangeExamResult,
      canChangeExamResult,
      canOverrideEligibility,
      canOverrideExamResult,
      columnFilters,
      examResultErrors,
      examsQuery,
      handoffQuery,
      isReadingResultFile,
      tableFilters,
      targetExamQuery,
    },
  };
}

export type ExamsWorkspaceController = ReturnType<typeof useExamsWorkspaceController>;
