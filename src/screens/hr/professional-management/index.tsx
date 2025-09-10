'use client';

import React, { useMemo } from 'react';
import { Box, Tab } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomTabs } from 'src/components/custom-tabs';
import { useSearchParam } from 'src/hooks/use-search-param';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import KPISetup from './kpi-setup';
import ReviewHistory from './review-history';
import PerformanceReview from './performance-review';

const TABS = [
  {
    value: 'performanceReviews',
    label: 'Performance Review',
    icon: <Iconify icon="solar:user-id-bold" width={20} />,
    component: () => <PerformanceReview />,
  },
  {
    value: 'kpiSetup',
    label: 'KPI Setup',
    icon: <Iconify icon="mingcute:heart-fill" width={20} />,
    component: () => <KPISetup />,
  },
  {
    value: 'reviewHistory',
    label: 'Review History',
    icon: <Iconify icon="mdi:history" width={20} />,
    component: () => <ReviewHistory />,
  },
];

const ProfessionalManagementScreen = () => {
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'performanceReviews' });

  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );
  return (
    <Box>
      <CustomBreadcrumbs
        heading={currentActiveComponent?.label}
        description={
          searchParams.tab === 'performanceReviews'
            ? 'Review employee performance, provide feedback, and track progress by department or period.'
            : searchParams.tab === 'kpiSetup'
              ? 'Define and manage KPIs by role and organization to track employee performance effectively.'
              : 'View past performance reviews by date, department, and reviewer for reference and tracking.'
        }
        links={[
          { name: 'HR' },
          { name: 'Attendance & Leave' },
          { name: currentActiveComponent?.label },
        ]}
        sx={{ px: 1, mb: 2 }}
      />
      <CustomTabs
        value={searchParams.tab}
        onChange={(e, value) => setSearchParams({ tab: value })}
        sx={{ '& .MuiTabs-flexContainer': { gap: 1.5 } }}
        role="tablist"
      >
        {TABS.map((tab) => (
          <Tab
            // sx={{ fontSize: '12px' }}
            key={tab.value}
            value={tab.value}
            icon={tab.icon}
            label={tab.label}
            role="tab"
          />
        ))}
      </CustomTabs>
      <Scrollbar sx={{ p: 1 }}>
        {currentActiveComponent?.component && (
          <currentActiveComponent.component
          // searchParams={searchParams}
          // setSearchParams={setSearchParams}
          />
        )}
      </Scrollbar>
    </Box>
  );
};

export default ProfessionalManagementScreen;
