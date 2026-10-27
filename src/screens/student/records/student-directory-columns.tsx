import type { IColumn } from 'src/components/customizabaleTable/types';
import type { AdaptiveThreeDotsAction } from 'src/components/adaptive-three-dots-actions';
import type { StudentDirectoryItem } from 'src/redux/student/records/student-records-types';

import { Label } from 'src/components/label';
import { RouterLink } from 'src/routes/components';
import { Link, Stack, Avatar } from '@mui/material';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

export const directoryStudentName = (student: StudentDirectoryItem) =>
  [student.firstName, student.middleName, student.lastName].filter(Boolean).join(' ') ||
  'Restricted identity';

export type DirectoryRowActions = (row: StudentDirectoryItem) => AdaptiveThreeDotsAction[];

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
    align: 'left',
    minWidth: compact ? 136 : 200,
    width: compact ? 136 : undefined,
    cellSx: compact ? { px: 1 } : undefined,
    headerSx: compact ? { px: 1 } : undefined,
    isSort: true,
    isFilter: true,
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
    align: 'left',
    minWidth: 120,
    isSort: true,
    isFilter: true,
    filterType: 'string',
    render: (value, row) => value || (row.grNo ?? '—'),
  },
  {
    id: 'classDivision',
    label: 'Class / Division',
    align: 'left',
    minWidth: 150,
    isSort: false,
    isFilter: true,
    filterType: 'string',
  },
  {
    id: 'rollNo',
    label: 'Roll number',
    align: 'left',
    minWidth: 100,
    isSort: false,
    isFilter: true,
    filterType: 'number',
    render: (value) => value ?? '—',
  },
  {
    id: 'status',
    label: 'Status',
    align: 'left',
    minWidth: compact ? 96 : 112,
    width: compact ? 96 : 112,
    cellSx: compact ? { px: 1 } : undefined,
    headerSx: compact ? { px: 1 } : undefined,
    isSort: false,
    isFilter: true,
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
    align: 'left',
    minWidth: compact ? 160 : 184,
    width: compact ? 160 : 184,
    cellSx: compact ? { px: 1 } : undefined,
    headerSx: compact ? { px: 1 } : undefined,
    sticky: true,
    stickyPosition: 'right',
    excludeFromExport: true,
    render: (_value, row) => {
      const actions = rowActions?.(row as StudentDirectoryItem) ?? [];
      const directCount = actions.filter((action) =>
        ['edit-details', 'attendance-history', 'certificate'].includes(action.id)
      ).length;
      return (
        <AdaptiveThreeDotsActions
          actions={actions}
          moreLabel={`More actions for ${directoryStudentName(row as StudentDirectoryItem)}`}
          directActionLimit={
            directCount >= 3 ? 3 : directCount === 2 ? 2 : directCount === 1 ? 1 : 0
          }
          collapseOnOverflow={false}
          sx={{ justifyContent: 'flex-end' }}
        />
      );
    },
  },
];
