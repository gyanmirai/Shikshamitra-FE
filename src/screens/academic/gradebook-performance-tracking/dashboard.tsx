import React from 'react';

import { Edit, Warning, AccessTime, CheckCircle, AccessTimeFilled } from '@mui/icons-material';
import {
  Box,
  Grid,
  Card,
  Paper,
  alpha,
  Button,
  useTheme,
  Typography,
  CardContent,
  LinearProgress,
} from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const Dashboard = () => {
  const theme = useTheme();
  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 3,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              height: '100%',
              bgcolor: varAlpha(theme.palette.info.mainChannel, 0.4),
            }}
          >
            <CheckCircle sx={{ fontSize: 32, mr: 2, color: 'info.main' }} />
            <Box>
              <Typography variant="h6" fontWeight="bold" gutterBottom>
                Total Grades Entered
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                150
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{
              p: 2,
              bgcolor: varAlpha(theme.palette.primary.mainChannel, 0.4),
              height: '100%',
            }}
          >
            <Typography variant="h5" gutterBottom>
              Average Class Performance
            </Typography>
            <Typography variant="h6">GPA: 3.2 (B)</Typography>
            <LinearProgress variant="determinate" value={80} sx={{ mt: 2, mb: 1 }} />
            <Grid container justifyContent="space-between">
              <Grid item>
                <Typography variant="body2" color="primary" sx={{ fontWeight: 'bold' }}>
                  Highest: 4.0 (A)
                </Typography>
              </Grid>
              <Grid item>
                <Typography variant="body2" color="error" sx={{ fontWeight: 'bold' }}>
                  Lowest: 2.0 (C)
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper
            elevation={3}
            sx={{ p: 2, bgcolor: varAlpha(theme.palette.warning.mainChannel, 0.4) }}
          >
            <Typography variant="h5" gutterBottom>
              Pending Grades
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="h6">
                  <AccessTime color="action" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Pending: 10
                </Typography>
                <Typography variant="body2">Quizzes: 2</Typography>
                <Typography variant="body2">Tests: 3</Typography>
                <Typography variant="body2">Assignments: 5</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="h6">
                  <Warning color="error" sx={{ mr: 1, verticalAlign: 'middle' }} />
                  Overdue: 3
                </Typography>
                <Typography variant="body2">Tests: 1</Typography>
                <Typography variant="body2">Assignments: 2</Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <AnalyticsCurrentVisits
            title="Grade Distribution"
            chart={{
              series: [
                { label: 'A', value: 3500 },
                { label: 'B', value: 2500 },
                { label: 'C', value: 1500 },
                { label: 'D', value: 500 },
              ],
            }}
            sx={{ height: '100%' }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <AnalyticsWebsiteVisits
            title="Performance Levels"
            //   subheader="(+43%) than last year"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
              series: [
                { name: 'High', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                { name: 'Medium', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                { name: 'Low', data: [51, 67, 47, 97, 40, 57, 24, 60, 24] },
              ],
              colors: [
                alpha(theme.palette.primary.dark, 0.8),
                alpha(theme.palette.warning.main, 0.8),
                alpha(theme.palette.error.main, 0.8),
              ],
            }}
            sx={{ height: '100%' }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 2,
              backgroundColor: varAlpha(theme.palette.warning.mainChannel, 0.4),
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Edit color="warning" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Pending grade submissions</Typography>
              </Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Submit grades for Math Class
              </Typography>
              <Box display="flex" justifyContent="flex-end">
                <Button variant="outlined" sx={{ mr: 1 }}>
                  View
                </Button>
                <Button variant="contained">Complete</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Overdue Performance Evaluations */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 2,
              backgroundColor: varAlpha(theme.palette.error.mainChannel, 0.4),
            }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccessTimeFilled color="error" sx={{ mr: 1 }} />
                <Typography variant="subtitle1">Overdue performance evaluations</Typography>
              </Box>
              <Typography variant="body2" color="error" gutterBottom>
                04 Grades are overdue
              </Typography>
              <Box display="flex" justifyContent="flex-end">
                <Button variant="outlined" sx={{ mr: 1 }}>
                  View
                </Button>
                <Button variant="contained">Complete</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Reminders */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{ borderRadius: 2, backgroundColor: varAlpha(theme.palette.info.mainChannel, 0.4) }}
          >
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <Iconify icon="mdi:reminder" color={theme.palette.info.main} sx={{ mr: 1 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Reminders
                </Typography>
              </Box>

              <Typography variant="body2" color="textSecondary" gutterBottom>
                - Underperforming students - 08
              </Typography>
              <Box display="flex" justifyContent="flex-end">
                <Button variant="outlined" sx={{ mr: 1 }}>
                  View
                </Button>
                <Button variant="contained">Complete</Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
