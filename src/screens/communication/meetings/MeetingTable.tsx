import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/useTabs';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizable-table';
import { Box, Tab, Tabs, IconButton, Typography } from '@mui/material';
import {
  MeetingStatus,
  MeetingStatusColor,
  MeetingStatusOptions,
} from 'src/enums/meeting-status-type';

import type { IMeeting } from './type';

interface IMeetingTableProps {
  data: IMeeting[];
  onEdit: (meeting: IMeeting) => void;
  onDelete: (meeting: IMeeting) => void;
  onView: (meeting: IMeeting) => void;
  onPublish: (meeting: IMeeting) => void;
}

const MeetingTable: React.FC<IMeetingTableProps> = ({
  data,
  onEdit,
  onDelete,
  onView,
  onPublish,
}) => {
  const theme = useTheme();

  // counts for tabs
  const meetingCounts = useMemo(
    () => ({
      all: data?.length || 0,
      draft: data?.filter((i) => i.status === MeetingStatus.Draft)?.length || 0,
      ongoing: data?.filter((i) => i.status === MeetingStatus.Ongoing)?.length || 0,
      completed: data?.filter((i) => i.status === MeetingStatus.Completed)?.length || 0,
    }),
    [data]
  );

  const tabs = useTabs('All');

  const TABS = useMemo(
    () => [
      { label: 'All', value: 'All', count: meetingCounts.all, color: 'default' },
      {
        label: 'Draft',
        value: MeetingStatus.Draft,
        count: meetingCounts.draft,
        color: 'warning',
      },
      {
        label: 'Published',
        value: MeetingStatus.Ongoing,
        count: meetingCounts.ongoing,
        color: 'success',
      },
      {
        label: 'Completed',
        value: MeetingStatus.Completed,
        count: meetingCounts.completed,
        color: 'info',
      },
    ],
    [meetingCounts]
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
          sx={{ '& .MuiTabs-flexContainer': { gap: 2 }, flexGrow: 1 }}
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
        tableId="meeting-table"
        columns={[
          { id: 'title', label: 'Title', align: 'left' },
          { id: 'type', label: 'Type', align: 'left' },
          { id: 'importance_level', label: 'Importance', align: 'left' },
          { id: 'meetingAgenda', label: 'Agenda', align: 'left' },
          {
            id: 'audience',
            label: 'Audience',
            align: 'left',
            render: (value) => <Box>{value.join(', ')}</Box>,
          },
          {
            id: 'organizations',
            label: 'Organizations',
            align: 'left',
            render: (value) => <Box>{value.join(', ')}</Box>,
          },
          {
            id: 'classes',
            label: 'Classes',
            align: 'left',
            render: (value) => <Box>{value.join(', ')}</Box>,
          },
          {
            id: 'divisions',
            label: 'Divisions',
            align: 'left',
            render: (value) => <Box>{value.join(', ')}</Box>,
          },
          {
            id: 'meetingDate',
            label: 'Meeting Date',
            filterType: 'date',
            align: 'left',
            render: (value) => (
              <Typography fontSize="13px">{dayjs(value).format('DD MMM YYYY')}</Typography>
            ),
          },
          {
            id: 'meetingTime',
            label: 'Meeting Time',
            align: 'left',
            render: (value) => (
              <Typography fontSize="13px">{dayjs(value, 'HH:mm').format('hh:mm A')}</Typography>
            ),
          },
          { id: 'meetingType', label: 'Mode', align: 'left' },
          { id: 'classRoom', label: 'Classroom', align: 'left' },
          {
            id: 'status',
            label: 'Status',
            align: 'left',
            filterType: 'enum',
            enumOptions: MeetingStatusOptions,
            sticky: true,
            render: (value) => (
              <Label
                variant="soft"
                color={MeetingStatusColor[value as MeetingStatus] as LabelColor}
              >
                {MeetingStatus[value as MeetingStatus]}
              </Label>
            ),
          },
          {
            id: 'active',
            label: 'Active',
            align: 'left',
            minWidth: 40,
            isFilter: false,
            sticky: true,
            isSort: false,
            render(value, row) {
              const statusColor =
                value === MeetingStatus.Ongoing
                  ? theme.palette.success.main
                  : theme.palette.text.secondary;

              return (
                <CustomTooltip title={value === 0 ? 'Published' : 'Draft'} arrow placement="left">
                  <span>
                    <IconButton
                      onClick={() => {
                        if (value === MeetingStatus.Draft) {
                          onPublish(row as IMeeting);
                        }
                      }}
                      sx={{
                        p: 0.6,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.06)',
                        transition: 'transform 0.2s ease-in-out, background-color 0.2s',
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.08)' },
                      }}
                      disabled={value === MeetingStatus.Completed}
                    >
                      <Iconify
                        icon={GlobalIcons.tick}
                        sx={{
                          width: 20,
                          height: 20,
                          cursor: value === MeetingStatus.Draft ? 'pointer' : 'not-allowed',
                          color: statusColor,
                        }}
                      />
                    </IconButton>
                  </span>
                </CustomTooltip>
              );
            },
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
                showViewIcon
                showThreeDots={false}
                handleEditClick={() => onEdit(row as IMeeting)}
                handleDeleteClick={() => onDelete(row as IMeeting)}
                handleViewClick={() => onView(row as IMeeting)}
              />
            ),
          },
        ]}
        data={tableData || []}
      />
    </Box>
  );
};

export default MeetingTable;
