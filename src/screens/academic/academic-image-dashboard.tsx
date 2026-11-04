'use client';

import dynamic from 'next/dynamic';
import { Stack } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAcademicInsights } from './insights/use-academic-insights';
import { AcademicInsightsSkeleton } from './insights/components/academic-insights-skeleton';

const AcademicDesignScreen = dynamic(() => import('./dashboard-design/academic-design-screen'), {
  loading: () => <Stack spacing={1} sx={{ pb: 2, minWidth: 0 }}>
    <CustomBreadcrumbs heading="Academic Dashboard" description="Academic insights and permitted workflows for your assigned responsibilities."
      links={[{ name: 'Academics' }, { name: 'Dashboard' }]} />
    <AcademicInsightsSkeleton />
  </Stack>,
});

export default function AcademicImageDashboard() {
  const query = useAcademicInsights();
  return <AcademicDesignScreen query={query} />;
}
