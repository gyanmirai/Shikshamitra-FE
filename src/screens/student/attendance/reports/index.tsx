'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CommonReport from 'src/components/common-report';
import CustomTooltip from 'src/components/custom-tooltip';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Button, IconButton, Typography } from '@mui/material';

import StudentWiseAbsentDays from './components/StudentWiseAbsentDays';
import MonthlyStrengthSummary from './components/MonthlyStrengthSummary';
import StudentAttendanceSheet from './components/StudentAttendanceSheet';
import DailyStrengthGenderWiseSummary from './components/DailyStrengthGenderWiseSummary';
import DailyStrengthAttendanceSummary from './components/DailyStrengthAttendanceSummary';
import StudentAttendanceRegisterSmall from './components/StudentAttendanceRegisterSmall';
import StudentWiseAbsentDaysDateRange from './components/StudentWiseAbsentDaysDateRange';
import MonthlyStrengthSummaryDateRange from './components/MonthlyStrengthSummaryDateRange';
import MonthlyStrengthAttendanceSummary from './components/MonthlyStrengthAttendanceSummary';

const AttendanceReportScreen = () => {
  const openGenerateReport = useBoolean();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Reports"
        description="Generate and filter attendance reports by class, division, date range, and other criteria."
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Attendance', href: '/student/attendance/dashboard/' },
          { name: 'Reports' },
        ]}
        sx={{ mb: 1 }}
        isBack={openGenerateReport.value}
        onBack={openGenerateReport.onFalse}
        action={
          <Button
            variant="contained"
            size="small"
            onClick={openGenerateReport.onTrue}
            startIcon={<Iconify icon={GlobalIcons.report} />}
          >
            Generate Report
          </Button>
        }
      />
      {openGenerateReport.value ? (
        <CommonReport
          categories={[
            {
              name: 'Daily',
              id: 'Daily',
              icon: 'solar:calendar-outline',
            },
            {
              name: 'Monthly',
              id: 'Monthly',
              icon: 'solar:calendar-mark-outline',
            },
            {
              name: 'Student-Specific',
              id: 'Student-Specific',
              icon: 'mdi:account-student',
            },
          ]}
          subCategories={[
            // Daily Reports
            {
              name: 'Daily Strength & Gender Summary',
              id: 'daily-gender-summary',
              icon: '',
              render: () => <DailyStrengthGenderWiseSummary />,
              description: 'View daily strength summary by gender',
              categoryId: 'Daily',
            },
            {
              name: 'Daily Strength & Attendance',
              id: 'daily-attendance-summary',
              icon: '',
              render: () => <DailyStrengthAttendanceSummary />,
              description: 'View daily attendance and strength summary',
              categoryId: 'Daily',
            },

            // Monthly Reports
            {
              name: 'Monthly Strength Summary',
              id: 'monthly-strength-summary',
              icon: '',
              render: () => <MonthlyStrengthSummary />,
              description: 'View monthly strength summary',
              categoryId: 'Monthly',
            },
            {
              name: 'Monthly Strength & Attendance',
              id: 'monthly-attendance-summary',
              icon: '',
              render: () => <MonthlyStrengthAttendanceSummary />,
              description: 'View monthly strength and attendance summary',
              categoryId: 'Monthly',
            },
            {
              name: 'Attendance Register (Small)',
              id: 'attendance-register-small',
              icon: '',
              render: () => <StudentAttendanceRegisterSmall />,
              description: 'View attendance register in small format',
              categoryId: 'Monthly',
            },
            {
              name: 'Attendance Sheet',
              id: 'attendance-sheet',
              icon: '',
              render: () => <StudentAttendanceSheet />,
              description: 'View monthly attendance sheet',
              categoryId: 'Monthly',
            },

            // Student-Specific Reports
            {
              name: 'Student Absent Days',
              id: 'student-absent-days',
              icon: '',
              render: () => <StudentWiseAbsentDays />,
              description: 'View student-wise absent days',
              categoryId: 'Student-Specific',
            },
            {
              name: 'Absent Days (Date Range)',
              id: 'absent-days-date-range',
              icon: '',
              render: () => <StudentWiseAbsentDaysDateRange />,
              description: 'View absent days with custom date range',
              categoryId: 'Student-Specific',
            },
            {
              name: 'Monthly Strength (Date Range)',
              id: 'monthly-strength-date-range',
              icon: '',
              render: () => <MonthlyStrengthSummaryDateRange />,
              description: 'View monthly strength with custom date range',
              categoryId: 'Student-Specific',
            },
          ]}
        />
      ) : (
        <CustomizableTable
          tableId="attendance-reports"
          columns={[
            {
              label: 'Report Name',
              id: 'reportName',
              minWidth: '15vw',
              align: 'left',
              sticky: true,
            },
            { label: 'Report Category', id: 'reportCategory', minWidth: '10vw', align: 'left' },
            {
              label: 'Report Description',
              id: 'reportDescription',
              minWidth: '12vw',
              align: 'left',
              render(value, row) {
                return (
                  <CustomTooltip title={row.reportDescription} arrow sx={{ textAlign: 'justify' }}>
                    <Typography
                      variant="caption"
                      sx={{
                        fontSize: '13px',
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '12vw',
                      }}
                    >
                      {row.reportDescription}
                    </Typography>
                  </CustomTooltip>
                );
              },
            },
            {
              label: 'Generate Report Date',
              id: 'generateReportDate',
              minWidth: '13vw',
              align: 'left',
            },
            {
              label: 'Applied Filters',
              id: 'appliedFilters',
              minWidth: 400,
              align: 'left',
              render(value, row) {
                return (
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {row.appliedFilters.map((filter: any) => (
                      <Chip
                        size="small"
                        variant="soft"
                        key={filter.name}
                        label={`${filter.name}: ${filter.value}`}
                      />
                    ))}
                  </Box>
                );
              },
            },
            {
              label: ' Action',
              id: 'reportAction',
              minWidth: '5vw',
              align: 'left',
              isFilter: false,
              isSort: false,
              sticky: true,
              render(value, row) {
                return (
                  <IconButton size="small" onClick={() => {}}>
                    <Iconify icon={GlobalIcons.report} />
                  </IconButton>
                );
              },
            },
          ]}
          data={[
            {
              reportName: 'Daily Strength & Gender Summary',
              reportCategory: 'Daily',
              reportDescription: 'View daily strength summary by gender',
              generateReportDate: '2025-12-02',
              appliedFilters: [
                { name: 'Organization', value: 'Primary' },
                { name: 'Class', value: 'All' },
                { name: 'Gender', value: 'Male | Female' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Student Absent Days',
              reportCategory: 'Student-Specific',
              reportDescription: 'View student-wise absent days',
              generateReportDate: '2025-12-01',
              appliedFilters: [
                { name: 'Organization', value: 'Primary' },
                { name: 'Class', value: 'Class 10' },
                { name: 'Division', value: 'A' },
                { name: 'Roll No', value: '25' },
              ],
              reportAction: 'View',
            },
          ]}
        />
      )}
    </Box>
  );
};

export default AttendanceReportScreen;
