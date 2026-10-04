import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { Grid, Button, MenuItem, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import FinanceRoutingFields from 'src/screens/finance/components/FinanceRoutingFields';

/** Extended props that also pass the entered notes/reason back on close. */
interface IFeeRefundApprovalFormProps {
  onClose: (
    e: any,
    isSubmit: boolean,
    notes?: string,
    routing?: { expenseCategoryId: string; bankAccountId?: string; method: string }
  ) => void;
  academicYearId?: string;
  defaultCategoryId?: string;
  defaultBankId?: string;
  defaultMethod?: string;
  mode: string;
  loading?: boolean;
}

const FeeRefundReasonApprovalForm = ({
  onClose,
  mode,
  loading,
  academicYearId = '',
  defaultCategoryId = '',
  defaultBankId = '',
  defaultMethod = 'Cash',
}: IFeeRefundApprovalFormProps) => {
  const formik = useFormik({
    initialValues: {
      reason: '',
      expenseCategoryId: defaultCategoryId,
      bankAccountId: defaultBankId,
      method:
        defaultMethod === 'UPI'
          ? 'Upi'
          : defaultMethod === 'Demand Draft (DD)'
            ? 'DemandDraft'
            : defaultMethod === 'Bank Transfer (NEFT/RTGS/IMPS)'
              ? 'BankTransfer'
              : defaultMethod,
    },
    validationSchema: Yup.object().shape({
      expenseCategoryId:
        mode === 'Approve' ? Yup.string().required('Expense Category is required') : Yup.string(),
      bankAccountId: Yup.string().when('method', {
        is: (method: string) => mode === 'Approve' && method !== 'Cash',
        then: (s) => s.required('Paying Bank Account is required'),
      }),
      method: Yup.string()
        .oneOf(['Cash', 'Cheque', 'DemandDraft', 'BankTransfer', 'Upi'])
        .required(),
      reason:
        mode === 'Reject' || mode === 'Cancel'
          ? Yup.string().trim().required('Reason is required')
          : Yup.string(),
    }),
    onSubmit: (values) => {
      onClose(
        null,
        true,
        values.reason || undefined,
        mode === 'Approve'
          ? {
              expenseCategoryId: values.expenseCategoryId,
              bankAccountId: values.bankAccountId || undefined,
              method: values.method,
            }
          : undefined
      );
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        {mode === 'Approve' && (
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                size="small"
                label="Payout Method"
                name="method"
                value={formik.values.method}
                onChange={formik.handleChange}
              >
                {['Cash', 'Cheque', 'DemandDraft', 'BankTransfer', 'Upi'].map((method) => (
                  <MenuItem key={method} value={method}>
                    {method}
                  </MenuItem>
                ))}
              </TextField>
              <FinanceRoutingFields
                formik={formik}
                academicYearId={academicYearId}
                operation="refund"
                categoryField="expenseCategoryId"
                categoryLabel="Expense Category"
                bankField="bankAccountId"
                bankLabel="Paying Bank Account"
              />
            </Grid>
          </Grid>
        )}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid size={12}>
            <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
              <TextField
                fullWidth
                label={`Reason${mode === 'Reject' || mode === 'Cancel' ? ' *' : ''}`}
                name="reason"
                size="small"
                multiline
                rows={3}
                value={formik.values.reason}
                onChange={(e) => {
                  formik.setFieldValue('reason', e.target.value);
                  formik.setFieldTouched('reason', true);
                }}
                error={formik.touched.reason && Boolean(formik.errors.reason)}
                helperText={formik.touched.reason && formik.errors.reason}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          onClick={() => {
            onClose(null, false);
          }}
          variant="outlined"
          size="small"
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
        >
          Cancel
        </Button>

        <LoadingButton
          size="small"
          variant="contained"
          color={mode === 'Reject' || mode === 'Cancel' ? 'error' : 'success'}
          startIcon={<Iconify icon={mode === 'Reject' ? GlobalIcons.cancel : GlobalIcons.tick} />}
          loading={loading}
          onClick={(e: any) => {
            e.preventDefault();
            formik.handleSubmit(e);
          }}
        >
          {mode}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default FeeRefundReasonApprovalForm;
