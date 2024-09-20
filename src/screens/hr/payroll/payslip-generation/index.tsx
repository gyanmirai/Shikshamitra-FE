'use client';

import type { Dayjs } from 'dayjs';

import React, { useState } from 'react';

import { DatePicker } from '@mui/x-date-pickers';
import { Email, Print, Download } from '@mui/icons-material';
import { Box, Card, Button, TextField, CardHeader, Typography, CardContent } from '@mui/material';

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
      <Box>
        <Typography variant="h6">Earning Section</Typography>
        <CustomizableTable
          columns={[
            { id: 'employeeType', label: 'Employee Type' },
            { id: 'amount', label: 'Amount' },
            { id: 'total', label: 'Total' },
          ]}
          data={[]}
        />
      </Box>
      <Box mt={2}>
        <Typography variant="h6">Deductions Section</Typography>
        <CustomizableTable
          columns={[
            { id: 'deductionType', label: 'Deduction Type' },
            { id: 'amount', label: 'Amount' },
            { id: 'totalDeduction', label: 'Total Deduction' },
          ]}
          data={[]}
        />
      </Box>
      <Box display="flex" gap={2} flexWrap="wrap" mt={2}>
        <Card sx={{ flexGrow: 1 }}>
          <CardHeader title="Total Earning" />
          <CardContent>
            <Typography variant="h3">40,000</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flexGrow: 1 }}>
          <CardHeader title="Total Deduction" />
          <CardContent>
            <Typography variant="h3">10,000</Typography>
          </CardContent>
        </Card>
        <Card sx={{ flexGrow: 1 }}>
          <CardHeader title="Net Payable" />
          <CardContent>
            <Typography variant="h3">30,000</Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default PaySlipGenerationScreen;
