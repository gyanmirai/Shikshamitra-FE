import type { FormikProps } from 'formik';

import { Iconify } from 'src/components/iconify';
import { Grid, TextField, InputAdornment } from '@mui/material';
import { routeTypeOptions } from 'src/enums/route-type-options';
import ShakingTextField from 'src/components/shaking-text-field';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { SectionCard } from 'src/screens/hr/employee/employee-form-fields/InformationFields';

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
}) => (
  <>
    <Grid size={{ xs: 12 }}>
      <TransportMemberProfile selectedMember={formik.values} fromViewScreen={false} />
    </Grid>
    <SectionCard title="Basic Details" paperProps={{ sx: { mt: 2 } }}>
      {/* <Grid container spacing={2}> */}
      <Grid size={{ xs: 12, md: 8, sm: 8 }}>
        <ShakingTextField error={!!(formik.touched.searchStop && formik.errors.searchStop)}>
          <PaginatedSearchSelect
            key={formik.values.searchStop || 'stop-empty'}
            fullWidth
            label="Stop *"
            noOptionsText="No Stop Found"
            minChars={0}
            size="small"
            fetchOptions={async (query: string, page: number) => {
              const filtered = options.filter((o) =>
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
            value={options.find((opt) => opt.value === formik.values.searchStop) || null}
            onChange={(_, newValue: any) =>
              formik.setFieldValue('searchStop', newValue ? newValue.value : '')
            }
            isOptionEqualToValue={(option: any, val: any) => option.value === val.value}
            error={formik.touched.searchStop && Boolean(formik.errors.searchStop)}
            helperText={
              formik.touched.searchStop && formik.errors.searchStop ? formik.errors.searchStop : ''
            }
          />
        </ShakingTextField>
      </Grid>
      <Grid size={{ xs: 12, md: 4 }}>
        <ShakingTextField error={!!(formik.touched.pickupType && formik.errors.pickupType)}>
          <PaginatedSearchSelect
            key={String(formik.values.pickupType ?? '') || 'pickup-type-empty'}
            fullWidth
            label="Pickup Type *"
            noOptionsText="No Pickup Type Found"
            minChars={0}
            size="small"
            fetchOptions={async (query: string, page: number) => {
              const filtered = routeTypeOptions.filter((o) =>
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
            value={routeTypeOptions.find((o) => o.value === formik.values.pickupType) || null}
            onChange={(_, newValue: any) =>
              formik.setFieldValue('pickupType', newValue ? newValue.value : '')
            }
            isOptionEqualToValue={(option: any, val: any) => option.value === val.value}
            error={!!(formik.touched.pickupType && formik.errors.pickupType)}
            helperText={
              formik.touched.pickupType ? (formik.errors.pickupType as string) : undefined
            }
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

export default TransportApplicationForm;
