'use client';

import { useFormik } from 'formik';
import React, { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import ShakingTextField from 'src/components/shaking-text-field';
import { DialogScrollContent } from 'src/components/customDialog';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import {
  useAddBankAccountMutation,
  useUpdateBankAccountMutation,
} from 'src/redux/finance/BankAccountManage/bankAccountApi';

import { getBankAccountInitialValues } from './bankInitialValues';
import { bankAccountValidationSchema } from './BankValidationSchema';

import type { IBankAccountFormProps } from './type';

const BankAccountForm: React.FC<IBankAccountFormProps> = ({ open, onClose, editData }) => {
  const [isLoading, setIsLoading] = useState(false);

  // POST mutation for creating
  const { addBankAccount } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddBankAccountMutation,
  });

  // PUT mutation for updating
  const { updateBankAccount } = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateBankAccountMutation,
  });

  const formik = useFormik({
    initialValues: getBankAccountInitialValues(editData),
    validationSchema: bankAccountValidationSchema,
    onSubmit: async (values) => {
      try {
        setIsLoading(true);

        // Transform form data to API format
        const payload = {
          bankName: values.bankName,
          branchName: values.branchName,
          branchAddress: values.branchAddress || '',
          accountHolderName: values.accountName,
          accountType: values.accountType,
          accountNumber: values.accountNumber,
          purpose: values.accountPurpose || '',
          ifscCode: values.ifscCode,
          upiId: values.upiId || '',
          isActive: true,
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
          await addBankAccount(payload).unwrap();

          shikshaMitraToast.success({ message: `Bank Account added successfully` });
        }
        onClose(null, true);
      } catch (error) {
        console.error('Save operation failed:', error);
        shikshaMitraToast.error({
          message: `Failed to ${editData ? 'update' : 'create'} bank account`,
        });
      } finally {
        setIsLoading(false);
      }
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <DialogScrollContent>
        <Grid container spacing={3}>
          {/* Bank Name */}
          <Grid size={{ xs: 12 }}>
            <ShakingTextField error={formik.touched.bankName && Boolean(formik.errors.bankName)}>
              <TextField
                fullWidth
                size="small"
                label="Bank Name *"
                name="bankName"
                value={formik.values.bankName}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '') // Allow only letters and spaces
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .trimStart(); // Remove leading spaces
                  formik.setFieldValue('bankName', value);
                }}
                error={formik.touched.bankName && Boolean(formik.errors.bankName)}
                helperText={formik.touched.bankName && formik.errors.bankName}
              />
            </ShakingTextField>
          </Grid>

          {/* Branch Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={formik.touched.branchName && Boolean(formik.errors.branchName)}
            >
              <TextField
                fullWidth
                size="small"
                label="Branch Name *"
                name="branchName"
                value={formik.values.branchName}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z0-9\s]/g, '') // Allow letters, numbers, and spaces
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .trimStart(); // Remove leading spaces
                  formik.setFieldValue('branchName', value);
                }}
                error={formik.touched.branchName && Boolean(formik.errors.branchName)}
                helperText={formik.touched.branchName && formik.errors.branchName}
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

          {/* Account Name */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={formik.touched.accountName && Boolean(formik.errors.accountName)}
            >
              <TextField
                fullWidth
                size="small"
                label="Account Holder Name *"
                name="accountName"
                value={formik.values.accountName}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z\s]/g, '') // Allow only letters and spaces
                    .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                    .trimStart(); // Remove leading spaces
                  formik.setFieldValue('accountName', value);
                }}
                error={formik.touched.accountName && Boolean(formik.errors.accountName)}
                helperText={formik.touched.accountName && formik.errors.accountName}
              />
            </ShakingTextField>
          </Grid>

          {/* Account Type */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={formik.touched.accountType && Boolean(formik.errors.accountType)}
            >
              <CustomSelect
                label="Account Type *"
                options={[
                  { value: 'Savings', label: 'Savings' },
                  { value: 'Current', label: 'Current' },
                  { value: 'Salary', label: 'Salary' },
                  { value: 'Other', label: 'Other' },
                ]}
                value={formik.values.accountType}
                onChange={(val) => formik.setFieldValue('accountType', val)}
                formControlProps={{ fullWidth: true, size: 'small' }}
                error={formik.touched.accountType && Boolean(formik.errors.accountType)}
                helperText={(formik.touched.accountType && formik.errors.accountType) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Account Number */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField
              error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Account Number *"
                name="accountNumber"
                value={formik.values.accountNumber}
                onChange={formik.handleChange}
                error={formik.touched.accountNumber && Boolean(formik.errors.accountNumber)}
                helperText={formik.touched.accountNumber && formik.errors.accountNumber}
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
              name="accountPurpose"
              value={formik.values.accountPurpose}
              onChange={formik.handleChange}
            />
          </Grid>

          {/* IFSC Code */}
          <Grid size={{ xs: 12, md: 6 }}>
            <ShakingTextField error={formik.touched.ifscCode && Boolean(formik.errors.ifscCode)}>
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
                helperText={formik.touched.ifscCode && formik.errors.ifscCode}
              />
            </ShakingTextField>
          </Grid>

          {/* UPI ID */}
          <Grid size={{ xs: 12, md: 6 }}>
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
            />
          </Grid>
        </Grid>
      </DialogScrollContent>

      <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
        <Button
          startIcon={<Iconify icon={GlobalIcons.cancel} />}
          onClick={() => onClose(null, false)}
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
          type="submit"
          variant="contained"
          size="small"
          loading={isLoading}
          disabled={isLoading}
          onClick={(e: any) => formik.handleSubmit(e)}
        >
          {editData ? 'Update' : 'Submit'}
        </LoadingButton>
      </DialogActions>
    </BackPopUpChecked>
  );
};

export default BankAccountForm;
