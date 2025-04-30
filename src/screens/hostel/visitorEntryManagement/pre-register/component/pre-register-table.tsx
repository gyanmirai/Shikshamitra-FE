import type { VisitorStatusType } from 'src/enums/visitor-status-type';

import React from 'react';
import dayjs from 'dayjs';

import { Box } from '@mui/material';

import visitorLogData from 'src/json/hostel/visitorManagement/pre-registerData.json';
import { VisitorStatusColors, VisitorStatusOptions } from 'src/enums/visitor-status-type';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IPreVisitorLog, IPreRegisterTableProps } from '../pre-register-interface';

const PreRegisterTable: React.FC<IPreRegisterTableProps> = ({ onClick }) => (
  <Box>
    <CustomizableTable
      tableId="visitor-log-data-table"
      searchFieldProps={{
        placeholder: 'Search by Visitor Name...',
        label: 'Search by Visitor Name...',
      }}
      noDataText={
        <>
          No Pre-Visitor Data Found{' '}
          <Box
            onClick={() => {
              onClick({} as IPreVisitorLog, 'new');
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
            Add Pre-Visitor
          </Box>
        </>
      }
      columns={[
        { id: 'visitorName', label: 'Visitor Name', align: 'left' },
        { id: 'idProof', label: 'ID Proof', align: 'left' },

        { id: 'contactNo', label: 'Contact Number', align: 'left' },

        {
          id: 'visitDate',
          label: 'Visit Date',
          align: 'left',
          filterType: 'date',
          render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : null),
        },
        {
          id: 'visitTime',
          label: 'Visit Time',
          align: 'left',
          isFilter: false,
          isSort: false,

          render: (value) => (value ? dayjs(value).format('hh:mm A') : null),
        },
        { id: 'reasonForVisit', label: 'Reason for Visit', align: 'left' },
        {
          id: 'status',
          label: 'Status',
          filterType: 'enum',
          enumOptions: VisitorStatusOptions,
          minWidth: '130px',
          align: 'left',
          render(value, row) {
            const color =
              VisitorStatusColors[
                VisitorStatusOptions.find((opt) => opt.label === value)?.value as VisitorStatusType
              ] ?? 'warning';

            return <Label color={color}>{value}</Label>;
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
                  onClick(row as IPreVisitorLog, 'delete');
                }}
                handleEditClick={() => {
                  onClick(row as IPreVisitorLog, 'edit');
                }}
                handleViewClick={() => {
                  onClick(row as IPreVisitorLog, 'view');
                }}
              />
            );
          },
        },
      ]}
      data={visitorLogData}
    />
  </Box>
);

export default PreRegisterTable;
