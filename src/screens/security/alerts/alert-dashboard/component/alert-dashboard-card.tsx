import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import DashboardCard from 'src/components/dasboard-card';
import { Box, Grid, TextField, Autocomplete } from '@mui/material';

const AlertDashboardCard = () => (
  <>
    <Box display="flex" alignItems="center" flexDirection="row" gap={2} pb="30px">
      <Grid size={{ xs: 12, md: 3 }}>
        <DatePicker
          label="Select Date"
          format="DD-MM-YYYY"
          onChange={(value) => {
            // Filter table data based on start date
          }}
          slotProps={{
            textField: {
              size: 'small',
              fullWidth: true,
            },
          }}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <Autocomplete
          loading={false}
          noOptionsText="No Officer Found"
          sx={{ minWidth: '200px' }}
          options={[]}
          getOptionLabel={(option: any) => option?.firstName || ''}
          onChange={(event, value) => {
            // Filter table data based on selected employee
          }}
          renderInput={(params: any) => (
            <TextField
              {...params}
              size="small"
              label="Officer Name"
              placeholder="Officer Name"
              sx={{ minWidth: '200px' }}
            />
          )}
          renderOption={(prop: any, option: any) => (
            <li {...prop} key={option.id}>
              {option.firstName}
            </li>
          )}
        />
      </Grid>

      <Grid size={{ xs: 12, md: 3 }}>
        <CustomSelect
          label="Status"
          options={[]}
          value=""
          onChange={() => {
            // Filter table data based on direction
          }}
          formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
        />
      </Grid>
    </Box>
    <Grid container spacing={3} pb="30px">
      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <DashboardCard
          title="Active Alerts"
          mainText="10"
          mainIcon={<Iconify icon={GlobalIcons.alertIcon} width={60} height={60} />}
          mainIconColor="#FF5722"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <DashboardCard
          title="Avg. Response Time"
          mainText="10 MIN"
          mainIcon={<Iconify icon="mdi:clock-alert" width={60} height={60} />}
          mainIconColor="#FFAB00"
        />
      </Grid>

      <Grid size={{ xs: 12, md: 6, lg: 4 }}>
        <DashboardCard
          title="Resolved Today"
          mainText="05"
          mainIcon={<Iconify icon={GlobalIcons.approvedIcon} width={60} height={60} />}
          mainIconColor="#4CAF50"
        />
      </Grid>
    </Grid>
  </>
);

export default AlertDashboardCard;
