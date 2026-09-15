'use client';

import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CommonReport from 'src/components/common-report';
import CustomTooltip from 'src/components/custom-tooltip';
import sortQueryString from 'src/utils/sort-query-string';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { StudentRecordsReportTitle } from 'src/enums/studentRecordsReports';
import { Box, Chip, Stack, Button, IconButton, Typography } from '@mui/material';
import StudentRecordsReportForm from 'src/screens/student/reports/components/StudentRecordsReportForm';

import { AttendanceAiReportButton } from './components/AttendanceAiReportButton';

const AttendanceReportScreen = () => {
  const openGenerateReport = useBoolean();
  const [query, setQuery] = useState({
    sorting: '',
    skipCount: 0,
    maxResultCount: 10,
  });
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Reports"
        description="Generate and filter attendance reports by class, division, date range, and other criteria."
        links={[
          { name: 'Student', href: '/student/dashboard/' },
          { name: 'Attendance', href: '/student/dashboard/' },
          { name: 'Reports' },
        ]}
        isBack={openGenerateReport.value}
        onBack={openGenerateReport.onFalse}
        action={
          <Stack direction="row" spacing={1}>
            <AttendanceAiReportButton />
            <Button
              variant="contained"
              size="small"
              onClick={openGenerateReport.onTrue}
              startIcon={<Iconify icon={GlobalIcons.report} />}
            >
              Generate Report
            </Button>
          </Stack>
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
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.DailyStrengthGenderWiseSummary}
                />
              ),
              description: 'View daily strength summary by gender',
              categoryId: 'Daily',
            },
            {
              name: 'Daily Strength & Attendance',
              id: 'daily-attendance-summary',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.DailyStrengthAttendanceSummary}
                />
              ),
              description: 'View daily attendance and strength summary',
              categoryId: 'Daily',
            },

            // Monthly Reports
            {
              name: 'Monthly Attendance Summary',
              id: 'monthly-attendance-summary',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.MonthlyAttendanceSummary}
                />
              ),
              description: 'View attendance percentage for each class during a month',
              categoryId: 'Monthly',
            },
            {
              name: 'Monthly Attendance Register',
              id: 'monthly-attendance-register',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.MonthlyAttendanceRegister}
                />
              ),
              description: 'Generate month-wise attendance register',
              categoryId: 'Monthly',
            },
            {
              name: 'Monthly Strength Report',
              id: 'monthly-strength-report',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.MonthlyStrengthSummary}
                />
              ),
              description: 'Analyze attendance strength over a selected month',
              categoryId: 'Monthly',
            },

            // Student-Specific Reports
            {
              name: 'Student Absent Days Report',
              id: 'student-absent-days',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.StudentAbsentDaysReport}
                />
              ),
              description: 'View student-wise absent days',
              categoryId: 'Student-Specific',
            },
            {
              name: 'Absent Days Report (Date Range)',
              id: 'absent-days-date-range',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.AbsentDaysReportDateRange}
                />
              ),
              description: 'View absent days with custom date range',
              categoryId: 'Student-Specific',
            },
            {
              name: 'Monthly Strength Report (Date Range)',
              id: 'monthly-strength-date-range',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.MonthlyStrengthReportDateRange}
                />
              ),
              description: 'View monthly strength with custom date range',
              categoryId: 'Student-Specific',
            },
          ]}
        />
      ) : (
        <CustomizableTable
          tableTitle="Attendance Reports"
          tableId="attendance-reports"
          columns={[
            {
              label: 'Report Name',
              id: 'reportName',
              minWidth: '150px',
              align: 'left',
              sticky: true,
              render(value, row) {
                return (
                  <CustomTooltip title={row.reportName} arrow sx={{ textAlign: 'justify' }}>
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
                      {row.reportName}
                    </Typography>
                  </CustomTooltip>
                );
              },
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
              minWidth: '400px',
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
          serverSide
          onServerSort={(column, sortData) => {
            setQuery((prev) => ({
              ...prev,
              sorting: sortQueryString(sortData),
            }));
          }}
          onServerPagination={(page: number, rowsPerPage: number) => {
            setQuery((prev) => ({
              ...prev,
              skipCount: page * rowsPerPage,
              maxResultCount: rowsPerPage,
            }));
          }}
        />
      )}
    </Box>
  );
};

export default AttendanceReportScreen;
