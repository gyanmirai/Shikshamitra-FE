import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
import { IAdjustmentFormProps } from '../type';
import { hostelAdjustmentValidationSchema } from './validationSchema';

const AdjustmentForm: React.FC<IAdjustmentFormProps> = ({ onClose, editData }) => {
  // Formik hook for handling form state and validation
  const formik = useFormik({
    initialValues: {
      amount: editData?.amount || 0,
      type: editData?.type || '',
      reason: editData?.reason || '',
    },
    validationSchema: hostelAdjustmentValidationSchema,
    onSubmit: (values) => {
      console.log(values);
    },
  });

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={2} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
                  <TextField
                    size="small"
                    label="Amount*"
                    name="amount"
                    type="number"
                    fullWidth
                    value={formik.values.amount}
                    onChange={formik.handleChange}
                    error={formik.touched.amount && Boolean(formik.errors.amount)}
                    helperText={formik.touched.amount && formik.errors.amount}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.type && formik.errors.type)}>
                  <CustomSelect
                    label="Type*"
                    options={[
                      { value: 'Fine', label: 'Fine' },
                      { value: 'Discount', label: 'Discount' },
                      { value: 'Scholarship', label: 'Scholarship' },
                    ]}
                    value={formik.values.type}
                    onChange={(val) => formik.setFieldValue('type', val)}
                    formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                    error={formik.touched.type && Boolean(formik.errors.type)}
                    helperText={(formik.touched.type && formik.errors.type) || undefined}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <ShakingTextField error={!!(formik.touched.reason && formik.errors.reason)}>
                  <TextField
                    size="small"
                    label="Reason*"
                    name="reason"
                    fullWidth
                    multiline
                    rows={3}
                    value={formik.values.reason}
                    onChange={formik.handleChange}
                    error={formik.touched.reason && Boolean(formik.errors.reason)}
                    helperText={formik.touched.reason && formik.errors.reason}
                  />
                </ShakingTextField>
              </Grid>
            </Grid>
          </Scrollbar>

          <DialogActions>
            <Button
              startIcon={<Iconify icon={GlobalIcons.cancel} />}
              onClick={() => {
                onClose(null, false);
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              {editData ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Box>
      </form>
    </BackPopUpChecked>
  );
};

export default AdjustmentForm;
