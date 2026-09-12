'use client';

import Link from 'next/link';
import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import { CustomTabs } from 'src/components/custom-tabs';
import { Tab, Stack, Paper, Typography } from '@mui/material';

import { studentSetupViews, type StudentSetupView } from './student-setup-view';

type StudentSetupTaskNavigationProps = {
  activeView: StudentSetupView;
  counts: Record<StudentSetupView, number>;
  getViewHref: (view: StudentSetupView) => string;
};

export default function StudentSetupTaskNavigation({
  activeView,
  counts,
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
        slotProps={{
          scroller: { p: 0.5 },
          tab: { minHeight: 44, px: { xs: 1.25, sm: 2 } },
          flexContainer: { gap: 0.5 },
        }}
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
            icon={<Iconify icon={view.icon} width={19} />}
            iconPosition="start"
            label={
              <Stack direction="row" alignItems="center" spacing={0.75}>
                <Typography component="span" variant="body2" fontWeight={600}>
                  {view.label}
                </Typography>
                <Label
                  variant="soft"
                  color={activeView === view.value ? 'primary' : 'default'}
                  sx={{ minWidth: 24, height: 22, px: 0.75 }}
                >
                  {counts[view.value]}
                </Label>
              </Stack>
            }
            sx={{ textDecoration: 'none' }}
          />
        ))}
      </CustomTabs>
    </Paper>
  );
}
