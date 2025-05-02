import type { LabelColor } from 'src/components/label';

import React from 'react';
import dayjs from 'dayjs';

import { Box } from '@mui/material';

import data from 'src/json/security/early-pass-request-data.json';
import {
  CommonRequestStatusType,
  CommonRequestStatusTypeColor,
  CommonRequestStatusTypeOptions,
} from 'src/enums/common-request-statusType';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type {
  IGetEarlyPassRequestFormValues,
  IGetEarlyPassRequestTableProps,
} from '../gate-pass-parent-interface';

const EarlyGatePassRequestTable: React.FC<IGetEarlyPassRequestTableProps> = ({ onClick }) => (
  <Box>
    <CustomizableTable
      tableId="early-gate-pass-request-table"
      searchFieldProps={{
        placeholder: 'Search by Student Name...',
        label: 'Search by Student Name...',
      }}
      noDataText={
        <>
          No Early Request Found{' '}
          <Box
            onClick={() => {
              onClick({} as IGetEarlyPassRequestFormValues, 'new');
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
            Request Early Pickup
          </Box>
        </>
      }
      columns={[
        { id: 'childName', label: 'Child Name' },
        {
          id: 'pickupDate',
          label: 'Pickup Date',
          filterType: 'date',
          render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : null),
        },
        {
          id: 'pickupTime',
          label: 'Pickup Time',

          isFilter: false,
          isSort: false,
          render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
        },
        { id: 'reasonForPickup', label: 'Reason for Pickup' },
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
                  onClick(row as IGetEarlyPassRequestFormValues, 'delete');
                }}
                handleEditClick={() => {
                  onClick(row as IGetEarlyPassRequestFormValues, 'edit');
                }}
                handleViewClick={() => {
                  onClick(row as IGetEarlyPassRequestFormValues, 'view');
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

export default EarlyGatePassRequestTable;
