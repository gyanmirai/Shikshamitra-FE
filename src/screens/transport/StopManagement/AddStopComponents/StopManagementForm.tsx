'use client';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import ShakingTextField from 'src/components/shaking-text-field';
import NumericFormatCustom from 'src/components/custom-numeric-format';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
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

        <Grid container spacing={3}>
          {/* Stop Name */}
          <Grid size={{ xs: 12, md: 4 }}>
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
          <Grid size={{ xs: 12, md: 4 }}>
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

          {/* Zone */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.zone && formik.errors.zone)}>
              <PaginatedSearchSelect
                key={formik.values.zone || 'zone-empty'}
                fullWidth
                label="Zone *"
                noOptionsText="No Zone Found"
                minChars={0}
                size="small"
                fetchOptions={async (query: string, page: number) => {
                  const zoneOptions = [
                    { value: 'North', label: 'North' },
                    { value: 'South', label: 'South' },
                    { value: 'East', label: 'East' },
                    { value: 'West', label: 'West' },
                    { value: 'Central', label: 'Central' },
                  ];
                  const filtered = zoneOptions.filter((o) =>
                    o.label.toLowerCase().includes(query.toLowerCase())
                  );
                  const pageSize = 10;
                  const start = (page - 1) * pageSize;
                  return {
                    data: filtered.slice(start, start + pageSize),
                    hasMore: start + pageSize < filtered.length,
                  };
                }}
                getOptionLabel={(option: any) => option?.label || ''}
                value={
                  [
                    { value: 'North', label: 'North' },
                    { value: 'South', label: 'South' },
                    { value: 'East', label: 'East' },
                    { value: 'West', label: 'West' },
                    { value: 'Central', label: 'Central' },
                  ].find((opt) => opt.value === formik.values.zone) || null
                }
                onChange={(_, newValue: any) => {
                  formik.setFieldValue('zone', newValue ? newValue.value : '');
                }}
                isOptionEqualToValue={(option: any, value: any) => option.value === value.value}
                error={!!(formik.touched.zone && formik.errors.zone)}
                helperText={(formik.touched.zone && formik.errors.zone) as string}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={!!(formik.touched.amount && formik.errors.amount)}>
              <NumericFormatCustom
                size="small"
                fullWidth
                label="Amount *"
                name="amount"
                value={formik.values.amount}
                error={!!(formik.touched.amount && formik.errors.amount)}
                helperText={(formik.touched.amount && formik.errors.amount) as string}
                onChange={(e: any) => {
                  // Remove non-numeric characters and parse to number
                  const rawValue = e.target.value.replace(/[^0-9.]/g, '');
                  formik.setFieldValue('amount', rawValue ? Number(rawValue) : '');
                }}
              />
            </ShakingTextField>
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField error={formik.touched.pincode && Boolean(formik.errors.pincode)}>
              <TextField
                fullWidth
                size="small"
                label="PIN Code"
                type="number"
                {...formik.getFieldProps('pincode')}
                error={formik.touched.pincode && Boolean(formik.errors.pincode)}
                helperText={formik.touched.pincode && formik.errors.pincode}
                name="pincode"
                onChange={(e) => {
                  const { value } = e.target;
                  if (value.length <= 6) {
                    formik.handleChange(e);
                    formik.validateField('pincode');
                  }
                }}
                onKeyDown={(e) => {
                  if (['e', 'E', '+', '-', '.'].includes(e.key)) {
                    e.preventDefault();
                  }
                }}
                inputProps={{ maxLength: 6, pattern: '[0-9]*' }}
              />
            </ShakingTextField>
          </Grid>

          {/* Approx Km from School */}
          <Grid size={{ xs: 12, md: 4 }}>
            <ShakingTextField
              error={!!(formik.touched.approxKmFromSchool && formik.errors.approxKmFromSchool)}
            >
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Approx Km from School *"
                name="approxKmFromSchool"
                value={formik.values.approxKmFromSchool}
                onChange={(e) => {
                  const { value } = e.target;
                  // allow digits and a single decimal point
                  const sanitized = value
                    .replace(/[^0-9.]/g, '') // remove anything except digits and dot
                    .replace(/(\..*)\./g, '$1'); // keep only the first dot
                  formik.setFieldValue('approxKmFromSchool', sanitized);
                }}
                onBlur={formik.handleBlur}
                error={!!(formik.touched.approxKmFromSchool && formik.errors.approxKmFromSchool)}
                helperText={
                  (formik.touched.approxKmFromSchool && formik.errors.approxKmFromSchool) as string
                }
              />
            </ShakingTextField>
          </Grid>
          {/* Building No/Flat/House No */}
          {/* Address Line 1 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Address Line 1"
              name="addressLine1"
              value={formik.values.addressLine1 || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          {/* Address Line 2 */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Address Line 2"
              name="addressLine2"
              value={formik.values.addressLine2 || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              size="small"
              multiline
              rows={3}
              label="Description"
              name="description"
              value={formik.values.description || ''}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default StopInformation;
