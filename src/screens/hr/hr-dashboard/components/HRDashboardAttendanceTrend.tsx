import React from 'react';
import { useTheme } from '@mui/material/styles';
import PeopleAltIcon from '@mui/icons-material/PeopleAlt';
import { Box, Grid, Card, Typography } from '@mui/material';
import { BankingBalanceStatistics } from 'src/screens/student/attendance/attendanceDashboard/components/dailyAttendanceTrend';

const HRDashboardAttendanceTrend = () => {
  const theme = useTheme();
  return (
    <Box>
      <Card sx={{ p: 3 }}>
        <Typography variant="subtitle1" fontWeight={600} mb={2}>
          Today&apos;s Attendance Overview
        </Typography>

        <Grid container spacing={2} mb={2}>
          {/* Present */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'success.main',
                bgcolor: 'success.lighter',
                borderRadius: 3,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                height: 100,
              }}
            >
              <PeopleAltIcon sx={{ color: 'success.main', fontSize: 28, mb: 0.5 }} />
              <Typography variant="subtitle1" color="success.main" fontWeight={600}>
                Present
              </Typography>
              <Typography variant="h6" color="success.main" fontWeight={700}>
                28
              </Typography>
            </Box>
          </Grid>

          {/* Absent */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'error.main',
                bgcolor: 'error.lighter',
                borderRadius: 3,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                height: 100,
              }}
            >
              <PeopleAltIcon sx={{ color: 'error.main', fontSize: 28, mb: 0.5 }} />
              <Typography variant="subtitle1" color="error.main" fontWeight={600}>
                Absent
              </Typography>
              <Typography variant="h6" color="error.main" fontWeight={700}>
                8
              </Typography>
            </Box>
          </Grid>

          {/* Late Arrival */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <Box
              sx={{
                border: '1px solid',
                borderColor: 'warning.main',
                bgcolor: 'warning.lighter',
                borderRadius: 3,
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                height: 100,
              }}
            >
              <PeopleAltIcon sx={{ color: 'warning.main', fontSize: 28, mb: 0.5 }} />
              <Typography variant="subtitle1" color="warning.main" fontWeight={600}>
                Late Arrival
              </Typography>
              <Typography variant="h6" color="warning.main" fontWeight={700}>
                6
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <BankingBalanceStatistics
          title="Attendance Trend"
          chart={{
            series: [
              {
                name: 'Last Week',
                categories: ['21/06', '22/06', '23/06', '24/06', '25/06', '26/06', '27/06'],
                data: [
                  { name: 'Present', data: [60, 30, 40, 60, 50, 60, 40] },
                  { name: 'Absent', data: [25, 20, 30, 25, 20, 30, 20] },
                  { name: 'Late', data: [15, 10, 15, 12, 18, 15, 13] },
                ],
              },
              {
                name: 'Last 15 Days',
                categories: [
                  '13/06',
                  '14/06',
                  '15/06',
                  '16/06',
                  '17/06',
                  '18/06',
                  '19/06',
                  '20/06',
                  '21/06',
                  '22/06',
                  '23/06',
                  '24/06',
                  '25/06',
                  '26/06',
                  '27/06',
                ],
                data: [
                  {
                    name: 'Present',
                    data: [50, 35, 45, 55, 65, 45, 50, 60, 55, 48, 52, 56, 53, 57, 51],
                  },
                  {
                    name: 'Absent',
                    data: [30, 25, 28, 22, 18, 25, 22, 20, 23, 30, 27, 26, 24, 22, 28],
                  },
                  {
                    name: 'Late',
                    data: [12, 15, 13, 14, 10, 16, 15, 13, 12, 14, 11, 13, 15, 12, 14],
                  },
                ],
              },
            ],
            colors: [
              theme.vars.palette.primary.dark,
              theme.palette.error.main,
              theme.vars.palette.warning.main,
            ],
          }}
          sx={{ height: '100%' }}
        />
      </Card>
    </Box>
  );
};

export default HRDashboardAttendanceTrend;
