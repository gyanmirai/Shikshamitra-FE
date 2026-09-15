'use client';

import { useState } from 'react';
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

// ── Other categories — existing standalone components (unchanged) ──────────────
import VerifyStudentData from './components/VerifyStudentData';
// ── Student Lists — centralized form (Student Enrollment Reports pattern) ──────
import StudentRecordsReportForm from './components/StudentRecordsReportForm';
import AdmissionCategorywiseList from './components/AdmissionCategorywiseList';
import { StudentRecordsAiReportButton } from './components/StudentRecordsAiReportButton';

const StudentReportsScreen = () => {
  const openGenerateReport = useBoolean();
  const [query, setQuery] = useState<any>({
    skipCount: 0,
    maxResultCount: 10,
    sorting: '',
  });
  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Reports"
        description="Generate and view comprehensive reports on student records, including academic performance, attendance, and other relevant data."
        links={[
          { name: 'Student', href: '/student/dashboard/' },
          { name: 'Student Records', href: '/student/dashboard/' },
          { name: 'Reports' },
        ]}
        isBack={openGenerateReport.value}
        onBack={openGenerateReport.onFalse}
        action={
          <Stack direction="row" spacing={1}>
            <StudentRecordsAiReportButton />
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
              name: 'Student Lists',
              id: 'Student Lists',
              icon: 'mdi:account-multiple-outline',
            },
            {
              name: 'Birthday & Dates',
              id: 'Birthday & Dates',
              icon: 'mdi:calendar-star-outline',
            },
            {
              name: 'Summaries',
              id: 'Summaries',
              icon: 'mdi:chart-box-outline',
            },
            {
              name: 'Demographics',
              id: 'Demographics',
              icon: 'mdi:account-group-outline',
            },
            {
              name: 'Compliance',
              id: 'Compliance',
              icon: 'mdi:file-check-outline',
            },
          ]}
          subCategories={[
            // ── Student Lists — centralized form (Student Enrollment Reports pattern) ──
            {
              name: 'Address Label Report',
              id: 'address-label-report',
              icon: '',
              render: () => (
                <StudentRecordsReportForm report={StudentRecordsReportTitle.AddressLabelReport} />
              ),
              description: 'Generate address labels for students',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student Contact List',
              id: 'student-contact-list',
              icon: '',
              render: () => (
                <StudentRecordsReportForm report={StudentRecordsReportTitle.StudentContactList} />
              ),
              description: 'View student contact information',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student Detail Information Form',
              id: 'student-detail-information-form',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.StudentDetailInformationForm}
                />
              ),
              description: 'Detailed student information form',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student List – Division Wise Serial No',
              id: 'student-list-division-wise',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.StudentListDivisionWiseSerialNo}
                />
              ),
              description: 'Student list organized by division serial numbers',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student List – ID No Wise',
              id: 'student-list-id-wise',
              icon: '',
              render: () => (
                <StudentRecordsReportForm report={StudentRecordsReportTitle.StudentListIDNoWise} />
              ),
              description: 'Student list sorted by ID numbers',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student Register',
              id: 'student-register',
              icon: '',
              render: () => (
                <StudentRecordsReportForm report={StudentRecordsReportTitle.StudentRegister} />
              ),
              description: 'Official student register',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student Register With Address',
              id: 'student-register-with-address',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.StudentRegisterWithAddress}
                />
              ),
              description: 'Student register including addresses',
              categoryId: 'Student Lists',
            },
            {
              name: 'New Student Admission Report',
              id: 'new-student-admission-report',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.NewStudentAdmissionReport}
                />
              ),
              description: 'Report of newly admitted students',
              categoryId: 'Student Lists',
            },

            // Birthday & Dates
            {
              name: 'All Birthday Wish List Report',
              id: 'all-birthday-wish-list',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.AllBirthdayWishListReport}
                />
              ),
              description: 'Complete birthday wish list for students',
              categoryId: 'Birthday & Dates',
            },
            {
              name: 'Left Student List',
              id: 'left-student-list',
              icon: '',
              render: () => (
                <StudentRecordsReportForm report={StudentRecordsReportTitle.LeftStudentList} />
              ),
              description: 'List of students who have left',
              categoryId: 'Birthday & Dates',
            },

            // Summaries
            {
              name: 'Student Strength Division Wise Summary',
              id: 'student-strength-division-wise',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.StudentStrengthDivisionWiseSummary}
                />
              ),
              description: 'Student strength summary by division',
              categoryId: 'Summaries',
            },
            {
              name: 'Age Wise Summary',
              id: 'age-wise-summary',
              icon: '',
              render: () => (
                <StudentRecordsReportForm report={StudentRecordsReportTitle.AgeWiseSummary} />
              ),
              description: 'Student distribution by age',
              categoryId: 'Summaries',
            },
            {
              name: 'Agewise List',
              id: 'agewise-list',
              icon: '',
              render: () => (
                <StudentRecordsReportForm report={StudentRecordsReportTitle.AgewiseList} />
              ),
              description: 'Detailed age-wise student list',
              categoryId: 'Summaries',
            },
            {
              name: 'Genderwise Student Strength Summary',
              id: 'genderwise-student-strength',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.GenderwiseStudentStrengthSummary}
                />
              ),
              description: 'Student strength by gender',
              categoryId: 'Summaries',
            },
            {
              name: 'Genderwise Summary',
              id: 'genderwise-summary',
              icon: '',
              render: () => (
                <StudentRecordsReportForm report={StudentRecordsReportTitle.GenderwiseSummary} />
              ),
              description: 'Gender distribution summary',
              categoryId: 'Summaries',
            },
            {
              name: 'Admission Categorywise List',
              id: 'admission-categorywise-list',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.AdmissionCategorywiseList}
                />
              ),
              description: 'Students by admission category',
              categoryId: 'Summaries',
            },
            {
              name: 'Verify Student Data',
              id: 'verify-student-data',
              icon: '',
              render: () => (
                <StudentRecordsReportForm report={StudentRecordsReportTitle.VerifyStudentData} />
              ),
              description: 'Verify and validate student data',
              categoryId: 'Summaries',
            },

            // Demographics
            {
              name: 'Religion Wise Report',
              id: 'religion-wise-report',
              icon: '',
              render: () => (
                <StudentRecordsReportForm report={StudentRecordsReportTitle.ReligionWiseReport} />
              ),
              description: 'Student distribution by religion',
              categoryId: 'Demographics',
            },
            {
              name: 'Caste Category Wise Report',
              id: 'caste-category-wise-report',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.CasteCategoryWiseReport}
                />
              ),
              description: 'Student distribution by caste category',
              categoryId: 'Demographics',
            },
            {
              name: 'Blood Group Wise Report',
              id: 'blood-group-wise-report',
              icon: '',
              render: () => (
                <StudentRecordsReportForm report={StudentRecordsReportTitle.BloodGroupWiseReport} />
              ),
              description: 'Student distribution by blood group',
              categoryId: 'Demographics',
            },
            {
              name: 'Mother Tongue Wise Report',
              id: 'mother-tongue-wise-report',
              icon: '',
              render: () => (
                <StudentRecordsReportForm
                  report={StudentRecordsReportTitle.MotherTongueWiseReport}
                />
              ),
              description: 'Student distribution by mother tongue',
              categoryId: 'Demographics',
            },
            {
              name: 'Generic UDISE+ Student Export',
              id: 'generic-udise-student-export',
              icon: '',
              render: () => <VerifyStudentData />,
              description:
                'Export UDISE+ baseline columns with masked identity compliance statuses',
              categoryId: 'Compliance',
            },
            {
              name: 'Gujarat/GSEB Student Compliance Report',
              id: 'gujarat-gseb-student-compliance-report',
              icon: '',
              render: () => <VerifyStudentData />,
              description: 'Review Gujarat state-board compliance fields for reconciliation',
              categoryId: 'Compliance',
            },
            {
              name: 'Aadhaar/APAAR Exception Report',
              id: 'aadhaar-apaar-exception-report',
              icon: '',
              render: () => <VerifyStudentData />,
              description: 'Track consent refused, mismatch, pending, and missing identity cases',
              categoryId: 'Compliance',
            },
            {
              name: 'RTE/Scholarship/Caste Certificate Tracking Report',
              id: 'rte-scholarship-caste-certificate-tracking-report',
              icon: '',
              render: () => <AdmissionCategorywiseList />,
              description: 'Track RTE, scholarship, and caste certificate follow-up status',
              categoryId: 'Compliance',
            },
          ]}
        />
      ) : (
        <CustomizableTable
          tableId="student-records-reports"
          tableTitle="Student Records Reports"
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
              reportName: 'Student Contact List',
              reportCategory: 'Student Lists',
              reportDescription: 'View student contact information',
              generateReportDate: '2025-12-02',
              appliedFilters: [
                { name: 'Organization', value: 'Main Campus' },
                { name: 'Class', value: 'All' },
              ],
              reportAction: 'View',
            },
            {
              reportName: 'Birthday Report',
              reportCategory: 'Birthday & Dates',
              reportDescription: 'Student birthdays by month',
              generateReportDate: '2025-12-01',
              appliedFilters: [
                { name: 'Month', value: 'December' },
                { name: 'Class', value: 'Class 10' },
              ],
              reportAction: 'View',
            },
          ]}
          serverSide
          onServerSort={(column, sortData) => {
            setQuery((prev: any) => ({
              ...prev,
              sorting: sortQueryString(sortData),
            }));
          }}
          onServerPagination={(page: number, rowsPerPage: number) => {
            setQuery((prev: any) => ({
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

export default StudentReportsScreen;
