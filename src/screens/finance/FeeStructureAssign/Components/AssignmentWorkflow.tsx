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
import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { DetailField } from 'src/components/detail-view';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { useRef, useState, useEffect, useCallback } from 'react';
import { FormSectionCard } from 'src/components/form-section-card';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
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
import PreparedAssignmentHandoff from './PreparedAssignmentHandoff';
import { assignmentCurrencyTotals } from './assignmentReviewPresentation';
import { assignmentYearBounds, assignmentServiceDateError } from './assignmentServiceDates';
import { assignmentInputError, assignmentFeeSelectionError } from './variableAssignmentValidation';
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
const initialValues: AssignmentValues = { structureId: '', requests: [] };
const steps = ['Structure & policies', 'Fees & dates', 'Review & assign'];
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
  onBusyChange?: (busy: boolean) => void;
  onContextResolved?: (status: AssignmentContext['status']) => void;
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
  const excluded =
    selectedStudents.length > 1
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
          onBusyChange={onBusyChange}
          students={students}
          contexts={contexts ?? []}
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
}: {
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
          admissionAssignmentRequest(
            student.studentId,
            academicYearId,
            candidate,
            contexts.find((context) => context.studentId === student.studentId)
          )
        ),
      },
      false
    );
  }, [academicYearId, candidates, contexts, formik, students]);
  return null;
}

function AssignmentEditor({
  students,
  academicYearId,
  academicYearName,
  editAssignedPolicies = false,
  onClose,
  onBusyChange,
  contexts,
  onAssignedConflict,
}: Omit<AssignmentWorkflowProps, 'onContextResolved'> & {
  contexts: AssignmentContext[];
  onAssignedConflict: () => void;
}) {
  const { permissions } = useSelector((state: RootState) => state.auth);
  const currentYear = useSelector((state: RootState) => state.globalState?.currentYear);
  const yearBounds = assignmentYearBounds(currentYear, academicYearId);
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
  const dispatch = useDispatch();
  const [editingPolicies, setEditingPolicies] = useState(
    editAssignedPolicies && canOverridePolicies
  );
  const setPolicyDirty = useCallback((dirty: boolean) => dispatch(setIsChanges(dirty)), [dispatch]);
  const viewing = students.length === 1 && !!students[0].isFeeStructureAssigned;
  const candidates = useAssignmentCandidatesQuery(
    { studentId: students[0]?.studentId, academicYearId },
    { skip: !academicYearId || viewing || !canAssign }
  );
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
  const [selectedStudentId, setSelectedStudentId] = useState(students[0]?.studentId ?? '');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentPage, setStudentPage] = useState(1);
  const isBulk = students.length > 1;
  const [preview, setPreview] = useState<AssignmentBulkPreview>();
  const [outcomes, setOutcomes] = useState<AssignmentBulkResult>();
  const [error, setError] = useState('');
  const [invalidAmounts, setInvalidAmounts] = useState(false);
  const [showInputErrors, setShowInputErrors] = useState(false);
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
    commitOneState.isLoading;
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
    setShowResults(false);
    setError('');
    setRetryingConfirmation(false);
  };

  const runPreview = async (values: AssignmentValues) => {
    if (missingStructure) return;
    generation.current += 1;
    const ticket = generation.current;
    setError('');
    setPreview(undefined);
    const items = values.requests.filter((r) => !committedIds.has(r.studentId));
    if (!items.length) return;
    const candidate = candidates.data?.find((item) => item.id === values.structureId);
    if (!candidate) {
      setStructureValidated(false);
      setError('Reload the selected fee structure.');
      setActiveStep(0);
      return;
    }
    const missingReason = items.find(
      (request) =>
        request.policies?.some(
          (policy) =>
            policy.versionId !==
            (candidate.policies?.find((defaultPolicy) => defaultPolicy.family === policy.family)
              ?.versionId ?? null)
        ) && !request.policyOverrideReason?.trim()
    );
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
          assignmentServiceDateError(candidate, request, yearBounds)
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
          assignmentServiceDateError(candidate, invalidRequest, yearBounds)
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

  const studentDetails = viewing ? (
    <FormSectionCard
      title="Student Details"
      icon="mdi:account-school-outline"
      descriptionTooltip="Student identity and enrollment context for the selected academic year."
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'minmax(0, 1fr)', sm: 'repeat(3, minmax(0, 1fr))' },
          gap: 2,
        }}
      >
        <DetailField label="Student name" value={students[0].studentName} />
        <DetailField
          label="Academic year"
          value={
            academicYearName || (currentYear?.id === academicYearId ? currentYear?.name : undefined)
          }
        />
        <DetailField label="GR number" value={students[0].grNumber} />
        <DetailField label="Roll number" value={students[0].rollNumber} />
        <DetailField label="Class / division" value={students[0].standardDivision} />
        <DetailField label="Board" value={students[0].boardName} />
        <DetailField label="Medium" value={students[0].mediumName} />
        <DetailField label="Academic stage" value={students[0].stageName} />
      </Box>
    </FormSectionCard>
  ) : null;

  if (
    viewing &&
    editingPolicies &&
    canOverridePolicies &&
    !assigned.isFetching &&
    !assigned.isError &&
    assigned.data?.assignment
  ) {
    return (
      <AssignedPolicyEditor
        data={assigned.data}
        onCancel={onClose}
        onSaved={() => {
          setEditingPolicies(false);
          assigned.refetch();
        }}
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
                !editingPolicies && <AssignmentReview data={assigned.data.assignment} committed />}
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

  return (
    <Box sx={{ display: 'flex', flex: 1, minHeight: 0, pt: 2, bgcolor: 'background.paper' }}>
      <CustomStepperWithFormik
        contentScrollMode={isBulk ? 'regions' : 'step'}
        initialValues={initialValues}
        steps={steps}
        activeStep={activeStep}
        validationSchema={validationSchema}
        loadingLabel={
          operationPhase === 'commit'
            ? `Assigning ${selectedPreviewItems.length} student${selectedPreviewItems.length === 1 ? '' : 's'}…`
            : `Previewing ${students.length - committedIds.size} student${students.length - committedIds.size === 1 ? '' : 's'}…`
        }
        showSaveButton={false}
        onCancel={onClose}
        validateForwardStepClick
        isStepClickable={(index) => !busy && !complete && !showResults && index <= reachedStep}
        onStepClick={async (index, _label, formik) => {
          if (operation.current || busy || index === activeStep) return;
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
            : `Assign fees (${selectedPreviewItems.length})`
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
            const missingReason = values.requests.find((r) => {
              const candidate = candidates.data?.find((c) => c.id === values.structureId);
              return (
                !committedIds.has(r.studentId) &&
                r.policies?.some(
                  (p) =>
                    p.versionId !==
                    (candidate?.policies?.find((d) => d.family === p.family)?.versionId ?? null)
                ) &&
                !r.policyOverrideReason?.trim()
              );
            });
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
                    assignmentServiceDateError(candidate, r, yearBounds)
                );
              if (invalidRequest) {
                setSelectedStudentId(invalidRequest.studentId);
                setShowInputErrors(true);
                const student = students.find(
                  (item) => item.studentId === invalidRequest.studentId
                );
                setError(
                  `${student?.studentName ?? 'Student'}: ${assignmentInputError(candidate, invalidRequest) || assignmentServiceDateError(candidate, invalidRequest, yearBounds)}`
                );
                return;
              }
            }

            if (activeStep === 1) {
              const missingReason = values.requests.find((r) => {
                const candidate = candidates.data?.find((c) => c.id === values.structureId);
                return (
                  !committedIds.has(r.studentId) &&
                  r.policies?.some(
                    (p) =>
                      p.versionId !==
                      (candidate?.policies?.find((d) => d.family === p.family)?.versionId ?? null)
                  ) &&
                  !r.policyOverrideReason?.trim()
                );
              });
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
        renderItem={(context) => {
          const formik = context.formik as FormikProps<AssignmentValues>;
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
          return (
            <Stack
              spacing={2}
              sx={{
                p: 2,
                minWidth: 0,
                ...(isBulk && { flex: 1, minHeight: 0, overflow: 'hidden' }),
                '& > .MuiAlert-root, & > section': { flexShrink: 0 },
              }}
            >
              {activeStep === 2 &&
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
              <AssignmentDirtyState
                dirty={values.requests.some((r) => !committedIds.has(r.studentId))}
              />
              <AdmissionDefaults
                formik={formik}
                contexts={contexts}
                students={students}
                candidates={candidates.data}
                academicYearId={academicYearId}
              />
              {activeStep === 1 && (
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
              {showResults && (
                <Box>
                  {committedIds.size} assigned
                  {!complete ? ` · ${students.length - committedIds.size} need attention` : ''}.
                </Box>
              )}

              {activeStep === 0 && (
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
                  <CustomSelect
                    name="structureId"
                    label="Fee structure"
                    size="small"
                    value={values.structureId}
                    isLoading={candidates.isLoading}
                    disabled={
                      busy ||
                      committedIds.size > 0 ||
                      contexts.some(
                        (sourceContext) =>
                          sourceContext.structureId &&
                          students.some((student) => student.studentId === sourceContext.studentId)
                      )
                    }
                    error={!!formik.touched.structureId && !!formik.errors.structureId}
                    helperText={formik.touched.structureId ? formik.errors.structureId : undefined}
                    onBlur={formik.handleBlur}
                    options={(candidates.data ?? []).map((c) => ({
                      value: c.id,
                      label: `${c.name} · r${c.revisionNumber}`,
                    }))}
                    noOptionsMessage="No published structure for this student and year"
                    onChange={(value) => {
                      const selectedCandidate = candidates.data?.find(
                        (item) => item.id === String(value)
                      );
                      invalidate();
                      setReachedStep(0);
                      setStructureValidated(false);
                      setShowInputErrors(false);
                      setOutcomes(undefined);
                      formik.setValues({
                        structureId: String(value),
                        requests: selectedCandidate
                          ? students.map((s) =>
                              admissionAssignmentRequest(
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
                  {candidate && (
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      useFlexGap
                      flexWrap="wrap"
                    >
                      <Stack direction="row" spacing={1}>
                        <Label>
                          {candidate.heads.filter((head) => !head.isOptional).length} required
                        </Label>
                        {candidate.heads.some((head) => head.isOptional) && (
                          <Label>
                            {candidate.heads.filter((head) => head.isOptional).length} optional
                          </Label>
                        )}
                      </Stack>
                      <Typography variant="subtitle2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                        {candidate.total == null ? '—' : formatNumber(candidate.total, 'INR')}
                      </Typography>
                    </Stack>
                  )}
                </FormSectionCard>
              )}
              {(activeStep > 0 || Boolean(candidate)) &&
                (() => {
                  const configuringBulk = isBulk && activeStep < 2;
                  const student = configuringBulk
                    ? (students.find((item) => !committedIds.has(item.studentId)) ?? students[0])
                    : (students.find((item) => item.studentId === selectedStudentId) ??
                      students[0]);
                  const request = values.requests.find((r) => r.studentId === student.studentId);
                  const admissionContext = contexts.find(
                    (item) => item.studentId === student.studentId
                  );
                  const admissionPeriods = candidate
                    ? admissionServicePeriods(
                        candidate,
                        admissionContext,
                        candidate.heads
                          .filter((head) => head.isOptional)
                          .map((head) => head.feeHeadId)
                      )
                    : [];
                  const studentCandidate = candidate && {
                    ...candidate,
                    heads: candidate.heads.map((head) => ({
                      ...head,
                      servicePeriod:
                        admissionPeriods.find((period) => period.feeHeadId === head.feeHeadId) ??
                        head.servicePeriod,
                    })),
                  };
                  const studentPreview = preview?.results.find(
                    (r) => r.studentId === student.studentId
                  );
                  const outcome = outcomes?.results.find((r) => r.studentId === student.studentId);
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
                            ? mergeAssignmentInputs(next, r, candidate, admissionContext)
                            : r;
                        // The bulk editor owns one configuration. Keep each student's identity
                        // and saved result separate while applying changes to all remaining requests.
                        return candidate
                          ? mergeAssignmentInputs(
                              next,
                              r,
                              candidate,
                              contexts.find((item) => item.studentId === r.studentId)
                            )
                          : r;
                      })
                    );
                  };
                  return (
                    <Box
                      sx={{
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
                      }}
                    >
                      {isBulk && (
                        <FormSectionCard
                          title="Selected students"
                          icon="mdi:account-group-outline"
                          iconSize={16}
                          iconContainerSize={28}
                          contentSpacing={1}
                          sx={{ minWidth: 0, minHeight: 0, overflow: 'hidden', p: 1.5 }}
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
                          {activeStep === 2 && batchTotals.length > 0 && (
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
                                const input = values.requests.find(
                                  (r) => r.studentId === item.studentId
                                );
                                const needsInput =
                                  !saved?.result &&
                                  candidate &&
                                  input &&
                                  (assignmentInputError(candidate, input) ||
                                    assignmentServiceDateError(candidate, input, yearBounds));
                                const needsAttention =
                                  !saved?.result &&
                                  !checked?.preview &&
                                  (saved?.errorMessage || checked?.errorMessage || needsInput);
                                return (
                                  <ListItemButton
                                    key={item.studentId}
                                    selected={item.studentId === student.studentId}
                                    disabled={busy}
                                    aria-label={`Select ${item.studentName || 'student'}`}
                                    aria-current={
                                      item.studentId === student.studentId ? 'true' : undefined
                                    }
                                    onClick={() => setSelectedStudentId(item.studentId)}
                                    sx={{
                                      borderRadius: 1,
                                      mb: 0.5,
                                      px: 1.5,
                                      border: 1,
                                      borderColor:
                                        item.studentId === student.studentId
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
                                      <Label
                                        color={
                                          saved?.result
                                            ? 'success'
                                            : needsAttention
                                              ? 'warning'
                                              : 'default'
                                        }
                                      >
                                        {saved?.result
                                          ? saved.outcome === 'AlreadyAssigned'
                                            ? 'Already assigned'
                                            : 'Assigned'
                                          : needsAttention
                                            ? 'Needs attention'
                                            : checked?.preview
                                              ? 'Ready to assign'
                                              : 'Configure'}
                                      </Label>
                                      {needsAttention && (
                                        <Typography
                                          variant="caption"
                                          color="error.main"
                                          sx={{ overflowWrap: 'anywhere' }}
                                        >
                                          {needsInput ||
                                            saved?.errorMessage ||
                                            checked?.errorMessage}
                                        </Typography>
                                      )}
                                      {checked?.preview && !saved?.result && (
                                        <Typography variant="caption">
                                          {formatNumber(checked.preview.proratedTotal, 'INR')}
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
                      <AssignmentDetailsRegion bounded={isBulk}>
                        <Stack spacing={2} sx={{ minWidth: 0, pr: isBulk ? 1 : 0 }}>
                          {configuringBulk ? (
                            <Typography variant="body2" color="text.secondary">
                              {contexts.some((source) => source.source === 'Admission')
                                ? 'Each student keeps their admission dates and confirmed fee choices. Other settings apply to all '
                                : 'The same policies, fees and dates apply to all '}
                              {committedIds.size ? 'remaining' : 'selected'} students.
                            </Typography>
                          ) : (
                            (isBulk || (outcome && (showResults || outcome.result))) && (
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={1}
                              >
                                {isBulk && (
                                  <Typography
                                    component="h2"
                                    variant="subtitle1"
                                    sx={{ overflowWrap: 'anywhere', minWidth: 0 }}
                                  >
                                    {student.studentName || 'Student'}
                                  </Typography>
                                )}
                                {outcome && (showResults || outcome.result) && (
                                  <Label color={outcome.result ? 'success' : 'warning'}>
                                    {outcome.outcome === 'AlreadyAssigned'
                                      ? 'Already assigned'
                                      : outcome.outcome}
                                  </Label>
                                )}
                              </Stack>
                            )
                          )}
                          {outcome?.result ? (
                            <AssignmentReview data={outcome.result.assignment} committed />
                          ) : (
                            <>
                              {activeStep < 2 && admissionContext?.source === 'Admission' && (
                                <Box
                                  sx={{
                                    display: 'grid',
                                    gridTemplateColumns: {
                                      xs: '1fr',
                                      sm: 'repeat(2, minmax(0, 1fr))',
                                    },
                                    gap: 1.5,
                                  }}
                                >
                                  <DetailField
                                    label="Joining date"
                                    value={
                                      admissionContext.joiningDate
                                        ? fDate(admissionContext.joiningDate)
                                        : 'Not recorded'
                                    }
                                  />
                                  <DetailField label="Date source" value="Admission" />
                                  <DetailField
                                    label="Proration policy"
                                    value={
                                      admissionContext.prorationPolicy
                                        ? `${admissionContext.prorationPolicy.name} · v${admissionContext.prorationPolicy.version}`
                                        : 'No applicable policy; full scheduled charge'
                                    }
                                  />
                                </Box>
                              )}
                              {activeStep === 0 && candidate && request && (
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
                              {activeStep === 1 && candidate && request && (
                                <FormSectionCard
                                  title="Fees & Dates"
                                  icon="mdi:format-list-checks"
                                  descriptionTooltip="Review the fees and service dates included in this assignment."
                                >
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
                                    lockOptionalSelection={Boolean(admissionContext?.structureId)}
                                    request={request}
                                    onChange={updateRequest}
                                    canOverrideDates={canOverrideDates}
                                    allowTransportSource={!isBulk}
                                    disabled={busy}
                                    yearBounds={yearBounds}
                                    showErrors={showInputErrors}
                                    flat
                                  />
                                </FormSectionCard>
                              )}
                              {outcome?.errorMessage && !studentPreview?.preview && (
                                <Alert
                                  severity={
                                    outcome.outcome === 'AlreadyAssigned' ? 'info' : 'error'
                                  }
                                >
                                  {student.studentName || 'Student'}: {outcome.errorMessage}
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
                                  {student.studentName || 'Student'}: {studentPreview.errorMessage}
                                </Alert>
                              )}
                              {activeStep === 2 && !showResults && studentPreview?.preview && (
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
              {error && <Alert severity="error">{error}</Alert>}
            </Stack>
          );
        }}
      />
    </Box>
  );
}
