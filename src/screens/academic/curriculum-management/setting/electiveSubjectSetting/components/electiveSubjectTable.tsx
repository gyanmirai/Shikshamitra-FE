'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Chip, Stack, Avatar, Typography } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useGetElectiveGroupsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi';
import {
  type ITimetableSummaryCard,
  TimetableSettingsSummaryCards,
} from 'src/screens/academic/components/AcademicSummaryInsights';

import { getElectiveSubjectTableActions } from './electiveSubjectTableActions';

import type { IElectiveSubject, IElectiveSubjectTableProps } from '../type';

const ElectiveSubjectTable: React.FC<IElectiveSubjectTableProps> = ({
  onAddElective,
  setOpenDialog,
  setEditData,
  onDelete,
  onEdit,
  onArchive,
  onRestore,
  onViewUsage,
  insightsOpen,
  onCloseInsights,
  canAdd = true,
  canView = true,
  canDelete = true,
}) => {
  const theme = useTheme();
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const {
    data: electiveGroupData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetElectiveGroupsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, includeArchived: true },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  const groups = useMemo(() => electiveGroupData || [], [electiveGroupData]);

  const summary = useMemo(
    () => ({
      total: groups.length,
      active: groups.filter((group: IElectiveSubject) => getStatusLabel(group.status) === 'Active')
        .length,
      archived: groups.filter(
        (group: IElectiveSubject) => getStatusLabel(group.status) === 'Archived'
      ).length,
      usedInClasses: groups.filter((group: IElectiveSubject) => (group.usedInClassesCount || 0) > 0)
        .length,
      unused: groups.filter((group: IElectiveSubject) => !group.isUsed).length,
    }),
    [groups]
  );

  const summaryCards: ITimetableSummaryCard[] = useMemo(
    () => [
      {
        label: 'Total Groups',
        value: summary.total,
        icon: 'solar:layers-bold-duotone',
        color: 'primary',
      },
      {
        label: 'Active Groups',
        value: summary.active,
        icon: 'solar:check-circle-bold-duotone',
        color: 'success',
      },
      {
        label: 'Archived Groups',
        value: summary.archived,
        icon: 'solar:archive-bold-duotone',
        color: 'warning',
      },
      {
        label: 'Used In Classes',
        value: summary.usedInClasses,
        icon: 'solar:buildings-3-bold-duotone',
        color: 'info',
      },
      {
        label: 'Unused Groups',
        value: summary.unused,
        icon: 'solar:close-circle-bold-duotone',
        color: 'error',
      },
    ],
    [summary]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Elective Group',
        align: 'left',
        minWidth: 260,
        sticky: true,
        stickyPosition: 'left',
        headerSx: {
          boxShadow: '2px 0 5px -2px rgba(0, 0, 0, 0.12)',
        },
        cellSx: {
          boxShadow: '2px 0 5px -2px rgba(0, 0, 0, 0.12)',
        },
        render: (value, row) => {
          const groupColor = row.color || theme.palette.primary.main;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: alpha(groupColor, 0.14),
                  color: groupColor,
                  border: `1px solid ${alpha(groupColor, 0.28)}`,
                }}
              >
                <Iconify icon="solar:layers-bold" width={18} height={18} />
              </Avatar>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: '13px' }} noWrap>
                  {value}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  noWrap
                  sx={{ display: 'block' }}
                >
                  {row.description || `${row.subjects?.length || 0} subjects`}
                </Typography>
              </Box>
            </Box>
          );
        },
      },
      {
        id: 'groupType',
        label: 'Group Type',
        align: 'left',
        minWidth: 130,
        render: (value) => (
          <Label color="info" variant="soft">
            {value || 'Custom'}
          </Label>
        ),
      },
      {
        id: 'subjects',
        label: 'Subjects',
        align: 'left',
        minWidth: 260,
        isFilter: false,
        isSort: false,
        render: (value) => {
          const subjects = (value || []) as IElectiveSubject['subjects'];
          const visibleSubjects = subjects.slice(0, 3);
          const hiddenCount = Math.max(subjects.length - visibleSubjects.length, 0);
          return (
            <CustomTooltip
              arrow
              placement="top"
              title={subjects.map((subject) => subject.name).join(', ')}
            >
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap alignItems="center">
                {visibleSubjects.map((subject) => {
                  const sColor =
                    subject.color || subject.subjectColor || theme.palette.primary.main;
                  return (
                    <Chip
                      key={subject.id || subject.name}
                      size="small"
                      label={subject.name}
                      variant="outlined"
                      sx={{
                        height: 24,
                        fontSize: '11.5px',
                        bgcolor: alpha(sColor, 0.08),
                        borderColor: alpha(sColor, 0.24),
                        fontWeight: 500,
                      }}
                      avatar={
                        <Box
                          component="span"
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: sColor,
                          }}
                        />
                      }
                    />
                  );
                })}
                {hiddenCount > 0 && (
                  <Chip
                    size="small"
                    label={`+${hiddenCount} more`}
                    sx={{ height: 24, fontSize: '11.5px', fontWeight: 600 }}
                  />
                )}
              </Stack>
            </CustomTooltip>
          );
        },
      },
      {
        id: 'usedInClassesCount',
        label: 'Used In Classes',
        align: 'center',
        minWidth: 160,
        filterType: 'number',
        render: (value, row) => (
          <Box
            component="button"
            type="button"
            onClick={() => onViewUsage(row as IElectiveSubject)}
            style={{
              border: 0,
              background: 'transparent',
              cursor: 'pointer',
              padding: 0,
              font: 'inherit',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: value ? 'primary.main' : 'text.secondary',
                fontWeight: value ? 600 : 400,
                '&:hover': value ? { textDecoration: 'underline' } : {},
              }}
            >
              {value ? `Used in ${value} classes` : 'Unused'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'lastUpdatedAt',
        label: 'Last Updated',
        align: 'left',
        minWidth: 140,
        filterType: 'date',
        render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
      },
      {
        id: 'status',
        label: 'Status',
        width: 130,
        minWidth: 130,
        sticky: true,
        filterType: 'enum',
        enumOptions: [
          { label: 'Active', value: 'Active' },
          { label: 'Inactive', value: 'Inactive' },
          { label: 'Archived', value: 'Archived' },
        ],
        render: (value) => {
          const label = getStatusLabel(value);
          return (
            <Label
              color={label === 'Active' ? 'success' : label === 'Archived' ? 'warning' : 'default'}
              variant="soft"
            >
              {label}
            </Label>
          );
        },
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 150,
        width: 150,
        align: 'center',
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        isFilter: false,
        render(value, row) {
          const group = row as IElectiveSubject;
          const isArchived = getStatusLabel(group.status) === 'Archived';
          const actions = getElectiveSubjectTableActions(group, isArchived, {
            canAdd,
            canView,
            canDelete,
            onViewUsage,
            onEdit,
            onArchive,
            onRestore,
            onDelete,
          });

          return (
            <AdaptiveThreeDotsActions
              actions={actions}
              placement="right-top"
              moreLabel="More elective group actions"
            />
          );
        },
      },
    ],
    [
      canAdd,
      canDelete,
      canView,
      onArchive,
      onDelete,
      onEdit,
      onRestore,
      onViewUsage,
      theme.palette.primary.main,
    ]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TimetableSettingsSummaryCards
        cards={summaryCards}
        open={insightsOpen}
        onClose={onCloseInsights}
        hideTrigger
      />

      <CustomizableTable
        isLoading={isLoading || isFetching}
        tableId="elective-subject-data-table"
        noDataText={
          <>
            Elective Group Data Not Found{' '}
            {canAdd && (
              <Box
                onClick={() => {
                  onAddElective.onTrue();
                  setOpenDialog(true);
                  setEditData(null);
                }}
                color="primary.main"
                fontWeight={600}
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  },
                }}
              >
                Add Elective Group
              </Box>
            )}
          </>
        }
        columns={columns}
        data={groups}
      />
    </Box>
  );
};

export default ElectiveSubjectTable;

const getStatusLabel = (status?: IElectiveSubject['status']) => {
  if (status === 2 || status === 'Archived') return 'Archived';
  if (status === 1 || status === 'Inactive') return 'Inactive';
  return 'Active';
};
