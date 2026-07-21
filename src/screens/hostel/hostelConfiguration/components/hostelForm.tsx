import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import ShakingTextField from 'src/components/shaking-text-field';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Button, TextField, Autocomplete, DialogActions } from '@mui/material';

import { hostelValidationSchema } from './validationSchema';
import { getHostelInitialValues } from './getInitialValues';

import type { IHostelFormProps } from './type';

const HostelForm: React.FC<IHostelFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getHostelInitialValues(editData),
    validationSchema: hostelValidationSchema,
    onSubmit: (values, formikHelpers) => {},
  });

  const wardenList = [
    { value: 'warden_1', label: 'John Smith' },
    { value: 'warden_2', label: 'Priya Patel' },
  ];

  return (
    <BackPopUpChecked initialValues={formik.initialValues} currentValues={formik.values}>
      <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
        <Box display="flex" flexDirection="column" gap={1} height="100%">
          <Scrollbar sx={{ p: 2, height: '100%' }}>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.hostelName && formik.errors.hostelName)}>
                  <TextField
                    size="small"
                    label="Hostel Name *"
                    name="hostelName"
                    fullWidth
                    value={formik.values.hostelName}
                    onChange={formik.handleChange}
                    error={formik.touched.hostelName && Boolean(formik.errors.hostelName)}
                    helperText={formik.touched.hostelName && formik.errors.hostelName}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.hostelType && formik.errors.hostelType)}>
                  <Autocomplete
                    options={[
                      { value: 'Boys', label: 'Boys' },
                      { value: 'Girls', label: 'Girls' },
                    ]}
                    getOptionLabel={(option) => option.label}
                    value={
                      [
                        { value: 'Boys', label: 'Boys' },
                        { value: 'Girls', label: 'Girls' },
                      ].find((opt) => opt.value === formik.values.hostelType) || null
                    }
                    onChange={(_, newValue) => {
                      formik.setFieldValue('hostelType', newValue?.value || '');
                    }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Hostel Type *"
                        size="small"
                        error={formik.touched.hostelType && Boolean(formik.errors.hostelType)}
                        helperText={formik.touched.hostelType && formik.errors.hostelType}
                        fullWidth
                      />
                    )}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.totalFloors && formik.errors.totalFloors)}
                >
                  <TextField
                    size="small"
                    label="Total Floors *"
                    name="totalFloors"
                    type="number"
                    fullWidth
                    value={formik.values.totalFloors}
                    onChange={formik.handleChange}
                    error={formik.touched.totalFloors && Boolean(formik.errors.totalFloors)}
                    helperText={formik.touched.totalFloors && formik.errors.totalFloors}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField error={!!(formik.touched.location && formik.errors.location)}>
                  <TextField
                    size="small"
                    label="Location *"
                    name="location"
                    fullWidth
                    value={formik.values.location}
                    onChange={formik.handleChange}
                    error={formik.touched.location && Boolean(formik.errors.location)}
                    helperText={formik.touched.location && formik.errors.location}
                  />
                </ShakingTextField>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <ShakingTextField
                  error={!!(formik.touched.assignedWarden && formik.errors.assignedWarden)}
                >
                  <Autocomplete
                    options={wardenList} // Make sure wardenList is passed as a prop or fetched
                    getOptionLabel={(option) => option.label}
                    onChange={(_, val) => {
                      formik.setFieldValue('assignedWarden', val?.value || '');
                    }}
                    value={
                      wardenList.find((item) => item.value === formik.values.assignedWarden) || null
                    }
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Assigned Warden *"
                        size="small"
                        error={
                          formik.touched.assignedWarden && Boolean(formik.errors.assignedWarden)
                        }
                        helperText={formik.touched.assignedWarden && formik.errors.assignedWarden}
                        fullWidth
                      />
                    )}
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

export default HostelForm;
