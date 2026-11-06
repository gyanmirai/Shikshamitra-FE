import type { AssignmentHead } from 'src/redux/finance/studentFeeAssignment';
import type { AdmissionVariableFeeHead } from 'src/redux/student/admissions/admission-fee-collection-types';

import * as Yup from 'yup';
import { getIn, useFormik } from 'formik';
import { useRouter } from 'next/navigation';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { StudentFeedback } from 'src/components/student-feedback';
import { FormSectionCard } from 'src/components/form-section-card';
import { DetailGrid, DetailField } from 'src/components/detail-view';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { amountError } from 'src/screens/finance/settings/FeeStructure/feeStructureModel';
import { Box, Stack, Button, TextField, DialogActions, LinearProgress } from '@mui/material';
import { renderUnsavedConfirmation } from 'src/components/confirm-dialog/render-unsaved-confirmation';
import AssignmentMoneyInput from 'src/screens/finance/FeeStructureAssign/Components/AssignmentMoneyInput';
import FeeProrationResult from 'src/screens/finance/FeeCollection/FeeCollectionComponent/FeeProrationResult';

import { useAdmissionFeePreview } from './use-admission-fee-preview';

export function AdmissionFeePreparationDialog({
  applicantName,
  heads,
  busy,
  onClose,
  onSubmit,
  previewContext,
}: {
  applicantName: string;
  heads: AssignmentHead[];
  busy: boolean;
  onClose: () => void;
  onSubmit: (heads: AdmissionVariableFeeHead[]) => Promise<void>;
  previewContext?: {
    applicationId: string;
    joiningDate: string;
    prorationPolicyVersionId?: string | null;
  };
}) {
  const router = useRouter();
  const form = useFormik({
    initialValues: {
      variableFeeHeads: heads.map((head) => ({
        feeHeadId: head.feeHeadId,
        amount: null as number | null,
        zeroAmountReason: '',
      })),
    },
    validationSchema: Yup.object({
      variableFeeHeads: Yup.array().of(
        Yup.object({
          amount: Yup.mixed()
            .nullable()
            .test('finance-amount', 'Enter a valid total amount.', (value, context) => {
              const error = amountError(value as number | null);
              return error ? context.createError({ message: error }) : true;
            }),
          zeroAmountReason: Yup.string()
            .max(500, 'Use 500 characters or fewer.')
            .when('amount', {
              is: 0,
              then: (schema) => schema.trim().required('Explain why this fee amount is zero.'),
            }),
        })
      ),
    }),
    onSubmit: async (values) => {
      if (busy || (previewContext && !preview.ready)) return;
      try {
        await onSubmit(
          values.variableFeeHeads.map((head) => ({
            feeHeadId: head.feeHeadId,
            amount: head.amount as number,
            zeroAmountReason: head.amount === 0 ? head.zeroAmountReason.trim() : undefined,
          }))
        );
      } catch (error) {
        form.setStatus(
          parseApiProblemDetail(error).detail ||
            'Fees could not be prepared. Your amounts are preserved; retry.'
        );
      }
    },
  });
  const variableFeeHeads = form.values.variableFeeHeads.map((head) => ({
    feeHeadId: head.feeHeadId,
    amount: head.amount as number,
    zeroAmountReason: head.amount === 0 ? head.zeroAmountReason.trim() : undefined,
  }));
  const preview = useAdmissionFeePreview(
    {
      applicationId: previewContext?.applicationId ?? '',
      joiningDate: previewContext?.joiningDate ?? '',
      variableFeeHeads,
      ...(previewContext?.prorationPolicyVersionId !== undefined && {
        prorationPolicyVersionId: previewContext.prorationPolicyVersionId,
      }),
    },
    Boolean(previewContext) &&
      variableFeeHeads.every(
        (head) => !amountError(head.amount) && (head.amount !== 0 || Boolean(head.zeroAmountReason))
      )
  );
  const loading = busy || form.isSubmitting;
  const guard = useUnsavedNavigation(form.dirty, {
    push: router.push,
    blockNavigation: loading,
    guardContextChanges: true,
    renderConfirmation: (keepEditing, discard) =>
      renderUnsavedConfirmation(keepEditing, discard, { busy: loading }),
  });
  const close = () => guard.requestNavigation(onClose);
  return (
    <CustomDialog
      open
      title={`Set Variable Fee Amounts · ${applicantName}`}
      titleInfo="Enter amounts for the variable fee heads configured in Finance. Finance calculates the installments before collection."
      maxWidth="sm"
      handleClose={close}
      disableClose={busy || form.isSubmitting}
      guardUnsavedChanges={false}
      formProps={{
        onSubmit: (event) => {
          event.preventDefault();
          form.submitForm();
        },
        noValidate: true,
      }}
    >
      <DialogScrollContent>
        <FormBusyRegion busy={busy || form.isSubmitting} label="Preparing Fees…">
          <Stack spacing={2}>
            <FormSectionCard
              title="Variable Fees"
              icon={GlobalIcons.admissionDetails}
              descriptionTooltip="Enter each full term coverage amount. Zero amounts require a reason; Finance owns the installment calculation."
            >
              <Stack spacing={2}>
                {heads.map((head, index) => {
                  const amountName = `variableFeeHeads.${index}.amount`;
                  const reasonName = `variableFeeHeads.${index}.zeroAmountReason`;
                  const error = getIn(form.touched, amountName) && getIn(form.errors, amountName);
                  const reasonError =
                    getIn(form.touched, reasonName) && getIn(form.errors, reasonName);
                  return (
                    <Stack key={head.feeHeadId} spacing={1}>
                      <Stack direction="row" alignItems="flex-start" spacing={0.5}>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <ShakingTextField error={Boolean(error)}>
                            <AssignmentMoneyInput
                              label={`${head.feeHeadName} total for term coverage`}
                              required
                              fullWidth
                              value={form.values.variableFeeHeads[index].amount}
                              disabled={busy || form.isSubmitting}
                              onAmountChange={(value) => form.setFieldValue(amountName, value)}
                              onBlur={() => form.setFieldTouched(amountName)}
                              error={Boolean(error)}
                              helperText={error || undefined}
                            />
                          </ShakingTextField>
                        </Box>
                        <InfoTooltipIcon
                          label={`About ${head.feeHeadName} amount`}
                          title="Full coverage amount; installments follow the Finance payment term."
                        />
                      </Stack>
                      {form.values.variableFeeHeads[index].amount === 0 && (
                        <ShakingTextField error={Boolean(reasonError)}>
                          <TextField
                            label={`Reason for zero ${head.feeHeadName} amount`}
                            name={reasonName}
                            required
                            fullWidth
                            size="small"
                            value={form.values.variableFeeHeads[index].zeroAmountReason}
                            onChange={form.handleChange}
                            onBlur={form.handleBlur}
                            disabled={busy || form.isSubmitting}
                            error={Boolean(reasonError)}
                            helperText={reasonError}
                            slotProps={{ htmlInput: { maxLength: 500 } }}
                          />
                        </ShakingTextField>
                      )}
                    </Stack>
                  );
                })}
              </Stack>
            </FormSectionCard>
            {preview.pending && <LinearProgress aria-label="Calculating variable fee preview" />}
            {preview.result && (
              <>
                <FeeProrationResult result={preview.result.proration} />
                {!preview.result.proration && (
                  <DetailGrid>
                    <DetailField
                      label="Scheduled fees"
                      value={formatNumber(preview.result.totalAmount, 'INR')}
                    />
                  </DetailGrid>
                )}
              </>
            )}
            {previewContext && preview.failed && (
              <Stack spacing={1} alignItems="flex-start">
                <StudentFeedback
                  notificationKey="admission-variable-fee-preview"
                  presentation="persistent"
                  severity="error"
                >
                  {parseApiProblemDetail(preview.query.error).detail ||
                    'The fee preview could not be calculated.'}
                </StudentFeedback>
                <Button size="small" variant="outlined" onClick={() => preview.query.refetch()}>
                  Retry fee preview
                </Button>
              </Stack>
            )}
            {form.status && (
              <StudentFeedback
                notificationKey="STU-0339"
                presentation="persistent"
                severity="error"
              >
                {form.status}
              </StudentFeedback>
            )}
          </Stack>
        </FormBusyRegion>
      </DialogScrollContent>
      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          size="small"
          variant="outlined"
          onClick={close}
          color="inherit"
          disabled={busy || form.isSubmitting}
          startIcon={<Iconify icon={GlobalIcons.cancel} width={16} />}
        >
          Cancel
        </Button>
        <Button
          size="small"
          variant="contained"
          color="inherit"
          type="submit"
          loading={busy || form.isSubmitting}
          disabled={loading || (Boolean(previewContext) && !preview.ready)}
          startIcon={<Iconify icon="mdi:arrow-right" width={16} />}
        >
          Continue to collection
        </Button>
      </DialogActions>
      {guard.confirmation}
    </CustomDialog>
  );
}
