import type { IColumn } from 'src/components/customizabaleTable/types';

import { RouterLink } from 'src/routes/components';
import { studentPaths } from 'src/constants/student-menu';
import { Link, Stack, Avatar, Typography } from '@mui/material';

import { recordsQueryUrl } from './records-url-state';
import { formatBirthdayDate } from './student-birthday-filters';

export function birthdayColumns(canViewProfile: boolean): IColumn[] {
  return [
    {
      id: 'studentName',
      label: 'Student',
      minWidth: 168,
      width: '48%',
      rowHeader: true,
      isFilter: false,
      isSort: false,
      render: (name: string, row) => {
        const parts = name.trim().split(/\s+/);
        const initials = [parts[0], parts.length > 1 ? parts.at(-1) : undefined]
          .map((part) => part?.[0] ?? '')
          .join('')
          .toUpperCase();
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar
              aria-hidden
              sx={{
                width: 32,
                height: 32,
                bgcolor: 'background.neutral',
                color: 'text.secondary',
                fontSize: 12,
              }}
            >
              {initials}
            </Avatar>
            {canViewProfile && row.canOpenProfile ? (
              <Link
                component={RouterLink}
                prefetch={false}
                href={recordsQueryUrl(studentPaths.records.studentList, '', {
                  student: row.studentId,
                  view: 'overview',
                })}
                underline="always"
                color="inherit"
                sx={{
                  typography: 'body2',
                  fontWeight: 'fontWeightSemiBold',
                  overflowWrap: 'anywhere',
                }}
              >
                {name}
              </Link>
            ) : (
              <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>
                {name}
              </Typography>
            )}
          </Stack>
        );
      },
    },
    {
      id: 'placement',
      label: 'Class / Division',
      minWidth: 112,
      isFilter: false,
      isSort: false,
      render: (_, row) => [row.standardName, row.divisionName].filter(Boolean).join(' / ') || '—',
    },
    {
      id: 'occurrenceDate',
      label: 'Birthday',
      minWidth: 104,
      isFilter: false,
      isSort: false,
      render: (value: string) => (
        <time dateTime={value}>{formatBirthdayDate(value, 'DD MMM YYYY')}</time>
      ),
    },
  ];
}
