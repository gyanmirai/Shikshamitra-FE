'use client';

import type { ReactNode } from 'react';
import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type { TooltipProps } from '@mui/material/Tooltip';
import type {
  AssignmentRequest,
  AssignmentContext,
  AssignmentCandidate,
  AssignmentBulkResult,
  AssignmentBulkPreview,
} from 'src/redux/finance/studentFeeAssignment';

import * as Yup from 'yup';
import { Formik } from 'formik';
import isEqual from 'lodash/isEqual';
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { formatNumber } from 'src/utils/formate_number';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { useRef, useState, useEffect, useCallback } from 'react';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { FeeStructureSelect } from 'src/components/fee-structure-selection';
import { DetailGrid, DetailField } from 'src/screens/finance/components/detail-view';
import { FormSectionCard, FormSectionHeader } from 'src/components/form-section-card';
import { AssignmentFormSkeleton } from 'src/screens/finance/components/FinanceFormSkeletons';
import FinancePrerequisiteState from 'src/screens/finance/components/FinancePrerequisiteState';
import { isFinancePrerequisiteMissing } from 'src/screens/finance/components/financePrerequisites';
import { useRefreshFinancePrerequisites } from 'src/screens/finance/hooks/useRefreshFinancePrerequisites';
import {
  Box,
  List,
  Stack,
  Alert,
  Button,
  Tooltip,
  ListItem,
  TextField,
  Pagination,
  Typography,
  ListItemButton,
} from '@mui/material';
import {
  assignmentError,
  assignmentErrorCode,
  useAssignmentDetailsQuery,
  useAssignmentContextsQuery,
  useAssignmentCommitMutation,
  useAssignmentCandidatesQuery,
  useAssignmentPreviewMutation,
  useAssignmentBulkCommitMutation,
  useAssignmentBulkPreviewMutation,
} from 'src/redux/finance/studentFeeAssignment';

import AssignmentReview from './AssignmentReview';
import AssignmentPolicies from './AssignmentPolicies';
import AssignedPolicyEditor from './AssignedPolicyEditor';
import AssignmentStudentInputs from './AssignmentStudentInputs';
import { optionalServiceStatus } from './optionalServiceStatus';
import OptionalFeeServiceRestart from './OptionalFeeServiceRestart';
import PreparedAssignmentHandoff from './PreparedAssignmentHandoff';
import { assignmentCurrencyTotals } from './assignmentReviewPresentation';
import { assignmentEditRequest, assignmentEditReasonError } from './assignmentEditRequest';
import { assignmentYearBounds, assignmentServiceDateError } from './assignmentServiceDates';
import AssignmentForm, { assignmentBatchGrid, AssignmentPreviewDialog } from './AssignmentForm';
import {
  assignmentInputError,
  assignmentPolicyError,
  assignmentFeeSelectionError,
} from './variableAssignmentValidation';
import {
  mergeAssignmentInputs,
  admissionServicePeriods,
  admissionAssignmentRequest,
} from './assignmentAdmissionContext';

import type { IFeeStructureData } from './type';

type Student = Omit<IFeeStructureData, 'id'>;
interface AssignmentValues {
  structureId: string;
  requests: AssignmentRequest[];
}
const assignmentEditSteps = ['Structure & policies', 'Fees & dates', 'Review & save'];
const initialValues: AssignmentValues = { structureId: '', requests: [] };
const studentNameTooltipSlots: TooltipProps['slotProps'] = {
  tooltip: {
    sx: {
      maxWidth: 'min(300px, calc(100vw - 32px))',
      overflowWrap: 'anywhere',
      whiteSpace: 'normal',
    },
  },
  popper: {
    modifiers: [
      {
        name: 'flip',
        options: { fallbackPlacements: ['top'], rootBoundary: 'viewport', padding: 8 },
      },
      {
        name: 'preventOverflow',
        options: { rootBoundary: 'viewport', padding: 8, altAxis: true, tether: false },
      },
    ],
  },
};

function AssignmentDetailsRegion({ bounded, children }: { bounded: boolean; children: ReactNode }) {
  return bounded ? (
    <Scrollbar
      sx={{ minHeight: 0, flex: 1, overscrollBehavior: 'contain' }}
      ariaLabel="Student fee details"
      scrollableNodeProps={{ tabIndex: 0 }}
    >
      {children}
    </Scrollbar>
  ) : (
    children
  );
}

// Observe the shared Formik values without creating another form-state owner.
function AssignmentDirtyState({ dirty }: { dirty: boolean }) {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(setIsChanges(dirty));
    return () => {
      dispatch(setIsChanges(false));
    };
  }, [dirty, dispatch]);
  return null;
}

function AssignmentAmountValidity({
  invalid,
  onChange,
}: {
  invalid: boolean;
  onChange: (invalid: boolean) => void;
}) {
  useEffect(() => onChange(invalid), [invalid, onChange]);
  return null;
}

type AssignmentWorkflowProps = {
  students: Student[];
  academicYearId: string;
  academicYearName?: string;
  editAssignedPolicies?: boolean;
  onClose: () => void;
  onCompleted?: () => void;
  onViewSavedAssignment?: () => void;
  onBusyChange?: (busy: boolean) => void;
  onContextResolved?: (status: AssignmentContext['status']) => void;
  onStructureEditResolved?: (editing: boolean) => void;
};

export default function AssignmentWorkflow({
  students: selectedStudents,
  academicYearId,
  onContextResolved,
  onBusyChange,
  ...editorProps
}: AssignmentWorkflowProps) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const canAssign = hasGrantedPermission(
    permissions,
    `${financePermissions.fees.structureAssign}.Add`
  );
  const contextQuery = useAssignmentContextsQuery(
    {
      academicYearId,
      studentIds: selectedStudents.map((student) => student.studentId),
      includeEditDetails:
        selectedStudents.length > 1 ||
        !!editorProps.editAssignedPolicies ||
        !selectedStudents[0]?.isFeeStructureAssigned,
    },
    { skip: !academicYearId || selectedStudents.length === 0, refetchOnMountOrArgChange: true }
  );
  const contexts =
    contextQuery.currentData ?? (contextQuery.isFetching ? undefined : contextQuery.data);
  const initialBatchContexts = useRef<AssignmentContext[] | undefined>(undefined);
  if (
    selectedStudents.length > 1 &&
    contexts &&
    !contextQuery.isFetching &&
    !initialBatchContexts.current
  )
    initialBatchContexts.current = contexts;
  const single =
    selectedStudents.length === 1
      ? contexts?.find((item) => item.studentId === selectedStudents[0].studentId)
      : undefined;
  useEffect(() => {
    if (single?.status) onContextResolved?.(single.status);
  }, [single?.status, onContextResolved]);
  if (
    ((contextQuery.isLoading || contextQuery.isFetching) && !contexts) ||
    (selectedStudents.length > 1 && contextQuery.isFetching && !initialBatchContexts.current)
  )
    return (
      <Box sx={{ p: 2 }} role="status" aria-label="Loading assignment context">
        <AssignmentFormSkeleton />
      </Box>
    );
  if (contextQuery.isError)
    return (
      <Alert
        severity="error"
        sx={{ m: 2 }}
        action={<Button onClick={() => contextQuery.refetch()}>Retry</Button>}
      >
        Assignment status could not be verified. Refresh before assigning fees.
      </Alert>
    );
  if (single?.status === 'Prepared')
    return (
      <PreparedAssignmentHandoff
        context={single}
        canAssign={canAssign && selectedStudents[0]?.isActive !== false}
        onSaved={() => contextQuery.refetch()}
        onBusyChange={onBusyChange}
      />
    );
  if (single?.status === 'NeedsAttention')
    return (
      <Alert
        severity="warning"
        sx={{ m: 2 }}
        action={<Button onClick={() => contextQuery.refetch()}>Refresh</Button>}
      >
        {single.blocker || 'Review this student’s admission facts before assigning fees.'}
      </Alert>
    );
  const editingContexts =
    selectedStudents.length > 1 ? (initialBatchContexts.current ?? contexts) : contexts;
  const editSelection =
    editorProps.editAssignedPolicies &&
    selectedStudents.every((student) =>
      editingContexts?.some(
        (item) => item.studentId === student.studentId && item.status === 'Assigned'
      )
    );
  const editingStructure =
    !!editSelection &&
    canAssign &&
    selectedStudents.every((student) => student.isActive !== false) &&
    selectedStudents.every((student) =>
      editingContexts?.some(
        (item) =>
          item.studentId === student.studentId &&
          item.canEditStructure &&
          item.assignmentId &&
          item.assignmentConcurrencyStamp &&
          item.assignedAssignment
      )
    );
  if (editSelection && selectedStudents.length > 1 && !editingStructure) {
    const blocked = editingContexts?.find((item) => !item.canEditStructure);
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        {blocked?.structureEditBlocker ||
          'Select unpaid students with editable assignments. Paid assignments allow policy changes only.'}
      </Alert>
    );
  }
  const editStructures = editingStructure
    ? new Set(
        editingContexts?.map((item) => JSON.stringify([item.structureId, item.structureRevision]))
      )
    : undefined;
  if (editStructures && editStructures.size !== 1)
    return (
      <Alert severity="warning" sx={{ m: 2 }}>
        Select students with the same fee structure and revision for bulk editing.
      </Alert>
    );
  const excluded =
    selectedStudents.length > 1 && !editingStructure
      ? selectedStudents.filter((student) =>
          initialBatchContexts.current?.some(
            (item) =>
              item.studentId === student.studentId &&
              ['Assigned', 'Prepared', 'NeedsAttention'].includes(item.status)
          )
        )
      : [];
  const students =
    selectedStudents.length === 1 && single?.status === 'Assigned'
      ? [{ ...selectedStudents[0], isFeeStructureAssigned: true }]
      : selectedStudents.filter((student) => !excluded.includes(student));
  const confirmedStructures = students.flatMap((student) => {
    const context = contexts?.find((item) => item.studentId === student.studentId);
    return context?.structureId ? [context.structureId] : [];
  });
  if (new Set(confirmedStructures).size > 1)
    return (
      <Alert severity="info" sx={{ m: 2 }}>
        These students have different confirmed admission structures. Review them individually or
        select students with the same structure.
      </Alert>
    );
  return (
    <Stack sx={{ flex: 1, minHeight: 0 }}>
      {excluded.length > 0 && (
        <Alert severity="info" sx={{ m: 2 }}>
          {excluded.length} student(s) already have an assignment, prepared fees, or an issue
          requiring individual review. They are excluded from this batch.
        </Alert>
      )}
      {students.length > 0 ? (
        <AssignmentEditor
          {...editorProps}
          academicYearId={academicYearId}
          editAssignedStructure={editingStructure}
          onBusyChange={onBusyChange}
          students={students}
          contexts={(editingStructure ? editingContexts : contexts) ?? []}
          onAssignedConflict={() => contextQuery.refetch()}
        />
      ) : (
        <Alert severity="info" sx={{ m: 2 }}>
          No students in this selection need a new fee assignment.
        </Alert>
      )}
    </Stack>
  );
}

function AdmissionDefaults({
  formik,
  contexts,
  students,
  candidates,
  academicYearId,
  editingStructure = false,
}: {
  editingStructure?: boolean;
  formik: FormikProps<AssignmentValues>;
  contexts: AssignmentContext[];
  students: Student[];
  candidates?: AssignmentCandidate[];
  academicYearId: string;
}) {
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current || formik.values.structureId || !candidates?.length) return;
    const selected = students
      .map(
        (student) =>
          contexts.find((context) => context.studentId === student.studentId)?.structureId
      )
      .filter(Boolean);
    if (!selected[0] || !selected.every((id) => id === selected[0])) return;
    const candidate = candidates.find((item) => item.id === selected[0]);
    if (!candidate) return;
    initialized.current = true;
    formik.setValues(
      {
        structureId: candidate.id,
        requests: students.map((student) =>
          editingStructure
            ? assignmentEditRequest(
                contexts.find((item) => item.studentId === student.studentId)!,
                candidate,
                academicYearId
              )
            : admissionAssignmentRequest(
                student.studentId,
                academicYearId,
                candidate,
                contexts.find((context) => context.studentId === student.studentId)
              )
        ),
      },
      false
    );
  }, [academicYearId, candidates, contexts, editingStructure, formik, students]);
  return null;
}

function AssignmentEditor({
  students,
  academicYearId,
  academicYearName,
  editAssignedPolicies = false,
  editAssignedStructure: canEditAssignedStructure = false,
  onStructureEditResolved,
  onClose,
  onCompleted,
  onViewSavedAssignment,
  onBusyChange,
  contexts,
  onAssignedConflict,
}: Omit<AssignmentWorkflowProps, 'onContextResolved'> & {
  editAssignedStructure?: boolean;
  contexts: AssignmentContext[];
  onAssignedConflict: () => void;
}) {
  const isBulk = students.length > 1;
  const [correctionRequested, setCorrectionRequested] = useState(false);
  const [serviceSaved, setServiceSaved] = useState(false);
  const [serviceBusy, setServiceBusy] = useState(false);
  const editAssignedStructure =
    canEditAssignedStructure && (isBulk || correctionRequested) && !serviceSaved;
  useEffect(() => {
    if (!canEditAssignedStructure) setCorrectionRequested(false);
  }, [canEditAssignedStructure]);
  useEffect(
    () => onStructureEditResolved?.(editAssignedStructure),
    [editAssignedStructure, onStructureEditResolved]
  );
  const { permissions } = useSelector((state: RootState) => state.auth);
  const currentYear = useSelector((state: RootState) => state.globalState?.currentYear);
  const academicYearBounds = assignmentYearBounds(currentYear, academicYearId);
  const canAssign = hasGrantedPermission(
    permissions,
    `${financePermissions.fees.structureAssign}.Add`
  );
  const canOverrideDates = hasGrantedPermission(
    permissions,
    financePermissions.policies.prorationPolicyActions.overrideChargePeriod
  );
  const canOverridePolicies = hasGrantedPermission(
    permissions,
    `${financePermissions.fees.structureAssign}.OverridePolicies`
  );
  const canStopOptionalService =
    hasGrantedPermission(
      permissions,
      `${financePermissions.fees.structureAssign}.StopOptionalService`
    ) && students[0]?.isActive !== false;
  const canRestartOptionalService =
    canAssign &&
    canStopOptionalService &&
    hasGrantedPermission(permissions, `${financePermissions.fees.structureAssign}.View`);
  const dispatch = useDispatch();
  const onOptionalServiceSaved = () => {
    setServiceSaved(true);
    onViewSavedAssignment?.();
  };
  const editingPolicies =
    editAssignedPolicies &&
    (canOverridePolicies || canStopOptionalService || canEditAssignedStructure) &&
    !editAssignedStructure &&
    !serviceSaved;
  const setPolicyDirty = useCallback((dirty: boolean) => dispatch(setIsChanges(dirty)), [dispatch]);
  const viewing =
    !editAssignedStructure && students.length === 1 && !!students[0].isFeeStructureAssigned;
  const candidates = useAssignmentCandidatesQuery(
    { studentId: students[0]?.studentId, academicYearId },
    { skip: !academicYearId || viewing || !canAssign }
  );
  const serviceBounds = (candidate?: AssignmentCandidate) =>
    assignmentYearBounds(
      candidate && {
        id: candidate.academicYearId,
        startDate: candidate.boardStartDate,
        endDate: candidate.boardEndDate,
      },
      academicYearId
    ) ?? academicYearBounds;
  const missingStructure = isFinancePrerequisiteMissing({
    ...candidates,
    options: candidates.currentData,
    required: !!academicYearId && !viewing && canAssign,
  });
  const refreshPrerequisites = () => {
    if (!candidates.isUninitialized && !viewing && canAssign) candidates.refetch?.();
  };
  useRefreshFinancePrerequisites(refreshPrerequisites, !viewing && canAssign);
  const assigned = useAssignmentDetailsQuery(
    { studentId: students[0]?.studentId, academicYearId },
    { skip: !academicYearId || !viewing }
  );
  const [activeStep, setActiveStep] = useState(0);
  const [reachedStep, setReachedStep] = useState(0);
  const [structureValidated, setStructureValidated] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.studentId ?? '');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const [preview, setPreview] = useState<AssignmentBulkPreview>();
  const [outcomes, setOutcomes] = useState<AssignmentBulkResult>();
  const [error, setError] = useState('');
  const [invalidAmounts, setInvalidAmounts] = useState(false);
  const [showInputErrors, setShowInputErrors] = useState(false);
  const [showEditReasonError, setShowEditReasonError] = useState(false);
  const [operationPhase, setOperationPhase] = useState<'preview' | 'commit'>();
  const [previewClock, setPreviewClock] = useState(Date.now);
  const [retryingConfirmation, setRetryingConfirmation] = useState(false);
  const generation = useRef(0);
  const reviewedValues = useRef<string | undefined>(undefined);
  const operation = useRef(false);
  const [previewBulk, previewState] = useAssignmentBulkPreviewMutation();
  const [commitBulk, commitState] = useAssignmentBulkCommitMutation();
  const [previewOne, previewOneState] = useAssignmentPreviewMutation();
  const [commitOne, commitOneState] = useAssignmentCommitMutation();
  const busy =
    !!operationPhase ||
    previewState.isLoading ||
    commitState.isLoading ||
    previewOneState.isLoading ||
    commitOneState.isLoading ||
    serviceBusy;
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  useEffect(
    () => () => {
      generation.current += 1;
    },
    []
  );
  const committedIds = new Set(
    outcomes?.results
      .filter((r) => r.result || r.outcome === 'AlreadyAssigned')
      .map((r) => r.studentId)
  );
  const complete = committedIds.size === students.length;
  const completionNotified = useRef(false);
  useEffect(() => {
    if (
      completionNotified.current ||
      !onCompleted ||
      !showResults ||
      !complete ||
      busy ||
      !outcomes?.results.every((item) => item.result && item.outcome !== 'AlreadyAssigned')
    )
      return;
    completionNotified.current = true;
    onCompleted();
  }, [busy, complete, onCompleted, outcomes, showResults]);
  const selectedPreviewItems =
    preview?.results.filter((r) => r.preview && !committedIds.has(r.studentId)) ?? [];
  const expiredAt = Math.min(
    ...selectedPreviewItems.flatMap((item) => {
      const expires = Date.parse(item.preview?.previewExpiresAt ?? '');
      return Number.isFinite(expires) ? [expires] : [];
    })
  );
  const previewExpired = expiredAt <= previewClock;
  useEffect(() => {
    setPreviewClock(Date.now());
    if (!Number.isFinite(expiredAt)) return undefined;
    const timer = window.setTimeout(
      () => setPreviewClock(Date.now()),
      Math.max(0, expiredAt - Date.now())
    );
    return () => window.clearTimeout(timer);
  }, [expiredAt]);
  const batchTotals = assignmentCurrencyTotals(
    showResults
      ? (outcomes?.results.flatMap((item) => (item.result ? [item.result.assignment] : [])) ?? [])
      : selectedPreviewItems.flatMap((item) => (item.preview ? [item.preview] : []))
  );
  const invalidate = () => {
    generation.current += 1;
    reviewedValues.current = undefined;
    setPreview(undefined);
    setPreviewDialogOpen(false);
    setShowResults(false);
    setError('');
    setRetryingConfirmation(false);
  };

  const policyReasonMissing = (
    candidate: AssignmentCandidate | undefined,
    request: AssignmentRequest
  ) => {
    const saved = contexts.find((item) => item.studentId === request.studentId)?.assignedAssignment;
    const baseline = request.editAssignmentId ? saved?.policies : candidate?.policies;
    return (
      request.policies?.some(
        (policy) =>
          policy.versionId !==
          (baseline?.find((item) => item.family === policy.family)?.versionId ?? null)
      ) && !request.policyOverrideReason?.trim()
    );
  };

  const runPreview = async (values: AssignmentValues) => {
    if (missingStructure) return;
    generation.current += 1;
    const ticket = generation.current;
    setError('');
    setPreview(undefined);
    const items = values.requests.filter((r) => !committedIds.has(r.studentId));
    if (!items.length) return;
    const editReasonError = items.map(assignmentEditReasonError).find(Boolean);
    if (editReasonError) {
      setShowEditReasonError(true);
      setError(editReasonError);
      return;
    }
    const candidate = candidates.data?.find((item) => item.id === values.structureId);
    if (!candidate) {
      setStructureValidated(false);
      setError('Reload the selected fee structure.');
      setActiveStep(0);
      return;
    }
    const missingPolicy = items.find((request) => assignmentPolicyError(candidate, request));
    if (missingPolicy) {
      setStructureValidated(false);
      setSelectedStudentId(missingPolicy.studentId);
      setActiveStep(0);
      const policyErr = assignmentPolicyError(candidate, missingPolicy)!;
      const studentName =
        students.find((student) => student.studentId === missingPolicy.studentId)?.studentName ||
        'Student';
      setError(students.length === 1 || isBulk ? policyErr : `${studentName}: ${policyErr}`);
      return;
    }
    const missingReason = items.find((request) => policyReasonMissing(candidate, request));
    if (missingReason) {
      setStructureValidated(false);
      setSelectedStudentId(missingReason.studentId);
      setActiveStep(0);
      setError('Enter a policy override reason.');
      return;
    }
    const invalidRequest =
      candidate &&
      items.find(
        (request) =>
          assignmentInputError(candidate, request) ||
          assignmentServiceDateError(candidate, request, academicYearBounds)
      );
    if (invalidRequest && candidate) {
      setSelectedStudentId(invalidRequest.studentId);
      setShowInputErrors(true);
      const studentName =
        students.find((student) => student.studentId === invalidRequest.studentId)?.studentName ||
        'Student';
      setError(
        `${studentName}: ${
          assignmentInputError(candidate, invalidRequest) ||
          assignmentServiceDateError(candidate, invalidRequest, academicYearBounds)
        }`
      );
      setActiveStep(1);
      return;
    }
    try {
      const result: AssignmentBulkPreview =
        students.length === 1
          ? {
              results: [
                { studentId: items[0].studentId, preview: await previewOne(items[0]).unwrap() },
              ],
            }
          : await previewBulk({ items }).unwrap();
      if (ticket === generation.current) {
        const alreadyAssigned = result.results.filter((item) =>
          item.errorCode?.endsWith('AlreadyAssigned')
        );
        if (alreadyAssigned.length) {
          onAssignedConflict();
          setOutcomes((previous) => {
            const existing = previous?.results ?? [];
            const knownIds = new Set(existing.map((item) => item.studentId));
            const additions = alreadyAssigned
              .filter((item) => !knownIds.has(item.studentId))
              .map((item) => ({
                studentId: item.studentId,
                outcome: 'AlreadyAssigned',
                errorMessage: 'Already assigned. View the saved assignment in Finance.',
              }));
            return {
              successCount: previous?.successCount ?? 0,
              alreadyAssignedCount: (previous?.alreadyAssignedCount ?? 0) + additions.length,
              skippedCount: previous?.skippedCount ?? 0,
              failedCount: previous?.failedCount ?? 0,
              results: [...existing, ...additions],
            };
          });
          if (alreadyAssigned.length === result.results.length) setShowResults(true);
        }
        reviewedValues.current = JSON.stringify(values);
        setStructureValidated(true);
        setPreview(result);
        if (!isBulk) setPreviewDialogOpen(true);
        setReachedStep(2);
        setActiveStep(2);
      }
    } catch (e) {
      if (assignmentErrorCode(e).endsWith('AlreadyAssigned')) onAssignedConflict();
      if (ticket === generation.current) setError(assignmentError(e));
    }
  };

  const runCommit = async (values: AssignmentValues) => {
    setError('');
    if (reviewedValues.current !== JSON.stringify(values)) {
      invalidate();
      setActiveStep(1);
      setError('Assignment inputs changed. Preview again before assigning fees.');
      return;
    }
    // A lost response may already have committed. Let the server resolve an
    // identical retry even after expiry; never block retrieval of saved evidence.
    if (!retryingConfirmation && expiredAt <= Date.now()) {
      setPreviewClock(Date.now());
      return;
    }
    const items = selectedPreviewItems.map((r) => ({
      ...values.requests.find((request) => request.studentId === r.studentId)!,
      previewToken: r.preview!.previewToken,
    }));
    if (!items.length) return;
    try {
      const response: AssignmentBulkResult =
        students.length === 1
          ? await (async () => {
              const single = await commitOne(items[0]).unwrap();
              return {
                successCount: single.outcome === 'Assigned' ? 1 : 0,
                alreadyAssignedCount: single.outcome === 'AlreadyAssigned' ? 1 : 0,
                skippedCount: 0,
                failedCount: 0,
                results: [
                  { studentId: items[0].studentId, outcome: single.outcome, result: single },
                ],
              };
            })()
          : await commitBulk({ items }).unwrap();
      if (response.results.some((item) => item.errorCode?.endsWith('AlreadyAssigned')))
        onAssignedConflict();
      const result: AssignmentBulkResult = {
        ...response,
        results: response.results.map((item) =>
          item.errorCode?.endsWith('AlreadyAssigned')
            ? {
                ...item,
                outcome: 'AlreadyAssigned',
                errorMessage: 'Already assigned. View the saved assignment in Finance.',
              }
            : item
        ),
      };
      setOutcomes((previous) => {
        // One canonical result per student. Preserve committed results across retries,
        // including a response containing an older failure for the same student.
        const byStudent = new Map(
          result.results.map((item) => [
            item.studentId,
            item.result
              ? { studentId: item.studentId, outcome: item.result.outcome, result: item.result }
              : item,
          ])
        );
        previous?.results
          .filter((item) => item.result || item.outcome === 'AlreadyAssigned')
          .forEach((item) => {
            if (!byStudent.get(item.studentId)?.result) byStudent.set(item.studentId, item);
          });
        const results = [...byStudent.values()];
        return {
          results,
          successCount: results.filter((item) => item.result?.outcome === 'Assigned').length,
          alreadyAssignedCount: results.filter((item) => item.outcome === 'AlreadyAssigned').length,
          skippedCount: results.filter((item) => !item.result && item.outcome === 'Skipped').length,
          failedCount: results.filter(
            (item) =>
              !item.result && item.outcome !== 'Skipped' && item.outcome !== 'AlreadyAssigned'
          ).length,
        };
      });
      setPreview(undefined);
      setRetryingConfirmation(false);
      setShowResults(true);
      setActiveStep(2);
    } catch (e) {
      if (assignmentErrorCode(e).endsWith('AlreadyAssigned')) onAssignedConflict();
      const status = (e as { status?: number | string })?.status;
      const unconfirmed =
        !assignmentErrorCode(e) &&
        (status === undefined || typeof status === 'string' || status >= 500);
      setRetryingConfirmation(unconfirmed);
      setError(
        unconfirmed
          ? 'Assignment status could not be confirmed. Retry this review to safely retrieve any saved assignments.'
          : assignmentError(e)
      );
    }
  };

  const validationSchema = Yup.object({
    structureId: Yup.string().required('Select a published fee structure.'),
    requests: Yup.array().min(1, 'Select students to assign.'),
  });
  const loadingLabel =
    operationPhase === 'commit'
      ? isBulk
        ? `Assigning ${selectedPreviewItems.length} student${selectedPreviewItems.length === 1 ? '' : 's'}…`
        : 'Saving…'
      : `Previewing ${students.length - committedIds.size} student${students.length - committedIds.size === 1 ? '' : 's'}…`;

  const runCreationOperation = async (phase: 'preview' | 'commit', values: AssignmentValues) => {
    if (
      operation.current ||
      busy ||
      missingStructure ||
      showResults ||
      (phase === 'preview' && (candidates.isLoading || candidates.isError))
    )
      return;
    if (phase === 'preview' && !isBulk && retryingConfirmation) {
      setPreviewDialogOpen(true);
      return;
    }
    operation.current = true;
    setOperationPhase(phase);
    try {
      if (phase === 'preview') await runPreview(values);
      else await runCommit(values);
    } finally {
      operation.current = false;
      setOperationPhase(undefined);
    }
  };

  const compactStudentDetails = editingPolicies || editAssignedStructure;
  const studentDetails =
    !isBulk && (viewing || editAssignedStructure) ? (
      <FormSectionCard
        title="Student Details"
        icon="mdi:account-school-outline"
        descriptionTooltip="Student identity and enrollment context for the selected academic year."
      >
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: compactStudentDetails ? 'repeat(2, minmax(0, 1fr))' : 'minmax(0, 1fr)',
              sm: 'repeat(3, minmax(0, 1fr))',
            },
            gap: 2,
          }}
        >
          {!compactStudentDetails && (
            <DetailField label="Student name" value={students[0].studentName} />
          )}
          <DetailField
            label="Academic year"
            value={
              academicYearName ||
              (currentYear?.id === academicYearId ? currentYear?.name : undefined)
            }
          />
          <DetailField label="GR number" value={students[0].grNumber} />
          {!compactStudentDetails && (
            <DetailField label="Roll number" value={students[0].rollNumber} />
          )}
          <DetailField label="Class / division" value={students[0].standardDivision} />
          {!compactStudentDetails && (
            <>
              <DetailField label="Board" value={students[0].boardName} />
              <DetailField label="Medium" value={students[0].mediumName} />
              <DetailField label="Academic stage" value={students[0].stageName} />
            </>
          )}
        </Box>
      </FormSectionCard>
    ) : null;

  if (viewing && editingPolicies && !assigned.isError && assigned.data?.assignment) {
    return (
      <AssignedPolicyEditor
        data={assigned.data}
        canStopOptionalService={canStopOptionalService}
        canRestartOptionalService={canRestartOptionalService}
        canOverridePolicies={canOverridePolicies}
        onEditFees={
          canEditAssignedStructure && assigned.data.canEditStructure !== false
            ? () => setCorrectionRequested(true)
            : undefined
        }
        onCancel={onClose}
        onSaved={() => {
          (onCompleted ?? onClose)();
        }}
        onOptionalServiceSaved={onOptionalServiceSaved}
        onBusyChange={onBusyChange}
        onDirtyChange={setPolicyDirty}
      >
        {studentDetails}
      </AssignedPolicyEditor>
    );
  }

  if (viewing || !canAssign)
    return (
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Stack
          spacing={2}
          sx={{ flex: 1, minHeight: 0, overflowY: 'auto', p: 2, '& > *': { flexShrink: 0 } }}
        >
          {viewing ? (
            <>
              {studentDetails}
              {assigned.isFetching && !busy && (
                <Box role="status" aria-label="Loading fee assignment">
                  <AssignmentFormSkeleton />
                </Box>
              )}
              {assigned.isError && (
                <Alert
                  severity="error"
                  action={
                    <Button
                      size="small"
                      startIcon={<Iconify icon="mdi:refresh" />}
                      onClick={() => assigned.refetch()}
                    >
                      Retry
                    </Button>
                  }
                >
                  {assignmentError(assigned.error)}
                </Alert>
              )}

              {!assigned.isFetching &&
                !assigned.isError &&
                assigned.data?.assignment &&
                !editingPolicies && (
                  <AssignmentReview data={assigned.data.assignment} committed />
                )}
              {!assigned.isFetching && !assigned.isError && !assigned.data?.assignment && (
                <Alert severity="info">
                  No saved fee assignment is available for this student in the selected academic
                  year.
                </Alert>
              )}
            </>
          ) : (
            <Box>Your current access allows viewing assignments only.</Box>
          )}
        </Stack>
      </Stack>
    );

  const renderContent = (formik: FormikProps<AssignmentValues>, creating = false) => {
    const { values } = formik;
    if (missingStructure && !showResults)
      return (
        <FinancePrerequisiteState
          requirements={[
            {
              key: 'fee-structure',
              description:
                'No published fee structure matches this student’s class, board, medium and academic year.',
            },
          ]}
          onRefresh={refreshPrerequisites}
        />
      );
    const candidate = candidates.data?.find((c) => c.id === values.structureId);
    const structureFields = (
      <FormSectionCard
        title="Fee Structure"
        icon="mdi:file-document-outline"
        descriptionTooltip="Choose the published fee structure to assign for this academic year."
      >
        {candidates.isError && (
          <Alert
            severity="error"
            action={
              <Button
                size="small"
                startIcon={<Iconify icon="mdi:refresh" />}
                onClick={() => candidates.refetch()}
              >
                Retry
              </Button>
            }
          >
            {assignmentError(candidates.error)}
          </Alert>
        )}
        <FeeStructureSelect
          name="structureId"
          label="Fee structure"
          size="small"
          required={creating}
          isSearch={creating}
          value={values.structureId}
          isLoading={candidates.isLoading}
          disabled={
            busy ||
            committedIds.size > 0 ||
            (!editAssignedStructure &&
              contexts.some(
                (sourceContext) =>
                  sourceContext.structureId &&
                  students.some((student) => student.studentId === sourceContext.studentId)
              ))
          }
          error={!!formik.touched.structureId && !!formik.errors.structureId}
          helperText={formik.touched.structureId ? formik.errors.structureId : undefined}
          onBlur={formik.handleBlur}
          options={(candidates.data ?? []).map((c) => ({
            value: c.id,
            label:
              creating && !editAssignedStructure
                ? `${c.name} · Revision ${c.revisionNumber}`
                : c.name,
          }))}
          noOptionsMessage="No published structure for this student and year"
          onChange={(value) => {
            const selectedCandidate = candidates.data?.find((item) => item.id === String(value));
            invalidate();
            setReachedStep(0);
            setStructureValidated(false);
            setShowInputErrors(false);
            setOutcomes(undefined);
            formik.setValues({
              structureId: String(value),
              requests: selectedCandidate
                ? students.map((s) =>
                    editAssignedStructure
                      ? {
                          ...assignmentEditRequest(
                            contexts.find((item) => item.studentId === s.studentId)!,
                            selectedCandidate,
                            academicYearId
                          ),
                          editReason:
                            values.requests.find((item) => item.studentId === s.studentId)
                              ?.editReason ?? '',
                        }
                      : admissionAssignmentRequest(
                          s.studentId,
                          academicYearId,
                          selectedCandidate,
                          contexts.find((item) => item.studentId === s.studentId)
                        )
                  )
                : [],
            });
          }}
        />
        {editAssignedStructure && (
          <TextField
            size="small"
            fullWidth
            required
            label="Fee structure change reason"
            name="editReason"
            value={values.requests[0]?.editReason ?? ''}
            disabled={busy || complete}
            onBlur={() => setShowEditReasonError(true)}
            error={
              showEditReasonError &&
              Boolean(values.requests[0] && assignmentEditReasonError(values.requests[0]))
            }
            onChange={(event) => {
              invalidate();
              setStructureValidated(false);
              formik.setFieldValue(
                'requests',
                values.requests.map((request) =>
                  committedIds.has(request.studentId)
                    ? request
                    : { ...request, editReason: event.target.value }
                )
              );
            }}
            helperText={
              (showEditReasonError &&
                values.requests[0] &&
                assignmentEditReasonError(values.requests[0])) ||
              'Explain why the unpaid fee assignment is changing.'
            }
          />
        )}
        {candidate && (
          <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
            <Stack direction="row" spacing={1}>
              <Label>{candidate.heads.filter((head) => !head.isOptional).length} required</Label>
              {candidate.heads.some((head) => head.isOptional) && (
                <Label>{candidate.heads.filter((head) => head.isOptional).length} optional</Label>
              )}
            </Stack>
            <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
              {candidate.total == null ? '—' : formatNumber(candidate.total, 'INR')}
            </Typography>
          </Stack>
        )}
      </FormSectionCard>
    );
    return (
      <Stack
        spacing={2}
        sx={{
          p: creating ? 0 : 2,
          minWidth: 0,
          ...(!creating && isBulk && { flex: 1, minHeight: 0, overflow: 'hidden' }),
          '& > .MuiAlert-root, & > section': { flexShrink: 0 },
        }}
      >
        {isBulk &&
          (creating || activeStep === 2) &&
          !showResults &&
          !busy &&
          !retryingConfirmation &&
          previewExpired && (
            <Alert
              severity="warning"
              action={
                <Button
                  size="small"
                  startIcon={<Iconify icon="mdi:refresh" />}
                  onClick={() => {
                    invalidate();
                    setActiveStep(1);
                  }}
                >
                  Review and refresh
                </Button>
              }
            >
              This preview has expired. Preview again before assigning fees.
            </Alert>
          )}
        {creating && error && !previewDialogOpen && <Alert severity="error">{error}</Alert>}
        <AssignmentDirtyState dirty={values.requests.some((r) => !committedIds.has(r.studentId))} />
        <AdmissionDefaults
          formik={formik}
          contexts={contexts}
          students={students}
          candidates={candidates.data}
          academicYearId={academicYearId}
          editingStructure={editAssignedStructure}
        />
        {!creating && activeStep === 1 && (
          <AssignmentAmountValidity
            invalid={
              !candidate ||
              values.requests
                .filter((request) => !committedIds.has(request.studentId))
                .some((request) => Boolean(assignmentInputError(candidate, request)))
            }
            onChange={setInvalidAmounts}
          />
        )}
        {!creating && editAssignedStructure && activeStep === 2 && !showResults && (
          <DetailField label="Fee structure change reason" value={values.requests[0]?.editReason} />
        )}
        {showResults && isBulk && (
          <Box>
            {committedIds.size} assigned
            {!complete ? ` · ${students.length - committedIds.size} need attention` : ''}.
          </Box>
        )}

        {(creating || activeStep === 0) && studentDetails}
        {!creating && activeStep === 0 && structureFields}
        {(creating || activeStep > 0 || Boolean(candidate)) &&
          (() => {
            const configuringBulk =
              isBulk && (creating ? !preview && !showResults : activeStep < 2);
            const pendingStudent = students.find((item) => !committedIds.has(item.studentId));
            const reviewStudent = configuringBulk
              ? (pendingStudent ?? students[0])
              : (students.find((item) => item.studentId === selectedStudentId) ?? students[0]);
            const student = creating && isBulk && pendingStudent ? pendingStudent : reviewStudent;
            const request = values.requests.find((r) => r.studentId === student.studentId);
            const admissionContext = contexts.find((item) => item.studentId === student.studentId);
            const savedServiceAssignment =
              !isBulk && editAssignedStructure ? admissionContext?.assignedAssignment : undefined;
            const hasPendingAssignmentChanges =
              savedServiceAssignment &&
              candidate &&
              request &&
              admissionContext &&
              (savedServiceAssignment.structureId !== candidate.id ||
                !isEqual(
                  { ...request, editReason: '' },
                  assignmentEditRequest(admissionContext, candidate, academicYearId)
                ));
            const prorationPolicy = admissionContext?.prorationPolicy;
            const joinedBeforeYear =
              !!admissionContext?.joiningDate &&
              !!academicYearBounds &&
              admissionContext.joiningDate.slice(0, 10) <
                academicYearBounds.start.format('YYYY-MM-DD');
            const admissionPeriods = candidate
              ? admissionServicePeriods(
                  candidate,
                  admissionContext,
                  candidate.heads.filter((head) => head.isOptional).map((head) => head.feeHeadId)
                )
              : [];
            const studentCandidate = candidate && {
              ...candidate,
              heads: candidate.heads.map((head) => ({
                ...head,
                usesSingleServiceMonth:
                  head.usesSingleServiceMonth && Boolean(admissionContext?.joiningDate),
                servicePeriod:
                  admissionPeriods.find((period) => period.feeHeadId === head.feeHeadId) ??
                  head.servicePeriod,
              })),
            };
            const studentPreview = preview?.results.find(
              (r) => r.studentId === reviewStudent.studentId
            );
            const outcome = outcomes?.results.find((r) => r.studentId === reviewStudent.studentId);
            const filtered = students.filter((item) =>
              (item.studentName || '').toLowerCase().includes(studentSearch.toLowerCase())
            );
            const page = Math.min(studentPage, Math.max(1, Math.ceil(filtered.length / 20)));
            const updateRequest = (next: AssignmentRequest) => {
              invalidate();
              if (activeStep === 0) setStructureValidated(false);
              formik.setFieldValue(
                'requests',
                values.requests.map((r) => {
                  if (committedIds.has(r.studentId)) return r;
                  if (!isBulk)
                    return r.studentId === next.studentId && candidate
                      ? mergeAssignmentInputs(next, r, candidate, admissionContext, request)
                      : r;
                  // The bulk editor owns one configuration. Keep each student's identity
                  // and saved result separate while applying changes to all remaining requests.
                  return candidate
                    ? mergeAssignmentInputs(
                        next,
                        r,
                        candidate,
                        contexts.find((item) => item.studentId === r.studentId),
                        request
                      )
                    : r;
                })
              );
            };
            const bulkSetupHelp = (
              <Typography variant="body2" color="text.secondary">
                {editAssignedStructure
                  ? 'Changes apply to all '
                  : contexts.some((source) => source.source === 'Admission')
                    ? 'Finance uses each student’s own joining date for eligible fees. The fee choices apply to all '
                    : 'The same policies, fees and dates apply to all '}
                {committedIds.size ? 'remaining' : 'selected'} students.
                {editAssignedStructure &&
                  ' Each student keeps their saved service dates unless you change them.'}
              </Typography>
            );
            const reviewHeader = (isBulk || (outcome && (showResults || outcome.result))) && (
              <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                {isBulk && (
                  <Typography
                    component="h2"
                    variant="subtitle1"
                    sx={{ overflowWrap: 'anywhere', minWidth: 0 }}
                  >
                    {reviewStudent.studentName || 'Student'}
                  </Typography>
                )}
                {outcome && (showResults || outcome.result) && (
                  <Label color={outcome.result ? 'success' : 'warning'}>
                    {outcome.outcome === 'AlreadyAssigned' ? 'Already assigned' : outcome.outcome}
                  </Label>
                )}
              </Stack>
            );
            const configurationFields = (
              <>
                {(creating || activeStep === 0) &&
                  !isBulk &&
                  (admissionContext?.source === 'Admission' || prorationPolicy) && (
                    <FormSectionCard
                      title="Fee Proration"
                      icon="mdi:calendar-range"
                      descriptionTooltip="Finance uses the joining date recorded in Student Applications, where available, and the same fee-head rules when calculating the preview."
                    >
                      <DetailGrid desktopColumns={2}>
                        <DetailField
                          label="Joining date"
                          value={
                            admissionContext?.joiningDate
                              ? fDate(admissionContext.joiningDate)
                              : 'Not recorded'
                          }
                          secondary={
                            admissionContext?.joiningDate ? 'Student Applications' : undefined
                          }
                        />
                        <DetailField
                          label={
                            editAssignedStructure ? 'Saved proration policy' : 'Proration policy'
                          }
                          value={
                            prorationPolicy
                              ? `${prorationPolicy.name} · v${prorationPolicy.version}`
                              : 'No applicable policy'
                          }
                        />
                      </DetailGrid>
                      <Typography variant="body2" color="text.secondary">
                        {joinedBeforeYear
                          ? 'Full fees apply because the student joined before the academic year started.'
                          : editAssignedStructure
                            ? 'Review the policy and recalculated amounts in the assignment preview.'
                            : 'Review the scheduled fees, reductions and final amounts before assigning.'}
                      </Typography>
                    </FormSectionCard>
                  )}
                {(creating || activeStep === 0) && candidate && request && (
                  <AssignmentPolicies
                    key={request.studentId}
                    studentId={request.studentId}
                    academicYearId={academicYearId}
                    defaults={candidate.policies ?? []}
                    selections={request.policies ?? []}
                    reason={request.policyOverrideReason ?? ''}
                    canOverride={canOverridePolicies}
                    disabled={busy}
                    flat
                    onChange={(policies, policyOverrideReason) =>
                      updateRequest({ ...request, policies, policyOverrideReason })
                    }
                  />
                )}
                {(creating || activeStep === 1) &&
                  candidate &&
                  request &&
                  (() => {
                    const fields = (
                      <>
                        {assignmentFeeSelectionError(candidate, request) && (
                          <Alert severity="info" sx={{ mb: 2 }}>
                            {admissionContext?.source === 'Admission' &&
                            admissionContext.structureId
                              ? 'Select at least one fee in Admission, then refresh this assignment.'
                              : assignmentFeeSelectionError(candidate, request)}
                          </Alert>
                        )}
                        <AssignmentStudentInputs
                          key={student.studentId}
                          candidate={studentCandidate ?? candidate}
                          request={request}
                          savedAssignment={admissionContext?.assignedAssignment}
                          onChange={updateRequest}
                          canOverrideDates={canOverrideDates}
                          allowTransportSource={!isBulk}
                          disabled={busy}
                          yearBounds={serviceBounds(candidate)}
                          validationBounds={academicYearBounds}
                          showErrors={showInputErrors}
                          flat
                          optionalServiceAction={(feeHeadId) => {
                            if (!savedServiceAssignment) return null;
                            const head = savedServiceAssignment.heads.find(
                              (item) =>
                                item.feeHeadId === feeHeadId && item.included && !item.isOneTime
                            );
                            if (!head) return null;
                            const status = optionalServiceStatus(
                              head,
                              savedServiceAssignment.lines.some(
                                (line) =>
                                  line.feeHeadId === feeHeadId &&
                                  (line.optionalServiceCancellationAmount ?? 0) > 0
                              )
                            );
                            if (!status.label) return null;
                            return (
                              <>
                                <Label
                                  color={
                                    status.stopped || status.label === 'Ended'
                                      ? 'default'
                                      : 'success'
                                  }
                                >
                                  {status.label}
                                </Label>
                                {status.stopped && canRestartOptionalService && (
                                  <OptionalFeeServiceRestart
                                    assignment={savedServiceAssignment}
                                    head={head}
                                    disabledReason={
                                      busy
                                        ? 'Another fee assignment operation is in progress.'
                                        : hasPendingAssignmentChanges
                                          ? 'Save or discard pending assignment changes before enabling this service.'
                                          : undefined
                                    }
                                    onSaved={onOptionalServiceSaved}
                                    onBusyChange={setServiceBusy}
                                  />
                                )}
                              </>
                            );
                          }}
                        />
                      </>
                    );
                    return editAssignedStructure ? (
                      fields
                    ) : (
                      <FormSectionCard
                        title="Fees & Dates"
                        icon="mdi:format-list-checks"
                        descriptionTooltip="Review included fee heads and enter amounts and service dates where permitted."
                      >
                        {fields}
                      </FormSectionCard>
                    );
                  })()}
              </>
            );
            if (creating && !isBulk)
              return (
                <Stack spacing={2} sx={{ minWidth: 0 }}>
                  {structureFields}
                  {configurationFields}
                </Stack>
              );
            return (
              <Box
                sx={
                  creating
                    ? assignmentBatchGrid(showResults)
                    : {
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'minmax(0, 1fr)',
                          sm: isBulk ? '240px minmax(0, 1fr)' : 'minmax(0, 1fr)',
                        },
                        ...(isBulk && {
                          flex: '1 1 0',
                          minHeight: 0,
                          overflow: 'hidden',
                          gridTemplateRows: {
                            xs: 'minmax(0, 0.95fr) minmax(0, 1.05fr)',
                            sm: 'minmax(0, 1fr)',
                          },
                        }),
                        gap: 2,
                        alignItems: 'stretch',
                      }
                }
              >
                {isBulk && (
                  <FormSectionCard
                    title="Selected students"
                    icon="mdi:account-group-outline"
                    iconSize={16}
                    iconContainerSize={28}
                    contentSpacing={1}
                    sx={{
                      minWidth: 0,
                      minHeight: 0,
                      overflow: 'hidden',
                      p: 1.5,
                      ...(creating && { gridArea: 'students' }),
                    }}
                    contentSx={{ height: '100%', minHeight: 0 }}
                  >
                    <TextField
                      size="small"
                      fullWidth
                      label="Search selected students"
                      value={studentSearch}
                      disabled={busy}
                      onChange={(e) => {
                        setStudentSearch(e.target.value);
                        setStudentPage(1);
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" aria-live="polite">
                      {configuringBulk
                        ? `${students.length} selected`
                        : `${committedIds.size} assigned · ${students.length - committedIds.size} remaining`}
                    </Typography>
                    {(creating || activeStep === 2) && batchTotals.length > 0 && (
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                        sx={{
                          borderBottom: 1,
                          borderColor: 'divider',
                          pb: 1,
                          flexWrap: 'wrap',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary">
                          {showResults ? 'Confirmed total' : 'Ready total'}
                        </Typography>
                        {batchTotals.map((item) => (
                          <Typography
                            key={item.currency}
                            variant="subtitle1"
                            sx={{ fontVariantNumeric: 'tabular-nums' }}
                          >
                            {formatNumber(item.total, item.currency)}
                          </Typography>
                        ))}
                      </Stack>
                    )}
                    <Scrollbar
                      sx={{ flex: '1 1 0', minHeight: 0, overscrollBehavior: 'contain' }}
                      ariaLabel="Selected students list"
                      scrollableNodeProps={{ tabIndex: 0 }}
                    >
                      <List disablePadding aria-label="Selected students">
                        {filtered.slice((page - 1) * 20, page * 20).map((item) => {
                          if (configuringBulk) {
                            return (
                              <ListItem key={item.studentId} sx={{ px: 1.5 }}>
                                <Tooltip
                                  disableInteractive
                                  title={item.studentName || 'Student'}
                                  placement="bottom"
                                  slotProps={studentNameTooltipSlots}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      overflowWrap: 'anywhere',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {item.studentName || 'Student'}
                                  </Typography>
                                </Tooltip>
                              </ListItem>
                            );
                          }
                          const saved = outcomes?.results.find(
                            (r) => r.studentId === item.studentId
                          );
                          const checked = preview?.results.find(
                            (r) => r.studentId === item.studentId
                          );
                          const input = values.requests.find((r) => r.studentId === item.studentId);
                          const needsInput =
                            !saved?.result &&
                            candidate &&
                            input &&
                            (assignmentInputError(candidate, input) ||
                              assignmentServiceDateError(candidate, input, academicYearBounds));
                          const needsAttention =
                            !saved?.result &&
                            !checked?.preview &&
                            (saved?.errorMessage || checked?.errorMessage || needsInput);
                          return (
                            <ListItemButton
                              key={item.studentId}
                              selected={item.studentId === reviewStudent.studentId}
                              disabled={busy}
                              aria-label={`Select ${item.studentName || 'student'}`}
                              aria-current={
                                item.studentId === reviewStudent.studentId ? 'true' : undefined
                              }
                              onClick={() => setSelectedStudentId(item.studentId)}
                              sx={{
                                borderRadius: 1,
                                mb: 0.5,
                                px: 1.5,
                                border: 1,
                                borderColor:
                                  item.studentId === reviewStudent.studentId
                                    ? 'primary.main'
                                    : 'transparent',
                                '&.Mui-selected': { bgcolor: 'action.selected' },
                              }}
                            >
                              <Stack spacing={0.5} sx={{ minWidth: 0, width: '100%' }}>
                                <Tooltip
                                  disableInteractive
                                  title={item.studentName || 'Student'}
                                  placement="bottom"
                                  slotProps={studentNameTooltipSlots}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    sx={{
                                      overflowWrap: 'anywhere',
                                      display: '-webkit-box',
                                      WebkitLineClamp: 2,
                                      WebkitBoxOrient: 'vertical',
                                      overflow: 'hidden',
                                    }}
                                  >
                                    {item.studentName || 'Student'}
                                  </Typography>
                                </Tooltip>
                                {(saved?.result || needsAttention) && (
                                  <Label color={saved?.result ? 'success' : 'warning'}>
                                    {saved?.result
                                      ? saved.outcome === 'AlreadyAssigned'
                                        ? 'Already assigned'
                                        : 'Assigned'
                                      : 'Needs attention'}
                                  </Label>
                                )}
                                {needsAttention && (
                                  <Typography
                                    variant="caption"
                                    color="error.main"
                                    sx={{ overflowWrap: 'anywhere' }}
                                  >
                                    {needsInput || saved?.errorMessage || checked?.errorMessage}
                                  </Typography>
                                )}
                              </Stack>
                            </ListItemButton>
                          );
                        })}
                      </List>
                      {!filtered.length && (
                        <Typography variant="body2" color="text.secondary">
                          No matching students.
                        </Typography>
                      )}
                    </Scrollbar>
                    {filtered.length > 20 && (
                      <Pagination
                        size="small"
                        siblingCount={0}
                        count={Math.ceil(filtered.length / 20)}
                        page={page}
                        disabled={busy}
                        onChange={(_, next) => setStudentPage(next)}
                      />
                    )}
                  </FormSectionCard>
                )}
                {creating && !showResults && (
                  <Stack spacing={2} sx={{ minWidth: 0, gridArea: 'setup' }}>
                    {structureFields}
                    {isBulk && bulkSetupHelp}
                    {configurationFields}
                  </Stack>
                )}
                <AssignmentDetailsRegion bounded={isBulk && !creating}>
                  <Stack
                    role={creating ? 'region' : undefined}
                    aria-label={creating ? 'Student fee details' : undefined}
                    spacing={2}
                    sx={{
                      minWidth: 0,
                      pr: isBulk && !creating ? 1 : 0,
                      ...(creating && { gridArea: 'preview' }),
                    }}
                  >
                    {creating && (
                      <FormSectionHeader
                        title={showResults ? 'Assignment Results' : 'Assignment Preview'}
                        icon="mdi:clipboard-check-outline"
                        descriptionTooltip="Review Finance-calculated amounts and installment details for this assignment."
                      />
                    )}
                    {configuringBulk ? !creating && bulkSetupHelp : reviewHeader}
                    {!creating && !outcome?.result && configurationFields}
                    {outcome?.result ? (
                      <AssignmentReview data={outcome.result.assignment} committed />
                    ) : (
                      <>
                        {creating && !showResults && !preview && (
                          <Typography variant="body2" color="text.secondary">
                            Preview the configured fees before assigning them.
                          </Typography>
                        )}
                        {outcome?.errorMessage && !studentPreview?.preview && (
                          <Alert
                            severity={outcome.outcome === 'AlreadyAssigned' ? 'info' : 'error'}
                          >
                            {reviewStudent.studentName || 'Student'}: {outcome.errorMessage}
                          </Alert>
                        )}
                        {studentPreview?.errorMessage && (
                          <Alert
                            severity={
                              studentPreview.errorCode?.endsWith('AlreadyAssigned')
                                ? 'info'
                                : 'error'
                            }
                          >
                            {reviewStudent.studentName || 'Student'}: {studentPreview.errorMessage}
                          </Alert>
                        )}
                        {(creating || activeStep === 2) &&
                          !showResults &&
                          studentPreview?.preview && (
                            <AssignmentReview data={studentPreview.preview} />
                          )}
                        {showResults && !outcome && (
                          <Alert severity="error">
                            Not assigned. Review this student and preview again.
                          </Alert>
                        )}
                      </>
                    )}
                  </Stack>
                </AssignmentDetailsRegion>
              </Box>
            );
          })()}
        {!creating && error && <Alert severity="error">{error}</Alert>}
      </Stack>
    );
  };

  if (!editAssignedStructure || !isBulk) {
    return (
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={(values) => runCreationOperation('preview', values)}
      >
        {(formik) => {
          const candidate = candidates.data?.find((item) => item.id === formik.values.structureId);
          const invalid =
            candidate &&
            formik.values.requests.some(
              (request) =>
                !committedIds.has(request.studentId) && assignmentInputError(candidate, request)
            );
          const previewDisabled =
            busy ||
            missingStructure ||
            candidates.isLoading ||
            candidates.isError ||
            Boolean(invalid);
          const assignDisabled =
            busy ||
            missingStructure ||
            selectedPreviewItems.length === 0 ||
            (!retryingConfirmation && previewExpired);
          const singlePreview = selectedPreviewItems[0]?.preview;
          const singleOutcome = outcomes?.results[0];
          const confirmLabel = editAssignedStructure ? 'Save fee changes' : 'Assign fees';
          return (
            <>
              <AssignmentForm
                busy={busy || formik.isSubmitting}
                busyLabel={loadingLabel}
                onCancel={onClose}
                onPreview={formik.handleSubmit}
                onAssign={
                  isBulk
                    ? async () => {
                        if (!assignDisabled) await runCreationOperation('commit', formik.values);
                      }
                    : undefined
                }
                previewDisabled={previewDisabled}
                assignDisabled={assignDisabled}
                assignLabel={
                  isBulk && selectedPreviewItems.length > 0
                    ? `Assign fees (${selectedPreviewItems.length})`
                    : 'Assign fees'
                }
                resultAction={
                  isBulk && showResults
                    ? {
                        label: complete ? 'Close' : 'Review remaining students',
                        icon: complete ? 'mdi:close' : 'mdi:refresh',
                        onClick: () => {
                          if (complete) onClose();
                          else {
                            const pendingStudent = students.find(
                              (item) => !committedIds.has(item.studentId)
                            );
                            invalidate();
                            if (pendingStudent) setSelectedStudentId(pendingStudent.studentId);
                          }
                        },
                      }
                    : undefined
                }
              >
                {renderContent(formik, true)}
              </AssignmentForm>
              {!isBulk && previewDialogOpen && (
                <AssignmentPreviewDialog
                  title={showResults ? 'Assignment Results' : undefined}
                  busy={busy}
                  onClose={showResults ? onClose : () => setPreviewDialogOpen(false)}
                  action={
                    !showResults && singlePreview
                      ? {
                          label: retryingConfirmation ? 'Retry confirmation' : confirmLabel,
                          disabled: assignDisabled,
                          onClick: async () => {
                            if (!assignDisabled)
                              await runCreationOperation('commit', formik.values);
                          },
                        }
                      : undefined
                  }
                >
                  {error && <Alert severity="error">{error}</Alert>}
                  {!showResults && previewExpired && !retryingConfirmation && (
                    <Alert
                      severity="warning"
                      action={
                        <Button
                          size="small"
                          disabled={busy}
                          startIcon={<Iconify icon="mdi:refresh" />}
                          onClick={() => runCreationOperation('preview', formik.values)}
                        >
                          Review and refresh
                        </Button>
                      }
                    >
                      This preview has expired. Preview again before saving.
                    </Alert>
                  )}
                  {editAssignedStructure && !showResults && (
                    <DetailField
                      label="Fee structure change reason"
                      value={formik.values.requests[0]?.editReason}
                    />
                  )}
                  {singleOutcome?.result && showResults ? (
                    <>
                      {singleOutcome.outcome === 'AlreadyAssigned' && (
                        <Box>
                          <Label color="success">Already assigned</Label>
                        </Box>
                      )}
                      <AssignmentReview data={singleOutcome.result.assignment} committed />
                    </>
                  ) : showResults ? (
                    <Alert severity="info">{singleOutcome?.errorMessage}</Alert>
                  ) : (
                    singlePreview && <AssignmentReview data={singlePreview} />
                  )}
                </AssignmentPreviewDialog>
              )}
            </>
          );
        }}
      </Formik>
    );
  }

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, pt: 2, bgcolor: 'background.paper' }}>
      <CustomStepperWithFormik
        contentScrollMode={isBulk ? 'regions' : 'step'}
        initialValues={initialValues}
        steps={assignmentEditSteps}
        activeStep={activeStep}
        validationSchema={validationSchema}
        loadingLabel={loadingLabel}
        showSaveButton={false}
        onCancel={onClose}
        validateForwardStepClick
        isStepClickable={(index) => !busy && !complete && !showResults && index <= reachedStep}
        onStepClick={async (index, _label, formik) => {
          if (operation.current || busy || index === activeStep) return;
          if (activeStep === 0 && index > 0) {
            const reasonError = formik.values.requests.map(assignmentEditReasonError).find(Boolean);
            if (reasonError) {
              setShowEditReasonError(true);
              setError(reasonError);
              return;
            }
            const candidate = candidates.data?.find((c) => c.id === formik.values.structureId);
            if (candidate) {
              const missingPolicy = formik.values.requests.find(
                (r: AssignmentRequest) =>
                  !committedIds.has(r.studentId) && assignmentPolicyError(candidate, r)
              );
              if (missingPolicy) {
                setSelectedStudentId(missingPolicy.studentId);
                setActiveStep(0);
                const policyErr = assignmentPolicyError(candidate, missingPolicy)!;
                const studentName =
                  students.find((student) => student.studentId === missingPolicy.studentId)
                    ?.studentName || 'Student';
                setError(
                  students.length === 1 || isBulk ? policyErr : `${studentName}: ${policyErr}`
                );
                return;
              }
              const missingReason = formik.values.requests.find(
                (r: AssignmentRequest) =>
                  !committedIds.has(r.studentId) && policyReasonMissing(candidate, r)
              );
              if (missingReason) {
                setSelectedStudentId(missingReason.studentId);
                setActiveStep(0);
                setError(
                  students.length === 1 || isBulk
                    ? 'Enter a policy override reason.'
                    : `${
                        students.find((student) => student.studentId === missingReason.studentId)
                          ?.studentName || 'Student'
                      }: Enter a policy override reason.`
                );
                return;
              }
            }
          }
          if (
            index !== 2 ||
            (preview &&
              reviewedValues.current === JSON.stringify(formik.values) &&
              (retryingConfirmation || !previewExpired))
          ) {
            setError('');
            setActiveStep(index);
            return;
          }
          operation.current = true;
          setOperationPhase('preview');
          try {
            await runPreview(formik.values);
          } finally {
            operation.current = false;
            setOperationPhase(undefined);
          }
        }}
        completedSteps={
          complete ? [0, 1, 2] : [...(structureValidated ? [0] : []), ...(preview ? [1, 2] : [])]
        }
        backButtonProps={{ disabled: complete, startIcon: <Iconify icon="mdi:arrow-left" /> }}
        handleBack={() => {
          setActiveStep(Math.max(0, activeStep - 1));
        }}
        nextButtonLabel={activeStep === 0 ? 'Next' : 'Preview assignments'}
        finalButtonLabel={
          showResults
            ? complete
              ? 'Close'
              : 'Review remaining students'
            : `${editAssignedStructure ? 'Save fee changes' : 'Assign fees'}${isBulk ? ` (${selectedPreviewItems.length})` : ''}`
        }
        saveAndNextButtonProps={{
          size: 'small',
          loading: busy,
          disabled:
            busy ||
            missingStructure ||
            (activeStep === 0 && (candidates.isLoading || candidates.isError)) ||
            (activeStep === 1 && invalidAmounts) ||
            (activeStep === 2 && !showResults && !retryingConfirmation && previewExpired) ||
            (activeStep === 2 && !showResults && selectedPreviewItems.length === 0),
          startIcon: (
            <Iconify
              icon={
                activeStep === 0
                  ? 'mdi:arrow-right'
                  : activeStep === 1
                    ? 'mdi:eye-outline'
                    : showResults
                      ? complete
                        ? 'mdi:close'
                        : 'mdi:refresh'
                      : 'mdi:check'
              }
            />
          ),
          endIcon: null,
        }}
        handleNext={async (_last, values: AssignmentValues, _formik, setLoading) => {
          if (operation.current || busy || missingStructure) return;
          if (activeStep === 0) {
            const reasonError = values.requests.map(assignmentEditReasonError).find(Boolean);
            if (reasonError) {
              setShowEditReasonError(true);
              setError(reasonError);
              return;
            }
            const candidate = candidates.data?.find((c) => c.id === values.structureId);
            if (candidate) {
              const missingPolicy = values.requests.find(
                (r) => !committedIds.has(r.studentId) && assignmentPolicyError(candidate, r)
              );
              if (missingPolicy) {
                setSelectedStudentId(missingPolicy.studentId);
                setActiveStep(0);
                const policyErr = assignmentPolicyError(candidate, missingPolicy)!;
                const studentName =
                  students.find((student) => student.studentId === missingPolicy.studentId)
                    ?.studentName || 'Student';
                setError(
                  students.length === 1 || isBulk ? policyErr : `${studentName}: ${policyErr}`
                );
                return;
              }
            }
            const missingReason = values.requests.find(
              (r) =>
                !committedIds.has(r.studentId) &&
                policyReasonMissing(
                  candidates.data?.find((c) => c.id === values.structureId),
                  r
                )
            );
            if (missingReason) {
              setSelectedStudentId(missingReason.studentId);
              setActiveStep(0);
              setError(
                `${
                  students.find((student) => student.studentId === missingReason.studentId)
                    ?.studentName || 'Student'
                }: Enter a policy override reason.`
              );
              return;
            }

            setError('');
            setReachedStep((previous) => Math.max(previous, 1));
            setStructureValidated(true);
            setActiveStep(activeStep + 1);
            return;
          }
          if (showResults) {
            if (complete) onClose();
            else {
              invalidate();
              setSelectedStudentId(
                students.find((student) => !committedIds.has(student.studentId))?.studentId ??
                  selectedStudentId
              );
              setActiveStep(1);
            }
            return;
          }
          operation.current = true;
          setOperationPhase(activeStep === 1 ? 'preview' : 'commit');
          setLoading(true);
          try {
            if (activeStep === 1) {
              const candidate = candidates.data?.find((c) => c.id === values.structureId);
              if (!candidate) {
                setError('Reload the selected fee structure.');
                return;
              }
              const invalidRequest = values.requests
                .filter((r) => !committedIds.has(r.studentId))
                .find(
                  (r) =>
                    assignmentInputError(candidate, r) ||
                    assignmentServiceDateError(candidate, r, academicYearBounds)
                );
              if (invalidRequest) {
                setSelectedStudentId(invalidRequest.studentId);
                setShowInputErrors(true);
                const student = students.find(
                  (item) => item.studentId === invalidRequest.studentId
                );
                setError(
                  `${student?.studentName ?? 'Student'}: ${assignmentInputError(candidate, invalidRequest) || assignmentServiceDateError(candidate, invalidRequest, academicYearBounds)}`
                );
                return;
              }
            }

            if (activeStep === 1) {
              const missingReason = values.requests.find(
                (r) =>
                  !committedIds.has(r.studentId) &&
                  policyReasonMissing(
                    candidates.data?.find((c) => c.id === values.structureId),
                    r
                  )
              );
              if (missingReason) {
                setSelectedStudentId(missingReason.studentId);
                setActiveStep(0);
                setError('Enter a policy override reason.');
                return;
              }
              await runPreview(values);
            } else await runCommit(values);
          } finally {
            operation.current = false;
            setOperationPhase(undefined);
            setLoading(false);
          }
        }}
        renderItem={({ formik }) => renderContent(formik as FormikProps<AssignmentValues>)}
      />
    </Box>
  );
}
