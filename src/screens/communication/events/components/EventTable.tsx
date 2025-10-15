'use client';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { useTheme } from '@mui/material/styles';
import { RemoveCircle } from '@mui/icons-material';
import React, { useMemo, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Tab, Tabs, MenuList, MenuItem, Typography } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { EventStatus, EventStatusColor, EventStatusOptions } from 'src/enums/event-type';

import type { IEventAnnouncement } from '../type';
import type { IAudience } from '../../announcement/type';

interface IEventAnnouncementTableProps {
  data: IEventAnnouncement[];
  onEdit: (row: IEventAnnouncement) => void;
  onDelete: (row: IEventAnnouncement) => void;
  onView: (row: IEventAnnouncement) => void;
  onPublish: (row: IEventAnnouncement) => void;
}

const EventAnnouncementTable: React.FC<IEventAnnouncementTableProps> = ({
  data,
  onEdit,
  onDelete,
  onView,
  onPublish,
}) => {
  const theme = useTheme();

  // tab counts
  const announcementCounts = useMemo(
    () => ({
      all: data?.length || 0,
      active: data?.filter((i) => i.status === EventStatus.Active)?.length || 0,
      upcoming: data?.filter((i) => i.status === EventStatus.Upcoming)?.length || 0,
      completed: data?.filter((i) => i.status === EventStatus.Completed)?.length || 0,
    }),
    [data]
  );

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onDelete(row as IEventAnnouncement);
          }}
        >
          <RemoveCircle sx={{ width: '20px', height: '20px', color: 'error.main' }} /> Remove
        </MenuItem>
      </MenuList>
    ),
    [onDelete]
  );

  const tabs = useTabs('All');

  const TABS = [
    { label: 'All', value: 'All', count: announcementCounts.all, color: 'default' },
    {
      label: 'Active',
      value: EventStatus.Active,
      count: announcementCounts.active,
      color: 'success',
    },
    {
      label: 'Upcoming',
      value: EventStatus.Upcoming,
      count: announcementCounts.upcoming,
      color: 'info',
    },
    {
      label: 'Completed',
      value: EventStatus.Completed,
      count: announcementCounts.completed,
      color: 'warning',
    },
  ];

  const tableData = useMemo(
    () => (tabs.value === 'All' ? data : data?.filter((i) => i.status === tabs.value)),
    [data, tabs.value]
  );

  return (
    <Box>
      {/* Tabs */}
      <Box display="flex" justifyContent="space-between" sx={{ mt: 1, mb: 2 }}>
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

      {/* Table */}
      <CustomizableTable
        tableId="event-announcement-table"
        data={tableData || []}
        columns={[
          { id: 'title', label: 'Title', align: 'left', sticky: true },
          { id: 'type', label: 'Type', align: 'left' },
          {
            id: 'audience',
            label: 'Audience',
            align: 'left',
            render: (value, row) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {row.audience?.map((aud: IAudience) => (
                  <Box key={aud.value} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <SubjectColorIndicator color={aud.color} />
                    <Typography variant="caption" fontSize="13px">
                      {aud.name}
                    </Typography>
                  </Box>
                ))}
              </Box>
            ),
          },
          {
            id: 'classes',
            label: 'Class',
            align: 'left',
            render: (val) => (val?.length ? val.join(',') : 'All'),
          },
          {
            id: 'divisions',
            label: 'Div',
            align: 'left',
            render: (val) => (val?.length ? val.join(',') : 'All'),
          },
          {
            id: 'eventMode',
            label: 'Mode',
            align: 'left',
            render: (val) => (
              <Typography fontSize="13px">{val === 'online' ? 'Online' : 'Offline'}</Typography>
            ),
          },
          {
            id: 'startDate',
            label: 'Start Date',
            filterType: 'date',
            minWidth: 110,
            align: 'left',
            render: (val) => (
              <Typography fontSize="13px">{dayjs(val).format('DD-MM-YYYY')}</Typography>
            ),
          },
          {
            id: 'endDate',
            label: 'End Date',
            filterType: 'date',
            minWidth: 110,
            align: 'left',
            render: (val) => (
              <Typography fontSize="13px">{dayjs(val).format('DD-MM-YYYY')}</Typography>
            ),
          },
          { id: 'createdBy', label: 'Created By', align: 'left', minWidth: 120 },
          {
            id: 'createdOn',
            label: 'Created On',
            align: 'left',
            minWidth: 120,
            render: (val) => (
              <Typography fontSize="13px">{dayjs(val).format('DD-MM-YYYY')}</Typography>
            ),
          },

          {
            id: 'status',
            label: 'Status',
            align: 'left',
            filterType: 'enum',
            enumOptions: EventStatusOptions,
            sticky: true,
            render: (val) => (
              <Label variant="soft" color={EventStatusColor[val as EventStatus] as any}>
                {EventStatus[val as EventStatus]}
              </Label>
            ),
          },
          {
            id: 'actions',
            label: 'Actions',
            align: 'center',
            sticky: true,
            isSort: false,
            isFilter: false,
            render: (_, row) => (
              <ThreeDotsActions
                placement="right-top"
                actions={(prop) => actions({ ...prop, row })}
                showEditIcon
                showViewIcon
                handleEditClick={() => onEdit(row as IEventAnnouncement)}
                handleViewClick={() => onView(row as IEventAnnouncement)}
              />
            ),
          },
        ]}
      />
    </Box>
  );
};

export default EventAnnouncementTable;
