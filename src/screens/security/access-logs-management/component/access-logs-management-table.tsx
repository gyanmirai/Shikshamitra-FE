import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React from 'react';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Grid, TextField, Autocomplete } from '@mui/material';
import data from 'src/json/resource-management/resource-settings/access-logs-data.json';
import {
  AccessLogsManagementStatusType,
  AccessLogsManagementStatusTypeColors,
  AccessLogsManagementStatusTypeOptions,
} from 'src/enums/access-logs-management-statusType';

const AccessLogsManagementTable = () => (
  <>
    <Box display="flex" alignItems="center" flexDirection="row" gap={2}>
      <Grid size={{ xs: 12, md: 3 }}>
        <DatePicker
          label="Start Date"
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
            // Filter table data based on end date
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
          noOptionsText="No Employee Found"
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
              label="Person Name"
              placeholder="Person Name"
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
          label="Gate"
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
        placeholder: 'Search by Person Name, Role...',
        label: 'Search by Person Name, Role...',
        sx: {
          maxWidth: '400px',
          width: '100%',
        },
      }}
      tableId="access-logs-management-table"
      noDataText="No Access Logs Data Found"
      columns={[
        { id: 'name', label: 'Name' },
        { id: 'role', label: 'Role' },
        { id: 'gate', label: 'Gate' },
        {
          id: 'timestamp',
          label: 'Timestamp',
          isFilter: false,
          isSort: false,

          render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
        },
        {
          id: 'direction',
          label: 'Direction',
          filterType: 'enum',
          enumOptions: AccessLogsManagementStatusTypeOptions,
          minWidth: '130px',
          align: 'left',
          render(value, row) {
            const color = AccessLogsManagementStatusTypeColors[
              value as AccessLogsManagementStatusType
            ] as LabelColor;

            const val = AccessLogsManagementStatusType[value];
            return <Label color={color}>{val}</Label>;
          },
        },
      ]}
      data={data}
    />
  </>
);

export default AccessLogsManagementTable;
