import type { FormikProps } from 'formik';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import ShakingTextField from 'src/components/shaking-text-field';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Grid, TextField, Autocomplete, InputAdornment } from '@mui/material';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';
import { useGetRouteMatcherOptionsQuery } from 'src/redux/transport/vehicle-management/route-management-api';

import TransportMemberProfile from './TransportMemberProfile';

import type { ITransportApplicationPayload } from '../type';

const existingStops = ['Parvat Surat, Gujarat', 'Parvat Gam, Shakti Nagar, Surat'];

const newStops = ['Parvat Patiya, Surat', 'Parvati Hill Parvati Paytha, Pune, Maharashtra'];

const options = [
  ...existingStops.map((stop) => ({
    label: stop,
    value: stop,
    group: 'Existing Stops',
  })),
  ...newStops
    .filter((stop) => !existingStops.includes(stop))
    .map((stop) => ({
      label: stop,
      value: stop,
      group: 'New Stops',
    })),
];

const TransportApplicationForm = ({
  formik,
}: {
  formik: FormikProps<ITransportApplicationPayload>;
}) => {
  const { data: routeTypeOptions = [] } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetRouteMatcherOptionsQuery,
  });
  return (
    <>
      <Grid size={{ xs: 12 }}>
        <TransportMemberProfile selectedMember={formik.values} fromViewScreen={false} />
      </Grid>
      <SectionCard title="Basic Details" paperProps={{ sx: { mt: 2 } }}>
        {/* <Grid container spacing={2}> */}
        <Grid size={{ xs: 12, md: 8, sm: 8 }}>
          <ShakingTextField error={!!(formik.touched.searchStop && formik.errors.searchStop)}>
            <Autocomplete
              clearOnEscape
              disableClearable={false}
              options={options}
              groupBy={(option) => option.group}
              getOptionLabel={(option) => option.label}
              value={options.find((opt) => opt.value === formik.values.searchStop) || null}
              onChange={(_, newValue) =>
                formik.setFieldValue('searchStop', newValue ? newValue.value : '')
              }
              renderOption={(props, option) => (
                <li
                  {...props}
                  key={option.value}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  {/* <RoomIcon fontSize="small" color="action" /> */}
                  {option.label}
                </li>
              )}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Stop *"
                  fullWidth
                  size="small"
                  error={formik.touched.searchStop && Boolean(formik.errors.searchStop)}
                  helperText={
                    formik.touched.searchStop && formik.errors.searchStop
                      ? formik.errors.searchStop
                      : ''
                  }
                />
              )}
              sx={{
                minWidth: 300,
                '& .MuiAutocomplete-groupLabel': {
                  fontWeight: 600,
                  backgroundColor: 'rgba(0,0,0,0.05)',
                  borderRadius: '4px',
                },
              }}
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 4 }}>
          <ShakingTextField error={!!(formik.touched.pickupType && formik.errors.pickupType)}>
            <CustomSelect
              label="Pickup Type *"
              name="pickupType"
              options={routeTypeOptions}
              value={formik.values.pickupType}
              onChange={(value) => formik.setFieldValue('pickupType', value)}
              error={!!(formik.touched.pickupType && formik.errors.pickupType)}
              helperText={formik.touched.pickupType ? formik.errors.pickupType : undefined}
              formControlProps={{ fullWidth: true }}
              size="small"
            />
          </ShakingTextField>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.landmark && formik.errors.landmark)}>
            <TextField
              fullWidth
              name="landmark"
              label="Landmark"
              value={formik.values.landmark}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                formik.setFieldValue('landmark', value);
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon="mdi:map-marker" sx={{ color: 'text.secondary', fontSize: 18 }} />
                  </InputAdornment>
                ),
              }}
              error={!!(formik.touched.landmark && formik.errors.landmark)}
              helperText={formik.touched.landmark && formik.errors.landmark}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <ShakingTextField error={!!(formik.touched.areaLocality && formik.errors.areaLocality)}>
            <TextField
              fullWidth
              name="areaLocality"
              label="Area/Locality/Road Name"
              value={formik.values.areaLocality}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                formik.setFieldValue('areaLocality', value);
              }}
              error={!!(formik.touched.areaLocality && formik.errors.areaLocality)}
              helperText={formik.touched.areaLocality && formik.errors.areaLocality}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        <Grid size={{ xs: 12 }}>
          <ShakingTextField error={!!(formik.touched.description && formik.errors.description)}>
            <TextField
              fullWidth
              name="description"
              label="Description"
              rows={3}
              value={formik.values.description}
              onChange={(e) => {
                const value = e.target.value.replace(/[^a-zA-Z0-9 ]/g, '');
                formik.setFieldValue('description', value);
              }}
              error={!!(formik.touched.description && formik.errors.description)}
              helperText={formik.touched.description && formik.errors.description}
              size="small"
            />
          </ShakingTextField>
        </Grid>
        {/* </Grid> */}
      </SectionCard>
    </>
  );
};

export default TransportApplicationForm;
