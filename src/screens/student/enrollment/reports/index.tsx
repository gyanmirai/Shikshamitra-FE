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
import { Box, Chip, Button, IconButton, Typography } from '@mui/material';

import DateOfBirthReport from './components/DateOfBirthReport';
import PreviousSchoolReport from './components/PreviousSchoolReport';
import StudentEnrollmentList from './components/StudentEnrollmentList';
import AdmissionSourceReport from './components/AdmissionSourceReport';
import CasteCategoryWiseReport from './components/CasteCategoryWiseReport';
import AadharVerificationReport from './components/AadharVerificationReport';
import ContactInformationReport from './components/ContactInformationReport';
import ReligionWiseStudentReport from './components/ReligionWiseStudentReport';
import MonthlyAdmissionTrendReport from './components/MonthlyAdmissionTrendReport';
import AcademicYearComparisonReport from './components/AcademicYearComparisonReport';
import PinCodeWiseStudentDistribution from './components/PinCodeWiseStudentDistribution';
import ClassWiseStudentEnrollmentReport from './components/ClassWiseStudentEnrollmentReport';
import GenderWiseStudentDistributionReport from './components/GenderWiseStudentDistributionReport';

const EnrollmentReportScreen = () => {
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
        description="Generate and filter enrollment reports by class, gender, and other criteria."
        links={[
          { name: 'Student', href: '/student/dashboard/' },
          { name: 'Enrollment', href: '/student/dashboard/' },
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
              name: 'Student List',
              id: 'Student List',
              icon: 'mdi:account-details-outline',
            },
            {
              name: 'Demographics',
              id: 'Demographics',
              icon: 'mdi:chart-pie-outline',
            },
            {
              name: 'Admission',
              id: 'Admission',
              icon: 'mdi:school-outline',
            },
            {
              name: 'Verification',
              id: 'Verification',
              icon: 'mdi:check-decagram-outline',
            },
          ]}
          subCategories={[
            // Student List
            {
              name: 'Class Wise Enrollment',
              id: 'class-wise-enrollment',
              icon: '',
              render: () => <ClassWiseStudentEnrollmentReport />,
              description: 'View student enrollment summary by class',
              categoryId: 'Student List',
            },
            {
              name: 'Student Enrollment List',
              id: 'student-enrollment-list',
              icon: '',
              render: () => <StudentEnrollmentList />,
              description: 'View detailed list of enrolled students',
              categoryId: 'Student List',
            },

            // Demographics
            {
              name: 'Religion Wise Report',
              id: 'religion-wise-report',
              icon: '',
              render: () => <ReligionWiseStudentReport />,
              description: 'View student distribution by religion',
              categoryId: 'Demographics',
            },
            {
              name: 'Caste Category Wise Report',
              id: 'caste-category-wise-report',
              icon: '',
              render: () => <CasteCategoryWiseReport />,
              description: 'View student distribution by caste category',
              categoryId: 'Demographics',
            },
            {
              name: 'Pin Code Wise Distribution',
              id: 'pincode-wise-distribution',
              icon: '',
              render: () => <PinCodeWiseStudentDistribution />,
              description: 'View student distribution by pin code',
              categoryId: 'Demographics',
            },
            {
              name: 'Date of Birth Report',
              id: 'dob-report',
              icon: '',
              render: () => <DateOfBirthReport />,
              description: 'View student list by date of birth',
              categoryId: 'Demographics',
            },
            {
              name: 'Gender Wise Distribution',
              id: 'gender-wise-distribution',
              icon: '',
              render: () => <GenderWiseStudentDistributionReport />,
              description: 'View student distribution by gender',
              categoryId: 'Demographics',
            },

            // Admission
            {
              name: 'Previous School Report',
              id: 'previous-school-report',
              icon: '',
              render: () => <PreviousSchoolReport />,
              description: 'View students by previous school',
              categoryId: 'Admission',
            },
            {
              name: 'Admission Source Report',
              id: 'admission-source-report',
              icon: '',
              render: () => <AdmissionSourceReport />,
              description: 'View admission source statistics',
              categoryId: 'Admission',
            },
            {
              name: 'Monthly Admission Trend',
              id: 'monthly-admission-trend',
              icon: '',
              render: () => <MonthlyAdmissionTrendReport />,
              description: 'View monthly admission trends',
              categoryId: 'Admission',
            },
            {
              name: 'Academic Year Comparison',
              id: 'academic-year-comparison',
              icon: '',
              render: () => <AcademicYearComparisonReport />,
              description: 'Compare admissions across academic years',
              categoryId: 'Admission',
            },

            // Verification
            {
              name: 'Aadhar Verification Report',
              id: 'aadhar-verification-report',
              icon: '',
              render: () => <AadharVerificationReport />,
              description: 'View students with/without Aadhar verification',
              categoryId: 'Verification',
            },
            {
              name: 'Contact Information Report',
              id: 'contact-information-report',
              icon: '',
              render: () => <ContactInformationReport />,
              description: 'View student contact information',
              categoryId: 'Verification',
            },
          ]}
        />
      ) : (
        <CustomizableTable
          tableId="enrollment-reports"
          tableTitle="Enrollment Reports"
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
                  <CustomTooltip
                    title={
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                        {row.appliedFilters.map((filter: any) => (
                          <Chip
                            size="small"
                            variant="soft"
                            key={filter.name}
                            label={`${filter.name}: ${filter.value}`}
                            sx={{ color: 'common.white' }}
                          />
                        ))}
                      </Box>
                    }
                    arrow
                    sx={{ maxWidth: 500 }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        gap: 1,
                        flexWrap: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '400px',
                      }}
                    >
                      {row.appliedFilters.map((filter: any) => (
                        <CustomTooltip
                          key={filter.name}
                          title={`${filter.name}: ${filter.value}`}
                          arrow
                        >
                          <Chip
                            size="small"
                            variant="soft"
                            label={`${filter.name}: ${filter.value}`}
                            sx={{
                              maxWidth: '200px',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              flexShrink: 0,
                            }}
                          />
                        </CustomTooltip>
                      ))}
                    </Box>
                  </CustomTooltip>
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
              reportName: 'Class Wise Enrollment',
              reportCategory: 'Student List',
              reportDescription: 'View student enrollment summary by class',
              generateReportDate: '2025-12-02',
              appliedFilters: [
                { name: 'Class', value: 'All' },
                { name: 'Gender', value: 'All' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Religion Wise Report',
              reportCategory: 'Demographics',
              reportDescription: 'View student distribution by religion',
              generateReportDate: '2025-12-01',
              appliedFilters: [
                { name: 'Religion', value: 'Hindu' },
                { name: 'Class', value: 'Class 10' },
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

export default EnrollmentReportScreen;
