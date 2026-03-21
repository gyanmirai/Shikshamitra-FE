'use client';

import type { IColumn } from 'src/components/customizable-table/types';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/useTabs';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { RemoveCircle } from '@mui/icons-material';
import React, { useMemo, useCallback } from 'react';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { Box, Tab, Tabs, Paper, MenuList, MenuItem, Typography } from '@mui/material';
import { EventStatus, EventStatusColor, EventStatusOptions } from 'src/enums/event-type';

import type { IEventAnnouncement } from '../type';

interface IEventAnnouncementTableProps {
  status: string;
  setStatus: (value: string) => void;
  isLoading?: boolean;
  setOpen: (value: boolean) => void;
  data: IEventAnnouncement[];
  onEdit: (row: IEventAnnouncement) => void;
  onDelete: (row: IEventAnnouncement) => void;
  onView: (row: IEventAnnouncement) => void;
  onPublish: (row: IEventAnnouncement) => void;
  onUploadPhotoVideo: (row: IEventAnnouncement) => void;
  onViewGallery: (row: IEventAnnouncement) => void;
}

const EventAnnouncementTable: React.FC<IEventAnnouncementTableProps> = ({
  status,
  setStatus,
  isLoading,
  setOpen,
  data,
  onEdit,
  onDelete,
  onView,
  onPublish,
  onUploadPhotoVideo,
  onViewGallery,
}) => {
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
            pop.onClose();
          }}
        >
          <RemoveCircle sx={{ width: '20px', height: '20px', color: 'error.main' }} /> Remove
        </MenuItem>
        {row.status === 2 && (
          <>
            <MenuItem
              onClick={() => {
                onUploadPhotoVideo(row as IEventAnnouncement);
              }}
            >
              <Iconify icon={GlobalIcons.upload} width={16} height={16} />
              Upload Photo/Video
            </MenuItem>
            <MenuItem
              onClick={() => {
                onViewGallery(row as IEventAnnouncement);
              }}
            >
              <Iconify icon={GlobalIcons.eye} width={16} height={16} />
              View Gallery
            </MenuItem>
          </>
        )}
      </MenuList>
    ),
    [onDelete, onUploadPhotoVideo, onViewGallery]
  );

  const tabs = useTabs(status);

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
      color: 'warning',
    },
    {
      label: 'Completed',
      value: EventStatus.Completed,
      count: announcementCounts.completed,
      color: 'info',
    },
  ];

  const tableData = useMemo(
    () => (tabs.value === 'All' ? data : data?.filter((i) => i.status === tabs.value)),
    [data, tabs.value]
  );

  const allColumns: IColumn[] = useMemo(
    () => [
      { id: 'title', label: 'Title', align: 'left', sticky: true, minWidth: 150 },
      {
        id: 'eventType.name',
        label: 'Type',
        align: 'left',
        render: (value, row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SubjectColorIndicator color={row.color} />
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'audienceIds',
        label: 'Target Group',
        align: 'left',
        minWidth: 150,
        render(value: any) {
          return value.join(', ');
        },
      },
      {
        id: 'eventMode',
        label: 'Mode',
        align: 'left',
        render: (val: string) => (
          <Typography fontSize="13px">{val === 'online' ? 'Online' : 'Offline'}</Typography>
        ),
      },
      {
        id: 'startDate',
        label: 'Start Date',
        filterType: 'date',
        minWidth: 110,
        align: 'left',
        render: (val: string) => (
          <Typography fontSize="13px">{dayjs(val).format('DD-MM-YYYY')}</Typography>
        ),
      },
      {
        id: 'endDate',
        label: 'End Date',
        filterType: 'date',
        minWidth: 110,
        align: 'left',
        render: (val: string) => (
          <Typography fontSize="13px">{dayjs(val).format('DD-MM-YYYY')}</Typography>
        ),
      },
      { id: 'createdBy', label: 'Created By', align: 'left', minWidth: 120 },
      {
        id: 'createdOn',
        label: 'Created On',
        align: 'left',
        minWidth: 120,
        render: (val: string) => (
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
        render: (val: EventStatus) => (
          <Label variant="soft" color={EventStatusColor[val] as any}>
            {EventStatus[val]}
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
        render: (_: any, row: any) => (
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
    ],
    [actions, onEdit, onView]
  );

  const otherColumns: IColumn[] = useMemo(
    () => [
      { id: 'title', label: 'Title', align: 'left', sticky: true, minWidth: 150 },
      {
        id: 'eventType.name',
        label: 'Type',
        align: 'left',
        render: (value, row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <SubjectColorIndicator color={row.color} />
            <Typography variant="caption" fontSize="13px">
              {value}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'audienceIds',
        label: 'Target Group',
        align: 'left',
        minWidth: 150,
        render(value: any) {
          return value.join(', ');
        },
      },
      {
        id: 'mode',
        label: 'Mode',
        align: 'left',
        render: (val: number) => (
          <Typography fontSize="13px">{val === 0 ? 'Online' : 'Offline'}</Typography>
        ),
      },
      {
        id: 'startDate',
        label: 'Start Date',
        filterType: 'date',
        minWidth: 110,
        align: 'left',
        render: (val: string) => (
          <Typography fontSize="13px">{dayjs(val).format('DD-MM-YYYY')}</Typography>
        ),
      },
      {
        id: 'endDate',
        label: 'End Date',
        filterType: 'date',
        minWidth: 110,
        align: 'left',
        render: (val: string) => (
          <Typography fontSize="13px">{dayjs(val).format('DD-MM-YYYY')}</Typography>
        ),
      },
      { id: 'createdBy', label: 'Created By', align: 'left', minWidth: 120 },
      {
        id: 'createdOn',
        label: 'Created On',
        align: 'left',
        minWidth: 120,
        render: (val: string) => (
          <Typography fontSize="13px">{dayjs(val).format('DD-MM-YYYY')}</Typography>
        ),
      },
      {
        id: 'actions',
        label: 'Actions',
        align: 'center',
        sticky: true,
        isSort: false,
        isFilter: false,
        render: (_: any, row: any) => (
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
    ],
    [actions, onEdit, onView]
  );

  return (
    <>
      {/* Tabs */}
      <Paper
        elevation={2}
        sx={{ mt: 1, mb: 1, display: 'flex', justifyContent: 'space-between', p: 1 }}
      >
        <Tabs
          value={tabs.value}
          onChange={(event, value) => {
            tabs.onChange(event, value);
            setStatus(value);
          }}
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
      </Paper>

      {/* Table */}
      <CustomizableTable
        tableId="event-announcement-table"
        isLoading={isLoading}
        noDataText={
          <>
            No event data found
            <Box
              onClick={() => {
                setOpen(true);
              }}
              color="primary.main"
              fontWeight={600}
              sx={{
                '&:hover': {
                  cursor: 'pointer',
                  color: 'primary.main',
                  textDecoration: 'underline',
                },
              }}
            >
              Add Event
            </Box>
          </>
        }
        data={tableData || []}
        columns={tabs.value === 'All' ? allColumns : otherColumns}
      />
    </>
  );
};

export default EventAnnouncementTable;
