'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import { Box } from '@mui/material';
import CommonReport from 'src/components/common-report';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { CurriculumReportTitleOptions } from 'src/enums/curriuculum-reports';

import CurriculumReportForm from './CurriculumReportForm';

const CurriculumReports = ({ addReportDialog }: { addReportDialog: UseBooleanReturn }) => {
  const categories = [
    {
      name: 'Curriculum Reports',
      id: 'CurriculumReports',
      icon: 'mdi:file-document-multiple-outline',
    },
  ];

  const subCategories = CurriculumReportTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `CurriculumReports-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'CurriculumReports',
    render: () => <CurriculumReportForm report={opt.name} />,
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Generate Report"
        links={[
          { name: 'Academic', href: '/academic/dashboard/' },
          { name: 'Curriculum Management', href: '/academic/curriculum-management/dashboard/' },
          { name: 'Generate Report' },
        ]}
        isBack={addReportDialog?.value}
        onBack={() => {
          addReportDialog?.onFalse();
        }}
        sx={{ mb: 1 }}
      />

      <CommonReport categories={categories} subCategories={subCategories} />
    </Box>
  );
};

export default CurriculumReports;
