import type { LabelColor } from 'src/components/label';

import React from 'react';
import dayjs from 'dayjs';
import { Box, Grid } from '@mui/material';
import { Label } from 'src/components/label';
import { DatePicker } from '@mui/x-date-pickers';
import data from 'src/json/security/staff-request-data.json';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import {
  CommonRequestStatusType,
  CommonRequestStatusTypeColor,
  CommonRequestStatusTypeOptions,
} from 'src/enums/common-request-statusType';

import type {
  IGatePassStaffFormValues,
  IGatePassStaffTableProps,
} from '../gate-pass-staff-interface';

const GateStaffPassRequestTable: React.FC<IGatePassStaffTableProps> = ({ onClick }) => (
  <Box>
    <Box display="flex" alignItems="center" flexDirection="row" gap={2} py="20px">
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
      tableId="early-gate-pass-request-table"
      searchFieldProps={{
        placeholder: 'Search ...',
        label: 'Search ...',
      }}
      noDataText={
        <>
          No Request Found{' '}
          <Box
            onClick={() => {
              onClick({} as IGatePassStaffFormValues, 'new');
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
            Request Gate Pass
          </Box>
        </>
      }
      columns={[
        {
          id: 'leaveDate',
          label: 'Requested Date',
          filterType: 'date',
          render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : null),
        },
        {
          id: 'leaveTime',
          label: 'Requested Time',

          isFilter: false,
          isSort: false,
          render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
        },
        { id: 'reasonForLeave', label: 'Reason' },
        {
          id: 'status',
          label: 'Status',
          filterType: 'enum',
          enumOptions: CommonRequestStatusTypeOptions,
          minWidth: '130px',
          align: 'left',
          render(value, row) {
            const color = CommonRequestStatusTypeColor[
              value as CommonRequestStatusType
            ] as LabelColor;

            const val = CommonRequestStatusType[value];
            return <Label color={color}>{val}</Label>;
          },
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
                  onClick(row as IGatePassStaffFormValues, 'delete');
                }}
                handleEditClick={() => {
                  onClick(row as IGatePassStaffFormValues, 'edit');
                }}
                handleViewClick={() => {
                  onClick(row as IGatePassStaffFormValues, 'view');
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

export default GateStaffPassRequestTable;
