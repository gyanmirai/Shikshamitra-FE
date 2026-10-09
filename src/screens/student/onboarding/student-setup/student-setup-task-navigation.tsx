'use client';

import Link from 'next/link';
import { Tab, Paper } from '@mui/material';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';

import { studentSetupViews, type StudentSetupView } from './student-setup-view';

type StudentSetupTaskNavigationProps = {
  activeView: StudentSetupView;
  getViewHref: (view: StudentSetupView) => string;
};

export default function StudentSetupTaskNavigation({
  activeView,
  getViewHref,
}: StudentSetupTaskNavigationProps) {
  return (
    <Paper variant="outlined" sx={{ flexShrink: 0, overflow: 'hidden' }}>
      <CustomTabs
        value={activeView}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label="Student setup tasks"
        sx={{ '& .MuiTabs-flexContainer': { gap: 1 } }}
      >
        {studentSetupViews.map((view) => (
          <Tab
            key={view.value}
            component={Link}
            href={getViewHref(view.value)}
            prefetch={false}
            value={view.value}
            id={`student-setup-${view.value}-tab`}
            aria-controls={`student-setup-${view.value}-panel`}
            icon={<Iconify icon={view.icon} width={20} />}
            iconPosition="start"
            label={view.label}
            sx={{ minHeight: 44, py: 1, textDecoration: 'none' }}
          />
        ))}
      </CustomTabs>
    </Paper>
  );
}
