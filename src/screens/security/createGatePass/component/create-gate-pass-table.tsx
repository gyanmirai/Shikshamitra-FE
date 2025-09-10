import type { LabelColor } from 'src/components/label';

import React from 'react';
import dayjs from 'dayjs';
import { Box } from '@mui/material';
import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import data from 'src/json/security/create-request-pass-data.json';
import {
  CreateGatePassStatusType,
  CreateGatePassRequestStatusColor,
  CreateGatePassRequestStatusOptions,
} from 'src/enums/create-gate-pass-statusType';

import type {
  ICreateEmergencyGatePassFormValue,
  ICreateEmergencyGatePassTableProps,
} from '../create-gate-pass-interface';

const CreateGatePassTable: React.FC<ICreateEmergencyGatePassTableProps> = ({ onClick }) => (
  <Box>
    <CustomizableTable
      tableId="create-gate-pass-table"
      searchFieldProps={{
        placeholder: 'Search by Person Name...',
        label: 'Search by Person Name...',
        sx: {
          maxWidth: '400px',
          width: '100%',
        },
      }}
      noDataText={
        <>
          No Request Found{' '}
          <Box
            onClick={() => {
              onClick({} as ICreateEmergencyGatePassFormValue, 'new');
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
            Create Gate Pass
          </Box>
        </>
      }
      columns={[
        { id: 'personName', label: 'Person Name' },
        {
          id: 'time',
          label: 'Time',
          isFilter: false,
          isSort: false,
          render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
        },
        { id: 'reason', label: 'Reason' },

        {
          id: 'emergencyFlag',
          label: 'Emergency Flag',
          align: 'left',
          minWidth: '130px',
          filterType: 'enum',
          enumOptions: CreateGatePassRequestStatusOptions,
          render(value) {
            const color = CreateGatePassRequestStatusColor[
              value as CreateGatePassStatusType
            ] as LabelColor;
            return <Label color={color}>{CreateGatePassStatusType[value]}</Label>;
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
                  onClick(row as ICreateEmergencyGatePassFormValue, 'delete');
                }}
                handleEditClick={() => {
                  onClick(row as ICreateEmergencyGatePassFormValue, 'edit');
                }}
                handleViewClick={() => {
                  onClick(row as ICreateEmergencyGatePassFormValue, 'view');
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

export default CreateGatePassTable;
