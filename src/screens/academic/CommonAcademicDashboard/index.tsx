'use client';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { academicPaths } from 'src/constants/academic-menu';
import { Box, Grid, Stack, Button, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { DashboardWidgetWrapper } from 'src/screens/mainDashboard/component/dashboard-widget-wrapper';

const quickLinks = [
  {
    title: 'Academic Calendar',
    description: 'Review school days, events and academic schedules.',
    href: academicPaths.academicCalendar.management,
    icon: 'mdi:calendar-month-outline',
  },
  {
    title: 'Notifications',
    description: 'See academic announcements and workflow updates.',
    href: academicPaths.notification,
    icon: 'mdi:bell-outline',
  },
  {
    title: 'Student Academic 360',
    description: 'Open the student academic view when your access permits it.',
    href: academicPaths.studentAcademic360,
    icon: 'mdi:account-school-outline',
  },
];

export default function CommonAcademicDashboard({ displayName }: { displayName?: string }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 2 }}>
      <CustomBreadcrumbs
        heading={displayName ? `Welcome, ${displayName}` : 'Academic Dashboard'}
        description="Your academic links, calendar and permitted updates in one place."
        links={[{ name: 'Academics', href: academicPaths.dashboard }, { name: 'Dashboard' }]}
      />

      <Grid container spacing={1}>
        {quickLinks.map((item) => (
          <Grid key={item.title} size={{ xs: 12, md: 4 }}>
            <DashboardWidgetWrapper sx={{ minHeight: 180 }}>
              <Stack spacing={1.25} sx={{ height: 1 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 1.5,
                    display: 'grid',
                    placeItems: 'center',
                    color: 'primary.main',
                    bgcolor: 'primary.lighter',
                  }}
                >
                  <Iconify icon={item.icon} width={22} />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">{item.title}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {item.description}
                  </Typography>
                </Box>
                <Button
                  component={Link}
                  href={item.href}
                  size="small"
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Open
                </Button>
              </Stack>
            </DashboardWidgetWrapper>
          </Grid>
        ))}
      </Grid>

      <DashboardWidgetWrapper
        title="Academic Updates"
        subheader="Role-specific work appears automatically"
      >
        <EmptyContent
          filled
          title="No role-specific academic tasks"
          description="Your dashboard will expand automatically when teaching, class-teacher or leadership responsibilities are assigned."
          sx={{ minHeight: 260 }}
          slotProps={{ img: { maxWidth: 112 } }}
        />
      </DashboardWidgetWrapper>
    </Box>
  );
}
