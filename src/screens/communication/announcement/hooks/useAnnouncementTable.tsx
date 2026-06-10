import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useTabs } from 'src/hooks/use-tabs';
import { useMemo, useCallback } from 'react';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { RemoveCircle } from '@mui/icons-material';
import CustomTooltip from 'src/components/custom-tooltip';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { Box, MenuList, MenuItem, Typography, IconButton } from '@mui/material';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import communicationData from 'src/json/communication/dummy-data/communicationData.json';
import {
  AnnouncementStatus,
  AnnouncementStatusColor,
  AnnouncementStatusOptions,
} from 'src/enums/communication_announcement_status_type';

import type { ISchoolWiseAnnouncement } from '../type';

interface UseAnnouncementTableProps {
  onRemove: (row: ISchoolWiseAnnouncement) => void;
  onEdit: (row: ISchoolWiseAnnouncement) => void;
  onDelete: (row: ISchoolWiseAnnouncement) => void;
  onView: (row: ISchoolWiseAnnouncement) => void;
  onPublish: (row: ISchoolWiseAnnouncement) => void;
}

export const useAnnouncementTable = ({
  onRemove,
  onEdit,
  onDelete,
  onView,
  onPublish,
}: UseAnnouncementTableProps) => {
  const theme = useTheme();
  const tabs = useTabs('All');

  // Memoization Justification: Expensive filtering operation on large dataset
  const announcementCounts = useMemo(
    () => ({
      all: communicationData?.schoolWiseAnnouncementData?.length || 0,
      draft:
        communicationData?.schoolWiseAnnouncementData?.filter(
          (i: any) => i.status === AnnouncementStatus.Upcoming
        )?.length || 0,
      published:
        communicationData?.schoolWiseAnnouncementData?.filter(
          (i: any) => i.status === AnnouncementStatus.Published
        )?.length || 0,
      completed:
        communicationData?.schoolWiseAnnouncementData?.filter(
          (i: any) => i.status === AnnouncementStatus.Completed
        )?.length || 0,
    }),
    []
  );

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

  // Memoization Justification: Prevent re-calculation of table data on every render
  const tableData = useMemo(
    () =>
      tabs.value === 'All'
        ? communicationData?.schoolWiseAnnouncementData || []
        : communicationData?.schoolWiseAnnouncementData?.filter(
            (i: any) => i.status === tabs.value
          ),
    [tabs.value]
  );

  // Memoization Justification: Function passed as prop to memoized child components
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

  // Memoization Justification: Complex column definition object creation
  const getColumns = useCallback(
    (tabValue: string | number): IColumn[] => {
      const isDraft = tabValue === AnnouncementStatus.Upcoming;
      // const isPublished = tabValue === AnnouncementStatus.Published; // Currently unused but good for future extension or lint logic

      // Shared column definitions to avoid duplication
      const baseColumns: IColumn[] = [
        { id: 'title', label: 'Announcement', align: 'left', sticky: true },
        {
          id: 'type',
          label: 'Type',
          align: 'left',
          render: (value, row) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {row.type?.map((aud: any, index: number) => (
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
              {row.audience?.map((aud: any) => (
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
          minWidth: 150,
          render: (value) => (
            <Typography variant="caption" fontSize="13px">
              {dayjs(value).format('DD-MM-YYYY hh:mm')}
            </Typography>
          ),
        },
        {
          id: 'duration',
          label: 'Duration',
          render: (value, row) => {
            const displayValue =
              typeof value === 'string' && value.toLowerCase().includes('day')
                ? value
                : `${value} ${row.durationUnit || ''}`;
            return <Typography fontSize="13px">{displayValue.trim()}</Typography>;
          },
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
      ];

      // Add status specific columns
      if (tabValue === 'All' || tabValue === AnnouncementStatus.Upcoming) {
        baseColumns.push({
          id: 'active',
          label: 'Publish',
          align: 'left',
          minWidth: 80,
          isFilter: false,
          sticky: true,
          isSort: false,
          filterType: 'enum',
          enumOptions: AnnouncementStatusOptions,
          render(value, row) {
            const isPublished = value === AnnouncementStatus.Published;
            const isUpcoming = value === AnnouncementStatus.Upcoming;
            const statusColor = isPublished
              ? theme.palette.success.main
              : theme.palette.text.secondary;

            return (
              <CustomTooltip title={isUpcoming ? 'Upcoming' : 'Published'} arrow placement="left">
                <span>
                  <IconButton
                    onClick={() => {
                      if (isUpcoming) {
                        onPublish(row as ISchoolWiseAnnouncement);
                      }
                    }}
                    sx={{
                      p: 0.6,
                      borderRadius: '50%',
                      backgroundColor: 'rgba(0,0,0,0.06)',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        backgroundColor: 'rgba(0,0,0,0.08)',
                      },
                    }}
                    disabled={isPublished}
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
        });
      }

      if (tabValue === 'All') {
        baseColumns.push({
          id: 'status',
          label: 'Status',
          align: 'left',
          filterType: 'enum',
          minWidth: 100,
          enumOptions: AnnouncementStatusOptions,
          sticky: true,
          render: (value, row) => (
            <Label
              variant="soft"
              color={(AnnouncementStatusColor[value as AnnouncementStatus] || 'default') as any}
            >
              {AnnouncementStatus[value as AnnouncementStatus] || 'Unknown'}
            </Label>
          ),
        });
      }

      // Add Actions
      baseColumns.push({
        id: 'action',
        label: 'Actions',
        isSort: false,
        isFilter: false,
        minWidth: '50px',
        sticky: true,
        render: (_, row) => (
          <ThreeDotsActions
            placement="right-top"
            actions={(prop) => actions({ ...prop, row })}
            showEditIcon
            showDeleteIcon={row.status === 0 || isDraft}
            showViewIcon
            showThreeDots={row.status === 1}
            handleEditClick={() => onEdit(row as ISchoolWiseAnnouncement)}
            handleDeleteClick={() => onDelete(row as ISchoolWiseAnnouncement)}
            handleViewClick={() => onView(row as ISchoolWiseAnnouncement)}
          />
        ),
      });

      return baseColumns;
    },
    [
      actions,
      onEdit,
      onDelete,
      onView,
      onPublish,
      theme.palette.success.main,
      theme.palette.text.secondary,
    ]
  );

  return {
    tabs,
    TABS,
    tableData,
    getColumns,
  };
};
