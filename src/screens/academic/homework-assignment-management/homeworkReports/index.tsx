'use client';

import React from 'react';
import { Box, Button } from '@mui/material';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CommonReport from 'src/components/common-report';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { HomeworkReportTitleOptions } from 'src/enums/homework-wise-reports';
import { AssignmentReportTitleOptions } from 'src/enums/assignment-wise-report';
import { HomeworkAssignmentAnalyticReportTitleOptions } from 'src/enums/homeworkAssignmentAnalytic-report';

import HomeworkManagementReports from './Components/homeworkTypeReports/HomeworkTypeReports';
import AssignmentManagementReports from './Components/assignmentTypeReports/AssignmentTypeReports';
import HomeworkAssignmentAnalyticsReports from './Components/analyticsTypeReports/AnalyticsTypeReports';

const HomeworkAssignmentReports = ({ addReportDialog }: { addReportDialog: any }) => {
  const categories = [
    { name: 'Homework', id: 'Homework', icon: 'mdi:file-document-outline' },
    { name: 'Assignment', id: 'Assignment', icon: 'mdi:file-document-check-outline' },
    { name: 'Analytics & Monitoring', id: 'Analytics', icon: 'solar:chart-square-outline' },
  ];

  const homeworkSubCategories = HomeworkReportTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `Homework-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'Homework',
    render: () => <HomeworkManagementReports report={opt.label} />,
  }));

  const assignmentSubCategories = AssignmentReportTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `Assignment-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'Assignment',
    render: () => <AssignmentManagementReports report={opt.label} />,
  }));

  const analyticsSubCategories = HomeworkAssignmentAnalyticReportTitleOptions.map((opt, index) => ({
    name: opt.label,
    id: `Analytics-${opt.label.replace(/\s+/g, '-')}-${index}`,
    icon: '',
    description: opt.label,
    categoryId: 'Analytics',
    render: () => <HomeworkAssignmentAnalyticsReports report={opt.label} />,
  }));

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Reports"
        description="Generate and export homework, assignment, and analytics reports."
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework & Assignment', href: '/academic/homeworkCreation' },
          { name: 'Reports' },
        ]}
        isBack={addReportDialog.value}
        onBack={addReportDialog.onFalse}
        action={
          <Button
            variant="contained"
            size="small"
            onClick={addReportDialog.onTrue}
            startIcon={<Iconify icon={GlobalIcons.report} />}
          >
            Generate Report
          </Button>
        }
      />

      <CommonReport
        categories={categories}
        subCategories={[
          ...homeworkSubCategories,
          ...assignmentSubCategories,
          ...analyticsSubCategories,
        ]}
      />
    </Box>
  );
};

export default HomeworkAssignmentReports;
