import * as Yup from 'yup';
import { useFormik } from 'formik';
import React, { useState } from 'react';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Button, TextField, Typography, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetUploadDialogQuery } from 'src/redux/finance/reconciliation';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { shikshaMitraToast } from 'src/components/toast';
import CustomTooltip from 'src/components/custom-tooltip';
import ShakingTextField from 'src/components/shaking-text-field';
import FileUploader1 from 'src/components/custom-upload/custom-upload';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

interface BankStatementUploadDialogProps {
  open: boolean;
  onClose: () => void;
}

const BankStatementUploadDialog = ({ open, onClose }: BankStatementUploadDialogProps) => {
  const [isUploading, setIsUploading] = useState(false);

  // isLoadingDialogData: Boolean indicating if data is being fetched
  const { data: uploadDialogData, isLoading: isLoadingDialogData } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetUploadDialogQuery,
    options: { skip: !open },
  });

  const statementNameOptions = uploadDialogData?.statementNameOptions || [];
  const bankOptions = uploadDialogData?.bankOptions || [];
  const statementPeriodOptions = uploadDialogData?.statementPeriodOptions || [];

  // Form validation schema using Yup
  const validationSchema = Yup.object().shape({
    statementName: Yup.string().required('Statement Name is required'),
    selectedBank: Yup.string().required('Bank selection is required'),
    statementPeriod: Yup.string().required('Statement Period is required'),
    description: Yup.string(),
  });

  // Initialize formik form with initial values and submit handler
  const formik = useFormik({
    initialValues: {
      statementName: '',
      selectedBank: '',
      statementPeriod: '',
      description: '',
      files: [],
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        setIsUploading(true);
        shikshaMitraToast.success({
          message: 'Bank Statement uploaded and processed successfully',
        });

        // Close dialog after successful upload
        handleClose();
      } catch (error) {
        console.error('Upload failed:', error);
        shikshaMitraToast.error({
          message: 'Failed to upload bank statement',
        });
      } finally {
        setIsUploading(false);
      }
    },
  });

  // Handle dialog cancellation and form reset
  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <CustomDialog
      open={open}
      handleClose={handleClose}
      title={
        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <Typography variant="h6">Bank Statement Upload</Typography>
          <CustomTooltip
            arrow
            placement="right"
            sx={{ textAlign: 'justify' }}
            title="Upload your bank statement to begin reconciliation. Provide statement details and attach the file for processing."
          >
            <Iconify icon="lucide:info" sx={{ cursor: 'pointer' }} color="info.main" />
          </CustomTooltip>
        </Box>
      }
      maxWidth="sm"
      fullWidth
      paperProps={{
        sx: {
          width: '580px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      <Box>
        <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
          <DialogScrollContent>
            <Stack spacing={3} p={0}>
              {/* Statement Name Dropdown */}
              <ShakingTextField
                error={!!(formik.touched.statementName && formik.errors.statementName) || false}
              >
                <CustomSelect
                  size="small"
                  value={formik.values.statementName}
                  name="statementName"
                  fullWidth
                  label="Statement Name *"
                  autoFocus
                  onChange={(value) => formik.setFieldValue('statementName', value)}
                  error={formik.touched.statementName && Boolean(formik.errors.statementName)}
                  helperText={
                    formik.touched.statementName ? formik.errors.statementName : undefined
                  }
                  options={statementNameOptions}
                  placeholder="Statement Name *"
                  disabled={isLoadingDialogData}
                />
              </ShakingTextField>

              {/* Bank Selection Dropdown */}
              <ShakingTextField
                error={!!(formik.touched.selectedBank && formik.errors.selectedBank) || false}
              >
                <CustomSelect
                  size="small"
                  value={formik.values.selectedBank}
                  name="selectedBank"
                  fullWidth
                  label="Select Bank *"
                  onChange={(value) => formik.setFieldValue('selectedBank', value)}
                  error={formik.touched.selectedBank && Boolean(formik.errors.selectedBank)}
                  helperText={formik.touched.selectedBank ? formik.errors.selectedBank : undefined}
                  options={bankOptions}
                  disabled={isLoadingDialogData}
                />
              </ShakingTextField>

              {/* Statement Period Dropdown */}
              <ShakingTextField
                error={!!(formik.touched.statementPeriod && formik.errors.statementPeriod) || false}
              >
                <CustomSelect
                  size="small"
                  value={formik.values.statementPeriod}
                  name="statementPeriod"
                  fullWidth
                  label="Select Statement Period *"
                  onChange={(value) => formik.setFieldValue('statementPeriod', value)}
                  error={formik.touched.statementPeriod && Boolean(formik.errors.statementPeriod)}
                  helperText={
                    formik.touched.statementPeriod ? formik.errors.statementPeriod : undefined
                  }
                  options={statementPeriodOptions}
                  disabled={isLoadingDialogData}
                />
              </ShakingTextField>

              {/* Description Text Field */}
              <TextField
                multiline
                rows={4}
                size="small"
                value={formik.values.description || ''}
                name="description"
                fullWidth
                label="Description"
                onChange={formik.handleChange}
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
              />

              {/* File Upload Section */}
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 2, fontWeight: 600, color: 'text.primary', fontSize: '16px' }}
                >
                  Upload Statement File
                </Typography>
                <FileUploader1
                  multiple
                  previewCount={3}
                  onChange={(files) => formik.setFieldValue('files', files)}
                  value={formik.values.files}
                  label="Upload Statement File"
                  outputFormat="base64"
                />
              </Box>
            </Stack>
          </DialogScrollContent>
        </BackPopUpChecked>

        {/* Dialog action buttons */}
        <DialogActions sx={{ p: 2, boxShadow: 'var(--shadows-10)' }}>
          <Button
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            size="small"
            variant="outlined"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <LoadingButton
            size="small"
            type="submit"
            variant="contained"
            loading={isUploading}
            startIcon={<Iconify icon="uis:process" width={18} />}
            onClick={(e: any) => {
              formik.handleSubmit(e);
            }}
          >
            Process Statement
          </LoadingButton>
        </DialogActions>
      </Box>
    </CustomDialog>
  );
};

export default BankStatementUploadDialog;
