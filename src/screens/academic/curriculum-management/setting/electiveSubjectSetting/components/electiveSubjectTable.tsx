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
import { Box, Card, Chip, Stack, Avatar, IconButton, Typography } from '@mui/material';
import { useGetElectiveGroupsQuery } from 'src/redux/academicAPI/CurriculumManagementApi/Setting/Elective-GroupApi';

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
  canAdd = true,
  canView = true,
  canDelete = true,
}) => {
  const { currentMedium } = useSelector((state: RootState) => state.globalState);
  const {
    data: electiveGroupData,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetElectiveGroupsQuery,
    params: { academicMediumId: (currentMedium as Medium)?.id },
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

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'name',
        label: 'Elective Group',
        align: 'left',
        minWidth: 240,
        sticky: true,
        stickyPosition: 'left',
        headerSx: {
          boxShadow: '2px 0 5px -2px rgba(0, 0, 0, 0.12)',
        },
        cellSx: {
          boxShadow: '2px 0 5px -2px rgba(0, 0, 0, 0.12)',
        },
        render: (value, row) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Avatar sx={{ width: 34, height: 34, bgcolor: row.color || 'primary.main' }}>
              <Iconify icon="solar:layers-bold" width={18} height={18} />
            </Avatar>
            <Box>
              <Typography variant="subtitle2" fontSize="13px">
                {value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {row.description || `${row.subjects?.length || 0} subjects`}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        id: 'groupType',
        label: 'Group Type',
        align: 'left',
        render: (value) => <Chip size="small" label={value || 'Custom'} variant="soft" />,
      },
      {
        id: 'subjects',
        label: 'Subjects',
        align: 'left',
        minWidth: 260,
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
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {visibleSubjects.map((subject) => (
                  <Chip
                    key={subject.id || subject.name}
                    size="small"
                    label={subject.name}
                    variant="soft"
                    avatar={
                      <Box
                        component="span"
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: subject.color || subject.subjectColor || 'primary.main',
                        }}
                      />
                    }
                  />
                ))}
                {hiddenCount > 0 && <Chip size="small" label={`+${hiddenCount} more`} />}
              </Stack>
            </CustomTooltip>
          );
        },
      },
      {
        id: 'usedInClassesCount',
        label: 'Used In Classes',
        align: 'center',
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
            <Typography variant="body2" color={value ? 'primary.main' : 'text.secondary'}>
              {value ? `Used in ${value} classes` : 'Unused'}
            </Typography>
          </Box>
        ),
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
        minWidth: 176,
        width: 176,
        align: 'center',
        isSort: false,
        sticky: true,
        stickyPosition: 'right',
        isFilter: false,
        render(value, row) {
          const group = row as IElectiveSubject;
          const isArchived = getStatusLabel(group.status) === 'Archived';
          return (
            <Stack direction="row" spacing={1} justifyContent="center">
              {canView && (
                <GroupActionButton
                  title="View usage"
                  icon="solar:eye-bold"
                  onClick={() => onViewUsage(group)}
                />
              )}
              {isArchived ? (
                <GroupActionButton
                  title="Restore group"
                  icon="solar:restart-bold"
                  color="success"
                  onClick={() => onRestore(group)}
                />
              ) : (
                <>
                  {canAdd && (
                    <GroupActionButton
                      title="Edit group"
                      icon="solar:pen-bold"
                      onClick={() => onEdit(group)}
                    />
                  )}
                  {canAdd && (
                    <GroupActionButton
                      title="Archive group"
                      icon="solar:archive-bold"
                      color="warning"
                      onClick={() => onArchive(group)}
                    />
                  )}
                  {canDelete && (
                    <GroupActionButton
                      title={
                        group.canDelete
                          ? 'Delete group'
                          : 'This elective group is already used in class allocation. View usage before deleting.'
                      }
                      icon="solar:trash-bin-trash-bold"
                      color="error"
                      disabled={!group.canDelete}
                      onClick={() => onDelete(group)}
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
          ['Total Groups', summary.total],
          ['Active Groups', summary.active],
          ['Archived Groups', summary.archived],
          ['Used In Classes', summary.usedInClasses],
          ['Unused Groups', summary.unused],
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

const GroupActionButton = ({
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
        sx={{ width: 34, height: 34 }}
      >
        <Iconify icon={icon} width={18} height={18} />
      </IconButton>
    </span>
  </CustomTooltip>
);
