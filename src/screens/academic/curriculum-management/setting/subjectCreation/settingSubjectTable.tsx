'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Stack, IconButton, Typography } from '@mui/material';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';
import {
  TimetableSettingsSummaryCards,
  type ITimetableSummaryCard,
} from 'src/components/timetable-settings-summary-cards/TimetableSettingsSummaryCards';

import SubjectNameCell from './subjectNameCell';

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

  const subjects = useMemo(() => subjectData || [], [subjectData]);

  const summary = useMemo(
    () => ({
      total: subjects.length,
      active: subjects.filter((subject: ISubject) => getStatusLabel(subject.status) === 'Active')
        .length,
      archived: subjects.filter(
        (subject: ISubject) => getStatusLabel(subject.status) === 'Archived'
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
            onClick={() => onViewUsage(row as ISubject)}
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
        minWidth: 140,
        width: 140,
        align: 'center',
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        isFilter: false,
        render(value, row) {
          const subject = row as ISubject;
          const isArchived = getStatusLabel(subject.status) === 'Archived';
          return (
            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
              {canView && (
                <SubjectActionButton
                  title="View usage"
                  icon="solar:eye-bold"
                  onClick={() => onViewUsage(subject)}
                />
              )}
              {isArchived ? (
                <SubjectActionButton
                  title="Restore subject"
                  icon="solar:restart-bold"
                  color="success"
                  onClick={() => onRestore(subject)}
                />
              ) : (
                <>
                  {canAdd && (
                    <SubjectActionButton
                      title="Edit subject"
                      icon="solar:pen-bold"
                      onClick={() => onEdit(subject)}
                    />
                  )}
                  {canAdd && (
                    <SubjectActionButton
                      title="Archive subject"
                      icon="solar:archive-bold"
                      color="warning"
                      onClick={() => onArchive(subject)}
                    />
                  )}
                  {canDelete && (
                    <SubjectActionButton
                      title={
                        subject.canDelete
                          ? 'Delete subject'
                          : 'This subject is already used. View usage before deleting.'
                      }
                      icon="solar:trash-bin-trash-bold"
                      color="error"
                      disabled={!subject.canDelete}
                      onClick={() => onDelete(subject)}
                    />
                  )}
                </>
              )}
            </Stack>
          );
        },
      },
    ],
    [canAdd, canDelete, canView, onArchive, onDelete, onEdit, onRestore, onViewUsage]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      <TimetableSettingsSummaryCards cards={summaryCards} />

      <CustomizableTable
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
      />
    </Box>
  );
};

export default SettingSubjectTable;

const getStatusLabel = (status?: ISubject['status']) => {
  if (status === 2 || status === 'Archived') return 'Archived';
  if (status === 1 || status === 'Inactive') return 'Inactive';
  return 'Active';
};

const SubjectActionButton = ({
  title,
  icon,
  color = 'default',
  disabled = false,
  onClick,
}: {
  title: string;
  icon: string;
  color?: 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
  disabled?: boolean;
  onClick: () => void;
}) => (
  <CustomTooltip title={title} arrow placement="top">
    <span>
      <IconButton
        size="small"
        color={color}
        disabled={disabled}
        aria-label={title}
        onClick={onClick}
        sx={{
          width: 28,
          height: 28,
          '&:hover': {
            bgcolor: 'action.hover',
          },
        }}
      >
        <Iconify icon={icon} width={17} height={17} />
      </IconButton>
    </span>
  </CustomTooltip>
);
