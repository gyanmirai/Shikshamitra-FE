'use client';

import type { FeeWaiverResult, ApplyFeeWaiverInput } from 'src/redux/feeCollection/feeCollection';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import SubmitButton from 'src/components/submit-button';
import { shikshaMitraToast } from 'src/components/toast';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { DetailField } from 'src/screens/finance/components/detail-view';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { useApplyFeeWaiverMutation } from 'src/redux/feeCollection/feeCollection';
import { Alert, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import { isCollectionOutcomeUncertain } from './feeCollectionContext';

import type { FeeWaiverToggleProps } from './FeeWaiverToggle';

type Props = Omit<FeeWaiverToggleProps, 'canWaive' | 'onApplied'> & {
  onClose: () => void;
  onApplied: (result: FeeWaiverResult) => void;
  pendingInput: ApplyFeeWaiverInput | null;
  onUnconfirmed: (input: ApplyFeeWaiverInput) => void;
};

const schema = Yup.object({
  reason: Yup.string()
    .trim()
    .required('Enter a waiver reason.')
    .max(500, 'Use 500 characters or fewer.'),
});

export default function FeeWaiverDialog({
  sourceType,
  sourceId,
  sourceName,
  remainingAmount,
  onClose,
  onApplied,
  pendingInput,
  onUnconfirmed,
}: Props) {
  const [applyWaiver, { isLoading }] = useApplyFeeWaiverMutation();
  const [idempotencyKey] = useState(() => pendingInput?.idempotencyKey ?? crypto.randomUUID());
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(Boolean(pendingInput));
  const inFlight = useRef(false);
  const submittedInput = useRef<ApplyFeeWaiverInput | null>(pendingInput);
  const amountRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLInputElement>(null);
  const label = sourceType === 'LateFee' ? 'late fee' : 'charge';
  const formik = useFormik({
    initialValues: {
      reason: pendingInput?.reason ?? '',
      amount: String(pendingInput?.amount ?? remainingAmount),
    },
    validationSchema: schema,
    validate: ({ amount }) => {
      if (uncertain) return {};
      if (!amount) return { amount: 'Enter a waiver amount.' };
      if (!/^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(amount) || Number(amount) <= 0)
        return { amount: 'Enter a positive amount with up to two decimal places.' };
      if (Number(amount) > remainingAmount)
        return { amount: 'Waiver amount cannot exceed the pending balance.' };
      return {};
    },
    onSubmit: async ({ reason, amount }, helpers) => {
      if (inFlight.current) return;
      inFlight.current = true;
      setError('');
      const input =
        uncertain && submittedInput.current
          ? submittedInput.current
          : {
              sourceType,
              sourceId,
              amount: Number(amount),
              reason: reason.trim(),
              idempotencyKey,
            };
      submittedInput.current = input;
      let result: FeeWaiverResult;
      try {
        result = await applyWaiver(input).unwrap();
      } catch (failure) {
        const unconfirmed = uncertain || isCollectionOutcomeUncertain(failure);
        setUncertain(unconfirmed);
        if (unconfirmed) onUnconfirmed(input);
        setError(parseApiProblemDetail(failure).detail || 'Unable to apply the waiver. Try again.');
        return;
      } finally {
        inFlight.current = false;
      }
      helpers.resetForm();
      shikshaMitraToast.success({
        message: `Waived ${formatNumber(result.waivedAmount, 'INR', { fractionDigits: 2 })} from the ${label}.`,
      });
      onApplied(result);
    },
  });
  const busy = isLoading || formik.isSubmitting;
  const close = () => {
    formik.resetForm();
    onClose();
  };
  const { requestNavigation, confirmation } = useUnsavedNavigation(formik.dirty || uncertain, {
    blockNavigation: busy,
    renderConfirmation: (keepEditing, discard) => (
      <ConfirmDialog
        open
        title={uncertain ? 'Leave Unconfirmed Waiver?' : 'Discard Unsaved Changes?'}
        icon={<Iconify icon={GlobalIcons.alertIcon} />}
        content={
          uncertain
            ? 'This waiver may already have been applied. Closing does not undo it. Check the refreshed balances before another action. Reopen this waiver to retry the same request.'
            : 'Your waiver has not been saved. Keep editing, or discard it and close.'
        }
        onClose={keepEditing}
        cancelText={uncertain ? 'Keep checking' : 'Keep editing'}
        action={
          <Button
            type="button"
            variant="contained"
            color={uncertain ? 'inherit' : 'error'}
            startIcon={
              <Iconify icon={uncertain ? GlobalIcons.cancel : GlobalIcons.delete} width={18} />
            }
            onClick={discard}
          >
            {uncertain ? 'Close and check later' : 'Discard changes'}
          </Button>
        }
      />
    ),
  });
  const requestClose = () => {
    if (!inFlight.current && !busy) requestNavigation(close);
  };
  const reasonError = formik.touched.reason && formik.errors.reason;
  const amountError = formik.touched.amount && formik.errors.amount;

  return (
    <>
      <CustomDialog
        open
        title={sourceType === 'LateFee' ? 'Waive Late Fee' : 'Waive Charge'}
        titleInfo="Waivers apply immediately and are recorded separately from payments."
        handleClose={requestClose}
        disableClose={busy}
        guardUnsavedChanges={false}
        hasUnsavedChanges={formik.dirty}
        hasForm={false}
        maxWidth="xs"
        onClick={(event) => event.stopPropagation()}
      >
        <Stack
          component="form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (busy || inFlight.current) return;
            formik.validateForm().then((errors) => {
              if (errors.amount) amountRef.current?.focus();
              else if (errors.reason) reasonRef.current?.focus();
            });
            formik.handleSubmit(event);
          }}
          sx={{ minHeight: 0, flex: 1 }}
        >
          <DialogScrollContent>
            <FormBusyRegion busy={busy} showOverlay={false} label="Applying waiver…">
              <FormSectionCard
                title="Waiver Details"
                icon={GlobalIcons.receiptIcon}
                descriptionTooltip="You can waive part or all of the current pending balance. The server checks the balance when you apply the waiver."
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              >
                <Stack spacing={2} sx={{ overflowWrap: 'anywhere' }}>
                  {sourceName && <Typography variant="subtitle2">{sourceName}</Typography>}
                  <Stack spacing={1}>
                    <DetailField
                      label="Pending balance"
                      value={formatNumber(remainingAmount, 'INR', { fractionDigits: 2 })}
                      layout="inline"
                    />
                    <NumericFormatCustom
                      inputRef={amountRef}
                      label="Waiver amount"
                      name="amount"
                      required
                      fullWidth
                      size="small"
                      roundToWholeRupees={false}
                      decimalScale={2}
                      value={formik.values.amount}
                      disabled={busy || uncertain}
                      onValueChange={({ value }, source) => {
                        if (source.source === 'event') formik.setFieldValue('amount', value);
                      }}
                      onBlur={formik.handleBlur}
                      error={Boolean(amountError)}
                      helperText={amountError}
                    />
                    <DetailField
                      label="Remaining after waiver"
                      value={formatNumber(
                        Math.max(0, remainingAmount - (Number(formik.values.amount) || 0)),
                        'INR',
                        { fractionDigits: 2 }
                      )}
                      layout="inline"
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    This non-cash reduction takes effect immediately. No payment receipt is
                    generated.
                  </Typography>
                  <ShakingTextField error={Boolean(reasonError)}>
                    <TextField
                      inputRef={reasonRef}
                      name="reason"
                      label="Reason"
                      required
                      fullWidth
                      size="small"
                      multiline
                      minRows={3}
                      disabled={busy || uncertain}
                      value={formik.values.reason}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      error={Boolean(reasonError)}
                      helperText={reasonError || `${formik.values.reason.length}/500 characters`}
                      inputProps={{ maxLength: 500 }}
                    />
                  </ShakingTextField>
                  {error && <Alert severity="error">{error}</Alert>}
                  {uncertain && (
                    <Alert severity="warning">
                      The result could not be confirmed. Retry this same waiver to check the result
                      safely.
                    </Alert>
                  )}
                </Stack>
              </FormSectionCard>
            </FormBusyRegion>
          </DialogScrollContent>
          <DialogActions>
            <Button
              type="button"
              size="small"
              variant="outlined"
              color="inherit"
              disabled={busy}
              startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
              onClick={requestClose}
            >
              Cancel
            </Button>
            <SubmitButton
              type="submit"
              buttonText={uncertain ? 'Retry waiver' : 'Apply waiver'}
              loading={busy}
              disabled={busy}
              startIcon={<Iconify icon={GlobalIcons.approveDecision} width={18} />}
            />
          </DialogActions>
        </Stack>
      </CustomDialog>
      {confirmation}
    </>
  );
}
