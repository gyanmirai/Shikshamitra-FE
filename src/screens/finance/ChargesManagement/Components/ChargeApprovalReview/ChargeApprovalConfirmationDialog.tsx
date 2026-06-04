'use client';

import React from 'react';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Alert, Button, TextField, Typography } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import type { IChargeApprovalConfirmationDialogProps } from './types';

/**
 * ChargeApprovalConfirmationDialog Component
 * Displays final confirmation before approving or rejecting a charge
 */
const ChargeApprovalConfirmationDialog: React.FC<IChargeApprovalConfirmationDialogProps> = ({
  open,
  mode,
  chargeId,
  chargeName,
  totalStudents,
  selectedStudents,
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  const isRejectMode = mode === 'reject';

  const formik = useFormik({
    initialValues: {
      notes: '',
    },
    validationSchema: Yup.object().shape({
      notes: isRejectMode
        ? Yup.string().required('Reason for rejection is required')
        : Yup.string(),
    }),
    onSubmit: async (values) => {
      try {
        await onConfirm(values.notes);
      } catch (error) {
        console.error('Error in confirmation:', error);
      }
    },
  });

  return (
    <CustomDialog
      open={open}
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Iconify
            icon={isRejectMode ? 'carbon:close-filled' : 'carbon:checkmark-filled'}
            sx={{
              fontSize: 24,
              color: isRejectMode ? 'error.main' : 'success.main',
            }}
          />
          <Typography variant="h5">{isRejectMode ? 'Reject Charge' : 'Approve Charge'}</Typography>
        </Box>
      }
      handleClose={onCancel}
      maxWidth="sm"
    >
      <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
        <Box sx={{ p: 2 }}>
          {/* Confirmation Message */}
          <Alert
            severity={isRejectMode ? 'error' : 'success'}
            sx={{ mb: 2 }}
            icon={
              <Iconify
                icon={isRejectMode ? 'solar:info-circle-bold' : 'solar:info-circle-bold'}
                sx={{ fontSize: 20 }}
              />
            }
          >
            <Typography variant="body2">
              {isRejectMode
                ? `You are about to reject the charge "${chargeName}" for ${selectedStudents} student${selectedStudents !== 1 ? 's' : ''}.`
                : `You are about to approve the charge "${chargeName}" for ${selectedStudents} student${selectedStudents !== 1 ? 's' : ''}.`}
            </Typography>
          </Alert>

          {/* Student Count Info */}
          <Box
            sx={{
              p: 2,
              backgroundColor: 'action.hover',
              borderRadius: 1,
              mb: 2,
            }}
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Total Students
                  </Typography>
                  <Typography variant="h6" fontWeight={700}>
                    {totalStudents}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Selected for {isRejectMode ? 'Rejection' : 'Approval'}
                  </Typography>
                  <Typography
                    variant="h6"
                    fontWeight={700}
                    color={isRejectMode ? 'error.main' : 'success.main'}
                  >
                    {selectedStudents}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>

          {/* Notes/Reason Field */}
          <Grid container spacing={2}>
            <Grid size={12}>
              <ShakingTextField error={!!(formik.touched.notes && formik.errors.notes)}>
                <TextField
                  fullWidth
                  label={isRejectMode ? 'Reason for Rejection *' : 'Approval Notes'}
                  name="notes"
                  size="small"
                  multiline
                  rows={3}
                  placeholder={
                    isRejectMode
                      ? 'Please provide the reason for rejection...'
                      : 'Add any approval notes (optional)'
                  }
                  value={formik.values.notes}
                  onChange={(e) => {
                    formik.setFieldValue('notes', e.target.value);
                    formik.setFieldTouched('notes', true);
                  }}
                  error={formik.touched.notes && Boolean(formik.errors.notes)}
                  helperText={formik.touched.notes && formik.errors.notes}
                />
              </ShakingTextField>
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            display="flex"
            alignItems="center"
            justifyContent="flex-end"
            gap={1.5}
            sx={{ mt: 3 }}
          >
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              onClick={onCancel}
              disabled={isLoading}
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
            >
              Cancel
            </Button>
            <LoadingButton
              type="submit"
              variant="contained"
              color={isRejectMode ? 'error' : 'success'}
              size="small"
              loading={isLoading}
              startIcon={
                <Iconify icon={isRejectMode ? 'carbon:close-filled' : 'carbon:checkmark-filled'} />
              }
              onClick={(e: any) => {
                formik.handleSubmit(e);
              }}
            >
              {isRejectMode ? 'Reject Charge' : 'Approve Charge'}
            </LoadingButton>
          </Box>
        </Box>
      </BackPopUpChecked>
    </CustomDialog>
  );
};

export default ChargeApprovalConfirmationDialog;
