import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { fNumber } from 'src/utils/format-number';
import { formatDateOnly } from 'src/utils/date-only';
import { StudentFeedback } from 'src/components/student-feedback';
import { Stack, Button, Typography, LinearProgress } from '@mui/material';

import { AdminDashboardPanel } from './admin-dashboard-panel';

import type { StudentSectionQuery } from '../hooks/use-student-dashboard-sections';

export function AdminDashboardAttendance({ query }: { query: StudentSectionQuery }) {
  const today = !query.isError ? query.currentData?.attendanceToday : undefined;
  const pending = (today?.missing ?? 0) + (today?.draft ?? 0);
  return (
    <AdminDashboardPanel
      title="Today's attendance"
      description={
        today
          ? `${formatDateOnly(today.schoolDate, 'DD MMM YYYY')} · School date${today.timeZone ? ` · ${today.timeZone}` : ''}`
          : 'Expected class and division registers'
      }
      query={query}
    >
      {!today ? (
        <Typography variant="body2" color="text.secondary">
          Daily attendance is unavailable with your current access.
        </Typography>
      ) : today.availability === 'outsideYear' ? (
        <StudentFeedback notificationKey="STU-0711" presentation="inline" severity="info">
          Today is outside the selected academic year. Select the current academic year to view
          today&apos;s registers.
        </StudentFeedback>
      ) : (
        <Stack spacing={1.5}>
          {today.provisional && (
            <StudentFeedback
              notificationKey="STU-0712"
              presentation="persistent"
              severity="warning"
            >
              Calendar or roster setup is incomplete. This summary is provisional.
            </StudentFeedback>
          )}
          {today.availability === 'noExpected' ? (
            <Typography variant="body2" color="text.secondary">
              No attendance registers are expected today in this scope.
            </Typography>
          ) : (
            <>
              <Stack spacing={0.25}>
                <Typography variant="h3">
                  {fNumber(today.submitted)} / {fNumber(today.expected)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Expected registers submitted
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={
                  today.expected
                    ? Math.min(100, ((today.submitted ?? 0) / today.expected) * 100)
                    : 0
                }
                aria-label="Expected registers submitted"
                sx={{ height: 6, borderRadius: 1, bgcolor: 'background.neutral' }}
              />
              <Stack direction="row" justifyContent="space-around" spacing={1}>
                {[
                  { value: today.missing, label: 'Not started' },
                  { value: today.draft, label: 'Drafts' },
                ].map((item) => (
                  <Stack key={item.label} alignItems="center">
                    <Typography variant="h5" color={item.value ? 'warning.dark' : 'text.primary'}>
                      {fNumber(item.value)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.label}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </>
          )}
          {(today.review ?? 0) > 0 && (
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon="mdi:alert-outline" sx={{ color: 'warning.dark' }} />
              <Typography variant="caption" color="warning.dark">
                {fNumber(today.review)} submitted{' '}
                {today.review === 1 ? 'register needs' : 'registers need'} review
              </Typography>
            </Stack>
          )}
          {today.href && (
            <Button
              component={Link}
              prefetch={false}
              href={today.href}
              size="small"
              variant="outlined"
              color="inherit"
              endIcon={<Iconify icon="mdi:arrow-right" />}
              sx={{ alignSelf: 'flex-end' }}
            >
              {pending || today.review ? 'Open pending registers' : 'Open attendance'}
            </Button>
          )}
        </Stack>
      )}
    </AdminDashboardPanel>
  );
}
