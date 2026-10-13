import type { ReactNode } from 'react';
import type { IColumn } from 'src/components/customizabaleTable/types';
import type { ThreeDotsActionContext } from 'src/components/three-dots-actions/types';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { Label } from 'src/components/label';
import { RouterLink } from 'src/routes/components';
import { Link, Stack, Avatar } from '@mui/material';
import ThreeDotsActions from 'src/components/three-dots-actions';

export const directoryStudentName = (student: StudentDirectoryItem) =>
  [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
  'Restricted identity';

export type DirectoryRowActions = (
  row: StudentDirectoryItem,
  context: ThreeDotsActionContext
) => ReactNode;

type Options = {
  profileHref: (studentId: string) => string;
  rowActions?: DirectoryRowActions;
  compact?: boolean;
};

export const buildDirectoryColumns = ({
  profileHref,
  rowActions,
  compact = false,
}: Options): IColumn[] => [
  {
    id: 'name',
    label: 'Student',
    minWidth: compact ? 136 : 200,
    width: compact ? 136 : undefined,
    cellSx: compact ? { px: 1 } : undefined,
    headerSx: compact ? { px: 1 } : undefined,
    isSort: true,
    isFilter: false,
    filterType: 'string',
    render: (_value, row) => (
      <Stack direction="row" spacing={1} alignItems="center">
        <Avatar
          sx={{
            display: compact ? 'none' : 'flex',
            width: 32,
            height: 32,
            bgcolor: 'background.neutral',
            color: 'text.secondary',
            fontSize: 12,
          }}
        >
          {[row.firstName, row.lastName]
            .filter(Boolean)
            .map((name) => String(name).charAt(0))
            .join('')
            .slice(0, 2) || '—'}
        </Avatar>
        <Link
          component={RouterLink}
          href={profileHref(row.studentId)}
          color="inherit"
          underline="hover"
          sx={{ typography: 'body2', fontWeight: 'fontWeightSemiBold', overflowWrap: 'anywhere' }}
        >
          {directoryStudentName(row as StudentDirectoryItem)}
        </Link>
      </Stack>
    ),
  },
  {
    id: 'grNumber',
    label: 'GR number',
    minWidth: 120,
    isSort: true,
    isFilter: false,
    filterType: 'string',
    render: (value, row) => value || (row.grNo ?? '—'),
  },
  {
    id: 'classDivision',
    label: 'Class / Division',
    minWidth: 150,
    isSort: false,
    isFilter: false,
    filterType: 'string',
  },
  {
    id: 'rollNo',
    label: 'Roll number',
    minWidth: 100,
    isSort: false,
    isFilter: false,
    filterType: 'number',
    render: (value) => value ?? '—',
  },
  {
    id: 'status',
    label: 'Status',
    minWidth: compact ? 72 : 120,
    width: compact ? 72 : undefined,
    cellSx: compact ? { px: 1 } : undefined,
    headerSx: compact ? { px: 1 } : undefined,
    isSort: false,
    isFilter: false,
    filterType: 'enum',
    enumOptions: [
      { value: 6, label: 'Active' },
      { value: 7, label: 'Inactive' },
      { value: 8, label: 'Left' },
    ],
    sticky: true,
    stickyPosition: 'right',
    render: (value) => (
      <Label color={value === 'Enrolled' || value === 6 ? 'success' : 'default'}>
        {typeof value === 'number'
          ? ({ 6: 'Active', 7: 'Inactive', 8: 'Left' }[value] ?? 'Unknown')
          : value === 'Enrolled'
            ? 'Active'
            : value || 'Unknown'}
      </Label>
    ),
  },
  {
    id: 'actions',
    label: 'Actions',
    isSort: false,
    isFilter: false,
    align: 'right',
    minWidth: compact ? 80 : rowActions ? 90 : 60,
    width: compact ? 80 : rowActions ? 90 : 60,
    cellSx: compact ? { px: 1 } : undefined,
    headerSx: compact ? { px: 1 } : undefined,
    sticky: true,
    stickyPosition: 'right',
    excludeFromExport: true,
    render: (_value, row) => (
      <ThreeDotsActions
        showViewIcon
        viewIcon="mdi:eye-outline"
        viewHref={profileHref(row.studentId)}
        viewLabel={`View profile for ${directoryStudentName(row as StudentDirectoryItem)}`}
        moreLabel={`More actions for ${directoryStudentName(row as StudentDirectoryItem)}`}
        showThreeDots={Boolean(rowActions)}
        actions={(context) => rowActions?.(row as StudentDirectoryItem, context)}
        sx={{ justifyContent: 'flex-end' }}
      />
    ),
  },
];
