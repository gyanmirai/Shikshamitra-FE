'use client';

import type { UseBooleanReturn } from 'src/hooks/useBoolean';

import React from 'react';
import { Box } from '@mui/material';
import CommonReport from 'src/components/common-report';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { TimetableReportTitleOptions } from 'src/enums/timetable-reports';

import TimetableReportForm from './TimetableReportForm';

const TimetableReports = ({ addReportDialog }: { addReportDialog: UseBooleanReturn }) => {
  const categories = [
    {
      name: 'Timetable Reports',
      id: 'TimetableReports',
      icon: 'mdi:calendar-clock',
    },
  ];

  const subCategories = TimetableReportTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `TimetableReports-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'TimetableReports',
    render: () => <TimetableReportForm report={opt.name} />,
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Generate Report"
        links={[
          { name: 'Academic', href: '/academic/dashboard/' },
          {
            name: 'Timetable',
            href: '/academic/timetable-schedule-management/dashboard/',
          },
          { name: 'Generate Report' },
        ]}
        isBack={addReportDialog?.value}
        onBack={() => {
          addReportDialog?.onFalse();
        }}
      />

      <CommonReport categories={categories} subCategories={subCategories} />
    </Box>
  );
};

export default TimetableReports;
