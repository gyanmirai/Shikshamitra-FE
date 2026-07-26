import type { EmployeeDashboardData } from 'src/redux/hr/employeeApi';

import dayjs from 'dayjs';
import { Iconify } from 'src/components/iconify';
import { Box, Paper, Stack, Typography } from '@mui/material';

import { formatHolidayRange } from '../employee-dashboard-utils';

const EmployeeUpcomingHolidays = ({ data }: { data: EmployeeDashboardData }) => {
  const upcoming = data.holidays
    .filter((holiday) => !dayjs(holiday.toDate).isBefore(data.date, 'day'))
    .slice(0, 5);

  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        minHeight: 360,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 2,
      }}
    >
      <Typography variant="h6">Upcoming Holidays</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
        Employee work-calendar holidays
      </Typography>

      {upcoming.length === 0 ? (
        <Box
          sx={{
            minHeight: 240,
            display: 'grid',
            placeItems: 'center',
            textAlign: 'center',
            color: 'text.secondary',
          }}
        >
          <Box>
            <Iconify icon="solar:calendar-minimalistic-linear" width={36} />
            <Typography variant="body2" sx={{ mt: 1 }}>
              No upcoming holidays in this academic year.
            </Typography>
          </Box>
        </Box>
      ) : (
        <Stack spacing={1.25}>
          {upcoming.map((holiday) => (
            <Box
              key={`${holiday.name}-${holiday.fromDate}-${holiday.toDate}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: 'background.neutral',
              }}
            >
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  flexShrink: 0,
                  display: 'grid',
                  placeItems: 'center',
                  borderRadius: 1.25,
                  color: 'secondary.main',
                  bgcolor: 'secondary.lighter',
                }}
              >
                <Iconify icon="solar:star-outline" width={22} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" noWrap>
                  {holiday.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatHolidayRange(holiday)}
                </Typography>
              </Box>
            </Box>
          ))}
        </Stack>
      )}
    </Paper>
  );
};

export default EmployeeUpcomingHolidays;
