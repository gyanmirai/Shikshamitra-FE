'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Box } from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers';

import { formatCurrency } from 'src/utils/cureencyFormater';

import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const PayProcessScreen = () => {
  const [year, setYear] = useState<null | Dayjs>(dayjs(new Date()));
  const [month, setMonth] = useState<null | Dayjs>(dayjs(new Date()));
  // const [allMediums, setAllMediums] = useState<Medium[]>([]);
  // const [medium, setMedium] = useState<string>('');
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  const { currentMedium: medium, setCurrentMedium: setMedium } = useSelector(
    (state: RootState) => state.globalState
  );

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  return (
    <Box>
      <CustomBreadcrumbs
        heading="Pay Process"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Pay Process' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <DatePicker
          value={year}
          onChange={(val) => setYear(val)}
          views={['year']}
          label="Select Year"
          format="YYYY"
          sx={{ maxWidth: '250px', width: '100%' }}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
        <DatePicker
          value={month}
          onChange={(val) => setMonth(val)}
          views={['month']}
          label="Select Month"
          format="MMMM"
          sx={{ maxWidth: '250px', width: '100%' }}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
        {/* <CustomSelect
          options={allMediums}
          label="Medium"
          value={medium}
          onChange={(val) => {
            setMedium(val as string);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        /> */}
        <CustomSelect
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
        />
      </Box>
      <CustomizableTable
        tableId="payProcess"
        columns={[
          { id: 'employeeCode', label: 'Employee Code', minWidth: 144 },
          { id: 'name', label: 'Name' },
          { id: 'remark', label: 'Remark' },

          { id: 'salaryMonth', label: 'Salary Month', minWidth: 130 },

          { id: 'year', label: 'Year' },
          { id: 'workingDays', label: 'Total Days', minWidth: 110 },
          { id: 'presentDays', label: 'Present Days', minWidth: 128 },
          {
            id: 'salary',
            label: 'Salary',
            align: 'right',
            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'grossSalary',
            label: 'Gross Salary',
            align: 'right',
            minWidth: 125,
            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'pr',
            label: 'PR',
            align: 'right',

            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'profTax',
            label: 'Prof. Tax',
            align: 'right',
            minWidth: 120,
            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'tds',
            label: 'TDS',
            align: 'right',
            render(value, row) {
              return formatCurrency(value);
            },
          },
          {
            id: 'netSalary',
            label: 'Net Salary',
            align: 'right',
            minWidth: 110,
            render(value, row) {
              return formatCurrency(value);
            },
          },
          // {
          //   id: 'payrollStatus',
          //   label: 'Payroll Status',
          //   render(value, row) {
          //     return <Label color={value === 'Generated' ? 'success' : 'warning'}>{value}</Label>;
          //   },
          // },
        ]}
        data={[
          {
            employeeCode: 'EMP001',
            name: 'John Doe',
            remark: 'Regular',
            payrollStatus: 'Generated',
            salaryMonth: 'January',
            year: 2024,
            workingDays: 22,
            presentDays: 20,
            salary: 50000,
            grossSalary: 55000,
            pr: 1200,
            profTax: 200,
            tds: 2500,
            netSalary: 51100,
          },
          {
            employeeCode: 'EMP002',
            name: 'Jane Smith',
            remark: 'New Hire',
            payrollStatus: 'Pending',
            salaryMonth: 'January',
            year: 2024,
            workingDays: 22,
            presentDays: 22,
            salary: 45000,
            grossSalary: 48000,
            pr: 1000,
            profTax: 200,
            tds: 2000,
            netSalary: 44800,
          },
        ]}
      />
    </Box>
  );
};

export default PayProcessScreen;
