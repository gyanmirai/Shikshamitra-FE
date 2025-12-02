'use client';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type { TabComponentType } from 'src/screens/hr/leave-request';

import React, { useMemo } from 'react';
import { Iconify } from 'src/components/iconify';
import { useSearchParam } from 'src/hooks/use-search-param';
import { Box, Card, Grid, Paper, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { HomeworkReportTitle } from 'src/enums/homework-wise-reports';
import { AssignmentReportTitle } from 'src/enums/assignment-wise-report';
import { HomeworkAssignmentAnalyticReportTitle } from 'src/enums/homeworkAssignmentAnalytic-report';

import HomeworkManagementReports from './Components/homeworkTypeReports/HomeworkTypeReports';
import AssignmentManagementReports from './Components/assignmentTypeReports/AssignmentTypeReports';
import HomeworkAssignmentAnalyticsReports from './Components/analyticsTypeReports/AnalyticsTypeReports';

const TABS = [
  {
    icon: <Iconify icon="mdi:file-document-outline" width={20} />,
    value: 'homeworkReports',
    label: 'Homework Reports',
    component: (props: TabComponentType) => <HomeworkManagementReports />,
    reportList: [
      {
        name: HomeworkReportTitle.DailyHomeworkReport,
        label: 'Daily Homework Report',
      },
      {
        name: HomeworkReportTitle.ClassWiseHomeworkReport,
        label: 'Class-wise Homework Report',
      },
      {
        name: HomeworkReportTitle.SubjectWiseHomeworkReport,
        label: 'Subject-wise Homework Report',
      },
      {
        name: HomeworkReportTitle.TeacherWiseHomeworkReport,
        label: 'Teacher-wise Homework Report',
      },
      {
        name: HomeworkReportTitle.StudentWiseHomeworkSummaryReport,
        label: 'Student-wise Homework Summary Report',
      },
      {
        name: HomeworkReportTitle.HomeworkCompletionStatusReport,
        label: 'Homework Completion Status Report',
      },
      {
        name: HomeworkReportTitle.PendingHomeworkReport,
        label: 'Pending Homework Report',
      },
      {
        name: HomeworkReportTitle.OverdueHomeworkReport,
        label: 'Overdue Homework Report',
      },
      {
        name: HomeworkReportTitle.HomeworkSubmissionHistoryReport,
        label: 'Homework Submission History Report',
      },
      {
        name: HomeworkReportTitle.HomeworkWithAttachmentsReport,
        label: 'Homework with Attachments Report',
      },
      {
        name: HomeworkReportTitle.HomeworkAcknowledgementReport,
        label: 'Homework Acknowledgement Report',
      },
    ],
  },
  {
    icon: <Iconify icon="mdi:file-document-check-outline" width={20} />,
    value: 'assignmentReports',
    label: 'Assignment Reports',
    component: (props: TabComponentType) => <AssignmentManagementReports />,
    reportList: [
      {
        name: AssignmentReportTitle.AssignmentIssuanceReport,
        label: 'Assignment Issuance Report',
      },
      {
        name: AssignmentReportTitle.AssignmentSubmissionReport,
        label: 'Assignment Submission Report',
      },
      {
        name: AssignmentReportTitle.AssignmentEvaluationReport,
        label: 'Assignment Evaluation Report',
      },
      {
        name: AssignmentReportTitle.AssignmentMarksReport,
        label: 'Assignment Marks Report',
      },
      {
        name: AssignmentReportTitle.LateSubmissionReport,
        label: 'Late Submission Report',
      },
      {
        name: AssignmentReportTitle.MissingAssignmentReport,
        label: 'Missing Assignment Report',
      },
      {
        name: AssignmentReportTitle.AssignmentFeedbackReport,
        label: 'Assignment Feedback Report',
      },
      {
        name: AssignmentReportTitle.AssignmentGradeDistributionReport,
        label: 'Assignment Grade Distribution Report',
      },
      {
        name: AssignmentReportTitle.AssignmentPerformanceReport,
        label: 'Assignment Performance Report',
      },
    ],
  },
  {
    icon: <Iconify icon="solar:chart-square-outline" width={20} />,
    value: 'analyticsMonitoring',
    label: 'Analytics & Monitoring',
    component: (props: TabComponentType) => <HomeworkAssignmentAnalyticsReports />,
    reportList: [
      {
        name: HomeworkAssignmentAnalyticReportTitle.HomeworkLoadAnalysisReport,
        label: 'Homework Load Analysis Report',
      },
      {
        name: HomeworkAssignmentAnalyticReportTitle.AssignmentLoadAnalysisReport,
        label: 'Assignment Load Analysis Report',
      },
      {
        name: HomeworkAssignmentAnalyticReportTitle.TeacherPerformanceInHomeworkEvaluationReport,
        label: 'Teacher Performance in Homework Evaluation Report',
      },
      {
        name: HomeworkAssignmentAnalyticReportTitle.StudentPerformanceTrendReport,
        label: 'Student Performance Trend Report',
      },
      {
        name: HomeworkAssignmentAnalyticReportTitle.ClasswiseOverallHomeworkAssignmentReport,
        label: 'Class-wise Overall Homework & Assignment Report',
      },
    ],
  },
];

const HomeworkAssignmentReports = ({ addReportDialog }: { addReportDialog: UseBooleanReturn }) => {
  // Initialize search params with default tab 'homeworkReports'
  const [searchParams, setSearchParams] = useSearchParam({ tab: 'homeworkReports' });

  // Find and memoize the currently active tab component based on search params
  const currentActiveComponent = useMemo(
    () => TABS.find((tab) => tab.value === searchParams?.tab),
    [searchParams.tab]
  );

  const dynamicLabel =
    currentActiveComponent?.value === 'homeworkReports'
      ? 'Homework Reports'
      : currentActiveComponent?.value === 'assignmentReports'
        ? 'Assignment Reports'
        : 'Analytics & Monitoring';
  const handleTabChange = (newValue: string) => {
    setSearchParams({ tab: newValue });
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading={dynamicLabel}
        description={
          currentActiveComponent?.value === 'homeworkReports'
            ? 'Explore and export homework-related reports and insights.'
            : currentActiveComponent?.value === 'assignmentReports'
              ? 'Browse and export assignment reports for classes and subjects.'
              : 'Monitor trends, performance, and submission analytics.'
        }
        links={[
          { name: 'Academics', href: '/academic/dashboard' },
          { name: 'Homework & Assignment', href: '/academic/homeworkCreation' },
          { name: 'Reports', href: '#' },
          { name: dynamicLabel },
        ]}
        isBack
        onBack={() => addReportDialog.onFalse()}
        sx={{ mb: 2 }}
      />
      <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)', p: 2 }}>
        {/* Top Cards Section */}
        <Grid container spacing={2} mb={2}>
          {TABS.map((tab) => {
            const isActive = searchParams.tab === tab.value;
            return (
              <Grid size={{ xs: 12, md: 3 }} key={tab.value}>
                <Paper
                  onClick={() => handleTabChange(tab.value)}
                  elevation={isActive ? 4 : 1}
                  sx={{
                    p: 1,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                    transition: 'all 0.3s ease',
                    border: (theme) =>
                      isActive
                        ? `2px solid ${theme.palette.primary.main}`
                        : `1px solid ${theme.palette.divider}`,
                    bgcolor: (theme) =>
                      isActive ? theme.palette.action.selected : theme.palette.background.paper,
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: (theme) => theme.customShadows.z4,
                      borderColor: (theme) => theme.palette.primary.main,
                    },
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      borderRadius: '50%',
                      bgcolor: (theme) =>
                        isActive ? theme.palette.primary.main : theme.palette.action.hover,
                      color: (theme) =>
                        isActive
                          ? theme.palette.primary.contrastText
                          : theme.palette.text.secondary,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {tab.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                      {tab.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tab.value === 'homeworkReports'
                        ? 'Daily & Subject-wise'
                        : tab.value === 'assignmentReports'
                          ? 'Submission & Grades'
                          : 'Trends & Analysis'}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        {/* Content Section */}
        <Box sx={{ flexGrow: 1 }}>
          {currentActiveComponent?.component && (
            <currentActiveComponent.component
              searchParams={searchParams}
              setSearchParams={setSearchParams}
            />
          )}
        </Box>
      </Card>
    </Box>
  );
};
export default HomeworkAssignmentReports;
