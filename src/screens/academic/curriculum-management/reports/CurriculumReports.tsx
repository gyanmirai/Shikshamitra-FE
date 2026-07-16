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
    render: () => (
      <CurriculumReportForm report={opt.name} onSuccess={() => addReportDialog?.onFalse()} />
    ),
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        sx={{ mb: 1 }}
        heading="Generate Report"
        links={[
          { name: 'Academic', href: '/academic/dashboard/' },
          { name: 'Curriculum' },
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

export default CurriculumReports;
