'use client';

import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Editor } from 'src/components/editor';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import SubmitButton from 'src/components/submit-button';
import CancelButton from 'src/components/cancel-button';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Typography, DialogActions } from '@mui/material';

import { getInitialProcurementAndVendorValues } from '../initialValue';
import { procurementAndVendorValidationSchema } from '../validationSchema';

import type { IAddProcurementRequestFormProps } from '../procurement-and-vendor-interface';

const AddProcurementRequestForm: React.FC<IAddProcurementRequestFormProps> = ({
  isEdit,
  data,
  onClose,
  fromTeacher,
}) => {
  const formik = useFormik({
    initialValues: getInitialProcurementAndVendorValues(data),
    validationSchema: procurementAndVendorValidationSchema,
    onSubmit: (values) => {},
  });

  // const isDisabled = data !== null && isEdit === false;
  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit}>
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={2}>
            <Grid size={6} pb="10px">
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

            <Grid size={6} pb="10px">
              <ShakingTextField
                error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
              >
                <TextField
                  name="resourceName"
                  label="Resource Name"
                  value={formik.values.resourceName}
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.resourceName && Boolean(formik.errors.resourceName)}
                  helperText={formik.touched.resourceName && formik.errors.resourceName}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={6} pb="10px">
              <ShakingTextField error={formik.touched.quantity && Boolean(formik.errors.quantity)}>
                <TextField
                  name="quantity"
                  label="Quantity"
                  value={formik.values.quantity}
                  type="number"
                  onChange={formik.handleChange}
                  size="small"
                  fullWidth
                  error={formik.touched.quantity && Boolean(formik.errors.quantity)}
                  helperText={formik.touched.quantity && formik.errors.quantity}
                />
              </ShakingTextField>
            </Grid>

            <Grid size={6} pb="10px">
              <ShakingTextField
                error={
                  formik.touched.expectedDeliveryDate && Boolean(formik.errors.expectedDeliveryDate)
                }
              >
                <DatePicker
                  label="Expected Delivery Date"
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: {
                      size: 'small',
                      fullWidth: true,
                      error:
                        formik.touched.expectedDeliveryDate &&
                        Boolean(formik.errors.expectedDeliveryDate),
                      helperText:
                        formik.touched.expectedDeliveryDate && formik.errors.expectedDeliveryDate,
                    },
                  }}
                />
              </ShakingTextField>
            </Grid>
            <Grid size={12} pb="10px">
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

            <Grid size={12} sx={{ pb: '10px' }}>
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
          {fromTeacher && (
            <Box display="flex" gap={2} width="100%" flexDirection="row" justifyContent="flex-end">
              <CancelButton onClick={onClose} />
              <SubmitButton onClick={() => {}} />
            </Box>
          )}
          {!fromTeacher && (
            <Box display="flex" gap={2} width="100%" flexDirection="row" justifyContent="flex-end">
              <Button
                color="error"
                startIcon={<Iconify icon={GlobalIcons.cancel} />}
                variant="outlined"
              >
                Reject
              </Button>
              <Button
                type="submit"
                startIcon={<Iconify icon={GlobalIcons.approvedIcon} />}
                variant="contained"
              >
                Approved
              </Button>
            </Box>
          )}
        </DialogActions>
      </form>
    </BackPopUpChecked>
  );
};

export default AddProcurementRequestForm;
