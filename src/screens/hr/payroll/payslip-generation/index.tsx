'use client';

import type { Dayjs } from 'dayjs';

import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Email, Print, Download } from '@mui/icons-material';
import { Box, Card, Button, TextField, CardHeader, Typography, CardContent } from '@mui/material';

import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const PaySlipGenerationScreen = () => {
  const [employee, setEmployee] = useState<string>('');
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [monthYear, setMonthYear] = useState<null | Dayjs>(null);
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Payslip Generation"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Payslip Generation' }]}
        sx={{ px: 1, mb: 2 }}
        action={
          <>
            <Button startIcon={<Download />} variant="contained" color="primary">
              Download PDF
            </Button>
            &nbsp;
            <Button startIcon={<Print />} variant="contained" color="secondary">
              Print Payslip
            </Button>
            &nbsp;
            <Button startIcon={<Email />} variant="contained" color="warning">
              Email Payslip
            </Button>
          </>
        }
      />
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <TextField
          label="Employee Name"
          size="small"
          value={employee}
          onChange={(e) => {
            setEmployee(e.target.value);
          }}
          sx={{ maxWidth: '250px', width: '100%' }}
        />
        <TextField
          label="Employee Code"
          size="small"
          value={employeeCode}
          onChange={(e) => {
            setEmployeeCode(e.target.value);
          }}
          sx={{ maxWidth: '250px', width: '100%' }}
        />
        <CustomSelect
          options={[]}
          label="department"
          value={department}
          onChange={(val: string | string[]) => {
            setDepartment(val as string);
          }}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
        />
        <DatePicker
          value={monthYear}
          onChange={(val) => setMonthYear(val)}
          views={['month', 'year']}
          label="Select Year Month"
          format="MMMM-YYYY"
          sx={{ maxWidth: '250px', width: '100%' }}
          slotProps={{
            textField: {
              size: 'small',
            },
          }}
        />
      </Box>
      <Box display="flex" gap={2} flexWrap="wrap" my={2}>
        <Card
          sx={{
            flexGrow: 1,
            background: (theme) => varAlpha(theme.palette.success.mainChannel, 0.25),
          }}
        >
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon="pepicons-pop:dollar-circle-filled" /> Total Earning
              </Box>
            }
            sx={{ color: 'success.main' }}
          />
          <CardContent sx={{ color: 'success.main' }}>
            <Typography variant="h3">40,000</Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            flexGrow: 1,
            background: (theme) => varAlpha(theme.palette.error.mainChannel, 0.25),
          }}
        >
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon="game-icons:cancel" /> Total Deduction
              </Box>
            }
            sx={{ color: 'error.main' }}
          />
          <CardContent sx={{ color: 'error.main' }}>
            <Typography variant="h3">10,000</Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            flexGrow: 1,
            background: (theme) => varAlpha(theme.palette.info.mainChannel, 0.25),
          }}
        >
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon="ion:wallet" /> Net Payable
              </Box>
            }
            sx={{ color: 'info.main' }}
          />
          <CardContent sx={{ color: 'info.main' }}>
            <Typography variant="h3">30,000</Typography>
          </CardContent>
        </Card>
      </Box>
      <Box>
        <Typography variant="h5">Earning Section</Typography>
        <CustomizableTable
          columns={[
            { id: 'employeeType', label: 'Employee Type' },
            { id: 'amount', label: 'Amount' },
            { id: 'total', label: 'Total' },
          ]}
          data={[
            { employeeType: 'Teaching Allowance', amount: 5000, total: 5000 },
            { employeeType: 'Transport Allowance', amount: 2000, total: 2000 },
            { employeeType: 'Academic Performance Bonus', amount: 3000, total: 3000 },
            { employeeType: 'Extra-curricular Activities', amount: 2000, total: 2000 },
            { employeeType: 'Library Allowance', amount: 1000, total: 1000 },
            { employeeType: 'Research Allowance', amount: 2000, total: 2000 },
          ]}
        />
      </Box>
      <Box mt={2}>
        <Typography variant="h5">Deductions Section</Typography>
        <CustomizableTable
          columns={[
            { id: 'deductionType', label: 'Deduction Type' },
            { id: 'amount', label: 'Amount' },
            { id: 'totalDeduction', label: 'Total Deduction' },
          ]}
          data={[
            { deductionType: 'Income Tax', amount: 5000, totalDeduction: 5000 },
            { deductionType: 'Provident Fund', amount: 3000, totalDeduction: 3000 },
            { deductionType: 'Professional Tax', amount: 1000, totalDeduction: 1000 },
            { deductionType: 'Insurance Premium', amount: 1000, totalDeduction: 1000 },
          ]}
        />
      </Box>
    </Box>
  );
};

export default PaySlipGenerationScreen;
