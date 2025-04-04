'use client';

import type { CardProps } from '@mui/material';

import React from 'react';
import Link from 'next/link';

import { useTheme } from '@mui/material/styles';
import { Box, Card, Grid, alpha, Typography, CardContent } from '@mui/material';

import { fShortenNumber } from 'src/utils/format-number';

import { varAlpha } from 'src/theme/styles';
import { EmployeeDashboardCard } from 'src/screens/hr/dashboard/dashboard';
import { AnalyticsCurrentVisits } from 'src/screens/student/enrollment/dashboard/organization-status';
import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';

import { CalendarView } from 'src/sections/calendar/view';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import type { TDashboardCardProps } from './type';

const CommunicationDashboard = () => {
  // Initialize theme object from MUI useTheme hook
  const theme = useTheme();

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Communication Dashboard"
        links={[{ name: 'Communication' }, { name: 'Communication Dashboard' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <DashBoardQuickAction
            actions={[
              {
                icon: 'mdi:announcement',
                label: 'Add Announcement',
                href: '/communication/announcement',
                color: 'success',
              },
              {
                icon: 'mdi:event',
                label: 'Add Event',
                href: '/communication/eventsAndCalendar',
                color: 'warning',
              },
              {
                icon: 'ri:survey-line',
                label: 'Add Survey',
                href: '/communication/feedbackAndSurvey',
                color: 'secondary',
              },
              {
                icon: 'mdi:virtual-meeting',
                label: 'Add Meeting',
                href: '/communication/meetings',
              },
            ]}
          />
        }
      />
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={3}>
          <EmployeeDashboardCard
            title="Total Announcement"
            icon="mdi:announcement"
            value={35}
            labels={[
              { name: 'School Wise : 10', color: 'info' },
              { name: 'Class Wise : 25', color: 'secondary' },
            ]}
            color="primary.main"
            // href="/hr/employee"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EmployeeDashboardCard
            title="Unread Messages"
            icon="mdi:message-text"
            value={5}
            labels={[]}
            color="error.main"
            // href="/hr/employee"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EmployeeDashboardCard
            title="Total Events"
            icon="mdi:event"
            value={55}
            labels={[
              { name: 'Active : 25', color: 'info' },
              { name: 'Upcoming : 20', color: 'warning' },
              { name: 'Completed : 10', color: 'secondary' },
            ]}
            color="secondary.main"
            // href="/hr/employee"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <EmployeeDashboardCard
            title="Total Survey"
            icon="ri:survey-line"
            value={47}
            labels={[
              { name: 'Active : 25', color: 'info' },
              { name: 'Upcoming : 12', color: 'warning' },
              { name: 'Completed : 10', color: 'secondary' },
            ]}
            color="warning.main"
            // href="/hr/employee"
          />
        </Grid>
      </Grid>

      <Grid item xs={12} mt={3}>
        <Card>
          <CardContent>
            <Typography variant="h6">Event Calendar</Typography>
            <CalendarView />
          </CardContent>
        </Card>
      </Grid>

      <Grid container spacing={2} mt={1}>
        <Grid item xs={12}>
          <Card sx={{ p: 1, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="flex-end" alignItems="flex-end">
              <CustomSelect
                label="Year"
                options={[
                  { value: '2024', label: '2024' },
                  { value: '2023', label: '2023' },
                  { value: '2022', label: '2022' },
                ]}
                onChange={() => {}}
                value=""
                formControlProps={{
                  sx: { width: '100%', maxWidth: '200px' },
                }}
              />
            </Box>
            <AnalyticsWebsiteVisits
              title="Organized Events"
              //   subheader="(+43%) than last year"
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                series: [{ name: 'Class 10-A', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] }],
                colors: [alpha(theme.palette.primary.dark, 0.8)],
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
      </Grid>
      <Grid container spacing={2} mt={1}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <AnalyticsCurrentVisits
              title="Survey Overview"
              chart={{
                series: [
                  { label: 'Survey 1', value: 50 },
                  { label: 'Survey 2', value: 20 },
                  { label: 'Survey 3', value: 30 },
                  { label: 'Survey 4', value: 5 },
                  { label: 'Survey 5', value: 5 },
                ],
              }}
              sx={{ boxShadow: 'none', height: '100%' }}
            />
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <PerformanceOverTime
              id="demo__4"
              title="Response Overview"
              //   subheader="(+43%) than last year"
              chart={{
                categories: [
                  'Jan',
                  'Feb',
                  'Mar',
                  'Apr',
                  'May',
                  'Jun',
                  'Jul',
                  'Aug',
                  'Sep',
                  'Oct',
                  'Nov',
                  'Dec',
                ],
                series: [
                  {
                    name: 'Positive',
                    data: [5, 10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                  },
                  {
                    name: 'Negative',
                    data: [40, 60, 47, 55, 59, 49, 69, 69, 91, 18, 35, 51, 50],
                  },
                ],
                options: {
                  legend: {
                    show: true,
                    position: 'top',
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CommunicationDashboard;

export const CommunicationDashboardCard: React.FC<TDashboardCardProps> = ({
  title,
  value,
  icon,
  href = '',
  color = 'success', // Default color
  description,
}) => {
  // Use theme to get color variants if needed
  const theme = useTheme();

  // Generate gradient background
  const getColorValue = (colorKey: string) => {
    // Check if the color exists in theme.vars.palette
    const paletteColor = theme.vars.palette[colorKey as keyof typeof theme.vars.palette];

    if (paletteColor && typeof paletteColor === 'object' && 'main' in paletteColor) {
      return paletteColor.main;
    }

    // Fallback to standard palette if vars.palette fails
    const standardPaletteColor = theme.palette[colorKey as keyof typeof theme.palette];

    if (
      standardPaletteColor &&
      typeof standardPaletteColor === 'object' &&
      'main' in standardPaletteColor
    ) {
      return standardPaletteColor.main;
    }

    // Default fallback
    return theme.palette.primary.main;
  };

  // Generate gradient background
  const gradientBackground = `linear-gradient(to right, ${getColorValue(color)} 0%, ${varAlpha(getColorValue(color), 0)} 100%)`;

  return (
    <Box
      component={Link}
      href={href}
      sx={{
        textDecoration: 'none',
        cursor: href ? 'pointer' : 'default',
        '&:hover': href
          ? {
              boxShadow: 6,
              transform: 'scale(1.02)',
              transition: '0.3s ease-in-out',
            }
          : {},
      }}
      onClick={href ? undefined : () => {}}
    >
      <Card
        sx={{
          py: 3,
          pl: 3,
          pr: 2.5,
          position: 'relative',
          height: '100%',
          overflow: 'hidden', // Ensure the background doesn't overflow
        }}
      >
        {/* Main Content */}
        <Box sx={{ flexGrow: 1, position: 'relative', zIndex: 1 }}>
          <Box sx={{ typography: 'h3' }}>{value}</Box>
          <Typography noWrap variant="subtitle2" component="div" sx={{ color: 'text.secondary' }}>
            {title}
          </Typography>
        </Box>

        {/* Icon */}
        <Iconify
          icon={icon}
          sx={{
            top: 24,
            right: 10,
            width: 36,
            height: 36,
            position: 'absolute',
            zIndex: 1,
          }}
        />

        {/* Background Gradient */}
        <Box
          sx={{
            top: -44,
            width: 160,
            zIndex: 0,
            height: 160,
            right: -104,
            opacity: 0.12,
            borderRadius: 3,
            position: 'absolute',
            transform: 'rotate(40deg)',
            background: gradientBackground,
          }}
        />
      </Card>
    </Box>
  );
};

type Props = CardProps & {
  title: string;
  total: number;
  percent?: number;
  icon: string;
};

export function BookingWidgetSummary({ title, percent, total, icon, sx, ...other }: Props) {
  return (
    <Card
      sx={{
        p: 2,
        pl: 3,
        display: 'flex',
        alignItems: 'center',
        ...sx,
      }}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Box sx={{ color: 'text.secondary', typography: 'subtitle2' }}>{title}</Box>
        <Box sx={{ my: 1.5, typography: 'h3' }}>{fShortenNumber(total)}</Box>
      </Box>

      <Iconify icon={icon} sx={{ width: 90, height: 90 }} />
    </Card>
  );
}
