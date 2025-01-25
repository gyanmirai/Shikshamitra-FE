import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import isEqual from 'lodash/isEqual';
import { useSelector, useDispatch } from 'react-redux';
import React, { useMemo, useState, useEffect } from 'react';

import { Box, Button, TextField, Typography, DialogActions } from '@mui/material';

import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
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

const validationSchema = Yup.object({
  taxName: Yup.string().required("Tax Name can't be empty"),
  taxPercentage: Yup.string().required("Tax Percentage can't be empty"),
  applicableRegion: Yup.array().min(1, 'Please select at least one region').required(),
  applicableCategory: Yup.array().min(1, 'Please select at least one category').required(),
});

const FinanceTaxSettingDialog: React.FC<FinanceTaxSettingDialogProps> = ({
  dialogValue,
  data,
  onSave,
  onClose,
  isEdit,
  allData,
}) => {
  const [showExistingEntryMessage, setShowExistingEntryMessage] = useState(false);

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);

  const dispatch = useDispatch();

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

  const formik = useFormik<FormikValue>({
    initialValues,
    onSubmit: (values) => {
      const normalize = (str: string) => str.toLowerCase().replace(/\s+/g, '').trim();

      const existingEntryIndex = allData.findIndex(
        (val: any) => normalize(val.taxName) === normalize(values.taxName)
      );
      if (!isEdit) {
        if (existingEntryIndex === -1) {
          setShowExistingEntryMessage(false);
          onSave(values);
        } else {
          setShowExistingEntryMessage(true);
          return;
        }
      } else {
        onSave(values);
      }

      console.log('Form Submitted type', values);
    },
    enableReinitialize: true,
  });

  useEffect(() => {
    const isChanged = !isEqual(formik.values, initialValues);
    dispatch(setIsChanges(isChanged));
  }, [dispatch, formik.values, initialValues]);

  const handleCloseDialog = () => {
    if (isChanges && window.confirm('Are you sure you want to leave this page?')) {
      onClose();
      dispatch(setIsChanges(false));
    } else if (!isChanges) {
      onClose();
    }
  };
  return (
    <>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <CustomBreadcrumbs
          heading="Tax Settings"
          links={[{ name: 'Finance' }, { name: 'Settings' }, { name: 'Tax Settings' }]}
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

      <Box px="15px">
        {showExistingEntryMessage ? (
          <Typography component="span" variant="h6">
            This Tax System Already Exists
          </Typography>
        ) : (
          <Box height="25px" />
        )}
      </Box>

      <Box px="15px">
        <form onSubmit={formik.handleSubmit}>
          <Box pt="10px" display="flex" flexDirection="column" gap={3}>
            <TextField
              disabled={isEdit}
              name="taxName"
              label="Tax Name"
              value={formik.values.taxName}
              onChange={formik.handleChange}
              size="small"
              error={formik.touched.taxName && Boolean(formik.errors.taxName)}
              helperText={formik.touched.taxName && formik.errors.taxName}
            />
            <TextField
              disabled={isEdit}
              name="taxPercentage"
              label="Tax Percentage"
              value={formik.values.taxPercentage}
              onChange={formik.handleChange}
              size="small"
              error={formik.touched.taxPercentage && Boolean(formik.errors.taxPercentage)}
              helperText={formik.touched.taxPercentage && formik.errors.taxPercentage}
            />
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
              formControlProps={{ sx: { minWidth: 195 } }}
              error={formik.touched.applicableRegion && Boolean(formik.errors.applicableRegion)}
              // @ts-ignore
              helperText={formik.touched.applicableRegion && formik.errors.applicableRegion}
            />
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
              formControlProps={{ sx: { minWidth: 195 } }}
              error={formik.touched.applicableCategory && Boolean(formik.errors.applicableCategory)}
              // @ts-ignore
              helperText={formik.touched.applicableCategory && formik.errors.applicableCategory}
            />
          </Box>
          <DialogActions>
            <Button type="submit" variant="outlined" size="small">
              Save
            </Button>
          </DialogActions>
        </form>
      </Box>
    </>
  );
};

export default FinanceTaxSettingDialog;
