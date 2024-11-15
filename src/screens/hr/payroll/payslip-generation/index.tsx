'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import React, { useState, useEffect } from 'react';

import { Search } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import {
  Box,
  Card,
  Grid,
  Button,
  TextField,
  CardHeader,
  Typography,
  CardContent,
  Autocomplete,
} from '@mui/material';

import { formatCurrency } from 'src/utils/cureencyFormater';

import { varAlpha } from 'src/theme/styles';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const PaySlipGenerationScreen = () => {
  const [employee, setEmployee] = useState<string | null>(null);
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [monthYear, setMonthYear] = useState<null | Dayjs>(dayjs());
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  const { currentMedium: medium, setCurrentMedium: setMedium } = useSelector(
    (state: RootState) => state.globalState
  );

  useEffect(() => {
    setAllOrganization(medium?.educationMediumStages || []);
    setOrganization(medium?.educationMediumStages?.[0]?.id || '');
  }, [medium]);

  const { data: employees, isLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeQuery,
  });
  return (
    <Box>
      <CustomBreadcrumbs
        heading="Payslip Generation"
        links={[{ name: 'HR' }, { name: 'Payroll Management' }, { name: 'Payslip Generation' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <Autocomplete
          loading={isLoading}
          noOptionsText="No Employee Found"
          fullWidth
          value={employee}
          onChange={(e, value) => {
            setEmployee(value);
          }}
          options={employees?.items || []}
          getOptionLabel={(option: any) => option?.firstName || ''}
          renderInput={(params) => (
            <TextField {...params} size="small" label="Employee" placeholder="Search  Employee" />
          )}
          renderOption={(props, option: any) => (
            <li {...props} key={option.id}>
              {option.firstName}
            </li>
          )}
          sx={{ maxWidth: '300px', width: '100%' }}
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
          options={allOrganization}
          label="Organization"
          value={organization}
          onChange={(val: string | string[]) => setOrganization(val as string)}
          labelKey="name"
          valueKey="id"
          formControlProps={{ sx: { maxWidth: '250px', width: '100%' } }}
          disabled={!medium}
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
        <Button variant="contained" startIcon={<Search />}>
          Search
        </Button>
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap" my={2}>
        <Card
          sx={{
            flexGrow: 1,
            background: (theme) => varAlpha(theme.palette.success.mainChannel, 0.1),
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
            <Typography variant="h3">{formatCurrency(40000)}</Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            flexGrow: 1,
            background: (theme) => varAlpha(theme.palette.error.mainChannel, 0.1),
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
            <Typography variant="h3">{formatCurrency(10000)}</Typography>
          </CardContent>
        </Card>
        <Card
          sx={{
            flexGrow: 1,
            background: (theme) => varAlpha(theme.palette.info.mainChannel, 0.1),
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
            <Typography variant="h3">{formatCurrency(30000)}</Typography>
          </CardContent>
        </Card>
      </Box>
      <Box display="flex" gap={2} flexWrap="wrap" my={2} justifyContent="flex-end">
        <Button
          startIcon={<Iconify icon="ion:download" />}
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
            color: 'primary.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.1),
            },
          }}
        >
          Download PDF
        </Button>

        <Button
          startIcon={<Iconify icon="ion:print" />}
          variant="contained"
          color="secondary"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.1),
            color: 'secondary.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.secondary.mainChannel, 0.1),
            },
          }}
        >
          Print Payslip
        </Button>

        <Button
          startIcon={<Iconify icon="ion:email" />}
          variant="contained"
          color="warning"
          sx={{
            backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            color: 'warning.main',
            '&:hover': {
              backgroundColor: (theme) => varAlpha(theme.palette.warning.mainChannel, 0.1),
            },
          }}
        >
          Email Payslip
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">Earning Section</Typography>
          <CustomizableTable
            columns={[
              { id: 'employeeType', label: 'Employee Type' },
              {
                id: 'amount',
                label: 'Amount',
                render(value, row) {
                  return formatCurrency(value);
                },
              },
              {
                id: 'total',
                label: 'Total',
                render(value, row) {
                  return formatCurrency(value);
                },
              },
            ]}
            data={[
              { employeeType: 'Teaching Allowance', amount: 5000, total: 5000 },
              { employeeType: 'Transport Allowance', amount: 2000, total: 2000 },
              { employeeType: 'Academic Performance Bonus', amount: 3000, total: 3000 },
              { employeeType: 'Extra-curricular Activities', amount: 2000, total: 2000 },
            ]}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="h5">Deductions Section</Typography>
          <CustomizableTable
            columns={[
              { id: 'deductionType', label: 'Deduction Type' },
              {
                id: 'amount',
                label: 'Amount',
                render(value, row) {
                  return formatCurrency(value);
                },
              },
              {
                id: 'totalDeduction',
                label: 'Total Deduction',
                render(value, row) {
                  return formatCurrency(value);
                },
              },
            ]}
            data={[
              { deductionType: 'Income Tax', amount: 5000, totalDeduction: 5000 },
              { deductionType: 'Provident Fund', amount: 3000, totalDeduction: 3000 },
              { deductionType: 'Professional Tax', amount: 1000, totalDeduction: 1000 },
              { deductionType: 'Insurance Premium', amount: 1000, totalDeduction: 1000 },
            ]}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaySlipGenerationScreen;
