import React from 'react';
import { useFormik } from 'formik';

import { Box, Grid, Button, TextField, DialogActions } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';

import { getHostelInitialValues } from './getInitialValues';

import type { IHostelFormProps } from './type';

const HostelForm: React.FC<IHostelFormProps> = ({ open, onClose, editData }) => {
  const formik = useFormik({
    initialValues: getHostelInitialValues(editData),
    onSubmit: (values, formikHelpers) => {
      console.log(values);
    },
  });

  return (
    <form onSubmit={formik.handleSubmit} style={{ height: '100%' }}>
      <Box display="flex" flexDirection="column" gap={2} height="100%">
        <Scrollbar sx={{ p: 2, height: '100%' }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                size="small"
                label="Hostel Name"
                name="hostelName"
                fullWidth
                value={formik.values.hostelName}
                onChange={formik.handleChange}
                error={formik.touched.hostelName && Boolean(formik.errors.hostelName)}
                helperText={formik.touched.hostelName && formik.errors.hostelName}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <CustomSelect
                label="Hostel Type"
                options={[
                  { value: 'Boys', label: 'Boys' },
                  { value: 'Girls', label: 'Girls' },
                ]}
                value={formik.values.hostelType}
                onChange={(val) => {
                  formik.setFieldValue('hostelType', val);
                }}
                formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
                error={formik.touched.hostelType && Boolean(formik.errors.hostelType)}
                helperText={(formik.touched.hostelType && formik.errors.hostelType) || undefined}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                size="small"
                label="Total Room Capacity"
                name="totalRoomCapacity"
                type="number"
                fullWidth
                value={formik.values.totalRoomCapacity}
                onChange={formik.handleChange}
                error={formik.touched.totalRoomCapacity && Boolean(formik.errors.totalRoomCapacity)}
                helperText={formik.touched.totalRoomCapacity && formik.errors.totalRoomCapacity}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                size="small"
                label="Location"
                name="location"
                fullWidth
                value={formik.values.location}
                onChange={formik.handleChange}
                error={formik.touched.location && Boolean(formik.errors.location)}
                helperText={formik.touched.location && formik.errors.location}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Warden Details"
                name="wardenDetails"
                fullWidth
                rows={4}
                multiline
                value={formik.values.wardenDetails}
                onChange={formik.handleChange}
                error={formik.touched.wardenDetails && Boolean(formik.errors.wardenDetails)}
                helperText={formik.touched.wardenDetails && formik.errors.wardenDetails}
              />
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
          <Button type="submit" variant="contained">
            {editData ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Box>
    </form>
  );
};

export default HostelForm;
