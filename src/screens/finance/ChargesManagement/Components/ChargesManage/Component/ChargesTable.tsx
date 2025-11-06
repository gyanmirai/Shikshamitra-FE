import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  ChargesPriorityStatus,
  ChargesPriorityStatusOptions,
} from 'src/enums/charges-priority-status';
import {
  ChargesPaymentStatus,
  ChargesPaymentStatusColors,
  ChargesPaymentStatusOptions,
} from 'src/enums/fee-charges-status';

import type { IChargeData } from './type';

const ChargesTable = ({
  data,
  onView,
  onEdit,
  onAddCharge,
}: {
  data: IChargeData[];
  onView: (data: IChargeData) => void;
  onEdit: (data: IChargeData) => void;
  onAddCharge: () => void;
}) => {
  const tableData = useMemo(
    () =>
      data?.map((item: IChargeData) => ({
        ...item,
        category: item.category,
        class: item.class, // or item.standardName if you want display value
        divisions: item.divisions || [], // ensure array for render
        students: item.students ?? 0,
        amount:
          item.amount !== undefined && item.amount !== null
            ? parseFloat(String(item.amount).replace(/,/g, ''))
            : 0,
        description: item.description || '-',
        priority: item.priority, // numeric/enum → resolved in render fn
        dueDate: item.dueDate ? dayjs(item.dueDate).format('DD-MM-YYYY') : '-',
        status: item.status, // numeric/enum → resolved in render fn
      })),
    [data]
  );
  return (
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
        {
          id: 'category',
          label: 'Charge Category',
          sticky: true,
          align: 'left',
          minWidth: '160px',
          isFilter: true,
        },
        { id: 'class', label: 'Class', align: 'left', isFilter: true },
        {
          id: 'divisions',
          label: 'Divisions',
          align: 'left',
          isFilter: true,
          render: (value) => <Box>{value.join(', ')}</Box>,
        },
        { id: 'students', label: 'Students', align: 'left', filterType: 'number', isFilter: true },
        {
          id: 'amount',
          label: 'Amount',
          filterType: 'number',
          align: 'left',
          isFilter: true,
          render: (value) => `₹ ${value.toLocaleString()}`,
        },
        {
          id: 'description',
          label: 'Description',
          align: 'left',
          render: (value) => (
            <Typography
              variant="caption"
              fontSize="13px"
              sx={{
                maxWidth: 300,
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {value || '-'}
            </Typography>
          ),
        },
        {
          id: 'priority',
          label: 'Priority',
          align: 'left',
          filterType: 'enum',
          isFilter: true,
          enumOptions: ChargesPriorityStatusOptions,
          render(value, row) {
            return (
              <Typography sx={{ fontSize: '13px' }}>
                {ChargesPriorityStatus[value as ChargesPriorityStatus]}
              </Typography>
            );
          },
        },
        { id: 'dueDate', label: 'Due Date', align: 'left', filterType: 'date', minWidth: '110px' },
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
                showEditIcon
                showThreeDots={false}
                handleViewClick={() => onView(row as IChargeData)}
                handleEditClick={() => onEdit(row as IChargeData)}
              />
            );
          },
        },
      ]}
      data={tableData || []}
    />
  );
};

export default ChargesTable;
