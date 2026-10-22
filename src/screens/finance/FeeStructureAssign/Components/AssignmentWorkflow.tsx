'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type {
  AssignmentRequest,
  AssignmentBulkResult,
  AssignmentBulkPreview,
} from 'src/redux/finance/studentFeeAssignment';

import * as Yup from 'yup';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { useDispatch, useSelector } from 'react-redux';
import { formatNumber } from 'src/utils/formate_number';
import CustomSelect from 'src/components/custom-select';
import { DetailSection } from 'src/components/detail-view';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { useRef, useState, useEffect, useCallback } from 'react';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  Box,
  List,
  Stack,
  Alert,
  Button,
  Skeleton,
  TextField,
  Pagination,
  Typography,
  ListItemButton,
} from '@mui/material';
import {
  assignmentError,
  useAssignmentDetailsQuery,
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
import { variableAssignmentError } from './variableAssignmentValidation';
import { assignmentCurrencyTotals } from './assignmentReviewPresentation';
import { assignmentYearBounds, assignmentServiceDateError } from './assignmentServiceDates';

interface Student {
  studentId: string;
  studentName?: string;
  isFeeStructureAssigned?: boolean;
}
interface AssignmentValues {
  structureId: string;
  requests: AssignmentRequest[];
}
const initialValues: AssignmentValues = { structureId: '', requests: [] };
const steps = ['Structure & policies', 'Fees & dates', 'Review & assign'];

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

export default function AssignmentWorkflow({
  students,
  academicYearId,
  onClose,
  onBusyChange,
}: {
  students: Student[];
  academicYearId: string;
  onClose: () => void;
  onBusyChange?: (busy: boolean) => void;
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
  const [editingPolicies, setEditingPolicies] = useState(false);
  const setPolicyDirty = useCallback((dirty: boolean) => dispatch(setIsChanges(dirty)), [dispatch]);
  const viewing = students.length === 1 && !!students[0].isFeeStructureAssigned;
  const candidates = useAssignmentCandidatesQuery(
    { studentId: students[0]?.studentId, academicYearId },
    { skip: !academicYearId || viewing || !canAssign }
  );
  const assigned = useAssignmentDetailsQuery(
    { studentId: students[0]?.studentId, academicYearId },
    { skip: !academicYearId || !viewing }
  );
  const [activeStep, setActiveStep] = useState(0);
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
  const generation = useRef(0);
  const operation = useRef(false);
  const [previewBulk, previewState] = useAssignmentBulkPreviewMutation();
  const [commitBulk, commitState] = useAssignmentBulkCommitMutation();
  const [previewOne, previewOneState] = useAssignmentPreviewMutation();
  const [commitOne, commitOneState] = useAssignmentCommitMutation();
  const busy =
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
  const committedIds = new Set(outcomes?.results.filter((r) => r.result).map((r) => r.studentId));
  const complete = committedIds.size === students.length;
  const selectedPreviewItems =
    preview?.results.filter((r) => r.preview && !committedIds.has(r.studentId)) ?? [];
  const batchTotals = assignmentCurrencyTotals(
    showResults
      ? (outcomes?.results.flatMap((item) => (item.result ? [item.result.assignment] : [])) ?? [])
      : selectedPreviewItems.flatMap((item) => (item.preview ? [item.preview] : []))
  );
  const invalidate = () => {
    generation.current += 1;
    setPreview(undefined);
    setShowResults(false);
    setError('');
  };

  const runPreview = async (values: AssignmentValues) => {
    generation.current += 1;
    const ticket = generation.current;
    setError('');
    setPreview(undefined);
    const items = values.requests.filter((r) => !committedIds.has(r.studentId));
    if (!items.length) return;
    const candidate = candidates.data?.find((item) => item.id === values.structureId);
    const invalidRequest =
      candidate &&
      items.find(
        (request) =>
          variableAssignmentError(candidate, request) ||
          assignmentServiceDateError(candidate, request, yearBounds)
      );
    if (invalidRequest && candidate) {
      setSelectedStudentId(invalidRequest.studentId);
      setShowInputErrors(true);
      const studentName =
        students.find((student) => student.studentId === invalidRequest.studentId)?.studentName ||
        'Student';
      setError(
        studentName +
          ': ' +
          (variableAssignmentError(candidate, invalidRequest) ||
            assignmentServiceDateError(candidate, invalidRequest, yearBounds))
      );
      setActiveStep(1);
      return;
    }
    try {
      const result =
        students.length === 1
          ? {
              results: [
                { studentId: items[0].studentId, preview: await previewOne(items[0]).unwrap() },
              ],
            }
          : await previewBulk({ items }).unwrap();
      if (ticket === generation.current) {
        setPreview(result);
        setActiveStep(2);
      }
    } catch (e) {
      if (ticket === generation.current) setError(assignmentError(e));
    }
  };

  const runCommit = async (values: AssignmentValues) => {
    setError('');
    const items = selectedPreviewItems.map((r) => ({
      ...values.requests.find((request) => request.studentId === r.studentId)!,
      previewToken: r.preview!.previewToken,
    }));
    if (!items.length) return;
    try {
      const result: AssignmentBulkResult =
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
      setOutcomes((previous) => ({
        ...result,
        results: [...(previous?.results.filter((r) => r.result) ?? []), ...result.results],
      }));
      setPreview(undefined);
      setShowResults(true);
      setActiveStep(2);
    } catch (e) {
      setError(assignmentError(e));
    }
  };

  const validationSchema = Yup.object({
    structureId: Yup.string().required('Select a published fee structure.'),
    requests: Yup.array().min(1, 'Select students to assign.'),
  });

  if (viewing || !canAssign)
    return (
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Stack spacing={2} sx={{ flex: 1, overflowY: 'auto', p: 2 }}>
          {viewing ? (
            <>
              {assigned.isLoading && <Skeleton height={180} />}
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

              {assigned.data?.assignment && !editingPolicies && (
                <AssignmentReview data={assigned.data.assignment} committed />
              )}
              {assigned.data &&
                canOverridePolicies &&
                (editingPolicies ? (
                  <AssignedPolicyEditor
                    data={assigned.data}
                    onCancel={() => setEditingPolicies(false)}
                    onSaved={() => {
                      setEditingPolicies(false);
                      assigned.refetch();
                    }}
                    onBusyChange={onBusyChange}
                    onDirtyChange={setPolicyDirty}
                  />
                ) : (
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Iconify icon="mdi:pencil-outline" />}
                    onClick={() => setEditingPolicies(true)}
                  >
                    Edit assigned policies
                  </Button>
                ))}
            </>
          ) : (
            <Box>Your current access allows viewing assignments only.</Box>
          )}
        </Stack>
        <Stack
          direction="row"
          justifyContent="flex-end"
          sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}
        >
          <Button
            size="small"
            variant="outlined"
            startIcon={<Iconify icon="mdi:close" />}
            onClick={onClose}
          >
            Close
          </Button>
        </Stack>
      </Stack>
    );

  return (
    <Box sx={{ flex: 1, minHeight: 0, pt: 2, bgcolor: 'background.paper' }}>
      <CustomStepperWithFormik
        initialValues={initialValues}
        steps={steps}
        activeStep={activeStep}
        validationSchema={validationSchema}
        showSaveButton={false}
        onCancel={onClose}
        isStepClickable={(index) => !busy && !complete && !showResults && index < activeStep}
        onStepClick={(index) => {
          invalidate();
          setActiveStep(index);
        }}
        completedSteps={complete ? [0, 1, 2] : Array.from({ length: activeStep }, (_, i) => i)}
        backButtonProps={{ disabled: complete, startIcon: <Iconify icon="mdi:arrow-left" /> }}
        handleBack={() => {
          invalidate();
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
            (activeStep === 0 && (candidates.isLoading || candidates.isError)) ||
            (activeStep === 1 && invalidAmounts) ||
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
          if (operation.current || busy) return;
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
                (students.find((student) => student.studentId === missingReason.studentId)
                  ?.studentName || 'Student') + ': Enter a policy override reason.'
              );
              return;
            }

            setError('');
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
                    variableAssignmentError(candidate, r) ||
                    assignmentServiceDateError(candidate, r, yearBounds)
                );
              if (invalidRequest) {
                setSelectedStudentId(invalidRequest.studentId);
                setShowInputErrors(true);
                const student = students.find(
                  (item) => item.studentId === invalidRequest.studentId
                );
                setError(
                  `${student?.studentName ?? 'Student'}: ${variableAssignmentError(candidate, invalidRequest) || assignmentServiceDateError(candidate, invalidRequest, yearBounds)}`
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
                setError('Enter a policy override reason for each student whose policies changed.');
                return;
              }
              await runPreview(values);
            } else await runCommit(values);
          } finally {
            operation.current = false;
            setLoading(false);
          }
        }}
        renderItem={(context) => {
          const formik = context.formik as FormikProps<AssignmentValues>;
          const { values } = formik;
          const candidate = candidates.data?.find((c) => c.id === values.structureId);
          return (
            <Stack spacing={2} sx={{ p: 2, minWidth: 0 }}>
              <AssignmentDirtyState
                dirty={values.requests.some((r) => !committedIds.has(r.studentId))}
              />
              {activeStep === 1 && (
                <AssignmentAmountValidity
                  invalid={
                    !candidate ||
                    values.requests
                      .filter((request) => !committedIds.has(request.studentId))
                      .some((request) => Boolean(variableAssignmentError(candidate, request)))
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
                <DetailSection title="Fee structure" icon="mdi:file-document-outline">
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
                    disabled={busy || committedIds.size > 0}
                    error={!!formik.touched.structureId && !!formik.errors.structureId}
                    helperText={formik.touched.structureId ? formik.errors.structureId : undefined}
                    onBlur={formik.handleBlur}
                    options={(candidates.data ?? []).map((c) => ({
                      value: c.id,
                      label: `${c.name} · r${c.revisionNumber}`,
                    }))}
                    noOptionsMessage="No published structure for this student and year"
                    onChange={(value) => {
                      invalidate();
                      setShowInputErrors(false);
                      setOutcomes(undefined);
                      formik.setValues({
                        structureId: String(value),
                        requests: students.map((s) => ({
                          studentId: s.studentId,
                          academicYearId,
                          standardFeeStructureId: String(value),
                          selectedOptionalFeeHeadIds: [],
                          servicePeriods: [],
                          feeHeadDetails: [],
                          variableFeeHeads: [],
                        })),
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
                </DetailSection>
              )}
              {(activeStep > 0 || Boolean(candidate)) &&
                (() => {
                  const student =
                    students.find((item) => item.studentId === selectedStudentId) ?? students[0];
                  const request = values.requests.find((r) => r.studentId === student.studentId);
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
                    formik.setFieldValue(
                      'requests',
                      values.requests.map((r) => (r.studentId === next.studentId ? next : r))
                    );
                  };
                  return (
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: 'minmax(0, 1fr)',
                          md: isBulk ? '260px minmax(0, 1fr)' : 'minmax(0, 1fr)',
                        },
                        gap: 2,
                        alignItems: 'start',
                      }}
                    >
                      {isBulk && (
                        <DetailSection title="Selected students" icon="mdi:account-group-outline">
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
                            {committedIds.size} assigned · {students.length - committedIds.size}{' '}
                            remaining
                          </Typography>
                          {activeStep === 2 && batchTotals.length > 0 && (
                            <Box sx={{ borderBottom: 1, borderColor: 'divider', pb: 1 }}>
                              <Typography variant="caption" color="text.secondary">
                                {showResults ? 'Confirmed total' : 'Ready total'}
                              </Typography>
                              {batchTotals.map((item) => (
                                <Typography
                                  key={item.currency}
                                  variant="h6"
                                  sx={{ fontVariantNumeric: 'tabular-nums' }}
                                >
                                  {formatNumber(item.total, item.currency)}
                                </Typography>
                              ))}
                            </Box>
                          )}
                          <List disablePadding aria-label="Selected students">
                            {filtered.slice((page - 1) * 20, page * 20).map((item) => {
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
                                (variableAssignmentError(candidate, input) ||
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
                                  sx={{ borderRadius: 1, mb: 0.5, px: 1.5 }}
                                >
                                  <Stack spacing={0.5} sx={{ minWidth: 0 }}>
                                    <Typography
                                      variant="subtitle2"
                                      sx={{ overflowWrap: 'anywhere' }}
                                    >
                                      {item.studentName || 'Student'}
                                    </Typography>
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
                                        {needsInput || saved?.errorMessage || checked?.errorMessage}
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
                          {filtered.length > 20 && (
                            <Pagination
                              size="small"
                              count={Math.ceil(filtered.length / 20)}
                              page={page}
                              disabled={busy}
                              onChange={(_, next) => setStudentPage(next)}
                            />
                          )}
                        </DetailSection>
                      )}
                      <Stack spacing={2} sx={{ minWidth: 0 }}>
                        {(isBulk || (outcome && (showResults || outcome.result))) && (
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            spacing={1}
                          >
                            {isBulk && (
                              <Typography variant="subtitle1" sx={{ overflowWrap: 'anywhere' }}>
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
                        )}
                        {outcome?.result ? (
                          <AssignmentReview data={outcome.result.assignment} committed />
                        ) : (
                          <>
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
                              <DetailSection title="Fees & dates" icon="mdi:format-list-checks">
                                <AssignmentStudentInputs
                                  key={student.studentId}
                                  candidate={candidate}
                                  request={request}
                                  onChange={updateRequest}
                                  canOverrideDates={canOverrideDates}
                                  disabled={busy}
                                  yearBounds={yearBounds}
                                  showErrors={showInputErrors}
                                  flat
                                />
                              </DetailSection>
                            )}
                            {outcome?.errorMessage && !studentPreview?.preview && (
                              <Alert severity="error">
                                {student.studentName || 'Student'}: {outcome.errorMessage}
                              </Alert>
                            )}
                            {studentPreview?.errorMessage && (
                              <Alert severity="error">
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
