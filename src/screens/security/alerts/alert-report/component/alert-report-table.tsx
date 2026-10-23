import type { LabelColor } from 'src/components/label/types';

import React from 'react';
import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import data from 'src/json/security/alert-report-data.json';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Grid, TextField, Autocomplete } from '@mui/material';
import {
  SLAMeetStatusType,
  SLAMeetStatusTypeColor,
  SLAMeetStatusTypeOptions,
} from 'src/enums/slameet-statusType';

const AlertReportTable = () => (
  <>
    <Box display="flex" alignItems="center" flexDirection="row" gap={1} pb="30px">
      <Grid size={{ xs: 12, md: 3 }}>
        <DatePicker
          label="To Date"
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
        <DatePicker
          label="End Date"
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
              label="Response Officer"
              placeholder="Response Officer"
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
          label="Alert Type"
          options={[]}
          value=""
          onChange={() => {
            // Filter table data based on direction
          }}
          formControlProps={{ fullWidth: true, sx: { minWidth: '200px' } }}
        />
      </Grid>
    </Box>
    <CustomizableTable
      searchFieldProps={{
        placeholder: 'Search by  Name, status...',
        label: 'Search by  Name, status...',
        sx: {
          maxWidth: '400px',
          width: '100%',
        },
      }}
      tableId="access-logs-management-table"
      noDataText="No Alerts Found"
      columns={[
        { id: 'studentName', label: 'Student Name' },
        {
          id: 'time',
          label: 'Time',
          filterType: 'string' as const,
          isFilter: true,
          isSort: false,
          render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
        },
        { id: 'acknowledgBy', label: 'Acknowledged By' },
        { id: 'resolved', label: 'Resolved' },

        {
          id: 'slaMet',
          label: 'SLA Met',
          filterType: 'enum' as const,
          enumOptions: SLAMeetStatusTypeOptions,
          minWidth: '130px',
          align: 'left',
          render(value, row) {
            const color = SLAMeetStatusTypeColor[value as SLAMeetStatusType] as LabelColor;

            const val = SLAMeetStatusType[value];
            return <Label color={color}>{val}</Label>;
          },
        },
      ]}
      data={data}
    />
  </>
);

export default AlertReportTable;
