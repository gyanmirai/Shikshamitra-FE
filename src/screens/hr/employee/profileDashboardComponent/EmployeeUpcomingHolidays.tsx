import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import { Label } from 'src/components/label';
import { Box, Paper, Stack, Typography } from '@mui/material';

import { formatHolidayRange, formatDashboardDate } from '../employee-dashboard-utils';

const EmployeeUpcomingHolidays = ({ data }: { data: EmployeeDashboardData }) => {
  const today = data.date.slice(0, 10);
  const upcoming = data.holidays
    .filter((holiday) => holiday.toDate.slice(0, 10) >= today)
    .toSorted((a, b) => a.fromDate.localeCompare(b.fromDate) || a.name.localeCompare(b.name))
    .slice(0, 5);

  return (
    <Paper
      variant="outlined"
      component="section"
      aria-label="Upcoming holidays"
      sx={{ borderRadius: 2, p: 2, minWidth: 0 }}
    >
      <Typography variant="subtitle2" component="h3">
        Upcoming holidays
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mt: 0.5, mb: 1.5 }}
      >
        Staff work-calendar holidays
      </Typography>
      {upcoming.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
          No upcoming holidays in this academic year.
        </Typography>
      ) : (
        <Stack component="ul" spacing={0} sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {upcoming.map((holiday) => {
            const ongoing = holiday.fromDate.slice(0, 10) <= today;
            return (
              <Box
                component="li"
                key={`${holiday.name}-${holiday.fromDate}-${holiday.toDate}`}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.5,
                  py: 1.25,
                  '& + &': { borderTop: '1px solid', borderColor: 'divider' },
                }}
              >
                <Box
                  aria-hidden="true"
                  sx={{
                    width: 40,
                    minHeight: 44,
                    flexShrink: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.25 }}>
                    {formatDashboardDate(holiday.fromDate, { month: 'short' })}
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontVariantNumeric: 'tabular-nums', lineHeight: 1.4 }}
                  >
                    {formatDashboardDate(holiday.fromDate, { day: '2-digit' })}
                  </Typography>
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, overflowWrap: 'anywhere' }}>
                    {holiday.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatHolidayRange(holiday)}
                  </Typography>
                </Box>
                {ongoing && (
                  <Label color="primary" sx={{ flexShrink: 0 }}>
                    Today
                  </Label>
                )}
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
};

export default EmployeeUpcomingHolidays;
