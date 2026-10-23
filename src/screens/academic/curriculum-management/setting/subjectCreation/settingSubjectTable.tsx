'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Box, Typography } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import {
  type ITimetableSummaryCard,
  TimetableSettingsSummaryCards,
} from 'src/screens/academic/components/AcademicSummaryInsights';

import SubjectNameCell from './subjectNameCell';
import { getSubjectMasterStatusLabel } from '../subjectMasterStatus';
import { getSettingSubjectTableActions } from './settingSubjectTableActions';
import { getSubjectTableRows, getSubjectNameSearchValue } from './subjectTableData';

import type { ISubject, ISubjectTableProps } from './type';

const SettingSubjectTable: React.FC<ISubjectTableProps> = ({
  open,
  setOpenDialog,
  setEditData,
  onDelete,
  onArchive,
  onRestore,
  onViewUsage,
  onEdit,
  onOpenDrawer,
  insightsOpen,
  onCloseInsights,
  canAdd = true,
  canView = true,
  canDelete = true,
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const {
    data: subjectData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetCoreSubjectsByMediumQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id, includeArchived: true },
    options: {
      skip: !(currentMedium as Medium)?.id,
    },
  });

  // Keep normalized rows stable for the table and summary dependencies between query updates.
  const subjects = useMemo(() => getSubjectTableRows(subjectData || []), [subjectData]);

  const summary = useMemo(
    () => ({
      total: subjects.length,
      active: subjects.filter(
        (subject: ISubject) => getSubjectMasterStatusLabel(subject.status) === 'Active'
      ).length,
      archived: subjects.filter(
        (subject: ISubject) => getSubjectMasterStatusLabel(subject.status) === 'Archived'
      ).length,
      usedInClasses: subjects.filter((subject: ISubject) => (subject.usedInClassesCount || 0) > 0)
        .length,
      unused: subjects.filter((subject: ISubject) => !subject.isUsed).length,
    }),
    [subjects]
  );

  const summaryCards: ITimetableSummaryCard[] = useMemo(
    () => [
      {
        label: 'Total Subjects',
        value: summary.total,
        icon: 'solar:book-bookmark-bold-duotone',
        color: 'primary',
      },
      {
        label: 'Active Subjects',
        value: summary.active,
        icon: 'solar:check-circle-bold-duotone',
        color: 'success',
      },
      {
        label: 'Archived Subjects',
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
        label: 'Unused Subjects',
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
        label: 'Subject',
        searchValue: getSubjectNameSearchValue,
        align: 'left',
        width: 300,
        minWidth: 300,
        sticky: true,
        stickyPosition: 'left',
        headerSx: {
          boxShadow: '2px 0 5px -2px rgba(0, 0, 0, 0.12)',
        },
        cellSx: {
          boxShadow: '2px 0 5px -2px rgba(0, 0, 0, 0.12)',
        },
        render: (value, row) => (
          <SubjectNameCell value={String(value || '')} subject={row as ISubject} />
        ),
      },
      {
        id: 'category',
        label: 'Category',
        align: 'left',
        minWidth: 140,
        render: (value) => value || 'General',
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
            disabled={!canView}
            onClick={(event) => {
              event.stopPropagation();
              onViewUsage(row as ISubject);
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
              {value ? `Used in ${value} ${Number(value) === 1 ? 'class' : 'classes'}` : 'Unused'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'usedInElectiveGroupsCount',
        label: 'Used In Elective Groups',
        align: 'center',
        minWidth: 180,
        filterType: 'number',
        render: (value) => (
          <Typography variant="body2" sx={{ fontWeight: value ? 600 : 400 }}>
            {value || 0}
          </Typography>
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
          const label = getSubjectMasterStatusLabel(value);
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
          const subject = row as ISubject;
          const isArchived = getSubjectMasterStatusLabel(subject.status) === 'Archived';
          const actions = getSettingSubjectTableActions(subject, isArchived, {
            canAdd,
            canDelete,
            onEdit,
            onArchive,
            onRestore,
            onDelete,
          });

          return (
            <AdaptiveThreeDotsActions
              actions={actions}
              directActionLimit={2}
              placement="right-top"
              moreLabel={`More actions for ${subject.name}`}
              sx={{ justifyContent: 'flex-end' }}
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
        tableTitle="Subjects"
        tableId="subject-data-table"
        isLoading={isLoading || isFetching}
        noDataText={
          <>
            Subject Data Not Found{' '}
            {canAdd && (
              <Box
                onClick={() => {
                  onOpenDrawer();
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
                Subject
              </Box>
            )}
          </>
        }
        columns={columns}
        data={subjects}
        handleRowClick={canView ? (row) => onViewUsage(row as ISubject) : undefined}
        rowProps={(row) => ({
          tabIndex: canView ? 0 : -1,
          'aria-label': canView ? `View subject ${row.name}` : undefined,
          onKeyDown: (event) => {
            if (
              canView &&
              event.target === event.currentTarget &&
              (event.key === 'Enter' || event.key === ' ')
            ) {
              event.preventDefault();
              onViewUsage(row as ISubject);
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

export default SettingSubjectTable;
