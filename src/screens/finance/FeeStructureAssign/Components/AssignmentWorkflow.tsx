'use client';

import type { FormikProps } from 'formik';
import type { RootState } from 'src/redux/store';
import type {
  AssignmentRequest,
  AssignmentBulkResult,
  AssignmentBulkPreview,
} from 'src/redux/finance/studentFeeAssignment';

import * as Yup from 'yup';
import { Iconify } from 'src/components/iconify';
import { useDispatch, useSelector } from 'react-redux';
import CustomSelect from 'src/components/custom-select';
import { hasGrantedPermission } from 'src/utils/permissions';
import { financePermissions } from 'src/constants/finance-menu';
import { useRef, useState, useEffect, useCallback } from 'react';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import {
  Box,
  Stack,
  Alert,
  Button,
  Skeleton,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
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
const steps = ['Structure', 'Heads and service', 'Policies', 'Review', 'Results'];

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
  const canAssign = hasGrantedPermission(
    permissions,
    `${financePermissions.fees.structureAssign}.Add`
  );
  const canOverrideAmount = hasGrantedPermission(
    permissions,
    `${financePermissions.fees.structureAssign}.OverrideAmount`
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
  const [preview, setPreview] = useState<AssignmentBulkPreview>();
  const [outcomes, setOutcomes] = useState<AssignmentBulkResult>();
  const [error, setError] = useState('');
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
  const invalidate = () => {
    generation.current += 1;
    setPreview(undefined);
    setError('');
  };

  const runPreview = async (values: AssignmentValues) => {
    generation.current += 1;
    const ticket = generation.current;
    setError('');
    setPreview(undefined);
    const items = values.requests.filter((r) => !committedIds.has(r.studentId));
    if (!items.length) return;
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
        setActiveStep(3);
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
      setActiveStep(4);
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
              {assigned.data?.warnings.map((warning) => (
                <Alert key={warning} severity="warning">
                  {warning}
                </Alert>
              ))}
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
              <Alert severity="info">
                Assigned obligations are preserved. Service changes, transfers and revision adoption
                require a separate reviewed financial correction.
              </Alert>
            </>
          ) : (
            <Alert severity="info">Your current access allows viewing assignments only.</Alert>
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
    <Box sx={{ flex: 1, minHeight: 0, pt: 2 }}>
      <CustomStepperWithFormik
        initialValues={initialValues}
        steps={steps}
        activeStep={activeStep}
        validationSchema={validationSchema}
        showSaveButton={false}
        isStepClickable={() => false}
        completedSteps={
          complete ? [0, 1, 2, 3, 4] : Array.from({ length: activeStep }, (_, i) => i)
        }
        backButtonProps={{ disabled: complete, startIcon: <Iconify icon="mdi:arrow-left" /> }}
        handleBack={() => {
          invalidate();
          setActiveStep(activeStep === 4 ? 1 : Math.max(0, activeStep - 1));
        }}
        nextButtonLabel={
          activeStep <= 1
            ? 'Next'
            : activeStep === 2
              ? 'Preview assignments'
              : `Confirm assignment (${selectedPreviewItems.length})`
        }
        finalButtonLabel={complete ? 'Close' : 'Review remaining students'}
        saveAndNextButtonProps={{
          size: 'small',
          loading: busy,
          disabled:
            busy ||
            (activeStep === 0 && (candidates.isLoading || candidates.isError)) ||
            (activeStep === 3 && selectedPreviewItems.length === 0),
          startIcon: (
            <Iconify
              icon={
                activeStep <= 1
                  ? 'mdi:arrow-right'
                  : activeStep === 2
                    ? 'mdi:eye-outline'
                    : activeStep === 3
                      ? 'mdi:check'
                      : complete
                        ? 'mdi:close'
                        : 'mdi:refresh'
              }
            />
          ),
          endIcon: null,
        }}
        handleNext={async (_last, values: AssignmentValues, _formik, setLoading) => {
          if (operation.current || busy) return;
          if (activeStep <= 1) {
            if (activeStep === 1) {
              const candidate = candidates.data?.find((c) => c.id === values.structureId);
              if (!candidate) {
                setError('Reload the selected fee structure.');
                return;
              }
              const problem = values.requests
                .filter((r) => !committedIds.has(r.studentId))
                .map((request) => {
                  const message = variableAssignmentError(candidate, request);
                  if (!message) return undefined;
                  const student = students.find((s) => s.studentId === request.studentId);
                  return `${student?.studentName ?? 'Student'  }: ${  message}`;
                })
                .find(Boolean);
              if (problem) {
                setError(problem);
                return;
              }
            }
            setError('');
            setActiveStep(activeStep + 1);
            return;
          }
          if (activeStep === 4) {
            if (complete) onClose();
            else {
              invalidate();
              setActiveStep(1);
            }
            return;
          }
          operation.current = true;
          setLoading(true);
          try {
            if (activeStep === 2) {
              const missingReason = values.requests.some((r) => {
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
              <Typography variant="body2" color="text.secondary">
                {students.length} student{students.length === 1 ? '' : 's'} · {steps[activeStep]}
              </Typography>
              {activeStep === 0 && (
                <>
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
                    label="Published fee structure revision"
                    value={values.structureId}
                    isLoading={candidates.isLoading}
                    disabled={busy || committedIds.size > 0}
                    error={!!formik.touched.structureId && !!formik.errors.structureId}
                    helperText={formik.touched.structureId ? formik.errors.structureId : undefined}
                    onBlur={formik.handleBlur}
                    options={(candidates.data ?? []).map((c) => ({
                      value: c.id,
                      label: `${c.name} · revision ${c.revisionNumber}`,
                    }))}
                    noOptionsMessage="No eligible published structure for this enrollment and year"
                    onChange={(value) => {
                      invalidate();
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
                </>
              )}
              {activeStep > 0 && candidate && (
                <Typography variant="subtitle2">
                  {candidate.name} · revision {candidate.revisionNumber}
                </Typography>
              )}
              {activeStep > 0 &&
                students.map((student, index) => {
                  const request = values.requests.find((r) => r.studentId === student.studentId);
                  const studentPreview = preview?.results.find(
                    (r) => r.studentId === student.studentId
                  );
                  const outcome = outcomes?.results.find((r) => r.studentId === student.studentId);
                  return (
                    <Accordion
                      key={student.studentId}
                      defaultExpanded={students.length === 1 || index === 0}
                      disableGutters
                    >
                      <AccordionSummary expandIcon={<Iconify icon="mdi:chevron-down" />}>
                        <Typography variant="subtitle2">
                          {student.studentName || `Student ${index + 1}`}
                          {outcome ? ` · ${outcome.outcome}` : ''}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <Stack spacing={2}>
                          {outcome?.result ? (
                            <AssignmentReview data={outcome.result.assignment} committed />
                          ) : (
                            <>
                              {activeStep === 1 && candidate && request && (
                                <AssignmentStudentInputs
                                  candidate={candidate}
                                  request={request}
                                  onChange={(next) => {
                                    invalidate();
                                    formik.setFieldValue(
                                      'requests',
                                      values.requests.map((r) =>
                                        r.studentId === next.studentId ? next : r
                                      )
                                    );
                                  }}
                                  canOverrideDates={canOverrideDates}
                                  canOverrideAmount={canOverrideAmount}
                                  disabled={busy}
                                />
                              )}
                              {activeStep === 2 && candidate && request && (
                                <AssignmentPolicies
                                  studentId={request.studentId}
                                  academicYearId={academicYearId}
                                  defaults={candidate.policies ?? []}
                                  selections={request.policies ?? []}
                                  reason={request.policyOverrideReason ?? ''}
                                  canOverride={canOverridePolicies}
                                  disabled={busy}
                                  onChange={(policies, policyOverrideReason) => {
                                    invalidate();
                                    formik.setFieldValue(
                                      'requests',
                                      values.requests.map((r) =>
                                        r.studentId === request.studentId
                                          ? { ...r, policies, policyOverrideReason }
                                          : r
                                      )
                                    );
                                  }}
                                />
                              )}
                              {outcome?.errorMessage && (
                                <Alert severity="error">{outcome.errorMessage}</Alert>
                              )}
                              {studentPreview?.errorMessage && (
                                <Alert severity="error">{studentPreview.errorMessage}</Alert>
                              )}
                              {activeStep === 3 && studentPreview?.preview && (
                                <AssignmentReview data={studentPreview.preview} />
                              )}
                              {activeStep === 4 && !outcome && (
                                <Alert severity="warning">
                                  This student has not been assigned. Review the remaining students
                                  and preview again.
                                </Alert>
                              )}
                            </>
                          )}
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              {error && <Alert severity="error">{error}</Alert>}
              {activeStep === 4 && (
                <Alert severity={complete ? 'success' : 'warning'}>
                  {committedIds.size} committed or already assigned;{' '}
                  {students.length - committedIds.size} need attention. Successful assignments are
                  preserved when retrying.
                </Alert>
              )}
            </Stack>
          );
        }}
      />
    </Box>
  );
}
