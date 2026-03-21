import dayjs from 'dayjs';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Grid, TextField, Autocomplete } from '@mui/material';
import data from 'src/json/security/guard-management/all-guard-handover-data.json';

import CheckInCheckOutDialog from '../../guard-management/my-duties/component/check-in-check-out-dialog';

import type { IMyDuties } from '../../guard-management/my-duties/my-duties-interface';

const HandOverNotesTable = () => {
  // Dialog state for check-in/check-out modal
  const checkInDialog = useBoolean();
  // State to track if user is checking in (true) or checking out (false)
  const [isCheckIn, setIsCheckIn] = useState<boolean | null>(false);
  // Selected row data for check-in/check-out operations
  const [selectedData, setSelectedData] = useState<IMyDuties | null>(null);
  return (
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
            noOptionsText="No Guard Found"
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
                label="Guard Name"
                placeholder="Guard Name"
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
      </Box>
      <CustomizableTable
        noDataText="No Duty Data Found"
        tableId="duty-table-guard"
        data={data}
        columns={[
          { id: 'guardName', label: 'Guard Name' },
          { id: 'day', label: 'Day' },
          {
            id: 'startTime',
            label: 'Date',
            isFilter: false,
            isSort: false,
            render: (value) => (value ? dayjs(value).format('DD-MM-YY') : null),
          },
          {
            id: 'startTime',
            label: 'Start Time',
            isFilter: false,
            isSort: false,
            render: (value) => (value ? dayjs(value).format('H:mm') : null),
          },
          {
            id: 'endTime',
            label: 'End Time',
            isFilter: false,
            isSort: false,
            render: (value) => (value ? dayjs(value).format('H:mm') : null),
          },
          { id: 'location', label: 'Locations' },
          { id: 'isPresent', label: 'Attendance' },

          {
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            sticky: true,
            minWidth: 100,
            render(value, row) {
              return (
                <ThreeDotsActions
                  handleViewClick={() => {
                    setIsCheckIn(null);
                    setSelectedData(row as IMyDuties);
                    checkInDialog.onTrue();
                  }}
                  showViewIcon
                  showThreeDots={false}
                  placement="right-top"
                />
              );
            },
          },
        ]}
      />

      {checkInDialog.value && (
        <CustomDialog
          title={`${selectedData === null ? `Check ${isCheckIn ? 'In' : 'Out'}` : 'Check In/Out Notes'}`}
          open={checkInDialog.value}
          handleClose={() => {
            checkInDialog.onFalse();
          }}
        >
          <CheckInCheckOutDialog
            data={selectedData}
            isCheckIn={isCheckIn}
            onClose={() => {
              checkInDialog.onFalse();
            }}
          />
        </CustomDialog>
      )}
    </>
  );
};

export default HandOverNotesTable;
