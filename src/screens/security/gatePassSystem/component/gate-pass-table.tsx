import type { LabelColor } from 'src/components/label';

import React from 'react';
import dayjs from 'dayjs';

import { Box } from '@mui/material';

import data from 'src/json/security/gate-pass-request-data.json';
import {
  GatePassRequestStatusType,
  GatePassRequestStatusColor,
  GatePassRequestStatusOptions,
} from 'src/enums/gate-pass-request-status';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type {
  IGatePassFormValues,
  IGatePassRequestTableProps,
} from '../gate-pass-system-interface';

const GatePassRequestTable: React.FC<IGatePassRequestTableProps> = ({ onClick }) => (
  <Box>
    <CustomizableTable
      tableId="gate-pass-request-table"
      searchFieldProps={{
        placeholder: 'Search by Student Name...',
        label: 'Search by Student Name...',
      }}
      noDataText={
        <>
          No Gate Request Found{' '}
          <Box
            onClick={() => {
              onClick({} as IGatePassFormValues, 'new');
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
          id: 'studentName',
          label: 'Student Name',
          align: 'left',
        },
        {
          id: 'studentId',
          label: 'Student ID',
          align: 'left',
        },
        {
          id: 'reason',
          label: 'Reason',
          align: 'left',
        },
        {
          id: 'validFrom',
          label: 'Valid From',
          align: 'left',
          filterType: 'date',
          render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : null),
        },
        {
          id: 'validTo',
          label: 'Valid To',
          align: 'left',
          filterType: 'date',
          render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : null),
        },
        {
          id: 'status',
          label: 'Status',
          align: 'left',
          minWidth: '130px',
          filterType: 'enum',
          enumOptions: GatePassRequestStatusOptions,
          render(value) {
            const color = GatePassRequestStatusColor[
              value as GatePassRequestStatusType
            ] as LabelColor;
            return <Label color={color}>{GatePassRequestStatusType[value]}</Label>;
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
                  onClick(row as IGatePassFormValues, 'delete');
                }}
                handleEditClick={() => {
                  onClick(row as IGatePassFormValues, 'edit');
                }}
                handleViewClick={() => {
                  onClick(row as IGatePassFormValues, 'view');
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

export default GatePassRequestTable;
