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

import AgewiseList from './components/AgewiseList';
import BirthdayReport from './components/BirthdayReport';
import AgeWiseSummary from './components/AgeWiseSummary';
import LeftStudentList from './components/LeftStudentList';
import StudentRegister from './components/StudentRegister';
import GenderWiseReport from './components/GenderWiseReport';
import StudentDetailList from './components/StudentDetailList';
import StudentListReport from './components/StudentListReport';
import VerifyStudentData from './components/VerifyStudentData';
import GenderwiseSummary from './components/GenderwiseSummary';
import AddressLabelReport from './components/AddressLabelReport';
import StudentContactList from './components/StudentContactList';
import ReligionWiseReport from './components/ReligionWiseReport';
import StudentListIDNoWise from './components/StudentListIDNoWise';
import AllBirthdayWishListReport from './components/AllBirthdayWishListReport';
import NewStudentAdmissionReport from './components/NewStudentAdmissionReport';
import AdmissionCategorywiseList from './components/AdmissionCategorywiseList';
import StudentRegisterWithAddress from './components/StudentRegisterWithAddress';
import StudentDetailInformationForm from './components/StudentDetailInformationForm';
import StudentListDivisionWiseSerialNo from './components/StudentListDivisionWiseSerialNo';
import GenderwiseStudentStrengthSummary from './components/GenderwiseStudentStrengthSummary';
import StudentStrengthDivisionWiseSummary from './components/StudentStrengthDivisionWiseSummary';

const StudentReportsScreen = () => {
  const openGenerateReport = useBoolean();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Reports"
        description="Generate and view comprehensive reports on student records, including academic performance, attendance, and other relevant data."
        links={[
          { name: 'Student', href: '/student/enrollment/dashboard/' },
          { name: 'Student Records', href: '/student/overview/' },
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
              name: 'Student Lists',
              id: 'Student Lists',
              icon: 'mdi:account-multiple',
            },
            {
              name: 'Birthday & Dates',
              id: 'Birthday & Dates',
              icon: 'mdi:calendar-star',
            },
            {
              name: 'Summaries',
              id: 'Summaries',
              icon: 'mdi:chart-box',
            },
            {
              name: 'Demographics',
              id: 'Demographics',
              icon: 'mdi:account-group',
            },
          ]}
          subCategories={[
            // Student Lists
            {
              name: 'Address Label Report',
              id: 'address-label-report',
              icon: '',
              render: () => <AddressLabelReport />,
              description: 'Generate address labels for students',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student Contact List',
              id: 'student-contact-list',
              icon: '',
              render: () => <StudentContactList />,
              description: 'View student contact information',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student Detail Information Form',
              id: 'student-detail-information-form',
              icon: '',
              render: () => <StudentDetailInformationForm />,
              description: 'Detailed student information form',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student Detail List',
              id: 'student-detail-list',
              icon: '',
              render: () => <StudentDetailList />,
              description: 'Comprehensive student details list',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student List Report',
              id: 'student-list-report',
              icon: '',
              render: () => <StudentListReport />,
              description: 'General student list report',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student List - Division Wise Serial No',
              id: 'student-list-division-wise',
              icon: '',
              render: () => <StudentListDivisionWiseSerialNo />,
              description: 'Student list organized by division serial numbers',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student List - ID No Wise',
              id: 'student-list-id-wise',
              icon: '',
              render: () => <StudentListIDNoWise />,
              description: 'Student list sorted by ID numbers',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student Register',
              id: 'student-register',
              icon: '',
              render: () => <StudentRegister />,
              description: 'Official student register',
              categoryId: 'Student Lists',
            },
            {
              name: 'Student Register With Address',
              id: 'student-register-with-address',
              icon: '',
              render: () => <StudentRegisterWithAddress />,
              description: 'Student register including addresses',
              categoryId: 'Student Lists',
            },
            {
              name: 'New Student Admission Report',
              id: 'new-student-admission-report',
              icon: '',
              render: () => <NewStudentAdmissionReport />,
              description: 'Report of newly admitted students',
              categoryId: 'Student Lists',
            },

            // Birthday & Dates
            {
              name: 'All Birthday Wish List Report',
              id: 'all-birthday-wish-list',
              icon: '',
              render: () => <AllBirthdayWishListReport />,
              description: 'Complete birthday wish list for students',
              categoryId: 'Birthday & Dates',
            },
            {
              name: 'Birthday Report',
              id: 'birthday-report',
              icon: '',
              render: () => <BirthdayReport />,
              description: 'Student birthdays by month',
              categoryId: 'Birthday & Dates',
            },
            {
              name: 'Left Student List',
              id: 'left-student-list',
              icon: '',
              render: () => <LeftStudentList />,
              description: 'List of students who have left',
              categoryId: 'Birthday & Dates',
            },

            // Summaries
            {
              name: 'Student Strength Division Wise Summary',
              id: 'student-strength-division-wise',
              icon: '',
              render: () => <StudentStrengthDivisionWiseSummary />,
              description: 'Student strength summary by division',
              categoryId: 'Summaries',
            },
            {
              name: 'Age Wise Summary',
              id: 'age-wise-summary',
              icon: '',
              render: () => <AgeWiseSummary />,
              description: 'Student distribution by age',
              categoryId: 'Summaries',
            },
            {
              name: 'Agewise List',
              id: 'agewise-list',
              icon: '',
              render: () => <AgewiseList />,
              description: 'Detailed age-wise student list',
              categoryId: 'Summaries',
            },
            {
              name: 'Genderwise Student Strength Summary',
              id: 'genderwise-student-strength',
              icon: '',
              render: () => <GenderwiseStudentStrengthSummary />,
              description: 'Student strength by gender',
              categoryId: 'Summaries',
            },
            {
              name: 'Genderwise Summary',
              id: 'genderwise-summary',
              icon: '',
              render: () => <GenderwiseSummary />,
              description: 'Gender distribution summary',
              categoryId: 'Summaries',
            },
            {
              name: 'Admission Categorywise List',
              id: 'admission-categorywise-list',
              icon: '',
              render: () => <AdmissionCategorywiseList />,
              description: 'Students by admission category',
              categoryId: 'Summaries',
            },
            {
              name: 'Verify Student Data',
              id: 'verify-student-data',
              icon: '',
              render: () => <VerifyStudentData />,
              description: 'Verify and validate student data',
              categoryId: 'Summaries',
            },

            // Demographics
            {
              name: 'Gender Wise Report',
              id: 'gender-wise-report',
              icon: '',
              render: () => <GenderWiseReport />,
              description: 'Student distribution by gender',
              categoryId: 'Demographics',
            },
            {
              name: 'Religion Wise Report',
              id: 'religion-wise-report',
              icon: '',
              render: () => <ReligionWiseReport />,
              description: 'Student distribution by religion',
              categoryId: 'Demographics',
            },
          ]}
        />
      ) : (
        <CustomizableTable
          tableId="student-records-reports"
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
        />
      )}
    </Box>
  );
};

export default StudentReportsScreen;
