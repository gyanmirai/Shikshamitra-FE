import React from 'react';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import data from 'src/json/security/guard-management/guard-shifts.json';

import type { IGuardShiftFormValues, IGuardShiftTableProps } from '../guard-settings-interface';

const GuardShiftsTable: React.FC<IGuardShiftTableProps> = ({ onClick }) => (
  <Box>
    <CustomizableTable
      tableId="guard-shift-table"
      searchFieldProps={{
        placeholder: 'Search by  Name...',
        label: 'Search by  Name...',
      }}
      noDataText={
        <>
          No Shifts Found{' '}
          <Box
            onClick={() => {
              onClick({} as IGuardShiftFormValues, 'new');
            }}
            color="primary.main"
            fontWeight={600}
            sx={{
              '&:hover': {
                cursor: 'pointer',
                textDecoration: 'underline',
              },
            }}
          >
            Add Shifts
          </Box>
        </>
      }
      columns={[
        {
          id: 'name',
          label: 'Shift Name',
          align: 'left',
        },

        {
          id: 'startTime',
          label: 'Start Time',
          filterType: 'string' as const,
          align: 'left',
          isFilter: true,
          isSort: false,
          render: (value) => (value ? dayjs(value, 'HH:mm').format('HH:mm') : null),
        },
        {
          id: 'endTime',
          label: 'End Time',
          filterType: 'string' as const,
          align: 'left',
          isFilter: true,
          isSort: false,
          render: (value) => (value ? dayjs(value, 'HH:mm').format('HH:mm') : null),
        },

        {
          id: 'action',
          label: 'Actions',
          minWidth: 80,
          isSort: false,
          sticky: true,
          isFilter: false,
          render(value, row) {
            return (
              <ThreeDotsActions
                showThreeDots={false}
                placement="right-top"
                showDeleteIcon
                showEditIcon
                showViewIcon
                handleDeleteClick={() => {
                  onClick(row as IGuardShiftFormValues, 'delete');
                }}
                handleEditClick={() => {
                  onClick(row as IGuardShiftFormValues, 'edit');
                }}
                handleViewClick={() => {
                  onClick(row as IGuardShiftFormValues, 'view');
                }}
              />
            );
          },
        },
      ]}
      data={data}
    />
  </Box>
);

export default GuardShiftsTable;
