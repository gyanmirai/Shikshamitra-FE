'use client';

import React, { useState } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CommonReport from 'src/components/common-report';
import CustomTooltip from 'src/components/custom-tooltip';
import sortQueryString from 'src/utils/sort-query-string';
import { StudentReportTitle } from 'src/enums/student-reports';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Chip, Button, IconButton, Typography } from '@mui/material';

import StudentReportForm from './components/StudentReportForm';
import CasteCategoryWiseReport from './components/CasteCategoryWiseReport';
import AadharVerificationReport from './components/AadharVerificationReport';

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
            {
              name: 'Compliance',
              id: 'Compliance',
              icon: 'mdi:file-check-outline',
            },
          ]}
          subCategories={[
            // ── Student List ──────────────────────────────────────────────────
            {
              name: 'Student List',
              id: 'student-list',
              icon: '',
              description: 'View the complete list of enrolled students',
              categoryId: 'Student List',
              render: () => <StudentReportForm report={StudentReportTitle.StudentList} />,
            },
            {
              name: 'Student Directory',
              id: 'student-directory',
              icon: '',
              description: 'Browse student profiles with contact and class details',
              categoryId: 'Student List',
              render: () => <StudentReportForm report={StudentReportTitle.StudentDirectory} />,
            },
            {
              name: 'Class-wise Student List',
              id: 'class-wise-student-list',
              icon: '',
              description: 'View students grouped by class and division',
              categoryId: 'Student List',
              render: () => <StudentReportForm report={StudentReportTitle.ClassWiseStudentList} />,
            },
            {
              name: 'Active Student Report',
              id: 'active-student-report',
              icon: '',
              description: 'List all currently active students',
              categoryId: 'Student List',
              render: () => <StudentReportForm report={StudentReportTitle.ActiveStudentReport} />,
            },
            {
              name: 'Inactive Student Report',
              id: 'inactive-student-report',
              icon: '',
              description: 'List students who are inactive, transferred, or withdrawn',
              categoryId: 'Student List',
              render: () => <StudentReportForm report={StudentReportTitle.InactiveStudentReport} />,
            },

            // ── Demographics ──────────────────────────────────────────────────
            {
              name: 'Religion Wise Report',
              id: 'religion-wise-report',
              icon: '',
              description: 'View student distribution by religion',
              categoryId: 'Demographics',
              render: () => <StudentReportForm report={StudentReportTitle.ReligionWiseReport} />,
            },
            {
              name: 'Caste Category Wise Report',
              id: 'caste-category-wise-report',
              icon: '',
              description: 'View student distribution by caste category',
              categoryId: 'Demographics',
              render: () => (
                <StudentReportForm report={StudentReportTitle.CasteCategoryWiseReport} />
              ),
            },
            {
              name: 'Gender Wise Distribution Report',
              id: 'gender-wise-distribution-report',
              icon: '',
              description: 'View student distribution by gender',
              categoryId: 'Demographics',
              render: () => (
                <StudentReportForm report={StudentReportTitle.GenderWiseDistributionReport} />
              ),
            },
            {
              name: 'Date of Birth Report',
              id: 'dob-report',
              icon: '',
              description: 'View student list by date of birth',
              categoryId: 'Demographics',
              render: () => <StudentReportForm report={StudentReportTitle.DateOfBirthReport} />,
            },
            {
              name: 'Blood Group Distribution Report',
              id: 'blood-group-distribution-report',
              icon: '',
              description: 'View student distribution by blood group',
              categoryId: 'Demographics',
              render: () => (
                <StudentReportForm report={StudentReportTitle.BloodGroupDistributionReport} />
              ),
            },
            {
              name: 'Pin Code Wise Distribution Report',
              id: 'pincode-wise-distribution-report',
              icon: '',
              description: 'View student distribution by residential pin code',
              categoryId: 'Demographics',
              render: () => (
                <StudentReportForm report={StudentReportTitle.PinCodeWiseDistributionReport} />
              ),
            },

            // ── Admission ─────────────────────────────────────────────────────
            {
              name: 'Admission Source Report',
              id: 'admission-source-report',
              icon: '',
              description: 'Analyze admissions by the source through which students were referred',
              categoryId: 'Admission',
              render: () => <StudentReportForm report={StudentReportTitle.AdmissionSourceReport} />,
            },
            {
              name: 'Previous School Report',
              id: 'previous-school-report',
              icon: '',
              description: 'Analyze students based on their previous schools',
              categoryId: 'Admission',
              render: () => <StudentReportForm report={StudentReportTitle.PreviousSchoolReport} />,
            },
            {
              name: 'Monthly Admission Trend Report',
              id: 'monthly-admission-trend-report',
              icon: '',
              description: 'Track admission growth trends month over month',
              categoryId: 'Admission',
              render: () => (
                <StudentReportForm report={StudentReportTitle.MonthlyAdmissionTrendReport} />
              ),
            },
            {
              name: 'Admission Comparison Report',
              id: 'admission-comparison-report',
              icon: '',
              description: 'Compare admissions across classes and periods',
              categoryId: 'Admission',
              render: () => (
                <StudentReportForm report={StudentReportTitle.AdmissionComparisonReport} />
              ),
            },
            {
              name: 'Class-wise Admission Report',
              id: 'class-wise-admission-report',
              icon: '',
              description: 'Analyze admissions broken down by class',
              categoryId: 'Admission',
              render: () => (
                <StudentReportForm report={StudentReportTitle.ClassWiseAdmissionReport} />
              ),
            },

            // ── Verification ──────────────────────────────────────────────────
            {
              name: 'Aadhaar Verification Report',
              id: 'aadhaar-verification-report',
              icon: '',
              description: 'Track Aadhaar verification status of students',
              categoryId: 'Verification',
              render: () => (
                <StudentReportForm report={StudentReportTitle.AadhaarVerificationReport} />
              ),
            },
            {
              name: 'Contact Information Report',
              id: 'contact-information-report',
              icon: '',
              description: 'Review and validate student and parent contact information',
              categoryId: 'Verification',
              render: () => (
                <StudentReportForm report={StudentReportTitle.ContactInformationReport} />
              ),
            },
            {
              name: 'Document Verification Report',
              id: 'document-verification-report',
              icon: '',
              description: 'Track verification status of submitted admission documents',
              categoryId: 'Verification',
              render: () => (
                <StudentReportForm report={StudentReportTitle.DocumentVerificationReport} />
              ),
            },

            // ── Compliance (standalone — unchanged) ───────────────────────────
            {
              name: 'Generic UDISE+ Student Export',
              id: 'generic-udise-student-export',
              icon: '',
              render: () => <AadharVerificationReport />,
              description:
                'Export UDISE+ baseline columns with masked identity compliance statuses',
              categoryId: 'Compliance',
            },
            {
              name: 'Gujarat/GSEB Student Compliance Report',
              id: 'gujarat-gseb-student-compliance-report',
              icon: '',
              render: () => <AadharVerificationReport />,
              description: 'Review Gujarat state-board compliance fields for reconciliation',
              categoryId: 'Compliance',
            },
            {
              name: 'Aadhaar/APAAR Exception Report',
              id: 'aadhaar-apaar-exception-report',
              icon: '',
              render: () => <AadharVerificationReport />,
              description: 'Track consent refused, mismatch, pending, and missing identity cases',
              categoryId: 'Compliance',
            },
            {
              name: 'RTE/Scholarship/Caste Certificate Tracking Report',
              id: 'rte-scholarship-caste-certificate-tracking-report',
              icon: '',
              render: () => <CasteCategoryWiseReport />,
              description: 'Track RTE, scholarship, and caste certificate follow-up status',
              categoryId: 'Compliance',
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
