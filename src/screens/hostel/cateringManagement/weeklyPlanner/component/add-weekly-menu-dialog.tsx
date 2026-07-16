'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import { Box, Grid, Button, DialogActions } from '@mui/material';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getMealInitialValues } from '../initialValue';
import { mealValidationSchema } from '../validationSchema';

import type { IAddWeeklyMenuDialogProps } from '../weekly-planner-interface';

const days = [
  { value: 'Mon', label: 'Monday' },
  { value: 'Tue', label: 'Tuesday' },
  { value: 'Wed', label: 'Wednesday' },
  { value: 'Thu', label: 'Thursday' },
  { value: 'Fri', label: 'Friday' },
  { value: 'Sat', label: 'Saturday' },
  { value: 'Sun', label: 'Sunday' },
];

const mealTypes = [
  { label: 'BreakFast', value: 'Breakfast' },
  { label: 'Lunch', value: 'Lunch' },
  { label: 'Snacks', value: 'Snacks' },
  { label: 'Dinner', value: 'Dinner' },
];

const AddWeeklyMenuDialog: React.FC<IAddWeeklyMenuDialogProps> = ({ data, isEdit, onClose }) => {
  const formik = useFormik({
    initialValues: getMealInitialValues(data),
    validationSchema: mealValidationSchema,
    onSubmit: (values, formikHelpers) => {},
  });

  // const isDisabled = data !== null && isEdit === true;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.mealType && formik.errors.mealType) || false}
                >
                  <CustomSelect
                    label="Meal Type *"
                    options={mealTypes}
                    value={formik.values.mealType}
                    onChange={(val) => formik.setFieldValue('mealType', val)}
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                    error={formik.touched.mealType && Boolean(formik.errors.mealType)}
                    helperText={(formik.touched.mealType && formik.errors.mealType) || undefined}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.mealDay && formik.errors.mealDay) || false}
                >
                  <CustomSelect
                    label="Select Day *"
                    options={days}
                    value={formik.values.mealDay}
                    onChange={(val) => formik.setFieldValue('mealDay', val)}
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                    error={formik.touched.mealDay && Boolean(formik.errors.mealDay)}
                    helperText={(formik.touched.mealDay && formik.errors.mealDay) || undefined}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <ShakingTextField
                  error={
                    !!(formik.touched.mealDescription && formik.errors.mealDescription) || false
                  }
                >
                  <Editor
                    value={formik.values.mealDescription}
                    onChange={(value) => formik.setFieldValue('mealDescription', value)}
                    placeholder="Description *"
                    sx={{ width: '100%', marginTop: '10px' }}
                    error={formik.touched.mealDescription && Boolean(formik.errors.mealDescription)}
                    helperText={formik.touched.mealDescription && formik.errors.mealDescription}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={onClose}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              startIcon={<Iconify icon={GlobalIcons.submit} />}
              type="submit"
              variant="contained"
            >
              {isEdit ? 'Update' : 'Submit'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default AddWeeklyMenuDialog;
