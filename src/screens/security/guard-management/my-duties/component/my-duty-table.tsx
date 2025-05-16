import dayjs from 'dayjs';
import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Box, Grid, MenuItem, MenuList } from '@mui/material';

import { useBoolean } from 'src/hooks/use-boolean';

import data from 'src/json/security/guard-management/my-duties-data.json';

import { Iconify } from 'src/components/iconify';
import CustomDialog from 'src/components/customDialog';
import CustomizableTable from 'src/components/customizabaleTable';
import ThreeDotsActions from 'src/components/three-dots-actions';

import CheckInCheckOutDialog from './check-in-check-out-dialog';

import type { IMyDuties } from '../my-duties-interface';

const MyDutytable = () => {
  const checkInDialog = useBoolean();
  const [isCheckIn, setIsCheckIn] = useState<boolean | null>(false);
  const [selectedData, setSelectedData] = useState<IMyDuties | null>(null);
  return (
    <>
      <Box display="flex" alignItems="center" flexDirection="row" gap={2}>
        <Grid item xs={12} md={3}>
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
        <Grid item xs={12} md={3}>
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
      </Box>
      <CustomizableTable
        tableId="my-duty-table"
        data={data}
        columns={[
          {
            id: 'name',
            label: 'Shifts Name',
          },
          { id: 'day', label: 'Day' },
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

          {
            id: 'actions',
            label: 'Actions',
            isFilter: false,
            isSort: false,
            sticky: true,
            minWidth: 100,
            render(value, row) {
              const now = dayjs(); // current time
              const start = dayjs(row.startTime);
              const end = dayjs(row.endTime);

              const isCheckedIn = row.status === 'checkedIn';
              const isCheckedOut = row.status === 'checkedOut';

              const canCheckIn =
                !isCheckedIn &&
                !isCheckedOut &&
                now.isAfter(start.subtract(1, 'hour')) &&
                now.isBefore(start);
              const canCheckOut = isCheckedIn && now.isBefore(end);
              const isPast = now.isAfter(end);

              // if ( (!canCheckIn && !canCheckOut)) return null; // Hide three-dots if no actions

              return (
                <ThreeDotsActions
                  handleViewClick={() => {
                    setIsCheckIn(null);
                    setSelectedData(row as IMyDuties);
                    checkInDialog.onTrue();
                  }}
                  showViewIcon={row.checkInNotes !== '' && row.checkOutNotes !== ''}
                  showThreeDots={row.status === 'checkedIn' || row.status === 'checkedOut'}
                  actions={({ popover }) => (
                    <MenuList>
                      {canCheckIn && (
                        <MenuItem
                          onClick={() => {
                            setSelectedData(null);
                            setIsCheckIn(true);
                            checkInDialog.onTrue();
                          }}
                        >
                          <Iconify icon="mdi:arrow-right-circle" sx={{ mr: 2 }} />
                          Check In
                        </MenuItem>
                      )}
                      {canCheckOut && (
                        <MenuItem
                          onClick={() => {
                            setSelectedData(null);
                            setIsCheckIn(false);
                            checkInDialog.onTrue();
                          }}
                        >
                          <Iconify icon="mdi:arrow-right-circle" sx={{ mr: 2 }} />
                          Check Out
                        </MenuItem>
                      )}
                    </MenuList>
                  )}
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

export default MyDutytable;
