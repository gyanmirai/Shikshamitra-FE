'use client';

import type { RoutingOption } from 'src/redux/finance/financeRoutingApi';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useRef, useState, useEffect } from 'react';
import { formatNumber } from 'src/utils/formate_number';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { LoadingButton } from 'src/components/loading-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { FormSectionCard } from 'src/components/form-section-card';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import {
  Box,
  Grid,
  Alert,
  Button,
  MenuItem,
  TextField,
  Typography,
  DialogActions,
} from '@mui/material';

import {
  normalizeRefundMethod,
  getAllowedRefundMethodOptions,
} from '../NewRefundForm/refundPayoutMethods';

import type { IStudentFeeData } from '../type';

export interface RefundPaymentValues {
  method: string;
  externalReference: string;
  bankAccountId: string;
  evidenceReference: string;
}

interface Props {
  refund: IStudentFeeData;
  bankAccounts: RoutingOption[];
  bankAccountsLoading: boolean;
  loading: boolean;
  onClose: () => void;
  onSubmit: (values: RefundPaymentValues) => Promise<void>;
}

export default function RefundPaymentDialog({
  refund,
  bankAccounts,
  bankAccountsLoading,
  loading,
  onClose,
  onSubmit,
}: Props) {
  const [confirmClose, setConfirmClose] = useState(false);
  const submitting = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);
  const focusedSubmission = useRef(0);
  const methodOptions = getAllowedRefundMethodOptions(refund._allowedPayoutMethods);
  const formik = useFormik<RefundPaymentValues>({
    initialValues: {
      method: normalizeRefundMethod(refund._refundMethod ?? ''),
      externalReference: '',
      bankAccountId: refund._payingBankAccountId ?? '',
      evidenceReference: '',
    },
    validationSchema: Yup.object({
      method: Yup.string()
        .oneOf(
          methodOptions.map((method) => method.value),
          'Select a payout method allowed by the refund policy'
        )
        .required('Payout method is required'),
      externalReference: Yup.string()
        .max(200)
        .when('method', {
          is: (method: string) => Boolean(method) && method !== 'Cash',
          then: (schema) => schema.trim().required('Payment reference is required'),
        }),
      bankAccountId: Yup.string().when('method', {
        is: (method: string) => Boolean(method) && method !== 'Cash',
        then: (schema) => schema.required('Source school bank account is required'),
      }),
      evidenceReference: Yup.string()
        .trim()
        .max(500)
        .required('Payment evidence reference is required'),
    }),
    onSubmit: async (values) => {
      if (submitting.current || loading || !refund._refundRequestId) return;
      submitting.current = true;
      formik.setStatus(undefined);
      try {
        await onSubmit(values);
      } catch (error) {
        formik.setStatus(error instanceof Error ? error.message : 'Refund processing failed.');
      } finally {
        submitting.current = false;
      }
    },
  });
  useEffect(() => {
    if (
      formik.isSubmitting ||
      formik.isValidating ||
      formik.submitCount <= focusedSubmission.current
    )
      return;
    focusedSubmission.current = formik.submitCount;
    formRef.current
      ?.querySelector<HTMLElement>(
        '[aria-invalid="true"]:not(:disabled):not([aria-disabled="true"])'
      )
      ?.focus();
  }, [formik.submitCount, formik.isSubmitting, formik.isValidating]);
  const busy = loading || formik.isSubmitting;
  const nonCash = Boolean(formik.values.method) && formik.values.method !== 'Cash';
  const requestClose = () => {
    if (busy) return;
    if (formik.dirty) setConfirmClose(true);
    else onClose();
  };
  const fieldError = (name: keyof RefundPaymentValues) =>
    formik.touched[name] ? formik.errors[name] : undefined;
  const referenceLabel =
    formik.values.method === 'Cheque'
      ? 'Cheque number'
      : formik.values.method === 'Demand Draft (DD)'
        ? 'DD number'
        : formik.values.method === 'UPI'
          ? 'UPI transaction ID'
          : 'Bank UTR / transaction reference';

  return (
    <>
      <CustomDialog
        titleInfo="Record payment evidence for the approved refund. The refund remains Approved until its payment outcome is confirmed."
        open
        title="Record Refund Payment"

        maxWidth="sm"
        hasForm={false}
        guardUnsavedChanges={false}
        disableClose={busy}
        handleClose={requestClose}
      >
        <Box
          component="form"
          ref={formRef}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (busy || submitting.current) return;
            formik.handleSubmit(event);
          }}
          sx={{ display: 'flex', flexDirection: 'column', minHeight: 0, flex: 1 }}
        >
          <DialogScrollContent>
            <FormBusyRegion busy={busy} label="Recording payment…">
              <FormSectionCard
                descriptionTooltip="Use the approved payout method and include the signed handover receipt or document reference for cash, or the transaction and payment evidence references for a bank payment."
                icon={GlobalIcons.receiptIcon}
                title="Payment Details"
                titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
              >
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 7 }}>
                    <Typography variant="caption" color="text.secondary">
                      Student
                    </Typography>
                    <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                      {refund.name}
                    </Typography>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Approved amount
                    </Typography>
                    <Typography variant="body2" sx={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatNumber(refund._approvedAmount ?? 0, 'INR')}
                    </Typography>
                  </Grid>
                  <Grid size={12}>
                    <ShakingTextField error={Boolean(fieldError('method'))}>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        label="Payout method"
                        name="method"
                        value={formik.values.method}
                        select={!refund._refundMethod}
                        disabled={
                          busy || Boolean(refund._refundMethod) || methodOptions.length === 0
                        }
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={Boolean(fieldError('method'))}
                        helperText={
                          fieldError('method') ||
                          (methodOptions.length === 0
                            ? 'No payment methods are available under this refund policy.'
                            : undefined)
                        }
                      >
                        {methodOptions.map((method) => (
                          <MenuItem key={method.value} value={method.value}>
                            {method.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </ShakingTextField>
                  </Grid>
                  {nonCash && (
                    <>
                      <Grid size={12}>
                        <ShakingTextField error={Boolean(fieldError('externalReference'))}>
                          <TextField
                            fullWidth
                            size="small"
                            required
                            label={referenceLabel}
                            name="externalReference"
                            value={formik.values.externalReference}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            disabled={busy}
                            inputProps={{ maxLength: 200 }}
                            error={Boolean(fieldError('externalReference'))}
                            helperText={fieldError('externalReference')}
                          />
                        </ShakingTextField>
                      </Grid>
                      <Grid size={12}>
                        <ShakingTextField error={Boolean(fieldError('bankAccountId'))}>
                          <TextField
                            fullWidth
                            size="small"
                            required
                            select
                            label="Source school bank account"
                            name="bankAccountId"
                            value={formik.values.bankAccountId}
                            onChange={formik.handleChange}
                            onBlur={formik.handleBlur}
                            disabled={
                              busy || bankAccountsLoading || Boolean(refund._payingBankAccountId)
                            }
                            error={Boolean(fieldError('bankAccountId'))}
                            helperText={
                              fieldError('bankAccountId') ||
                              (bankAccountsLoading
                                ? 'Loading bank accounts…'
                                : bankAccounts.length === 0
                                  ? 'No school bank accounts are available.'
                                  : undefined)
                            }
                          >
                            {bankAccounts.map((account) => (
                              <MenuItem key={account.id} value={account.id}>
                                {account.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </ShakingTextField>
                      </Grid>
                    </>
                  )}
                  <Grid size={12}>
                    <ShakingTextField error={Boolean(fieldError('evidenceReference'))}>
                      <TextField
                        fullWidth
                        size="small"
                        required
                        label={
                          formik.values.method === 'Cash'
                            ? 'Signed handover receipt or document reference'
                            : 'Payment evidence reference'
                        }
                        name="evidenceReference"
                        value={formik.values.evidenceReference}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        disabled={busy}
                        inputProps={{ maxLength: 500 }}
                        error={Boolean(fieldError('evidenceReference'))}
                        helperText={fieldError('evidenceReference')}
                      />
                    </ShakingTextField>
                  </Grid>
                </Grid>
                {formik.status && <Alert severity="error">{formik.status}</Alert>}
              </FormSectionCard>
            </FormBusyRegion>
          </DialogScrollContent>
          <DialogActions sx={{ p: 2, flexShrink: 0, flexWrap: 'wrap', rowGap: 1 }}>
            <Button
              type="button"
              size="small"
              variant="outlined"
              disabled={busy}
              startIcon={<Iconify icon={GlobalIcons.cancel} width={18} />}
              onClick={requestClose}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              size="small"
              variant="contained"
              loading={busy}
              loadingPosition="start"
              disabled={busy || !refund._refundRequestId || methodOptions.length === 0}
              startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
            >
              Record Payment
            </LoadingButton>
          </DialogActions>
        </Box>
      </CustomDialog>
      <ConfirmDialog
        open={confirmClose}
        onClose={() => setConfirmClose(false)}
        title="Discard Changes?"
        content="Your changes to this refund payment form will be lost if you discard them."
        cancelText="Keep Editing"
        action={
          <Button
            type="button"
            size="small"
            variant="contained"
            color="error"
            startIcon={<Iconify icon={GlobalIcons.delete} width={18} />}
            onClick={onClose}
          >
            Discard Changes
          </Button>
        }
      />
    </>
  );
}
