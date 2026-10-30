'use client';

import dynamic from 'next/dynamic';
import { Box, Skeleton } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const AcademicInsightsScreen = dynamic(() => import('./insights/academic-insights-screen'), {
  loading: () => (
    <Box aria-label="Loading Academic dashboard" role="status">
      <CustomBreadcrumbs heading="Academic Dashboard"
        description="Academic insights and permitted workflows for your assigned responsibilities."
        links={[{ name: 'Academics' }, { name: 'Dashboard' }]} />
      <Skeleton variant="rounded" height={400} />
    </Box>
  ),
});

export default function AcademicDashboard() {
  return <AcademicInsightsScreen />;
}
