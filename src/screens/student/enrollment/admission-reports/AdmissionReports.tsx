'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import React from 'react';
import { Box } from '@mui/material';
import CommonReport from 'src/components/common-report';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AdmissionReportTitleOptions } from 'src/enums/admission-reports';

import AdmissionReportForm from './AdmissionReportForm';

const AdmissionReports = ({ addReportDialog }: { addReportDialog: UseBooleanReturn }) => {
  const categories = [
    {
      name: 'Inquiry Reports',
      id: 'InquiryReports',
      icon: 'mdi:help-circle-outline',
    },
    {
      name: 'Registration Form Issued Reports',
      id: 'RegistrationFormIssuedReports',
      icon: 'mdi:file-document-edit-outline',
    },
    {
      name: 'Registration Reports',
      id: 'RegistrationReports',
      icon: 'mdi:clipboard-list-outline',
    },
    {
      name: 'Entrance Exam Reports',
      id: 'EntranceExamReports',
      icon: 'mdi:school-outline',
    },
    {
      name: 'Admission Reports',
      id: 'AdmissionReports',
      icon: 'mdi:account-check-outline',
    },
  ];

  const subCategories = AdmissionReportTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `AdmissionReports-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: opt.category,
    render: () => (
      <AdmissionReportForm report={opt.name} onSuccess={() => addReportDialog?.onFalse()} />
    ),
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Generate Report"
        links={[
          { name: 'Student', href: '/student/dashboard/' },
          { name: 'Enrollment' },
          { name: 'Admission Reports' },
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

export default AdmissionReports;
