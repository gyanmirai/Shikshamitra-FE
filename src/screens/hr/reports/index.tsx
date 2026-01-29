'use client';

import React from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import CommonReport from 'src/components/common-report';
import { Box, Chip, Button, IconButton } from '@mui/material';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import AllowanceReport from './components/AllowanceReport';
import DeductionReport from './components/DeductionReport';
import EmployeeListReport from './components/EmployeeListReport';
import JoiningLetterReport from './components/JoiningLetterReport';
import EmployeeDetailReport from './components/EmployeeDetailReport';
import SalaryRegisterReport from './components/SalaryRegisterReport';
import EmployeeProfileReport from './components/EmployeeProfileReport';
import EmployeePayslipReport from './components/EmployeePayslipReport';
import LeaveEncashmentReport from './components/LeaveEncashmentReport';
import FinalSettlementReport from './components/FinalSettlementReport';
import EmployeeAllDetailReport from './components/EmployeeAllDetailReport';
import EmployeeContactListReport from './components/EmployeeContactListReport';
import RelievingCertificateReport from './components/RelievingCertificateReport';
import IncrementCertificateReport from './components/IncrementCertificateReport';
import ExperienceCertificateReport from './components/ExperienceCertificateReport';
import MonthlyPayrollSummaryReport from './components/MonthlyPayrollSummaryReport';
import PayrollReconciliationReport from './components/PayrollReconciliationReport';

const ReportsScreen = () => {
  const openGenerateReport = useBoolean();

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CustomBreadcrumbs
        heading="Reports"
        description="Generate and filter payroll and employee reports by department, role, status, and other criteria."
        links={[{ name: 'HR/Staff', href: '/hr/dashboard/' }, { name: 'Reports' }]}
        sx={{ px: 2 }}
        isBack={openGenerateReport.value}
        onBack={openGenerateReport.onFalse}
        action={
          openGenerateReport.value ? null : (
            <Button
              variant="contained"
              size="small"
              onClick={openGenerateReport.onTrue}
              startIcon={<Iconify icon={GlobalIcons.report} />}
              sx={{ px: '32px' }}
            >
              Generate Report
            </Button>
          )
        }
      />
      {openGenerateReport.value ? (
        <CommonReport
          categories={[
            {
              name: 'Employee',
              id: 'Employee',
              icon: 'stash:user-id-light',
            },
            {
              name: 'Payroll',
              id: 'Payroll',
              icon: 'fluent:payment-48-regular',
            },
          ]}
          subCategories={[
            {
              name: 'Employee Profile',
              id: 'Employee-Profile',
              icon: '',
              render: () => <EmployeeProfileReport />,
              description: 'View employee profile details',
              categoryId: 'Employee',
            },
            {
              name: 'Employee List',
              id: 'Employee-List',
              icon: '',
              render: () => <EmployeeListReport />,
              description: 'View employee list',
              categoryId: 'Employee',
            },
            {
              name: 'Joining Letter',
              id: 'Joining-Letter',
              icon: '',
              render: () => <JoiningLetterReport />,
              description: 'View employee joining letter',
              categoryId: 'Employee',
            },
            {
              name: 'Employee Detail',
              id: 'Employee-Detail',
              icon: '',
              render: () => <EmployeeDetailReport />,
              description: 'View employee detail',
              categoryId: 'Employee',
            },
            {
              name: 'Employee Contact List',
              id: 'Employee-Contact-List',
              icon: '',
              render: () => <EmployeeContactListReport />,
              description: 'View employee contact list',
              categoryId: 'Employee',
            },
            {
              name: 'Employee All Detail',
              id: 'Employee-All-Detail',
              icon: '',
              render: () => <EmployeeAllDetailReport />,
              description: 'View employee all detail',
              categoryId: 'Employee',
            },
            {
              name: 'Relieving Certificate',
              id: 'Relieving-Certificate',
              icon: '',
              render: () => <RelievingCertificateReport />,
              description: 'View relieving certificate',
              categoryId: 'Employee',
            },
            {
              name: 'Increment Certificate',
              id: 'Increment-Certificate',
              icon: '',
              render: () => <IncrementCertificateReport />,
              description: 'View increment certificate',
              categoryId: 'Employee',
            },
            {
              name: 'Experience Certificate',
              id: 'Experience-Certificate',
              icon: '',
              render: () => <ExperienceCertificateReport />,
              description: 'View experience certificate',
              categoryId: 'Employee',
            },
            {
              name: 'Salary Register',
              id: 'Salary-Register',
              icon: 'solar:wallet-outline',
              render: () => <SalaryRegisterReport />,
              description: 'View salary register',
              categoryId: 'Payroll',
            },
            {
              name: 'Employee Payslip',
              id: 'Employee-Payslip',
              icon: 'solar:wallet-outline',
              render: () => <EmployeePayslipReport />,
              description: 'View employee payslip',
              categoryId: 'Payroll',
            },
            {
              name: 'Monthly Payroll Summary',
              id: 'Monthly-Payroll-Summary',
              icon: '',
              render: () => <MonthlyPayrollSummaryReport />,
              description: 'View monthly payroll summary',
              categoryId: 'Payroll',
            },
            {
              name: 'Allowance Report',
              id: 'Allowance-Report',
              icon: '',
              render: () => <AllowanceReport />,
              description: 'View allowance report',
              categoryId: 'Payroll',
            },
            {
              name: 'Deduction Report',
              id: 'Deduction-Report',
              icon: '',
              render: () => <DeductionReport />,
              description: 'View deduction report',
              categoryId: 'Payroll',
            },
            {
              name: 'Payroll Reconciliation Report',
              id: 'Payroll-Reconciliation-Report',
              icon: '',
              render: () => <PayrollReconciliationReport />,
              description: 'View payroll reconciliation report',
              categoryId: 'Payroll',
            },
            {
              name: 'Leave Encashment Report',
              id: 'Leave-Encashment-Report',
              icon: '',
              render: () => <LeaveEncashmentReport />,
              description: 'View leave encashment report',
              categoryId: 'Payroll',
            },
            {
              name: 'Final Settlement Report',
              id: 'Final-Settlement-Report',
              icon: '',
              render: () => <FinalSettlementReport />,
              description: 'View final settlement report',
              categoryId: 'Payroll',
            },
          ]}
        />
      ) : (
        <CustomizableTable
          tableId="hr-reports"
          columns={[
            {
              label: 'Report Name',
              id: 'reportName',
              minWidth: '15vw',
              align: 'left',
              sticky: true,
              filterType: 'string',
            },

            { label: 'Report Category', id: 'reportCategory', minWidth: '10vw', align: 'left' },

            {
              label: 'Report Description',
              id: 'reportDescription',
              minWidth: '12vw',
              align: 'left',
              filterType: 'string',
            },
            {
              label: 'Generate Report Date',
              id: 'generateReportDate',
              minWidth: '13vw',
              align: 'left',
              filterType: 'date',
            },
            {
              label: 'Applied Filters',
              id: 'appliedFilters',
              isFilter: false,
              isSort: false,
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
              reportName: 'Employee Profile',
              reportCategory: 'Employee',
              reportSubCategory: 'Detail',
              reportDescription: 'View employee profile details',
              generateReportDate: '2025-12-01',
              appliedFilters: [{ name: 'Name', value: 'John Doe | Parth Ghusar | Vishal Makwana' }],
              reportAction: 'View',
            },
            {
              reportName: 'Employee List',
              reportCategory: 'Employee',
              reportSubCategory: 'Summary',
              reportDescription: 'View employee list',
              generateReportDate: '2025-12-01',
              appliedFilters: [
                { name: 'Name', value: 'John Doe' },
                { name: 'Department', value: 'Computer' },
              ],
              reportAction: 'View',
            },
          ]}
        />
      )}
    </Box>
  );
};

export default ReportsScreen;
