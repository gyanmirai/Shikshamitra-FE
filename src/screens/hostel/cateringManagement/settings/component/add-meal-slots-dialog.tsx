import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { Grid, TextField, DialogActions } from '@mui/material';

import { Scrollbar } from 'src/components/scrollbar';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

import { getMealSlotInitialValues } from '../initialValue';
import { mealSlotValidationSchema } from '../validationSchema';

import type { IAddMealSlotForm, IAddMealSlotsDialogProps } from '../meal-slots-interfcae';

const AddMealSlotsDialog: React.FC<IAddMealSlotsDialogProps> = ({ data, isEdit, onClose }) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IAddMealSlotForm>(() => getMealSlotInitialValues(data), [data]);

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IAddMealSlotForm>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: mealSlotValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });

  const isDisable = isEdit === false && data !== null;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} pb="10px">
              <ShakingTextField
                error={formik.touched.mealSlotsName && Boolean(formik.errors.mealSlotsName)}
              >
                <TextField
                  name="mealSlotsName"
                  label="Name"
                  value={formik.values.mealSlotsName}
                  placeholder="Enter Meal Slot Name"
                  autoFocus
                  disabled={isDisable}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.mealSlotsName && Boolean(formik.errors.mealSlotsName)}
                  helperText={formik.touched.mealSlotsName && formik.errors.mealSlotsName}
                />
              </ShakingTextField>
            </Grid>

            <Grid item xs={12} pb="10px">
              <ShakingTextField
                error={formik.touched.description && Boolean(formik.errors.description)}
              >
                <TextField
                  multiline
                  rows={4}
                  disabled={isDisable}
                  name="description"
                  label="Description"
                  value={formik.values.description}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.description && Boolean(formik.errors.description)}
                  helperText={formik.touched.description && formik.errors.description}
                />
              </ShakingTextField>
            </Grid>
          </Grid>
        </Scrollbar>
        <DialogActions>
          <CancelButton onClick={onClose} />
          <SubmitButton onClick={() => {}} />
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};

export default AddMealSlotsDialog;
