'use client';

import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CommonReport from 'src/components/common-report';
import sortQueryString from 'src/utils/sort-query-string';
import { Box, Chip, Button, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import ClassMasterReport from './components/ClassMasterReport';
import ClassCircularReport from './components/ClassCircularReport';
import SectionMasterReport from './components/SectionMasterReport';
import SubjectMasterReport from './components/SubjectMasterReport';
import ClassAllocationReport from './components/ClassAllocationReport';
import TeacherWorkloadReport from './components/TeacherWorkloadReport';
import ClassActivityLogReport from './components/ClassActivityLogReport';
import ClassroomAllocationReport from './components/ClassroomAllocationReport';
import ClassSectionCapacityReport from './components/ClassSectionCapacityReport';
import ClassStrengthSummaryReport from './components/ClassStrengthSummaryReport';
import SectionChangeRequestReport from './components/SectionChangeRequestReport';
import ClassCommunicationLogReport from './components/ClassCommunicationLogReport';
import ClassPromotionSummaryReport from './components/ClassPromotionSummaryReport';
import ClassroomAvailabilityReport from './components/ClassroomAvailabilityReport';
import ClassPromotionDemotionReport from './components/ClassPromotionDemotionReport';
import ClassroomAssetResourceReport from './components/ClassroomAssetResourceReport';
import TeacherClassAllocationReport from './components/TeacherClassAllocationReport';
import SubjectWiseStudentCountReport from './components/SubjectWiseStudentCountReport';
// Class & Section Reports
import ClassAcademicYearSummaryReport from './components/ClassAcademicYearSummaryReport';
import ClassManagementDashboardReport from './components/ClassManagementDashboardReport';
import TeacherSubjectAllocationReport from './components/TeacherSubjectAllocationReport';
import ClassroomMaintenanceRequestReport from './components/ClassroomMaintenanceRequestReport';
import ClassroomCapacityUtilizationReport from './components/ClassroomCapacityUtilizationReport';
import ParentTeacherMeetingAttendanceReport from './components/ParentTeacherMeetingAttendanceReport';

const ReportsScreen = () => {
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
        description="Generate and filter class management reports by class, section, teacher, subject, and other criteria."
        links={[
          { name: 'Class Management', href: '/classManagement/dashboard/' },
          { name: 'Reports' },
        ]}
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
              name: 'Class & Section',
              id: 'Class-Section',
              icon: 'mdi:google-classroom',
            },
            {
              name: 'Teacher & Subject',
              id: 'Teacher-Subject',
              icon: 'mdi:teach',
            },
            {
              name: 'Classroom Management',
              id: 'Classroom-Management',
              icon: 'mdi:door-open',
            },
            {
              name: 'Parent Communication',
              id: 'Parent-Communication',
              icon: 'mdi:message-text',
            },
            {
              name: 'Administrative',
              id: 'Administrative',
              icon: 'mdi:file-document',
            },
          ]}
          subCategories={[
            // Class & Section Reports
            {
              name: 'Class Master Report',
              id: 'Class-Master-Report',
              icon: '',
              render: () => <ClassMasterReport />,
              description: 'View class master details including medium, teacher, and capacity',
              categoryId: 'Class-Section',
            },
            {
              name: 'Section Master Report',
              id: 'Section-Master-Report',
              icon: '',
              render: () => <SectionMasterReport />,
              description: 'View section details with strength and class teacher information',
              categoryId: 'Class-Section',
            },
            {
              name: 'Class & Section Capacity Report',
              id: 'Class-Section-Capacity-Report',
              icon: '',
              render: () => <ClassSectionCapacityReport />,
              description: 'View capacity, enrolled students, and remaining seats',
              categoryId: 'Class-Section',
            },
            {
              name: 'Class Strength Summary Report',
              id: 'Class-Strength-Summary-Report',
              icon: '',
              render: () => <ClassStrengthSummaryReport />,
              description: 'View total sections, capacity, students, and utilization percentage',
              categoryId: 'Class-Section',
            },
            {
              name: 'Class Allocation Report (Students)',
              id: 'Class-Allocation-Report',
              icon: '',
              render: () => <ClassAllocationReport />,
              description: 'View student allocation with admission number, roll number, and status',
              categoryId: 'Class-Section',
            },
            {
              name: 'Section Change Request Report',
              id: 'Section-Change-Request-Report',
              icon: '',
              render: () => <SectionChangeRequestReport />,
              description: 'View section change requests with approval status',
              categoryId: 'Class-Section',
            },
            {
              name: 'Class Promotion/Demotion Report',
              id: 'Class-Promotion-Demotion-Report',
              icon: '',
              render: () => <ClassPromotionDemotionReport />,
              description: 'View student promotion and demotion details',
              categoryId: 'Class-Section',
            },

            // Teacher & Subject Reports
            {
              name: 'Subject Master Report',
              id: 'Subject-Master-Report',
              icon: '',
              render: () => <SubjectMasterReport />,
              description: 'View subject details including type, max marks, and status',
              categoryId: 'Teacher-Subject',
            },
            {
              name: 'Teacher Subject Allocation Report',
              id: 'Teacher-Subject-Allocation-Report',
              icon: '',
              render: () => <TeacherSubjectAllocationReport />,
              description: 'View teacher-subject allocation with periods per week',
              categoryId: 'Teacher-Subject',
            },
            {
              name: 'Teacher Class Allocation Report',
              id: 'Teacher-Class-Allocation-Report',
              icon: '',
              render: () => <TeacherClassAllocationReport />,
              description: 'View teacher-class allocation with role information',
              categoryId: 'Teacher-Subject',
            },
            {
              name: 'Teacher Workload Report',
              id: 'Teacher-Workload-Report',
              icon: '',
              render: () => <TeacherWorkloadReport />,
              description: 'View teacher workload including classes, subjects, and periods',
              categoryId: 'Teacher-Subject',
            },
            {
              name: 'Subject-wise Student Count Report',
              id: 'Subject-Wise-Student-Count-Report',
              icon: '',
              render: () => <SubjectWiseStudentCountReport />,
              description: 'View student count by subject, class, and section',
              categoryId: 'Teacher-Subject',
            },

            // Classroom Management Reports
            {
              name: 'Classroom Allocation Report',
              id: 'Classroom-Allocation-Report',
              icon: '',
              render: () => <ClassroomAllocationReport />,
              description: 'View classroom allocation with capacity and assigned teacher',
              categoryId: 'Classroom-Management',
            },
            {
              name: 'Classroom Availability Report',
              id: 'Classroom-Availability-Report',
              icon: '',
              render: () => <ClassroomAvailabilityReport />,
              description: 'View classroom availability with available and occupied periods',
              categoryId: 'Classroom-Management',
            },
            {
              name: 'Classroom Capacity Utilization Report',
              id: 'Classroom-Capacity-Utilization-Report',
              icon: '',
              render: () => <ClassroomCapacityUtilizationReport />,
              description: 'View classroom capacity utilization percentage',
              categoryId: 'Classroom-Management',
            },
            {
              name: 'Classroom Asset / Resource Report',
              id: 'Classroom-Asset-Resource-Report',
              icon: '',
              render: () => <ClassroomAssetResourceReport />,
              description: 'View classroom assets with quantity, condition, and last checked date',
              categoryId: 'Classroom-Management',
            },
            {
              name: 'Classroom Maintenance Request Report',
              id: 'Classroom-Maintenance-Request-Report',
              icon: '',
              render: () => <ClassroomMaintenanceRequestReport />,
              description: 'View maintenance requests with status and completion details',
              categoryId: 'Classroom-Management',
            },

            // Parent Communication Reports
            {
              name: 'Class Circular Report',
              id: 'Class-Circular-Report',
              icon: '',
              render: () => <ClassCircularReport />,
              description: 'View class circulars with issue date and description',
              categoryId: 'Parent-Communication',
            },
            {
              name: 'Parent-Teacher Meeting Attendance Report',
              id: 'Parent-Teacher-Meeting-Attendance-Report',
              icon: '',
              render: () => <ParentTeacherMeetingAttendanceReport />,
              description: 'View parent-teacher meeting attendance by class and section',
              categoryId: 'Parent-Communication',
            },
            {
              name: 'Class Communication Log Report',
              id: 'Class-Communication-Log-Report',
              icon: '',
              render: () => <ClassCommunicationLogReport />,
              description: 'View communication logs with message type and sender details',
              categoryId: 'Parent-Communication',
            },

            // Administrative Reports
            {
              name: 'Class Activity Log Report',
              id: 'Class-Activity-Log-Report',
              icon: '',
              render: () => <ClassActivityLogReport />,
              description: 'View activity logs with user actions and timestamps',
              categoryId: 'Administrative',
            },
            {
              name: 'Class Promotion Summary Report',
              id: 'Class-Promotion-Summary-Report',
              icon: '',
              render: () => <ClassPromotionSummaryReport />,
              description: 'View promotion summary with promoted and detained counts',
              categoryId: 'Administrative',
            },
            {
              name: 'Class Academic Year Summary Report',
              id: 'Class-Academic-Year-Summary-Report',
              icon: '',
              render: () => <ClassAcademicYearSummaryReport />,
              description: 'View academic year summary with attendance and performance',
              categoryId: 'Administrative',
            },
            {
              name: 'Class Management Dashboard Report',
              id: 'Class-Management-Dashboard-Report',
              icon: '',
              render: () => <ClassManagementDashboardReport />,
              description: 'View comprehensive dashboard metrics and statistics',
              categoryId: 'Administrative',
            },
          ]}
        />
      ) : (
        <CustomizableTable
          tableId="class-management-reports"
          columns={[
            {
              label: ' Name',
              id: 'reportName',
              minWidth: '15vw',
              align: 'left',
              sticky: true,
            },
            { label: ' Category', id: 'reportCategory', minWidth: '10vw', align: 'left' },
            {
              label: ' Description',
              id: 'reportDescription',
              minWidth: '12vw',
              align: 'left',
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
              label: 'Action',
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
              reportName: 'Class Master Report',
              reportCategory: 'Class & Section',
              reportSubCategory: 'Master',
              reportDescription:
                'View class master details including medium, teacher, and capacity',
              generateReportDate: '2025-12-06',
              appliedFilters: [
                { name: 'Class', value: 'Class 10 | Class 11 | Class 12' },
                { name: 'Medium', value: 'English' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Teacher Subject Allocation Report',
              reportCategory: 'Teacher & Subject',
              reportSubCategory: 'Allocation',
              reportDescription: 'View teacher-subject allocation with periods per week',
              generateReportDate: '2025-12-06',
              appliedFilters: [
                { name: 'Teacher', value: 'John Doe | Jane Smith' },
                { name: 'Subject', value: 'Mathematics | Science' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Classroom Allocation Report',
              reportCategory: 'Classroom Management',
              reportSubCategory: 'Allocation',
              reportDescription: 'View classroom allocation with capacity and assigned teacher',
              generateReportDate: '2025-12-05',
              appliedFilters: [{ name: 'Room', value: 'Room 101 | Room 102 | Room 103' }],
              reportAction: 'View',
            },
            {
              reportName: 'Class Circular Report',
              reportCategory: 'Parent Communication',
              reportSubCategory: 'Communication',
              reportDescription: 'View class circulars with issue date and description',
              generateReportDate: '2025-12-04',
              appliedFilters: [
                { name: 'Class', value: 'Class 9' },
                { name: 'Date Range', value: '2025-11-01 to 2025-12-01' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Class Promotion Summary Report',
              reportCategory: 'Administrative',
              reportSubCategory: 'Summary',
              reportDescription: 'View promotion summary with promoted and detained counts',
              generateReportDate: '2025-12-03',
              appliedFilters: [
                { name: 'Class', value: 'All Classes' },
                { name: 'Academic Year', value: '2024-2025' },
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

export default ReportsScreen;
