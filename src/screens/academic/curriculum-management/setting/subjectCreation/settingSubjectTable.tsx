'use client';

import type { Medium } from 'src/types/school';
import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { formatDateOnly } from 'src/utils/date-only';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Card, Chip, Stack, IconButton, Typography } from '@mui/material';
import { useGetCoreSubjectsByMediumQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Core-SubjectApi';

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

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Subject',
        align: 'left',
        width: 320,
        minWidth: 320,
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
        render: (value) => value || 'General',
      },
      {
        id: 'usedInClassesCount',
        label: 'Used In Classes',
        align: 'center',
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
            <Typography variant="body2" color={value ? 'primary.main' : 'text.secondary'}>
              {value ? `Used in ${value} classes` : 'Unused'}
            </Typography>
          </Box>
        ),
      },
      {
        id: 'usedInElectiveGroupsCount',
        label: 'Used In Elective Groups',
        align: 'center',
        render: (value) => value || 0,
      },
      {
        id: 'lastUpdatedAt',
        label: 'Last Updated',
        align: 'left',
        render: (value) => formatDateOnly(value),
      },
      {
        id: 'status',
        label: 'Status',
        align: 'center',
        width: 150,
        minWidth: 150,
        sticky: true,
        stickyPosition: 'right',
        render: (value) => {
          const label = getStatusLabel(value);
          return (
            <Chip
              size="small"
              label={label}
              color={label === 'Active' ? 'success' : label === 'Archived' ? 'default' : 'warning'}
              variant="soft"
            />
          );
        },
      },
      {
        id: 'action',
        label: 'Actions',
        minWidth: 152,
        width: 152,
        align: 'center',
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        isFilter: false,
        render(value, row) {
          const subject = row as ISubject;
          const isArchived = getStatusLabel(subject.status) === 'Archived';
          return (
            <Stack direction="row" spacing={1} justifyContent="center">
              <SubjectActionButton
                title="View usage"
                icon="solar:eye-bold"
                onClick={() => onViewUsage(subject)}
              />
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
    [canAdd, canDelete, onArchive, onDelete, onEdit, onRestore, onViewUsage]
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, flex: 1, minHeight: 0 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(5, 1fr)' },
          gap: 1,
          flexShrink: 0,
        }}
      >
        {[
          ['Total Subjects', summary.total],
          ['Active Subjects', summary.active],
          ['Archived Subjects', summary.archived],
          ['Used In Classes', summary.usedInClasses],
          ['Unused Subjects', summary.unused],
        ].map(([label, count]) => (
          <Card key={label} sx={{ p: 1.5, borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5">{count}</Typography>
          </Card>
        ))}
      </Box>

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
        sx={{ width: 18, height: 18, p: 0 }}
      >
        <Iconify icon={icon} width={16} height={16} />
      </IconButton>
    </span>
  </CustomTooltip>
);
