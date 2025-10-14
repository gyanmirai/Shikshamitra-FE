'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import { Card, Grid, TextField, Typography, CardContent, InputAdornment } from '@mui/material';

import type { IStopData } from '../Components/type';

interface StopInformationProps {
  editData?: IStopData | null;
  formik: any;
  onFormChange?: (values: any) => void;
}

const StopInformation: React.FC<StopInformationProps> = ({ editData, formik, onFormChange }) => {
  // Call onFormChange when form values change
  React.useEffect(() => {
    if (onFormChange) {
      onFormChange(formik.values);
    }
  }, [formik.values, onFormChange]);

  return (
    <Card sx={{ height: 'fit-content' }}>
      <CardContent>
        <Typography variant="h6" color="primary" gutterBottom>
          Stop Information
        </Typography>

        <Grid container spacing={2}>
          {/* Stop Name */}
          <Grid size={12} mb={1}>
            <ShakingTextField error={!!(formik.touched.stopName && formik.errors.stopName)}>
              <TextField
                fullWidth
                size="small"
                label="Stop Name *"
                name="stopName"
                value={formik.values.stopName}
                onChange={(e) => {
                  const value = e.target.value
                    .replace(/[^a-zA-Z0-9\s-]/g, '') // allow letters, numbers, spaces, and hyphens
                    .split(' ')
                    .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
                    .join(' ');
                  formik.setFieldValue('stopName', value);
                }}
                onBlur={formik.handleBlur}
                error={!!(formik.touched.stopName && formik.errors.stopName)}
                helperText={(formik.touched.stopName && formik.errors.stopName) as string}
              />
            </ShakingTextField>
          </Grid>

          {/* Landmark */}
          <Grid size={12} mb={1}>
            <ShakingTextField error={!!(formik.touched.landmark && formik.errors.landmark)}>
              <TextField
                fullWidth
                size="small"
                label="Landmark *"
                name="landmark"
                value={formik.values.landmark}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!(formik.touched.landmark && formik.errors.landmark)}
                helperText={(formik.touched.landmark && formik.errors.landmark) as string}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Iconify
                        icon="mdi:map-marker"
                        sx={{ color: 'text.secondary', fontSize: 18 }}
                      />
                    </InputAdornment>
                  ),
                }}
              />
            </ShakingTextField>
          </Grid>

          {/* Building No/Flat/House No */}
          <Grid size={12} mb={1}>
            <TextField
              fullWidth
              size="small"
              label="Building No./Flat/House No."
              name="buildingNo"
              value={formik.values.buildingNo || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          {/* Area/Locality/Road Name */}
          <Grid size={12} mb={1}>
            <ShakingTextField
              error={!!(formik.touched.areaLocalityRoadName && formik.errors.areaLocalityRoadName)}
            >
              <TextField
                fullWidth
                size="small"
                label="Area/Locality/Road Name"
                name="areaLocalityRoadName"
                value={formik.values.areaLocalityRoadName}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={
                  !!(formik.touched.areaLocalityRoadName && formik.errors.areaLocalityRoadName)
                }
                helperText={
                  (formik.touched.areaLocalityRoadName &&
                    formik.errors.areaLocalityRoadName) as string
                }
              />
            </ShakingTextField>
          </Grid>

          {/* Zone */}
          <Grid size={12} mb={1}>
            <ShakingTextField error={!!(formik.touched.zone && formik.errors.zone)}>
              <TextField
                fullWidth
                size="small"
                label="Zone"
                name="zone"
                value={formik.values.zone}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={!!(formik.touched.zone && formik.errors.zone)}
                helperText={(formik.touched.zone && formik.errors.zone) as string}
              />
            </ShakingTextField>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StopInformation;
