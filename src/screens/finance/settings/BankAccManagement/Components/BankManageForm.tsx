'use client';

import { sanitizeFinanceName } from 'src/utils/finance-name';
import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import React, { useState, useCallback } from 'react';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import { FormSectionCard } from 'src/components/form-section-card';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Grid, Alert, Stack, Button, TextField, DialogActions } from '@mui/material';
import DownstreamUsageWarning from 'src/screens/finance/settings/components/DownstreamUsageWarning';
import { getAccountSettingSaveError } from 'src/screens/finance/settings/components/account-setting-save-error';
import {
  usePutBankAccountMutation,
  usePostBankAccountMutation,
} from 'src/redux/finance/BankAccountManage/bankAccountApi';

import { getBankAccountInitialValues } from './bankInitialValues';
import { BankAccountType, type IBankAccountFormProps } from './type';
import { bankAccountValidationSchema } from './BankValidationSchema';

const BankAccountForm: React.FC<IBankAccountFormProps> = ({ open, onClose, editData }) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const [saveError, setSaveError] = useState('');

  const [showDownstreamWarning, setShowDownstreamWarning] = useState(false);
  const [pendingFormValues, setPendingFormValues] = useState<ReturnType<
    typeof getBankAccountInitialValues
  > | null>(null);

  // POST mutation for creating
  const [addBankAccount, { isLoading: isAddLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePostBankAccountMutation,
  });

  // PUT mutation for updating
  const [updateBankAccount, { isLoading: isUpdateLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: usePutBankAccountMutation,
  });

  const formik = useFormik({
    initialValues: getBankAccountInitialValues(editData),
    validationSchema: bankAccountValidationSchema,
    onSubmit: async (values) => {
      // Check if updating an item that is used downstream
      if (editData?.isUsedInDownstream && editData?.id) {
        setPendingFormValues(values);
        setShowDownstreamWarning(true);
        return;
      }

      // Proceed with submission if not used downstream
      await performSubmission(values);
    },
  });

  // Perform the actual form submission
  const performSubmission = async (values: ReturnType<typeof getBankAccountInitialValues>) => {
    setSaveError('');
    try {
      // Transform form data to API format
      const payload = {
        bankName: values.bankName.trim(),
        branchName: values.branchName.trim(),
        branchAddress: values.branchAddress || '',
        accountHolderName: values.accountHolderName.trim(),
        accountType: values.accountType,
        accountNumber: String(values.accountNumber),
        purpose: values.purpose || '',
        ifscCode: values.ifscCode,
        upiId: values.upiId || '',
        effectiveFrom: `${values.effectiveFrom!.format('YYYY-MM-DD')}T00:00:00.000Z`,
        effectiveTo: values.effectiveTo
          ? `${values.effectiveTo.format('YYYY-MM-DD')}T23:59:59.000Z`
          : null,
        concurrencyStamp: editData ? values.concurrencyStamp : null,
      };

      if (editData?.id) {
        // Update existing bank account
        await updateBankAccount({
          bankAccountId: editData.id,
          body: payload,
        }).unwrap();

        shikshaMitraToast.success({ message: `Bank Account updated successfully` });
      } else {
        // Create new bank account
        await addBankAccount({
          academicYearId: currentYear?.id,
          body: payload,
        }).unwrap();

        shikshaMitraToast.success({ message: `Bank Account added successfully` });
      }
      onClose(null, true);
    } catch (error) {
      const problem = getAccountSettingSaveError(error, 'bank');
      setSaveError(problem.message);
      if (problem.field) {
        formik.setFieldTouched(problem.field, true, false);
        formik.setFieldError(problem.field, problem.message);
      }
    }
  };
  const handleSubmit = useCallback(() => {
    formik.submitForm();
  }, [formik]);

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        {saveError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {saveError}
          </Alert>
        )}
        <Stack spacing={2}>
          {/* Section: Bank Details */}
          <FormSectionCard
            descriptionTooltip="Identify the bank and branch that hold this account."
            icon={GlobalIcons.bankAccount}
            title="Bank details"
          >
            <Grid container spacing={1.5}>
              {/* Bank Name */}
              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={formik.touched.bankName && Boolean(formik.errors.bankName)}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Bank Name *"
                    name="bankName"
                    value={formik.values.bankName}
                    onChange={(event) =>
                      formik.setFieldValue(
                        event.target.name,
                        sanitizeFinanceName(event.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    error={formik.touched.bankName && Boolean(formik.errors.bankName)}
                    helperText={
                      formik.touched.bankName && formik.errors.bankName
                        ? formik.errors.bankName
                        : `${formik.values.bankName.length}/100 characters`
                    }
                    inputProps={{ maxLength: 100 }}
                  />
                </ShakingTextField>
              </Grid>
              {/* Branch Name */}
              <Grid size={12}>
                <ShakingTextField
                  error={formik.touched.branchName && Boolean(formik.errors.branchName)}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Branch Name *"
                    name="branchName"
                    value={formik.values.branchName}
                    onChange={(event) =>
                      formik.setFieldValue(
                        event.target.name,
                        sanitizeFinanceName(event.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    error={formik.touched.branchName && Boolean(formik.errors.branchName)}
                    helperText={
                      formik.touched.branchName && formik.errors.branchName
                        ? formik.errors.branchName
                        : `${formik.values.branchName.length}/100 characters`
                    }
                    inputProps={{ maxLength: 100 }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Branch Address */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="Branch Address"
                  name="branchAddress"
                  value={formik.values.branchAddress}
                  onChange={formik.handleChange}
                />
              </Grid>
            </Grid>
          </FormSectionCard>

          {/* Section: Account Details */}
          <FormSectionCard
            descriptionTooltip="Enter the account holder and account information used for Finance transactions."
            icon="solar:wallet-money-bold-duotone"
            title="Account details"
          >
            <Grid container spacing={1.5}>
              {/* Account Name */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={
                    formik.touched.accountHolderName && Boolean(formik.errors.accountHolderName)
                  }
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="Account Holder Name *"
                    name="accountHolderName"
                    value={formik.values.accountHolderName}
                    onChange={(event) =>
                      formik.setFieldValue(
                        event.target.name,
                        sanitizeFinanceName(event.target.value)
                      )
                    }
                    onBlur={formik.handleBlur}
                    error={
                      formik.touched.accountHolderName && Boolean(formik.errors.accountHolderName)
                    }
                    helperText={
                      formik.touched.accountHolderName && formik.errors.accountHolderName
                        ? formik.errors.accountHolderName
                        : `${formik.values.accountHolderName.length}/100 characters`
                    }
                    inputProps={{ maxLength: 100 }}
                  />
                </ShakingTextField>
              </Grid>

              {/* Account Type */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={formik.touched.accountType && Boolean(formik.errors.accountType)}
                >
                  <CustomSelect
                    label="Account Type *"
                    options={[
                      { value: BankAccountType.Saving, label: 'Saving' },
                      { value: BankAccountType.Current, label: 'Current' },
                    ]}
                    value={formik.values.accountType}
                    onChange={(val) => formik.setFieldValue('accountType', val)}
                    formControlProps={{ fullWidth: true, size: 'small' }}
                    error={formik.touched.accountType && Boolean(formik.errors.accountType)}
                    helperText={
                      ((formik.touched.accountType && formik.errors.accountType) as string) ||
                      undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              {/* Account Number */}
              <Grid size={12}>
                <ShakingTextField
                  error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
                >
                  <TextField
                    size="small"
                    fullWidth
                    label="Account Number *"
                    name="accountNumber"
                    type="text"
                    value={formik.values.accountNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 18) {
                        formik.setFieldValue('accountNumber', value);
                      }
                    }}
                    onBlur={(e) => {
                      formik.setFieldValue('accountNumber', e.target.value.trim());
                      formik.handleBlur(e);
                    }}
                    inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', maxLength: 18 }}
                    error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
                    helperText={
                      (formik.touched.accountNumber && formik.errors.accountNumber) || undefined
                    }
                  />
                </ShakingTextField>
              </Grid>

              {/* Account Purpose */}
              <Grid size={{ xs: 12 }}>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={3}
                  label="Account Purpose"
                  name="purpose"
                  value={formik.values.purpose}
                  onChange={formik.handleChange}
                  inputProps={{ maxLength: 500 }}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.purpose && formik.errors.purpose)}
                  helperText={
                    formik.touched.purpose && formik.errors.purpose
                      ? formik.errors.purpose
                      : `${formik.values.purpose?.length ?? 0}/500`
                  }
                  FormHelperTextProps={{ sx: { textAlign: 'right', mr: 0 } }}
                />
              </Grid>
            </Grid>
          </FormSectionCard>

          {/* Section: Payment Info */}
          <FormSectionCard
            descriptionTooltip="Add the routing codes used to identify this bank account for payments."
            icon="solar:card-bold-duotone"
            title="Payment information"
          >
            <Grid container spacing={1.5}>
              {/* IFSC Code */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField
                  error={formik.touched.ifscCode && Boolean(formik.errors.ifscCode)}
                >
                  <TextField
                    fullWidth
                    size="small"
                    label="IFSC Code *"
                    name="ifscCode"
                    value={formik.values.ifscCode}
                    onChange={(e) => {
                      const value = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, '')
                        .slice(0, 11);
                      formik.setFieldValue('ifscCode', value);
                    }}
                    error={formik.touched.ifscCode && Boolean(formik.errors.ifscCode)}
                    helperText={(formik.touched.ifscCode && formik.errors.ifscCode) || undefined}
                  />
                </ShakingTextField>
              </Grid>

              {/* UPI ID */}
              <Grid size={{ xs: 12, sm: 6 }}>
                <ShakingTextField error={formik.touched.upiId && Boolean(formik.errors.upiId)}>
                  <TextField
                    fullWidth
                    size="small"
                    label="UPI ID"
                    name="upiId"
                    value={formik.values.upiId}
                    onChange={(e) => {
                      const value = e.target.value
                        .toLowerCase()
                        .replace(/[^a-z0-9@._-]/g, '')
                        .slice(0, 50);
                      formik.setFieldValue('upiId', value);
                    }}
                    error={formik.touched.upiId && Boolean(formik.errors.upiId)}
                    helperText={(formik.touched.upiId && formik.errors.upiId) || undefined}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </FormSectionCard>
        </Stack>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
          disabled={isAddLoading || isUpdateLoading}
          variant="outlined"
          size="small"
        >
          Cancel
        </Button>
        <LoadingButton
          startIcon={
            <Iconify
              icon={editData ? GlobalIcons.edit : GlobalIcons.submit}
              width={editData ? 16 : 20}
              height={editData ? 16 : 20}
            />
          }
          type="button"
          variant="contained"
          size="small"
          loading={isAddLoading || isUpdateLoading}
          disabled={isAddLoading || isUpdateLoading}
          onClick={handleSubmit}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>

      {/* Downstream Usage Warning Dialog */}
      <DownstreamUsageWarning
        open={showDownstreamWarning}
        itemName={editData?.bankName || ''}
        itemType="Bank Account"
        isLoading={isAddLoading || isUpdateLoading}
        onConfirm={async () => {
          if (pendingFormValues) {
            await performSubmission(pendingFormValues);
            setShowDownstreamWarning(false);
            setPendingFormValues(null);
          }
        }}
        onCancel={() => {
          setShowDownstreamWarning(false);
          setPendingFormValues(null);
        }}
      />
    </BackPopUpChecked>
  );
};

export default BankAccountForm;
