// SubjectTable.tsx

import type { RootState } from 'src/redux/store';
import type { IColumn } from 'src/components/customizabaleTable/types';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { useMemo, useCallback } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Archive, Restore, RemoveCircle } from '@mui/icons-material';
import { hasGrantedPermission } from 'src/utils/permissions';
import ThreeDotsActions from 'src/components/three-dots-actions';
import { academicPermissions } from 'src/constants/academic-menu';
import CustomizableTable from 'src/components/customizabaleTable';
import { SubjectColorIndicator } from 'src/components/subject-color/SubejctColor';
import { PublishUnpublishStatusOptions } from 'src/enums/publishUnpublish-status';
import {
  Box,
  Chip,
  MenuList,
  MenuItem,
  IconButton,
  Typography,
  LinearProgress,
} from '@mui/material';

import { SubjectType, SubjectAssignmentStatus } from '../enum/subjectType';

import type { ISubjectTableProps, ISubjectFormValues } from './type';

// ── Health score helpers ─────────────────────────────────────────────────────
function healthColor(score: number) {
  if (score >= 90) return '#22c55e';
  if (score >= 70) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function healthLabel(score: number) {
  if (score >= 90) return 'Ready';
  if (score >= 70) return 'Almost Ready';
  if (score >= 40) return 'Needs Setup';
  return 'Incomplete';
}

function SetupHealthCell({ score }: { score?: number }) {
  const value = score ?? 0;
  const color = healthColor(value);
  return (
    <CustomTooltip title={healthLabel(value)} arrow placement="top">
      <Box sx={{ minWidth: 80 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.3 }}>
          <Typography variant="caption" fontWeight={600} sx={{ color }}>
            {value}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={value}
          sx={{
            height: 5,
            borderRadius: 3,
            backgroundColor: `${color}30`,
            '& .MuiLinearProgress-bar': { backgroundColor: color, borderRadius: 3 },
          }}
        />
      </Box>
    </CustomTooltip>
  );
}

const SubjectTable = ({
  isLoading,
  classId,
  addSubjectDialog,
  subjectTableData,
  onView,
  onEdit,
  onDelete,
  onArchive,
  onRestore,
  onToggleStatus,
  query,
  setQuery,
  totalCount,
}: ISubjectTableProps) => {
  const theme = useTheme();
  const { permissions } = useSelector((state: RootState) => state.auth);

  const canAdd = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.subjectsAssignment}.Add`
  );
  const canView = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.subjectsAssignment}.View`
  );
  const canDelete = hasGrantedPermission(
    permissions,
    `${academicPermissions.curriculum.subjectsAssignment}.Delete`
  );

  const subjectData = useMemo(
    () =>
      subjectTableData?.map((item) => ({
        ...item,
        subjectTypeValue: SubjectType[item.subjectType] || 'Core',
        subjectsName: item?.subjects?.map((sub: any) => sub.subjectName).join(', '),
        subjectName: (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
            {item?.subjects?.map(
              (
                sub: { color?: string; subjectName?: string; subjectCode?: string },
                subIndex: number
              ) => (
                <Box
                  key={`${item.id}-${subIndex}`}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
                >
                  <SubjectColorIndicator color={sub.color} />
                  <Typography variant="body2">{sub.subjectName}</Typography>
                </Box>
              )
            )}
            {/* AI / Copied badges */}
            {item.isAiSuggested && (
              <Chip size="small" label="AI" color="secondary" sx={{ height: 18, fontSize: 10 }} />
            )}
            {item.isCopiedFromPreviousYear && (
              <Chip
                size="small"
                label="Copied"
                variant="outlined"
                sx={{ height: 18, fontSize: 10 }}
              />
            )}
          </Box>
        ),
        subjectCodeValue: item?.subjects?.map((sub: any) => sub.subjectCode).join(', ') || '—',
        statusValue: SubjectAssignmentStatus[item.status] || 'Draft',
        primaryTeacherDisplay: item?.primaryTeacherName || '—',
        chaptersDisplay: item.chaptersCount ?? 0,
        weeklyPeriodsDisplay: item.weeklyPeriods ? `${item.weeklyPeriods}` : '—',
        lastUpdatedDisplay: item.lastUpdatedAt
          ? dayjs(item.lastUpdatedAt).format('DD MMM YY')
          : '—',
      })) || [],
    [subjectTableData]
  );

  const actions = useCallback(
    ({ popover, row }: any) => {
      const removeDisabled = row.canDelete === false;
      const isArchived = row.status === SubjectAssignmentStatus.Archived;
      const removeDisabledReason =
        row.deleteDisabledReason ||
        'This subject is already used in another module. Remove those references before removing it.';

      return (
        <MenuList disablePadding dense>
          {isArchived && canAdd && (
            <MenuItem
              onClick={() => {
                onRestore?.(row);
                popover.onClose();
              }}
            >
              <Restore sx={{ width: 18, height: 18, color: 'success.main', mr: 1 }} />
              Reactivate
            </MenuItem>
          )}
          {!isArchived && canDelete && (
            <MenuItem
              onClick={() => {
                onArchive?.(row);
                popover.onClose();
              }}
            >
              <Archive sx={{ width: 18, height: 18, color: 'warning.main', mr: 1 }} />
              Archive
            </MenuItem>
          )}
          {canDelete && (
            <CustomTooltip
              title={removeDisabled ? removeDisabledReason : 'Remove'}
              arrow
              placement="left"
            >
              <Box component="span" sx={{ display: 'block' }}>
                <MenuItem
                  disabled={removeDisabled}
                  onClick={() => {
                    if (removeDisabled) return;
                    onDelete(row);
                    popover.onClose();
                  }}
                  sx={{ color: removeDisabled ? 'text.disabled' : 'error.main' }}
                >
                  <RemoveCircle sx={{ width: 18, height: 18, mr: 1 }} />
                  Remove
                </MenuItem>
              </Box>
            </CustomTooltip>
          )}
        </MenuList>
      );
    },
    [onDelete, onArchive, onRestore, canAdd, canDelete]
  );

  const columns: IColumn[] = useMemo(
    () => [
      {
        id: 'subjectTypeValue',
        label: 'Type',
        align: 'left',
        minWidth: 60,
        width: 70,
        sticky: true,
        render: (value) => (
          <Chip
            size="small"
            label={value}
            variant="soft"
            color={value === 'Core' ? 'primary' : value === 'Elective' ? 'secondary' : 'default'}
            sx={{ height: 20, fontSize: 11 }}
          />
        ),
      },
      {
        id: 'subjectsName',
        label: 'Subject Name',
        align: 'left',
        isFilter: false,
        isSort: false,
        minWidth: 180,
        render: (value, row) => row.subjectName,
      },
      {
        id: 'subjectCodeValue',
        label: 'Code',
        align: 'left',
        minWidth: 100,
        isSort: false,
        isFilter: false,
        render: (value) => (
          <Typography variant="caption" fontFamily="monospace" color="text.secondary">
            {value}
          </Typography>
        ),
      },
      {
        id: 'primaryTeacherDisplay',
        label: 'Primary Teacher',
        align: 'left',
        minWidth: 130,
        isSort: false,
        isFilter: false,
        render: (value) =>
          value === '—' ? (
            <Chip
              size="small"
              label="Not Assigned"
              color="warning"
              variant="soft"
              sx={{ height: 20, fontSize: 11 }}
            />
          ) : (
            <Typography variant="body2">{value}</Typography>
          ),
      },
      {
        id: 'chaptersDisplay',
        label: 'Chapters',
        align: 'center',
        minWidth: 70,
        width: 70,
        isSort: false,
        isFilter: false,
        render: (value) => (
          <Typography variant="body2" textAlign="center">
            {value}
          </Typography>
        ),
      },
      {
        id: 'weeklyPeriodsDisplay',
        label: 'Periods/Wk',
        align: 'center',
        minWidth: 80,
        width: 80,
        isSort: false,
        isFilter: false,
      },
      {
        id: 'setupHealthScore',
        label: 'Health',
        align: 'left',
        minWidth: 90,
        width: 100,
        isSort: false,
        isFilter: false,
        render: (value) => <SetupHealthCell score={value as number} />,
      },
      {
        id: 'lastUpdatedDisplay',
        label: 'Updated',
        align: 'left',
        minWidth: 90,
        width: 90,
        isSort: false,
        isFilter: false,
        render: (value) => (
          <Typography variant="caption" color="text.secondary">
            {value}
          </Typography>
        ),
      },
      {
        id: 'statusValue',
        label: 'Status',
        align: 'left',
        minWidth: 60,
        width: 70,
        isSort: false,
        isFilter: false,
        sticky: true,
        enumOptions: PublishUnpublishStatusOptions,
        render(value, row) {
          const isPublished = row.status === SubjectAssignmentStatus.Published;
          const isInteractive = !isPublished;
          const statusColor = isPublished
            ? theme.vars.palette.success.main
            : theme.vars.palette.text.secondary;

          return (
            <CustomTooltip title={value} arrow placement="left">
              <Box component="span">
                <IconButton
                  disabled={!isInteractive}
                  onClick={() => onToggleStatus(row as ISubjectFormValues)}
                  sx={{
                    p: 0.6,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(0,0,0,0.06)',
                    transition: 'all 0.2s',
                    cursor: isInteractive ? 'pointer' : 'default',
                    '&:hover': {
                      transform: isInteractive ? 'scale(1.1)' : 'none',
                      backgroundColor: 'rgba(0,0,0,0.08)',
                    },
                    '&.Mui-disabled': { backgroundColor: 'rgba(0,0,0,0.06)' },
                  }}
                >
                  <Iconify
                    icon={GlobalIcons.tick}
                    sx={{ width: 20, height: 20, color: statusColor }}
                  />
                </IconButton>
              </Box>
            </CustomTooltip>
          );
        },
      },
      {
        id: 'action',
        label: 'Actions',
        width: 70,
        minWidth: 70,
        align: 'left',
        sticky: true,
        isSort: false,
        isFilter: false,
        render(value, row) {
          return (
            <ThreeDotsActions
              placement="right-top"
              actions={(prop) => actions({ ...prop, row: row as ISubjectFormValues })}
              showViewIcon={canView}
              showEditIcon={canAdd}
              showThreeDots={canDelete}
              handleViewClick={() => onView(row as ISubjectFormValues)}
              handleEditClick={() => onEdit(row as ISubjectFormValues)}
            />
          );
        },
      },
    ],
    [actions, canAdd, canDelete, canView, onEdit, onToggleStatus, onView, theme]
  );

  return (
    <CustomizableTable
      tableId="subject-table"
      isLoading={isLoading}
      totalCount={totalCount}
      noDataText={
        <>
          <Typography variant="body2" color="text.secondary" mb={1}>
            No subjects allocated for this class yet.
          </Typography>
          {canAdd && (
            <Box
              onClick={() => addSubjectDialog.onTrue()}
              color="primary.main"
              fontWeight={600}
              sx={{
                cursor: 'pointer',
                '&:hover': { color: 'primary.main', textDecoration: 'underline' },
              }}
            >
              + Allocate Subjects
            </Box>
          )}
        </>
      }
      serverSidePagination
      onServerPagination={(page, rowPerPage) => {
        setQuery({ page: page - 1, pageSize: rowPerPage });
      }}
      columns={columns}
      data={subjectData}
    />
  );
};

export default SubjectTable;
