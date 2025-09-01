import type { LabelColor } from 'src/components/label';

import React, { useMemo } from 'react';

import { Box, Tab, Tabs, Typography } from '@mui/material';

import { useTabs } from 'src/hooks/use-tabs';

import {
  ChargesPriorityStatus,
  ChargesPriorityStatusOptions,
} from 'src/enums/charges-priority-status';
import {
  ChargesPaymentStatus,
  ChargesPaymentStatusColors,
  ChargesPaymentStatusOptions,
} from 'src/enums/fee-charges-status';

import { Label } from 'src/components/label';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';

import type { IChargeData } from '../../ChargesManage/Component/type';

interface ChargesApprovalTableProps {
  data: IChargeData[];
  onView: (data: IChargeData) => void;
}

const ChargesApprovalTable: React.FC<ChargesApprovalTableProps> = ({ data, onView }) => {
  const tabs = useTabs('all');

  // Calculate counts by status
  const chargeCounts = useMemo(
    () => ({
      all: data?.length || 0,
      pending: data?.filter((i) => i.status === ChargesPaymentStatus.Pending)?.length || 0,
      approved: data?.filter((i) => i.status === ChargesPaymentStatus.Approved)?.length || 0,
      rejected: data?.filter((i) => i.status === ChargesPaymentStatus.Rejected)?.length || 0,
    }),
    [data]
  );

  // Tabs
  const TABS = useMemo(
    () => [
      {
        label: 'All',
        value: 'all',
        count: chargeCounts.all,
        color: 'default',
      },
      {
        label: 'Pending',
        value: ChargesPaymentStatus.Pending,
        count: chargeCounts.pending,
        color: 'warning',
      },
      {
        label: 'Approved',
        value: ChargesPaymentStatus.Approved,
        count: chargeCounts.approved,
        color: 'success',
      },
      {
        label: 'Rejected',
        value: ChargesPaymentStatus.Rejected,
        count: chargeCounts.rejected,
        color: 'error',
      },
    ],
    [chargeCounts]
  );

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: string | number) => {
    tabs.onChange(event, newValue);
  };

  // Filter data based on selected tab
  const tableData = useMemo(
    () => (tabs.value === 'all' ? data : data?.filter((i: any) => i.status === tabs.value)),
    [data, tabs.value]
  );

  return (
    <Box>
      {/* Tabs */}
      <Tabs
        value={tabs.value}
        onChange={handleTabChange}
        sx={{
          '& .MuiTabs-flexContainer': { gap: 2 },
          flexGrow: 1,
        }}
      >
        {TABS.map((tab) => (
          <Tab
            sx={{ fontSize: '12px' }}
            key={tab.value}
            label={
              <Box display="flex" justifyContent="center" gap={1} alignItems="center">
                {tab.label}{' '}
                <Label
                  variant={tab.value === 'all' ? 'filled' : 'soft'}
                  color={(tab?.color as LabelColor) || 'default'}
                >
                  {tab.count}
                </Label>
              </Box>
            }
            value={tab.value}
          />
        ))}
      </Tabs>

      {/* Table */}
      <CustomizableTable
        tableId="charges-approval-table"
        noDataText="No Charges Found"
        columns={[
          {
            id: 'category',
            label: 'Charge Category',
            align: 'left',
            minWidth: '160px',
            isFilter: true,
          },
          { id: 'class', label: 'Class', align: 'left' },
          {
            id: 'divisions',
            label: 'Division',
            align: 'left',
            render: (value) => <Box>{value.join(', ')}</Box>,
          },
          { id: 'students', label: 'Students', align: 'left', filterType: 'number' },
          {
            id: 'amount',
            label: 'Amount',
            align: 'left',
            filterType: 'number',
            render: (value) => <Box>₹ {value}</Box>,
          },
          {
            id: 'priority',
            label: 'Priority',
            align: 'left',
            filterType: 'enum',
            enumOptions: ChargesPriorityStatusOptions,
            render(value, row) {
              return (
                <Typography sx={{ fontSize: '13px' }}>
                  {ChargesPriorityStatus[value as ChargesPriorityStatus]}
                </Typography>
              );
            },
          },
          {
            id: 'dueDate',
            label: 'Due Date',
            align: 'left',
            filterType: 'date',
            minWidth: '110px',
            isFilter: true,
          },
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
                  color={
                    color as 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info'
                  }
                >
                  {ChargesPaymentStatus[value as ChargesPaymentStatus]}
                </Label>
              );
            },
          },
          {
            id: 'action',
            label: 'Action',
            minWidth: 80,
            align: 'left',
            isSort: false,
            sticky: true,
            isFilter: false,
            render(value, row) {
              return (
                <ThreeDotsActions
                  showThreeDots={false}
                  placement="right-top"
                  showViewIcon
                  handleViewClick={() => {
                    onView(row as IChargeData);
                  }}
                />
              );
            },
          },
        ]}
        data={tableData || []}
      />
    </Box>
  );
};

export default ChargesApprovalTable;
