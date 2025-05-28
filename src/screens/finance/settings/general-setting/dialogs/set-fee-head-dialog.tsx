import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useAddfeeHeadMutation, useUpdatefeeHeadMutation } from 'src/redux/feeHead/feeHeadApi';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialSetFeeHeadValues } from './initialValues';
import { setFeeHeadValidationSchema } from './validationSchema';

import type {
  ISetFeeHeadDialogProps,
  IFinanceFeeSetHeadInterface,
} from './finance-general-settings-interface';

const SetFeeHeadDialog: React.FC<ISetFeeHeadDialogProps> = ({
  isEditMode,
  data,
  onClose,
  onSave,
}) => {
  // Get initial form values from data prop or default values
  const initialValues = getInitialSetFeeHeadValues(data);

  // Initialize form handling with Formik
  const {
    values,
    errors,
    touched,
    handleSubmit,
    handleChange,
    handleBlur,
    isSubmitting,
    setSubmitting,
  } = useFormik<IFinanceFeeSetHeadInterface>({
    initialValues,
    validationSchema: setFeeHeadValidationSchema,
    onSubmit: async (formValues) => {
      try {
        // If editing existing fee head, update it. Otherwise create new one
        if (isEditMode && data?.feeHeadCode) {
          await updateFeeHead({
            id: data.feeHeadCode,
            body: formValues,
          }).unwrap();
        } else {
          await addFeeHead(formValues).unwrap();
        }
        onSave(formValues); // Notify parent to refresh list and close dialog
      } catch (error) {
        console.error('Submission failed:', error);
      } finally {
        setSubmitting(false);
      }
    },
  });

  // Setup mutation for adding new fee head with success popup
  const [addFeeHead] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useAddfeeHeadMutation,
    popupConfig: {
      success: true,
      successMessage: 'Fee-Head added successfully',
    },
  });

  // Setup mutation for updating existing fee head with success popup
  const [updateFeeHead] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatefeeHeadMutation,
    popupConfig: {
      success: true,
      successMessage: 'Fee-Head updated successfully',
    },
  });

  // Check if fee head name field has been touched and has errors
  const isFeeHeadNameError = touched.feeHeadName && Boolean(errors.feeHeadName);

  // Check if fee head code field has been touched and has errors
  const isFeeHeadCodeError = touched.feeHeadCode && Boolean(errors.feeHeadCode);

  return (
    <form onSubmit={handleSubmit}>
      <Scrollbar
        sx={{
          p: 2,
          bgcolor: 'background.neutral',
          height: '100%',
        }}
      >
        <Grid container spacing={2}>
          <Grid item xs={12} pb="10px">
            <ShakingTextField error={isFeeHeadNameError}>
              <TextField
                size="small"
                fullWidth
                name="feeHeadName"
                label="Fee Head Name"
                value={values.feeHeadName}
                onChange={handleChange}
                onBlur={handleBlur}
                error={isFeeHeadNameError}
                helperText={touched.feeHeadName && errors.feeHeadName}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>

      <DialogActions>
        <Box display="flex" gap={2} width="100%" flexDirection="row" justifyContent="flex-end">
          <Button
            variant="outlined"
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<Iconify icon={GlobalIcons.submit} />}
            disabled={isSubmitting}
          >
            {isEditMode ? 'Update' : 'Submit'}
          </Button>
        </Box>
      </DialogActions>
    </form>
  );
};

export default SetFeeHeadDialog;
