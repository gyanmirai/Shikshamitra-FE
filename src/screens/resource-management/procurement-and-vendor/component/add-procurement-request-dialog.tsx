import { useFormik } from 'formik';
import React, { useMemo } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Editor } from 'src/components/editor';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import { UploadBox } from 'src/components/upload/upload-box';
import ShakingTextField from 'src/components/shaking-text-field';

import { getInitialProcurementAndVendorValues } from '../initialValue';
import { procurementAndVendorValidationSchema } from '../validationSchema';

import type {
  IProcurementAndVendorFromValues,
  IAddProcurementRequestDialogProps,
} from '../procurement-and-vendor-interface';

const AddProcurementRequestDialog: React.FC<IAddProcurementRequestDialogProps> = ({
  data,
  isEdit,
  fromTeacher = false,
}) => {
  // Generate initial form values based on `isEdit` mode and incoming `data`.
  // This uses a utility function for reusability across the app.
  const initialValues = useMemo<IProcurementAndVendorFromValues>(
    () => getInitialProcurementAndVendorValues(data, isEdit),
    [data, isEdit]
  );

  // Initialize Formik for managing form state, validation, and submission
  const formik = useFormik<IProcurementAndVendorFromValues>({
    // Set initial form field values
    initialValues,

    // Attach Yup validation schema for field validation
    validationSchema: procurementAndVendorValidationSchema,

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
              error={formik.touched.resourceCategory && Boolean(formik.errors.resourceCategory)}
            >
              <CustomSelect
                label="Select Category"
                options={[]}
                value={formik.values.resourceCategory}
                onChange={(value) => formik.setFieldValue('resourceCategory', value)}
                disabled={isEdit}
                error={formik.touched.resourceCategory && Boolean(formik.errors.resourceCategory)}
                helperText={
                  formik.touched.resourceCategory && formik.errors.resourceCategory
                    ? String(formik.errors.resourceCategory)
                    : ''
                }
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
            >
              <TextField
                name="resourceName"
                label="Resource Name"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
                helperText={formik.touched.resourceName && formik.errors.resourceName}
              />
            </ShakingTextField>
          </Grid>
          <Grid item xs={6} pb="10px">
            <ShakingTextField error={formik.touched.quantity && Boolean(formik.errors.quantity)}>
              <TextField
                name="quantity"
                label="Quantity"
                value=""
                onChange={() => {}}
                size="small"
                fullWidth
                error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                helperText={formik.touched.quantity && formik.errors.quantity}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={6} pb="10px">
            <ShakingTextField
              error={
                formik.touched.expectedDeliveryDate && Boolean(formik.errors.expectedDeliveryDate)
              }
            >
              <DatePicker
                label="Expected Delivery Date"
                format="DD-MM-YYYY"
                slotProps={{ textField: { size: 'small', fullWidth: true } }}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} pb="10px">
            <ShakingTextField error={formik.touched.purpose && Boolean(formik.errors.purpose)}>
              <Editor
                onChange={(value) => {
                  formik.setFieldValue('description', value);
                }}
                value={formik.values.purpose}
                placeholder="purpose"
                error={formik.touched.purpose && Boolean(formik.errors.purpose)}
                helperText={formik.touched.purpose && formik.errors.purpose}
                editable={isEdit}
                sx={{ height: '100%' }}
                slotProps={{
                  wrap: {
                    height: '100%',
                  },
                }}
              />
            </ShakingTextField>
          </Grid>

          <Grid item xs={12} sx={{ pb: '10px' }}>
            <UploadBox
              onDrop={() => {}}
              placeholder={
                <Box
                  sx={{
                    gap: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    color: 'text.disabled',
                    flexDirection: 'column',
                  }}
                >
                  <Iconify icon="eva:cloud-upload-fill" width={40} />
                  <Typography variant="body2">Drag Your File</Typography>
                </Box>
              }
              sx={{
                py: 2.5,
                width: '100%',
                height: 'auto',
                borderRadius: 1.5,
              }}
            />
          </Grid>
        </Grid>
      </Scrollbar>
      <DialogActions>
        {fromTeacher && <SubmitButton onClick={() => {}} />}
        {!fromTeacher && (
          <Box display="flex" gap={2} width="100%" flexDirection="row" justifyContent="flex-end">
            <Button
              color="error"
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              variant="outlined"
            >
              Reject
            </Button>
            <Button startIcon={<Iconify icon={GlobalIcons.approvedIcon} />} variant="contained">
              Approved
            </Button>
          </Box>
        )}
      </DialogActions>
    </form>
  );
};

export default AddProcurementRequestDialog;
