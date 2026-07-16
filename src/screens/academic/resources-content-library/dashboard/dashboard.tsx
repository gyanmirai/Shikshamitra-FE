'use client';

import type { JSX } from 'react';
import type { CardProps } from '@mui/material';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import { Box, Card, Grid, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import DashBoardQuickAction from 'src/components/dashboard-quick-action';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

import RecentResources from './component/recentResources';

const quickStatsData = [
  { label: 'Total resources uploaded', value: 30 },
  { label: 'Shared resources', value: 10 },
  { label: 'Favorites', value: 3 },
];

const Dashboard = (props: TabComponentType) => {
  const theme = useTheme();
  return (
    <Box>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Dashboard"
        links={[{ name: 'Academics' }, { name: 'Resource Content Library' }, { name: 'Dashboard' }]}
        action={
          <DashBoardQuickAction
            actions={[
              {
                icon: 'mdi:plus',
                label: 'Resource',
                href: '/academic/resources-content-library/allResources',
                color: 'primary',
              },
              {
                icon: 'mdi:share-variant',
                label: 'My Share',
                href: '/academic/resources-content-library/sharedWithMe',
                color: 'warning',
              },
              {
                icon: 'mdi:plus',
                label: 'Resource Category',
                href: '/academic/resources-content-library/settings',
                color: 'secondary',
              },
            ]}
          />
        }
      />
      <Grid container spacing={1}>
        <RecentResources />
        <AnalyticsTrafficBySite list={quickStatsData} />
        <Grid size={{ xs: 12 }}>
          <Card sx={{ p: 2 }}>
            <AnalyticsWebsiteVisits
              title="Categories Overview"
              // subheader="(+43%) than last year"
              chart={{
                categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                series: [
                  { name: 'Assignments', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                  { name: 'Lectures', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                ],
                colors: [
                  alpha(theme.vars.palette.primary.dark, 0.8),
                  alpha(theme.vars.palette.warning.main, 0.8),
                ],
              }}
              sx={{ height: '100%' }}
            />
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
export default Dashboard;

type Props = CardProps & {
  title?: string;
  subheader?: string;
  list: { value: number; label: string }[];
};

const icons: { [key: string]: JSX.Element } = {
  'Total resources uploaded': <Iconify icon="mdi:resource-description-framework" />,
  'Shared resources': <Iconify icon="mdi:share-variant" />,
  Favorites: <Iconify icon="mdi:star" />,
};

export function AnalyticsTrafficBySite({ title, subheader, list, ...other }: Props) {
  const theme = useTheme();

  return (
    <Grid size={{ xs: 12, md: 6 }}>
      <Card {...other}>
        <Box display="grid" gap={1} gridTemplateColumns="repeat(2, 1fr)" sx={{ p: 3 }}>
          {list.map((site) => (
            <Box
              key={site.label}
              sx={{
                py: 2.5,
                display: 'flex',
                borderRadius: 1.5,
                textAlign: 'center',
                alignItems: 'center',
                flexDirection: 'column',
                border: `solid 1px ${varAlpha(theme.vars.palette.grey['500Channel'], 0.12)}`,
              }}
            >
              {icons[site.label]}
              <Typography variant="h6" sx={{ mt: 1 }}>
                {site.value}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {site.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Card>
    </Grid>
  );
}
