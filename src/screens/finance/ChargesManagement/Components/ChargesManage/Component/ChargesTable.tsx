import type { LabelColor } from 'src/components/label';

import React from 'react';

import { Box } from '@mui/material';

import {
  ChargesPaymentStatus,
  ChargesPaymentStatusColors,
  ChargesPaymentStatusOptions,
} from 'src/enums/fee-charges-status';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IChargeData } from './type';

const ChargesTable = ({
  data,
  onView,
  onAddCharge,
}: {
  data: IChargeData[];
  onView: (data: IChargeData) => void;
  onAddCharge: () => void;
}) => (
  <CustomizableTable
    tableId="charges-table"
    noDataText={
      <>
        No Charges Data Found{' '}
        <Box
          onClick={onAddCharge}
          color="primary.main"
          fontWeight={600}
          sx={{
            '&:hover': {
              cursor: 'pointer',
              textDecoration: 'underline',
            },
          }}
        >
          Add Charge
        </Box>
      </>
    }
    columns={[
      { id: 'category', label: 'Charge Category', align: 'left' },
      { id: 'class', label: 'Class', align: 'left' },
      {
        id: 'divisions',
        label: 'Divisions',
        align: 'left',
        render: (value) => <Box>{value.join(', ')}</Box>,
      },
      { id: 'students', label: 'Students', align: 'left', filterType: 'number' },
      {
        id: 'amount',
        label: 'Amount',
        filterType: 'number',
        align: 'left',
        render: (value) => `₹ ${value.toLocaleString()}`,
      },
      {
        id: 'priority',
        filterType: 'number',
        label: 'Priority',
        align: 'left',
      },
      { id: 'dueDate', label: 'Due Date', align: 'left', filterType: 'date' },
      {
        id: 'status',
        label: 'Status',
        align: 'left',
        filterType: 'enum',
        enumOptions: ChargesPaymentStatusOptions,
        sticky: true,
        render(value, row) {
          const color = ChargesPaymentStatusColors[value as ChargesPaymentStatus] as LabelColor;
          return (
            <Label
              color={color as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'}
            >
              {ChargesPaymentStatus[value as ChargesPaymentStatus]}
            </Label>
          );
        },
      },
      {
        id: 'actions',
        label: 'Action',
        align: 'left',
        isSort: false,
        isFilter: false,
        minWidth: 60,
        sticky: true,
        render(value, row) {
          return (
            <ThreeDotsActions
              placement="right-top"
              showViewIcon
              showThreeDots={false}
              handleViewClick={() => onView(row as IChargeData)}
            />
          );
        },
      },
    ]}
    data={data || []}
  />
);

export default ChargesTable;
