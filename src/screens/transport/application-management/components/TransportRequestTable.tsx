'use client';

import type { LabelColor } from 'src/components/label';

import { useTabs } from 'src/hooks/useTabs';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RemoveCircle } from '@mui/icons-material';
import React, { useMemo, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Tab, Tabs, MenuList, MenuItem, Typography } from '@mui/material';
import {
  TransportStatus,
  TransportStatusColor,
  TransportStatusOptions,
} from 'src/enums/trasnport-status';

import type { ITransportApplicationPayload } from '../type';

interface ITransportRequestTableProps {
  data: ITransportApplicationPayload[];
  onView: (row: ITransportApplicationPayload) => void;
  onDelete?: (row: ITransportApplicationPayload) => void;
  onChangeStop?: (row: ITransportApplicationPayload) => void;
}

const TransportRequestTable: React.FC<ITransportRequestTableProps> = ({
  data: inputData,
  onView,
  onDelete,
  onChangeStop,
}) => {
  // Tab management
  const data = useMemo(() => inputData || [], [inputData]);
  const tabs = useTabs('All');

  const counts = useMemo(
    () => ({
      all: data.length,
      pending: data.filter((d) => d.status === 0).length,
      approve: data.filter((d) => d.status === 1).length,
      reject: data.filter((d) => d.status === 2).length,
      hold: data.filter((d) => d.status === 3).length,
    }),
    [data]
  );

  const TABS = [
    { label: 'All', value: 'All', count: counts.all, color: 'default' },
    { label: 'Pending', value: 0, count: counts.pending, color: 'warning' },
    { label: 'Approve', value: 1, count: counts.approve, color: 'success' },
    { label: 'Reject', value: 2, count: counts.reject, color: 'error' },
    { label: 'Hold', value: 3, count: counts.hold, color: 'info' },
  ];

  // Filter data based on tab
  const tableData = useMemo(
    () => (tabs.value === 'All' ? data : data.filter((d) => d.status === tabs.value)),
    [tabs.value, data]
  );

  // Actions menu (View only)
  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        {onDelete && (
          <MenuItem
            onClick={() => {
              onDelete(row);
              pop.onClose();
            }}
            sx={{ color: 'error.main' }}
          >
            <RemoveCircle sx={{ width: 20, height: 20, mr: 1 }} />
            Remove
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            onChangeStop?.(row);
            pop.onClose();
          }}
        >
          <Iconify icon={GlobalIcons.edit} width={18} height={18} />
          Change Stop
        </MenuItem>
      </MenuList>
    ),
    [onDelete, onChangeStop]
  );

  return (
    <>
      {/* Tabs Header */}
      <Box display="flex" justifyContent="space-between" sx={{ mt: 1, mb: 2, px: 2 }}>
        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
          sx={{ '& .MuiTabs-flexContainer': { gap: 2 }, flexGrow: 1 }}
        >
          {TABS.map((tab) => (
            <Tab
              key={tab.value}
              sx={{ fontSize: '12px' }}
              value={tab.value}
              label={
                <Box display="flex" alignItems="center" gap={1}>
                  {tab.label}
                  <Label color={tab.color as any}>{tab.count}</Label>
                </Box>
              }
            />
          ))}
        </Tabs>
      </Box>
      {/* Table */}{' '}
      {tabs.value === 'All' ? (
        <CustomizableTable
          tableId="transport-request-table"
          data={tableData || []}
          noDataText="No requests found"
          columns={[
            { id: 'name', label: 'Name', align: 'left', sticky: true },
            { id: 'role', label: 'Role', align: 'left' },
            {
              id: 'class',
              label: 'Class',
              align: 'left',
            },
            {
              id: 'division',
              label: 'Division',
              align: 'left',
            },
            {
              id: 'grNo',
              label: 'GR No.',
              align: 'left',
              minWidth: 120,
            },
            {
              id: 'rollNo',
              label: 'Roll No.',
              align: 'left',
              minWidth: 90,
              filterType: 'number',
            },
            {
              id: 'searchStop',
              label: 'Preferred Stop',
              align: 'left',
              minWidth: 170,
            },
            {
              id: 'areaLocality',
              label: 'Area Locality',
              minWidth: 160,
              align: 'left',
              render: (val) => (
                <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                  {val}
                </Typography>
              ),
            },
            {
              id: 'status',
              label: 'Status',
              align: 'left',
              filterType: 'enum',
              minWidth: 100,
              enumOptions: TransportStatusOptions,
              sticky: true,
              render: (val) => (
                <Label
                  variant="soft"
                  color={TransportStatusColor[val as TransportStatus] as LabelColor}
                >
                  {TransportStatus[val as number]}
                </Label>
              ),
            },
            {
              id: 'actions',
              label: 'Actions',
              align: 'left',
              minWidth: 50,
              sticky: true,
              isSort: false,
              isFilter: false,
              render: (_, row) => (
                <ThreeDotsActions
                  placement="right-top"
                  actions={(prop) => actions({ ...prop, row })}
                  showViewIcon
                  showThreeDots={false}
                  handleViewClick={() => onView(row as ITransportApplicationPayload)}
                />
              ),
            },
          ]}
        />
      ) : tabs.value === 1 || tabs.value === 2 ? (
        <CustomizableTable
          tableId="transport-request-table"
          data={tableData || []}
          noDataText="No requests found"
          columns={[
            { id: 'name', label: 'Name', align: 'left', sticky: true },
            { id: 'role', label: 'Role', align: 'left', minWidth: 80 },
            {
              id: 'class',
              label: 'Class',
              align: 'left',
            },
            {
              id: 'division',
              label: 'Division',
              align: 'left',
            },
            {
              id: 'grNo',
              label: 'GR No.',
              align: 'left',
              minWidth: 140,
            },
            {
              id: 'rollNo',
              label: 'Roll No.',
              align: 'left',
              minWidth: 90,
              filterType: 'number',
            },
            {
              id: 'searchStop',
              label: 'Preferred Stop',
              minWidth: 170,
              align: 'left',
            },
            {
              id: 'areaLocality',
              label: 'Area Locality',
              align: 'left',
              minWidth: 160,
              render: (val) => (
                <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                  {val}
                </Typography>
              ),
            },
          ]}
        />
      ) : (
        (tabs.value === 0 || tabs.value === 3) && (
          <CustomizableTable
            tableId="transport-request-table"
            data={tableData || []}
            noDataText="No requests found"
            columns={[
              { id: 'name', label: 'Name', align: 'left', sticky: true },
              { id: 'role', label: 'Role', align: 'left' },
              {
                id: 'class',
                label: 'Class',
                align: 'left',
              },
              {
                id: 'division',
                label: 'Division',
                align: 'left',
              },
              {
                id: 'grNo',
                label: 'GR No.',
                align: 'left',
                minWidth: 120,
              },
              {
                id: 'rollNo',
                label: 'Roll No.',
                align: 'left',
                minWidth: 90,
                filterType: 'number',
              },
              {
                id: 'searchStop',
                label: 'Preferred Stop',
                align: 'left',
                minWidth: 140,
              },
              {
                id: 'areaLocality',
                label: 'Area Locality',
                minWidth: 130,
                align: 'left',
                render: (val) => (
                  <Typography variant="body2" noWrap sx={{ maxWidth: 220 }}>
                    {val}
                  </Typography>
                ),
              },
              {
                id: 'actions',
                label: 'Actions',
                align: 'left',
                isSort: false,
                sticky: true,
                minWidth: 80,
                isFilter: false,
                render: (_, row) => (
                  <ThreeDotsActions
                    placement="right-top"
                    actions={(prop) => actions({ ...prop, row })}
                    showViewIcon
                    handleViewClick={() => onView(row as ITransportApplicationPayload)}
                  />
                ),
              },
            ]}
          />
        )
      )}
    </>
  );
};

export default TransportRequestTable;
