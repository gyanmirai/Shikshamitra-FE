import type { RootState } from 'src/redux/store';

import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useSelector, useDispatch } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { Box, Card, Grid, Button, TextField } from '@mui/material';

import capitalizeWords from 'src/utils/capitalizeText';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

interface FinanceTaxSettingDialogProps {
  dialogValue: boolean;
  data: any;
  onSave: (values: any) => void;
  onClose: () => void;
  isEdit: boolean;
  allData: any;
}

interface FormikValue {
  taxName: string;
  taxPercentage: string;
  applicableRegion: string[];
  applicableCategory: string[];
  id: number;
}

const FinanceTaxSettingDialog: React.FC<FinanceTaxSettingDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
}) => {
  // State to track and display message when a tax entry already exists
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  // Get isChanges state from Redux store to track form modifications
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

  // Initialize form values based on whether we're editing existing tax or creating new
  const initialValues = useMemo<FormikValue>(
    () => ({
      taxName: isEdit ? (data.taxName ?? '') : '',
      taxPercentage: isEdit ? (data.taxPercentage ?? '') : '',
      applicableRegion: isEdit ? (data.applicableRegion ?? []) : [],
      applicableCategory: isEdit ? (data.applicableCategory ?? []) : [],
      id: isEdit ? data.id : Math.floor(Math.random() * 10000),
    }),
    [data, isEdit]
  );

  // Setup Formik form handling with validation and submission logic
  const formik = useFormik<FormikValue>({
    initialValues,
    onSubmit: (values) => {
      // Normalize tax names for case-insensitive comparison
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      // Check if tax name already exists in the data
      const existingEntryIndex = allData.findIndex(
        (val: any) => normalize(val.taxName) === normalize(values.taxName)
      );

      // Handle form submission based on edit mode
      if (!isEdit) {
        if (existingEntryIndex === -1) {
          // If tax name doesn't exist, proceed with save
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          // Show error message if tax name already exists
          setShowExistingEntryMessage(true);
          return;
        }
      } else {
        // In edit mode, directly save the changes
        onSave(values);
      }

      console.log('Form Submitted type', values);
    },
    enableReinitialize: true,
  });

  // Track form changes and update Redux store
  useEffect(() => {
    const isChanged = !isEqual(formik.values, initialValues);
    dispatch(setIsChanges(isChanged));
  }, [dispatch, formik.values, initialValues]);

  // Handle dialog close with unsaved changes confirmation
  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };
  return (
    <Box display="flex" flexDirection="column" gap={2} height="100%">
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Tax Settings"
          links={[
            { name: 'Finance', href: '/finance/dashboard' },
            { name: 'Settings' },
            { name: 'Tax Settings' },
          ]}
          sx={{ px: 1, mb: 2 }}
        />
        <Box sx={{ mr: '15px', mb: '20px' }} gap={3} display="flex" justifyContent="flex-end">
          <Button
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
            onClick={handleCloseDialog}
            variant="contained"
            size="small"
          >
            Back
          </Button>
        </Box>
      </Box>

      <form
        onSubmit={formik.handleSubmit}
        style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Card
          sx={{
            boxShadow: 'var(--shadows-4)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <Box display="flex" flexDirection="column" gap={2} p={2} flexGrow={1}>
            <Box flexGrow={1} p={2}>
              <Grid container spacing={3} pt="10px">
                <Grid item xl={6}>
                  <ShakingTextField
                    error={formik.touched.taxName && Boolean(formik.errors.taxName)}
                  >
                    <TextField
                      disabled={isEdit}
                      name="taxName"
                      label="Tax Name"
                      autoFocus
                      fullWidth
                      value={formik.values.taxName}
                      onChange={(e) => {
                        formik.setFieldValue('taxName', capitalizeWords(e.target.value));
                      }}
                      size="small"
                      error={formik.touched.taxName && Boolean(formik.errors.taxName)}
                      helperText={formik.touched.taxName && formik.errors.taxName}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xl={6}>
                  <ShakingTextField
                    error={formik.touched.taxPercentage && Boolean(formik.errors.taxPercentage)}
                  >
                    <TextField
                      disabled={isEdit}
                      name="taxPercentage"
                      label="Tax Percentage"
                      fullWidth
                      value={formik.values.taxPercentage}
                      onChange={formik.handleChange}
                      size="small"
                      error={formik.touched.taxPercentage && Boolean(formik.errors.taxPercentage)}
                      helperText={formik.touched.taxPercentage && formik.errors.taxPercentage}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xl={6}>
                  <ShakingTextField
                    error={
                      formik.touched.applicableRegion && Boolean(formik.errors.applicableRegion)
                    }
                  >
                    <CustomSelect
                      multiple
                      label="Applicable Region"
                      options={[
                        { value: 'India', label: 'India' },
                        { value: 'Nepal', label: 'Nepal' },
                        { value: 'Bhutan', label: 'Bhutan' },
                        { value: 'Usa', label: 'Usa' },
                      ]}
                      // @ts-ignore
                      value={formik.values.applicableRegion}
                      onChange={(selectedValues) =>
                        formik.setFieldValue('applicableRegion', selectedValues)
                      }
                      formControlProps={{ sx: { minWidth: 195, width: '100%' } }}
                      error={
                        formik.touched.applicableRegion && Boolean(formik.errors.applicableRegion)
                      }
                      // @ts-ignore
                      helperText={formik.touched.applicableRegion && formik.errors.applicableRegion}
                    />
                  </ShakingTextField>
                </Grid>
                <Grid item xl={6}>
                  <ShakingTextField
                    error={
                      formik.touched.applicableCategory && Boolean(formik.errors.applicableCategory)
                    }
                  >
                    <CustomSelect
                      multiple
                      label="Applicable Categories"
                      options={[
                        { value: 'Sports Fee', label: 'Sport Fee' },
                        { value: 'Tuition Fee', label: 'Tuition Fee' },
                      ]}
                      // @ts-ignore
                      value={formik.values.applicableCategory}
                      onChange={(e) => formik.setFieldValue('applicableCategory', e)}
                      formControlProps={{ sx: { minWidth: 195, width: '100%' } }}
                      error={
                        formik.touched.applicableCategory &&
                        Boolean(formik.errors.applicableCategory)
                      }
                      // @ts-ignore
                      helperText={
                        formik.touched.applicableCategory && formik.errors.applicableCategory
                      }
                    />
                  </ShakingTextField>
                </Grid>
              </Grid>
            </Box>
          </Box>
          <Box display="flex" justifyContent="flex-end" p={2}>
            <Button size="small" type="submit" variant="contained">
              Save
            </Button>
          </Box>
        </Card>
      </form>
    </Box>
  );
};
export default FinanceTaxSettingDialog;
