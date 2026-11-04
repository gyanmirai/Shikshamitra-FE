'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Box, Button, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useGetElectiveGroupsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi';
import {
  type ITimetableSummaryCard,
  TimetableSettingsSummaryCards,
} from 'src/screens/academic/components/AcademicSummaryInsights';

import ElectiveGroupNameCell from './ElectiveGroupNameCell';
import ElectiveGroupSubjectsCell from './ElectiveGroupSubjectsCell';
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
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const {
    data: electiveGroupData,
    isLoading,
    isFetching,
    error,
    refetch,
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
        width: 320,
        minWidth: 320,
        maxWidth: 320,
        sticky: true,
        stickyPosition: 'left',
        headerSx: {
          boxShadow: '2px 0 5px -2px rgba(0, 0, 0, 0.12)',
        },
        cellSx: {
          boxShadow: '2px 0 5px -2px rgba(0, 0, 0, 0.12)',
        },
        render: (_value, row) => <ElectiveGroupNameCell group={row as IElectiveSubject} />,
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
        filterType: 'string' as const,
        align: 'left',
        minWidth: 260,
        isFilter: true,
        isSort: false,
        render: (value) => (
          <ElectiveGroupSubjectsCell subjects={(value || []) as IElectiveSubject['subjects']} />
        ),
      },
      {
        id: 'usedInClassesCount',
        label: 'Used In Classes',
        align: 'center',
        minWidth: 160,
        filterType: 'number' as const,
        render: (value, row) => (
          <Box
            component="button"
            type="button"
            disabled={!canView}
            onClick={(event) => {
              event.stopPropagation();
              onViewUsage(row as IElectiveSubject);
            }}
            style={{
              border: 0,
              background: 'transparent',
              cursor: canView ? 'pointer' : 'default',
              padding: 0,
              font: 'inherit',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: value ? 'primary.main' : 'text.secondary',
                fontWeight: value ? 600 : 400,
                '&:hover': canView && value ? { textDecoration: 'underline' } : {},
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
        filterType: 'date' as const,
        render: (value) => (value ? dayjs(value).format('DD-MM-YYYY') : '-'),
      },
      {
        id: 'status',
        label: 'Status',
        width: 130,
        minWidth: 130,
        sticky: true,
        filterType: 'enum' as const,
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
            canDelete,
            onEdit,
            onArchive,
            onRestore,
            onDelete,
          });

          return (
            <AdaptiveThreeDotsActions
              directActionLimit={2}
              actions={actions}
              placement="right-top"
              moreLabel="More elective group actions"
            />
          );
        },
      },
    ],
    [canAdd, canDelete, canView, onArchive, onDelete, onEdit, onRestore, onViewUsage]
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
        tableTitle="Elective Groups"
        error={error}
        onRetry={refetch}
        isLoading={isLoading || isFetching}
        tableId="elective-subject-data-table"
        noDataText={
          <>
            Elective Group Data Not Found{' '}
            {canAdd && (
              <Button
                size="small"
                onClick={() => {
                  onAddElective.onTrue();
                  setOpenDialog(true);
                  setEditData(null);
                }}
                color="primary"
                sx={{
                  '&:hover': {
                    cursor: 'pointer',
                    textDecoration: 'underline',
                  },
                }}
              >
                Add Elective Group
              </Button>
            )}
          </>
        }
        columns={columns}
        data={groups}
        handleRowClick={canView ? (row) => onViewUsage(row as IElectiveSubject) : undefined}
        rowProps={(row) => ({
          tabIndex: canView ? 0 : -1,
          'aria-label': canView ? `View elective group ${row.name}` : undefined,
          onKeyDown: (event) => {
            if (
              canView &&
              event.target === event.currentTarget &&
              (event.key === 'Enter' || event.key === ' ')
            ) {
              event.preventDefault();
              onViewUsage(row as IElectiveSubject);
            }
          },
          sx: {
            cursor: canView ? 'pointer' : 'default',
            '&:focus-visible': canView
              ? { outline: '2px solid', outlineColor: 'primary.main', outlineOffset: -2 }
              : undefined,
          },
        })}
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
