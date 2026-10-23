import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React from 'react';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, MenuItem, MenuList } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import data from 'src/json/security/visitor-management/visitor-check-in-data.json';
import {
  VisitorVisitingStatusType,
  VisitorVisitingStatusColors,
  VisitorVisitingStatusOptions,
} from 'src/enums/visitor-visiting-status';

import type {
  IWalkInVisitorFormValues,
  IWalkInVisitorTableProps,
} from '../visitor-check-in-out-interface';

const TodayVisitorTable: React.FC<IWalkInVisitorTableProps> = ({ onClick }) => (
  <>
    <Box display="flex" alignItems="center" flexDirection="row" gap={1} py="20px">
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
    </Box>
    <CustomizableTable
      tableId="today-visitor-table"
      searchFieldProps={{
        placeholder: 'Search by Name,...',
        label: 'Search by Name...',
        sx: {
          maxWidth: '400px',
          width: '100%',
        },
      }}
      noDataText={<>No Visitor Found.</>}
      columns={[
        {
          label: 'Visitor Name',
          id: 'visitorName',
        },
        {
          label: 'Visiting Contact',
          id: 'visitorPhone',
        },
        {
          label: 'Visiting Email',
          id: 'visitorEmail',
        },

        {
          label: 'Visiting Date',
          id: 'visitingDate',

          filterType: 'date' as const,
          render: (value) => (value ? dayjs(value).format('DD MMM YYYY') : null),
        },
        {
          label: 'Visiting Time',
          filterType: 'string' as const,
          id: 'visitingTime',
          isFilter: true,
          isSort: false,

          render: (value) => (value ? dayjs(value).format('DD MMM YYYY') : null),
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: '130px',
          filterType: 'enum' as const,
          enumOptions: VisitorVisitingStatusOptions,
          render(value) {
            const color = VisitorVisitingStatusColors[
              value as VisitorVisitingStatusType
            ] as LabelColor;
            return <Label color={color}>{VisitorVisitingStatusType[value]}</Label>;
          },
        },
        {
          id: 'action',
          label: 'Actions',
          align: 'left',
          minWidth: 100,
          sticky: true,
          isFilter: false,
          isSort: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                placement="right-top"
                showThreeDots
                //   showDeleteIcon
                //   showEditIcon
                //   showViewIcon
                handleDeleteClick={() => {
                  onClick(row as IWalkInVisitorFormValues, 'delete');
                }}
                handleEditClick={() => {
                  onClick(row as IWalkInVisitorFormValues, 'edit');
                }}
                handleViewClick={() => {
                  onClick(row as IWalkInVisitorFormValues, 'view');
                }}
                actions={({ popover }) => (
                  <MenuList>
                    {row.status === 1 && (
                      <MenuItem
                        onClick={() => {
                          // onClick(row as IMyResources, 'concern');
                          popover.onClose();
                        }}
                      >
                        <Iconify
                          icon="hugeicons:calendar-check-in-02"
                          sx={{ height: '16px', width: '16px' }}
                        />
                        Check Out
                      </MenuItem>
                    )}
                    {row.status === 0 && (
                      <MenuItem
                        onClick={() => {
                          // onClick(row as IMyResources, 'concern');
                          popover.onClose();
                        }}
                      >
                        <Iconify
                          icon="hugeicons:calendar-check-out-02"
                          sx={{ height: '16px', width: '16px' }}
                        />
                        Check In
                      </MenuItem>
                    )}
                  </MenuList>
                )}
              />
            );
          },
        },
      ]}
      data={data}
    />
  </>
);

export default TodayVisitorTable;
