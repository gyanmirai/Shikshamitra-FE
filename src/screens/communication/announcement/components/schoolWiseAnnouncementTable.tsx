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
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import {
  AnnouncementStatus,
  AnnouncementStatusColor,
  AnnouncementStatusOptions,
} from 'src/enums/communication_announcement_status_type';

import type {
  IAudience,
  ISchoolWiseAnnouncement,
  ISchoolWiseAnnouncementTableProps,
} from '../type';

const SchoolWiseAnnouncementTable: React.FC<ISchoolWiseAnnouncementTableProps> = ({
  setOpen,
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
      {tabs.value === 'All' ? (
        <CustomizableTable
          tableId="school-wise-announcement-table"
          noDataText={
            <>
              No school announcement data found
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
                Add Announcement
              </Box>
            </>
          }
          columns={[
            { id: 'title', label: 'Announcement', align: 'left', sticky: true },
            {
              id: 'type',
              label: 'Type',
              align: 'left',
            },
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
              id: 'startDate',
              label: 'Start Date',
              filterType: 'date',
              align: 'left',
              minWidth: 120,
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'endDate',
              label: 'End Date',
              filterType: 'date',
              align: 'left',
              minWidth: 120,
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'importance_level',
              label: 'Importance Level',
              align: 'left',
              minWidth: 160,
              render: (value, row) => (
                <Box key={value.value} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <SubjectColorIndicator color={value.color} />
                  <Typography variant="caption" fontSize="13px">
                    {value.levelName}
                  </Typography>
                </Box>
              ),
            },
            { id: 'duration', label: 'Duration' },
            { id: 'createdBy', label: 'Created By', align: 'left', minWidth: 120 },
            {
              id: 'createdOn',
              label: 'Created On',
              filterType: 'date',
              align: 'left',
              minWidth: 120,
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
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
              filterType: 'enum',
              enumOptions: AnnouncementStatusOptions,
              render(value, row) {
                const statusColor =
                  value === AnnouncementStatus.Published
                    ? theme.palette.success.main
                    : theme.palette.text.secondary;

                return (
                  <CustomTooltip title={value === 0 ? 'Published' : 'Draft'} arrow placement="left">
                    <span>
                      <IconButton
                        onClick={() =>
                          value === AnnouncementStatus.Draft &&
                          onPublish(row as ISchoolWiseAnnouncement)
                        }
                        sx={{
                          p: 0.6,
                          borderRadius: '50%',
                          backgroundColor: 'rgba(0,0,0,0.06)',
                          '&:hover': {
                            transform: 'scale(1.1)',
                            backgroundColor: 'rgba(0,0,0,0.08)',
                          },
                        }}
                        disabled={value === AnnouncementStatus.Published}
                      >
                        <Iconify
                          icon={GlobalIcons.tick}
                          sx={{ width: 20, height: 20, color: statusColor }}
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
                  handleDeleteClick={() => onDelete(row as ISchoolWiseAnnouncement)}
                  handleViewClick={() => onView(row as ISchoolWiseAnnouncement)}
                />
              ),
            },
          ]}
          data={tableData || []}
        />
      ) : tabs.value === 0 ? (
        <CustomizableTable
          tableId="school-wise-announcement-table-draft"
          noDataText={
            <>
              No school announcement data found
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
                Add Announcement
              </Box>
            </>
          }
          columns={[
            { id: 'title', label: 'Announcement', align: 'left', sticky: true },
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
              id: 'startDate',
              label: 'Start Date',
              filterType: 'date',
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'endDate',
              label: 'End Date',
              filterType: 'date',
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            { id: 'createdBy', label: 'Created By', align: 'left' },
            { id: 'createdOn', label: 'Created On', filterType: 'date', align: 'left' },
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
                  handleDeleteClick={() => onDelete(row as ISchoolWiseAnnouncement)}
                  handleViewClick={() => onView(row as ISchoolWiseAnnouncement)}
                />
              ),
            },
          ]}
          data={tableData || []}
        />
      ) : tabs.value === 1 ? (
        <CustomizableTable
          tableId="school-wise-announcement-table-readonly"
          noDataText={
            <>
              No school announcement data found
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
                Add Announcement
              </Box>
            </>
          }
          columns={[
            { id: 'title', label: 'Announcement', align: 'left', sticky: true },
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
              id: 'startDate',
              label: 'Start Date',
              filterType: 'date',
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'endDate',
              label: 'End Date',
              filterType: 'date',
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            { id: 'createdBy', label: 'Created By', align: 'left' },
            { id: 'createdOn', label: 'Created On', filterType: 'date', align: 'left' },
            {
              id: 'action',
              label: 'Action',
              isSort: false,
              isFilter: false,
              sticky: true,
              render: (_, row) => (
                <ThreeDotsActions
                  placement="right-top"
                  showViewIcon
                  showThreeDots={false}
                  handleViewClick={() => onView(row as ISchoolWiseAnnouncement)}
                />
              ),
            },
          ]}
          data={tableData || []}
        />
      ) : tabs.value === 2 ? (
        <CustomizableTable
          tableId="school-wise-announcement-table-readonly"
          noDataText={
            <>
              No school announcement data found
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
                Add Announcement
              </Box>
            </>
          }
          columns={[
            { id: 'title', label: 'Announcement', align: 'left', sticky: true },
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
              id: 'startDate',
              label: 'Start Date',
              filterType: 'date',
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'endDate',
              label: 'End Date',
              filterType: 'date',
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            { id: 'createdBy', label: 'Created By', align: 'left' },
            { id: 'createdOn', label: 'Created On', filterType: 'date', align: 'left' },
            {
              id: 'action',
              label: 'Action',
              isSort: false,
              isFilter: false,
              sticky: true,
              render: (_, row) => (
                <ThreeDotsActions
                  placement="right-top"
                  showViewIcon
                  showThreeDots={false}
                  handleViewClick={() => onView(row as ISchoolWiseAnnouncement)}
                  showDeleteIcon
                  handleDeleteClick={() => onDelete(row as ISchoolWiseAnnouncement)}
                />
              ),
            },
          ]}
          data={tableData || []}
        />
      ) : null}
    </Box>
  );
};

export default SchoolWiseAnnouncementTable;
