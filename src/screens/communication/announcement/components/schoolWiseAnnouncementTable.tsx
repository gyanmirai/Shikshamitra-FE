import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Tab, Tabs, IconButton, Typography } from '@mui/material';
import {
  AnnouncementStatus,
  AnnouncementStatusColor,
  AnnouncementStatusOptions,
} from 'src/enums/communication_announcement_status_type';

import type { ISchoolWiseAnnouncement, ISchoolWiseAnnouncementTableProps } from '../type';

const SchoolWiseAnnouncementTable: React.FC<ISchoolWiseAnnouncementTableProps> = ({
  data,
  onEdit,
  handleSwitchChange,
  onDelete,
  onView,
  onPublish,
}) => {
  const theme = useTheme();
  // counts for tabs
  const announcementCounts = useMemo(
    () => ({
      all: data?.length || 0,
      draft: data?.filter((i) => i.status === AnnouncementStatus.Draft)?.length || 0,
      published: data?.filter((i) => i.status === AnnouncementStatus.Published)?.length || 0,
      completed: data?.filter((i) => i.status === AnnouncementStatus.Completed)?.length || 0,
    }),
    [data]
  );

  const tabs = useTabs('All');

  const TABS = useMemo(
    () => [
      {
        label: 'All',
        value: 'All',
        count: announcementCounts.all,
        color: 'default',
      },
      {
        label: 'Draft',
        value: AnnouncementStatus.Draft,
        count: announcementCounts.draft,
        color: 'warning',
      },
      {
        label: 'Published',
        value: AnnouncementStatus.Published,
        count: announcementCounts.published,
        color: 'success',
      },
      {
        label: 'Completed',
        value: AnnouncementStatus.Completed,
        count: announcementCounts.completed,
        color: 'info',
      },
    ],
    [announcementCounts]
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
        tableId="school-wise-announcement-table"
        columns={[
          { id: 'title', label: 'Title', align: 'left' },
          { id: 'type', label: 'Type', align: 'left' },
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
            id: 'active',
            label: 'Active',
            align: 'left',
            minWidth: 40,
            isFilter: false,
            sticky: true,
            isSort: false,
            filterType: 'enum',
            enumOptions: AnnouncementStatusOptions,
            render(value, row) {
              const statusColor =
                value === AnnouncementStatus.Published
                  ? theme.palette.success.main
                  : theme.palette.text.secondary;

              return (
                <CustomTooltip
                  title={value === 0 ? 'Published' : 'Draft'}
                  arrow
                  placement="left"
                  PopperProps={{
                    modifiers: [
                      {
                        name: 'offset',
                        options: {
                          offset: [0, 0], // Try 0 or adjust closer
                        },
                      },
                    ],
                  }}
                >
                  <span>
                    <IconButton
                      onClick={() => {
                        // Only allow click action when status is draft (1)
                        if (value === AnnouncementStatus.Draft) {
                          onPublish(row as ISchoolWiseAnnouncement);
                        }
                      }}
                      sx={{
                        p: 0.6, // some padding for a more clickable area
                        borderRadius: '50%',
                        backgroundColor: 'rgba(0,0,0,0.06)', // light background to indicate clickability
                        transition: 'transform 0.2s ease-in-out, background-color 0.2s',
                        cursor: 'pointer',
                        '&:hover': { transform: 'scale(1.1)', backgroundColor: 'rgba(0,0,0,0.08)' },
                      }}
                      disabled={value === AnnouncementStatus.Published}
                    >
                      <Iconify
                        icon={GlobalIcons.tick}
                        sx={{
                          width: 20,
                          height: 20,
                          cursor: value === AnnouncementStatus.Draft ? 'pointer' : 'not-allowed',
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
            id: 'status',
            label: 'Status',
            align: 'left',
            filterType: 'enum',
            enumOptions: AnnouncementStatusOptions,
            sticky: true,
            render: (value, row) => (
              <Label
                variant="soft"
                color={AnnouncementStatusColor[value as AnnouncementStatus] as LabelColor}
              >
                {AnnouncementStatus[value as AnnouncementStatus]}
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
                showViewIcon
                showThreeDots={false}
                handleEditClick={() => onEdit(row as ISchoolWiseAnnouncement)}
                handleDeleteClick={() => onDelete(row.id)}
                handleViewClick={() => onView(row as ISchoolWiseAnnouncement)}
              />
            ),
          },
        ]}
        data={tableData || []}
      />
    </Box>
  );
};

export default SchoolWiseAnnouncementTable;
