import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { Box, Grid, Button, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialAssignedToPurchaseValues } from '../initialValue';
import { assignedToPurchaseValidationSchema } from '../validationSchema';

import type { IAssignedToPurchase } from '../procurement-and-vendor-interface';

const AssignToPurchaseDialog = () => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IAssignedToPurchase>(
    () => getInitialAssignedToPurchaseValues(),
    []
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IAssignedToPurchase>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: assignedToPurchaseValidationSchema,

    // Handle form submission
    onSubmit: (values) => {
      // Add logic here to handle form submission (e.g., API call or state update)
    },
  });

  return (
    <form onSubmit={formik.handleSubmit}>
      <Scrollbar sx={{ p: 2, bgcolor: 'background.neutral', height: '100%' }}>
        <Grid container spacing={2}>
          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={formik.touched.assignedTo && Boolean(formik.errors.assignedTo)}
            >
              <CustomSelect
                label="Select Assign To"
                options={[]}
                value={formik.values.assignedTo}
                onChange={(value) => formik.setFieldValue('assignedTo', value)}
                error={formik.touched.assignedTo && Boolean(formik.errors.assignedTo)}
                helperText={
                  formik.touched.assignedTo && formik.errors.assignedTo
                    ? String(formik.errors.assignedTo)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={6} pb="10px">
            <ShakingTextField error={formik.touched.priority && Boolean(formik.errors.priority)}>
              <CustomSelect
                label="Select Priority"
                options={[]}
                value={formik.values.priority}
                onChange={(value) => formik.setFieldValue('priority', value)}
                error={formik.touched.priority && Boolean(formik.errors.priority)}
                helperText={
                  formik.touched.priority && formik.errors.priority
                    ? String(formik.errors.priority)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} pb="10px">
            <ShakingTextField
              error={formik.touched.description && Boolean(formik.errors.description)}
            >
              <Editor
                onChange={(value) => {
                  formik.setFieldValue('description', value);
                }}
                value={formik.values.description}
                placeholder="description"
                error={formik.touched.description && Boolean(formik.errors.description)}
                helperText={formik.touched.description && formik.errors.description}
                sx={{ height: '100%' }}
                slotProps={{
                  wrap: {
                    height: '100%',
                  },
                }}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        <Box display="flex" gap={2} width="100%" flexDirection="row" justifyContent="flex-end">
          <Button startIcon={<Iconify icon={GlobalIcons.approvedIcon} />} variant="contained">
            Assign To Purchase
          </Button>
        </Box>
      </DialogActions>
    </form>
  );
};

export default AssignToPurchaseDialog;
