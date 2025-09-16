'use client';

import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { Box, Tab, Tabs, Typography } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import {
  HolidayStatus,
  HolidayStatusColor,
  HolidayStatusOptions,
} from 'src/enums/holiday-status-type';

import type { IHoliday, IHolidayTableProps } from './type';

const HolidayTable: React.FC<IHolidayTableProps> = ({ data, onEdit, onDelete, onPublish }) => {
  // counts for tabs
  const holidayCounts = useMemo(
    () => ({
      all: data?.length || 0,
      ongoing: data?.filter((i) => i.status === HolidayStatus.Ongoing)?.length || 0,
      upcoming: data?.filter((i) => i.status === HolidayStatus.Upcoming)?.length || 0,
      completed: data?.filter((i) => i.status === HolidayStatus.Completed)?.length || 0,
    }),
    [data]
  );

  const tabs = useTabs('All');

  const TABS = useMemo(
    () => [
      {
        label: 'All',
        value: 'All',
        count: holidayCounts.all,
        color: 'default',
      },
      {
        label: 'Ongoing',
        value: HolidayStatus.Ongoing,
        count: holidayCounts.ongoing,
        color: 'success',
      },
      {
        label: 'Upcoming',
        value: HolidayStatus.Upcoming,
        count: holidayCounts.upcoming,
        color: 'warning',
      },
      {
        label: 'Completed',
        value: HolidayStatus.Completed,
        count: holidayCounts.completed,
        color: 'info',
      },
    ],
    [holidayCounts]
  );

  const tableData = useMemo(
    () => (tabs.value === 'All' ? data || [] : data?.filter((i) => i.status === tabs.value)),
    [data, tabs.value]
  );

  return (
    <Box>
      {/* Tabs */}
      <Box display="flex" justifyContent="space-between" sx={{ mt: '4px', mb: 2 }}>
        <Tabs
          value={tabs.value}
          onChange={tabs.onChange}
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
                  {tab.label}
                  <Label color={(tab?.color as LabelColor) || 'default'}>{tab.count}</Label>
                </Box>
              }
              value={tab.value}
            />
          ))}
        </Tabs>
      </Box>

      {/* Table */}
      <CustomizableTable
        tableId="holiday-table"
        columns={[
          { id: 'holidayName', label: 'Holiday Name', align: 'left' },
          { id: 'holidayType', label: 'Type', align: 'left' },
          { id: 'importanceLevel', label: 'Importance', align: 'left' },
          {
            id: 'audience',
            label: 'Audience',
            align: 'left',
            render: (value) => <Box>{value.join(', ')}</Box>,
          },
          {
            id: 'startDate',
            label: 'Start Date',
            filterType: 'date',
            align: 'left',
            render: (value) => (
              <Typography fontSize="12px">{dayjs(value).format('DD MMM YYYY')}</Typography>
            ),
          },
          {
            id: 'endDate',
            label: 'End Date',
            filterType: 'date',
            align: 'left',
            render: (value) => (
              <Typography fontSize="12px">{dayjs(value).format('DD MMM YYYY')}</Typography>
            ),
          },
          { id: 'createdBy', label: 'Created By', align: 'left' },
          { id: 'createdOn', label: 'Created On', filterType: 'date', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            filterType: 'enum',
            enumOptions: HolidayStatusOptions,
            sticky: true,
            render: (value) => (
              <Label
                variant="soft"
                color={HolidayStatusColor[value as HolidayStatus] as LabelColor}
              >
                {HolidayStatus[value as HolidayStatus]}
              </Label>
            ),
          },
          {
            id: 'action',
            label: 'Action',
            isSort: false,
            isFilter: false,
            sticky: true,
            render: (_, row) => (
              <ThreeDotsActions
                placement="right-top"
                showEditIcon
                showDeleteIcon
                showThreeDots={false}
                handleEditClick={() => onEdit(row as IHoliday)}
                handleDeleteClick={() => onDelete(row.id)}
              />
            ),
          },
        ]}
        data={tableData || []}
      />
    </Box>
  );
};

export default HolidayTable;
