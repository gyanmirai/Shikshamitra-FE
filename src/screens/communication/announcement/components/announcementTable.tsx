import type { LabelColor } from 'src/components/label';

import dayjs from 'dayjs';
import { Label } from 'src/components/label';
import { useTabs } from 'src/hooks/use-tabs';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { RemoveCircle } from '@mui/icons-material';
import React, { useMemo, useCallback } from 'react';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import CustomizableTable from 'src/components/customizabaleTable';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { Box, Tab, Tabs, Paper, MenuList, MenuItem, IconButton, Typography } from '@mui/material';
import {
  AnnouncementStatus,
  AnnouncementStatusColor,
  AnnouncementStatusOptions,
} from 'src/enums/communication_announcement_status_type';

import type { IAnnouncementType } from '../../settings/AnnouncementType/Components/type';
import type {
  IAudience,
  ISchoolWiseAnnouncement,
  ISchoolWiseAnnouncementTableProps,
} from '../type';

const AnnouncementTable: React.FC<ISchoolWiseAnnouncementTableProps> = ({
  setOpen,
  data,
  onEdit,
  handleSwitchChange,
  onDelete,
  onRemove,
  onView,
  onPublish,
}) => {
  const theme = useTheme();
  // counts for tabs
  const announcementCounts = useMemo(
    () => ({
      all: data?.length || 0,
      draft: data?.filter((i) => i.status === AnnouncementStatus.Upcoming)?.length || 0,
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
        label: 'Upcoming',
        value: AnnouncementStatus.Upcoming,
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

  const actions = useCallback(
    ({ popover: pop, row }: any) => (
      <MenuList>
        <MenuItem
          onClick={() => {
            onRemove(row as ISchoolWiseAnnouncement);
            pop.onClose();
          }}
        >
          <RemoveCircle sx={{ width: '20px', height: '20px', color: 'error.main' }} /> Remove
        </MenuItem>
      </MenuList>
    ),
    [onRemove]
  );

  return (
    <>
      {/* Tabs */}
      <Paper
        sx={{
          mt: '4px',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          height: 50,
        }}
        elevation={2}
      >
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
      </Paper>

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
              render: (value, row) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {row.type?.map((aud: IAnnouncementType, index: string) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SubjectColorIndicator color={aud.color} />
                      <Typography variant="caption" fontSize="13px">
                        {aud.announcementType}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ),
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
              label: 'Start Date/Time',
              filterType: 'date',
              align: 'left',
              minWidth: 150,
              render: (value) => (
                <Typography variant="caption" fontSize="13px">
                  {dayjs(value).format('DD-MM-YYYY hh:mm')}
                </Typography>
              ),
            },
            {
              id: 'endDate',
              label: 'End Date/Time',
              filterType: 'date',
              align: 'left',
              minWidth: 140,
              render: (value) => (
                <Typography variant="caption" fontSize="13px">
                  {dayjs(value).format('DD-MM-YYYY hh:mm')}
                </Typography>
              ),
            },
            {
              id: 'duration',
              label: 'Duration',
              render: (value, row) => (
                <Typography fontSize="13px">
                  {value} {row.durationUnit}
                </Typography>
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
              label: 'Publish',
              align: 'left',
              minWidth: 50,
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
                    title={value === 0 ? 'Upcoming' : 'Published'}
                    arrow
                    placement="left"
                  >
                    <span>
                      <IconButton
                        onClick={() =>
                          value === AnnouncementStatus.Upcoming &&
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
              label: 'Actions',
              isSort: false,
              isFilter: false,
              sticky: true,
              render: (_, row) => (
                <ThreeDotsActions
                  placement="right-top"
                  actions={(prop) => actions({ ...prop, row })}
                  showEditIcon
                  showDeleteIcon={row.status === 0}
                  showViewIcon
                  showThreeDots={row.status === 1}
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
            {
              id: 'type',
              label: 'Type',
              align: 'left',
              render: (value, row) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {row.type?.map((aud: IAnnouncementType, index: string) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SubjectColorIndicator color={aud.color} />
                      <Typography variant="caption" fontSize="13px">
                        {aud.announcementType}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ),
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
              label: 'Start Date/Time',
              filterType: 'date',
              minWidth: 150,

              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'endDate',
              label: 'End Date/Time',
              filterType: 'date',
              minWidth: 150,
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'duration',
              label: 'Duration',
              render: (value, row) => (
                <Typography fontSize="13px">
                  {value} {row.durationUnit}
                </Typography>
              ),
            },
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
              label: 'Publish',
              align: 'left',
              minWidth: 50,
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
                  <CustomTooltip title={value === 0 ? 'Draft' : 'Published'} arrow placement="left">
                    <span>
                      <IconButton
                        onClick={() =>
                          value === AnnouncementStatus.Upcoming &&
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
              id: 'action',
              label: 'Actions',
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
            {
              id: 'type',
              label: 'Type',
              align: 'left',
              render: (value, row) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {row.type?.map((aud: IAnnouncementType, index: string) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SubjectColorIndicator color={aud.color} />
                      <Typography variant="caption" fontSize="13px">
                        {aud.announcementType}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ),
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
              label: 'Start Date/Time',
              filterType: 'date',
              minWidth: 150,
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'endDate',
              label: 'End Date/Time',
              minWidth: 150,
              filterType: 'date',
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'duration',
              label: 'Duration',
              render: (value, row) => (
                <Typography fontSize="13px">
                  {value} {row.durationUnit}
                </Typography>
              ),
            },
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
              id: 'action',
              label: 'Actions',
              isSort: false,
              isFilter: false,
              sticky: true,
              render: (_, row) => (
                <ThreeDotsActions
                  placement="right-top"
                  showViewIcon
                  actions={(prop) => actions({ ...prop, row })}
                  showThreeDots
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
            {
              id: 'type',
              label: 'Type',
              align: 'left',
              render: (value, row) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {row.type?.map((aud: IAnnouncementType, index: string) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SubjectColorIndicator color={aud.color} />
                      <Typography variant="caption" fontSize="13px">
                        {aud.announcementType}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              ),
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
              label: 'Start Date/Time',
              filterType: 'date',
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'endDate',
              label: 'End Date/Time',
              filterType: 'date',
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'duration',
              label: 'Duration',
              render: (value, row) => (
                <Typography fontSize="13px">
                  {value} {row.durationUnit}
                </Typography>
              ),
            },
            { id: 'createdBy', label: 'Created By', align: 'left' },
            {
              id: 'createdOn',
              label: 'Created On',
              filterType: 'date',
              align: 'left',
              render: (value) => (
                <Typography fontSize="13px">{dayjs(value).format('DD-MM-YYYY hh:mm')}</Typography>
              ),
            },
            {
              id: 'action',
              label: 'Actions',
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
      ) : null}
    </>
  );
};

export default AnnouncementTable;
