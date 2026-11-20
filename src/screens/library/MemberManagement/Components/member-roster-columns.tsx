import type { IColumn } from 'src/components/customizabaleTable/types';

import { Box, Avatar } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { fNumber } from 'src/utils/format-number';
import AdaptiveThreeDotsActions from 'src/components/adaptive-three-dots-actions';

import { MemberOverdueValue } from '../../circulation/MemberOverdueValue';

import type { IMember } from './type';

export function memberRosterColumns(onView?: (member: IMember) => void): IColumn[] {
  const columns: IColumn[] = [
    {
      id: 'name',
      label: 'Name',
      rowHeader: true,
      sticky: true,
      minWidth: 180,
      render: (value, row) => (
        <Box display="flex" alignItems="center" gap={1}>
          <Avatar src={row.avatar || undefined} alt={value} sx={{ width: 32, height: 32 }} />
          {value}
        </Box>
      ),
    },
    {
      id: 'memberIdentifier',
      label: 'Member ID',
      minWidth: 140,
      render: (value) =>
        value === null || value === undefined || value === '' ? 'Unavailable' : value,
    },
    { id: 'role', label: 'Role' },
    { id: 'rollNo', label: 'Roll no.', minWidth: 90 },
    { id: 'grNo', label: 'GR no.', minWidth: 90 },
    { id: 'classDivision', label: 'Class/division', minWidth: 140 },
    {
      id: 'currentIssue',
      label: 'Current loans',
      align: 'right',
      minWidth: 130,
      render: (value) => fNumber(value),
    },
    {
      id: 'overdueReturn',
      label: 'Overdue books',
      align: 'left',
      minWidth: 190,
      render: (value, row) => <MemberOverdueValue count={value} classification={row} />,
    },
    {
      id: 'actions',
      label: 'Actions',
      sticky: true,
      align: 'right',
      excludeFromExport: true,
      render: (_value, row) =>
        onView && row.id ? (
          <AdaptiveThreeDotsActions
            directActionLimit={2}
            actions={[
              {
                id: 'view',
                label: `View ${row.name || 'Library member'}`,
                icon: GlobalIcons.eye,
                onClick: () => onView(row as IMember),
              },
            ]}
          />
        ) : null,
    },
  ];
  // The roster endpoint supports name/contact search, without column predicates or sorting.
  return columns.map((column) => ({ ...column, isFilter: false, isSort: false }));
}
