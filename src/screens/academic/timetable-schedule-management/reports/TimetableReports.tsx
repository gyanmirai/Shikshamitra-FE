'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

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
    description: 'Choose the available filters, preview the report, then queue the export.',
    configurationHelp:
      'Select the available academic scope and date filters. Preview the selected records before queueing an export.',
    categoryId: 'TimetableReports',
    render: () => <TimetableReportForm report={opt.name} />,
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Generate Report"
        description="Generate and manage timetable reports"
        links={[
          { name: 'Academics', href: '/academic/dashboard/' },
          {
            name: 'Timetable',
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
