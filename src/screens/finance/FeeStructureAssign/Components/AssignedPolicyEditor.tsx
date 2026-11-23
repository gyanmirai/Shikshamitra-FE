import type { ReactNode } from 'react';
import type {
  AssignmentDetails,
  AssignmentPolicySelection,
} from 'src/redux/finance/studentFeeAssignment';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { fDate } from 'src/utils/format-time';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { FormSectionCard } from 'src/components/form-section-card';
import { Stack, Alert, Button, Divider, Typography } from '@mui/material';
import { CustomStepperWithFormik } from 'src/components/custom-stepper';
import { DetailField } from 'src/screens/finance/components/detail-view';
import {
  assignmentError,
  assignmentPolicyFamilies,
  useAssignmentPolicyOptionsQuery,
  useAssignmentUpdatePoliciesMutation,
} from 'src/redux/finance/studentFeeAssignment';

import AssignmentReview from './AssignmentReview';
import AssignmentPolicies from './AssignmentPolicies';
import OptionalFeeServiceStops from './OptionalFeeServiceStops';
import AssignmentFeeHeadSummary from './AssignmentFeeHeadSummary';
import { groupFeeHeadProration } from './assignmentReviewPresentation';
import AssignmentStepperFrame, {
  assignmentEditSteps,
  assignmentEditPadding,
} from './AssignmentStepperFrame';

export default function AssignedPolicyEditor({
  data,
  onCancel,
  onSaved,
  onBusyChange,
  onDirtyChange,
  children,
  canStopOptionalService,
  canRestartOptionalService,
  canOverridePolicies = true,
  onOptionalServiceSaved,
  onEditFees,
}: {
  data: AssignmentDetails;
  onCancel: () => void;
  onSaved: () => void;
  onBusyChange?: (busy: boolean) => void;
  onDirtyChange: (dirty: boolean) => void;
  children?: ReactNode;
  canStopOptionalService?: boolean;
  canRestartOptionalService?: boolean;
  canOverridePolicies?: boolean;
  onOptionalServiceSaved?: () => void;
  onEditFees?: () => void;
}) {
  const [save, state] = useAssignmentUpdatePoliciesMutation();
  const policyOptions = useAssignmentPolicyOptionsQuery(
    { studentId: data.assignment.studentId, academicYearId: data.assignment.academicYearId },
    { skip: !canOverridePolicies }
  );
  const [error, setError] = useState('');
  const pending = useRef(false);
  const [activeStep, setActiveStep] = useState(0);
  const [reachedStep, setReachedStep] = useState(0);
  const [serviceBusy, setServiceBusy] = useState(false);
  const busy = state.isLoading || serviceBusy;
  const feeHeadProration =
    activeStep === 1 && data.assignment.calculationVersion !== 'LegacyUnknown'
      ? groupFeeHeadProration(data.assignment.lines.filter((line) => !line.optionalServicePeriodId))
      : undefined;
  const policiesDiffer = (policies: AssignmentPolicySelection[]) =>
    policies.some(
      (policy) =>
        policy.versionId !==
        (data.assignment.policies.find((saved) => saved.family === policy.family)?.versionId ??
          null)
    );
  const formik = useFormik<{ policies: AssignmentPolicySelection[]; reason: string }>({
    initialValues: {
      policies: assignmentPolicyFamilies
        .filter((family) => family !== 'proration')
        .map((family) => ({
          family,
          versionId: data.assignment.policies.find((p) => p.family === family)?.versionId ?? null,
        })),
      reason: '',
    },
    validationSchema: !canOverridePolicies
      ? Yup.object({})
      : Yup.object({
          reason: Yup.string()
            .trim()
            .max(500)
            .test(
              'changed-policy-reason',
              'Enter a policy change reason.',
              (value, context) => !policiesDiffer(context.parent.policies) || Boolean(value)
            ),
          policies: Yup.array()
            .test(
              'collection',
              'Select a collection policy.',
              (policies) => !!policies?.find((p) => p.family === 'collection')?.versionId
            )
            .test(
              'refund',
              'Select a refund policy.',
              (policies) => !!policies?.find((p) => p.family === 'refund')?.versionId
            ),
        }),
    onSubmit: async (values) => {
      if (pending.current || busy) return;
      if (!policiesDiffer(values.policies)) {
        onCancel();
        return;
      }
      if (!canOverridePolicies) return;
      pending.current = true;
      setError('');
      try {
        await save({
          studentId: data.assignment.studentId,
          academicYearId: data.assignment.academicYearId,
          concurrencyStamp: data.concurrencyStamp,
          ...values,
        }).unwrap();
        onDirtyChange(false);
        shikshaMitraToast.success({ message: 'Assigned policies updated.' });
        onSaved();
      } catch (e) {
        setError(assignmentError(e));
      } finally {
        pending.current = false;
      }
    },
  });
  const policiesChanged = formik.values.policies.some(
    (policy) =>
      policy.versionId !==
      (data.assignment.policies.find((assigned) => assigned.family === policy.family)?.versionId ??
        null)
  );
  useEffect(() => {
    onBusyChange?.(busy);
    return () => onBusyChange?.(false);
  }, [busy, onBusyChange]);
  useEffect(() => {
    onDirtyChange(formik.dirty);
    return () => onDirtyChange(false);
  }, [formik.dirty, onDirtyChange]);
  return (
    <AssignmentStepperFrame savedAssignment>
      <CustomStepperWithFormik
        steps={assignmentEditSteps}
        activeStep={activeStep}
        initialValues={formik.initialValues}
        formikInstance={formik}
        validationSchema={undefined}
        showSaveButton={false}
        nextButtonLabel="Next"
        finalButtonLabel={policiesChanged ? 'Save policies' : 'Close'}
        onCancel={onCancel}
        handleBack={() => setActiveStep((step) => Math.max(0, step - 1))}
        handleNext={(last) => {
          if (last) {
            formik.handleSubmit();
            return;
          }
          setReachedStep((step) => Math.max(step, activeStep + 1));
          setActiveStep((step) => step + 1);
        }}
        completedSteps={Array.from({ length: reachedStep }, (_, index) => index)}
        isStepClickable={(index) => index <= reachedStep && !busy}
        onStepClick={(index) => {
          if (index <= reachedStep) setActiveStep(index);
        }}
        validateForwardStepClick
        saveAndNextButtonProps={{
          loading: busy,
          disabled: busy,
          color: 'inherit',
          startIcon: (
            <Iconify
              icon={
                activeStep < 2
                  ? 'mdi:arrow-right'
                  : policiesChanged
                    ? GlobalIcons.submit
                    : GlobalIcons.cancel
              }
              width={20}
            />
          ),
          endIcon: null,
        }}
        backButtonProps={{ disabled: busy }}
        renderItem={() => (
          <Stack
            role="region"
            aria-label="Assigned policy fields"
            spacing={2}
            sx={{
              flex: 1,
              minHeight: 0,
              p: assignmentEditPadding,
              '& > *': { flexShrink: 0 },
            }}
          >
            {activeStep === 0 && (
              <>
                {children}
                <FormSectionCard
                  title="Fee Structure"
                  icon="mdi:file-document-outline"
                  descriptionTooltip="The saved fee structure and revision for this student and academic year."
                >
                  <DetailField
                    label="Fee structure"
                    value={`${data.assignment.structureName} · r${data.assignment.revisionNumber}`}
                  />
                </FormSectionCard>
                <AssignmentPolicies
                  studentId={data.assignment.studentId}
                  academicYearId={data.assignment.academicYearId}
                  defaults={data.assignment.policies}
                  selections={formik.values.policies}
                  reason={formik.values.reason}
                  editing
                  canOverride={canOverridePolicies}
                  disabled={busy}
                  onChange={(policies, reason) => {
                    setReachedStep(0);
                    formik.setValues({
                      policies: [...policies].sort(
                        (a, b) =>
                          assignmentPolicyFamilies.indexOf(a.family) -
                          assignmentPolicyFamilies.indexOf(b.family)
                      ),
                      reason,
                    });
                  }}
                />
              </>
            )}
            {activeStep === 1 && (
              <>
                {!onEditFees && (
                  <Alert severity="info">
                    {data.structureEditBlocker ||
                      'The assigned amounts and service dates are read-only in this editor.'}
                  </Alert>
                )}
                <FormSectionCard
                  title="Required Fee Heads"
                  icon="mdi:format-list-checks"
                  descriptionTooltip="Review the saved amounts, service dates and proration for the required fees."
                  action={
                    onEditFees && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<Iconify icon={GlobalIcons.edit} />}
                        disabled={formik.dirty || busy}
                        onClick={onEditFees}
                      >
                        Edit fees
                      </Button>
                    )
                  }
                >
                  <Stack spacing={1.5} divider={<Divider flexItem />}>
                    {(data.assignment.heads ?? [])
                      .filter((head) => !head.isOptional && head.included)
                      .map((head) => (
                        <AssignmentFeeHeadSummary
                          key={head.feeHeadId}
                          head={head}
                          currency={data.assignment.currency}
                          calculation={feeHeadProration?.get(head.feeHeadId)}
                          serviceDetails={
                            <DetailField
                              label="Service dates"
                              value={
                                head.servicePeriod?.startDate && head.servicePeriod?.endDate
                                  ? `${fDate(head.servicePeriod.startDate)} – ${fDate(head.servicePeriod.endDate)}`
                                  : 'Not recorded'
                              }
                            />
                          }
                        />
                      ))}
                  </Stack>
                </FormSectionCard>
                {(data.assignment.heads ?? []).some((head) => head.isOptional) && (
                  <OptionalFeeServiceStops
                    assignment={data.assignment}
                    feeHeadProration={feeHeadProration}
                    canRestart={canRestartOptionalService}
                    disabled={!canStopOptionalService || formik.dirty || busy}
                    disabledReason={
                      !canStopOptionalService
                        ? 'Optional service cancellation requires the Stop Optional Service permission and an active enrollment.'
                        : formik.dirty
                          ? 'Save or discard the pending policy changes before changing an optional service.'
                          : busy
                            ? 'Another fee assignment operation is in progress.'
                            : undefined
                    }
                    onSaved={onOptionalServiceSaved}
                    onBusyChange={setServiceBusy}
                  />
                )}
                {!canStopOptionalService && !onEditFees && (
                  <Typography variant="body2" color="text.secondary">
                    Optional service cancellation requires the fee assignment Stop Optional Service
                    permission and an active enrollment.
                  </Typography>
                )}
              </>
            )}
            {activeStep === 2 && (
              <>
                <AssignmentReview data={data.assignment} committed />
                {policiesChanged && (
                  <FormSectionCard
                    title="Policy Changes"
                    icon="mdi:shield-check-outline"
                    descriptionTooltip="Review the pending policies before saving. Assigned amounts are unchanged."
                  >
                    <AssignmentPolicies
                      studentId={data.assignment.studentId}
                      academicYearId={data.assignment.academicYearId}
                      defaults={[...data.assignment.policies, ...(policyOptions.data ?? [])]}
                      selections={formik.values.policies}
                      reason={formik.values.reason}
                      canOverride={false}
                      onChange={() => {}}
                    />
                    <DetailField label="Policy change reason" value={formik.values.reason} />
                  </FormSectionCard>
                )}
              </>
            )}
            {(formik.submitCount > 0 || formik.touched.reason) && formik.errors.reason && (
              <Alert severity="error">{formik.errors.reason}</Alert>
            )}
            {error && (
              <Alert severity="error">
                {error} Reopen the assignment if another user changed it.
              </Alert>
            )}
          </Stack>
        )}
      />
    </AssignmentStepperFrame>
  );
}
