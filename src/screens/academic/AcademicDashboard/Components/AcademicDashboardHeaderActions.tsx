'use client';

import Link from 'next/link';
import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { academicPaths } from 'src/constants/academic-menu';

type AcademicDashboardHeaderActionsProps = {
  isFetching: boolean;
  onRefresh: () => void;
};

const DASHBOARD_ACTIONS = [
  {
    label: 'Student 360',
    href: academicPaths.studentAcademic360,
    icon: 'mdi:account-school-outline',
    variant: 'outlined' as const,
  },
  {
    label: 'Timetables',
    href: academicPaths.timetable.management,
    icon: 'solar:calendar-linear',
    variant: 'outlined' as const,
  },
  {
    label: 'Schedule Exam',
    href: academicPaths.examination.schedule,
    icon: 'solar:clipboard-text-linear',
    variant: 'contained' as const,
  },
];

export function AcademicDashboardHeaderActions({
  isFetching,
  onRefresh,
}: AcademicDashboardHeaderActionsProps) {
  return (
    <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" justifyContent="flex-end">
      <Button
        size="small"
        variant="outlined"
        disabled={isFetching}
        onClick={onRefresh}
        startIcon={<Iconify icon="solar:refresh-linear" />}
      >
        {isFetching ? 'Refreshing' : 'Refresh'}
      </Button>

      {DASHBOARD_ACTIONS.map((action) => (
        <Button
          key={action.label}
          component={Link}
          href={action.href}
          size="small"
          variant={action.variant}
          startIcon={<Iconify icon={action.icon} />}
        >
          {action.label}
        </Button>
      ))}
    </Stack>
  );
}
