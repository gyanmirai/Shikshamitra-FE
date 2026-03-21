'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { Search } from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import CustomSelect from 'src/components/custom-select';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { useGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import CustomizableTable from 'src/components/customizable-table';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Card,
  Grid,
  Alert,
  Button,
  TextField,
  CardHeader,
  Typography,
  CardContent,
  Autocomplete,
} from '@mui/material';

const PaySlipGenerationScreen = () => {
  const [employee, setEmployee] = useState<string | null>(null);
  const [employeeCode, setEmployeeCode] = useState<string>('');
  const [monthYear, setMonthYear] = useState<null | Dayjs>(dayjs());
  const [allOrganization, setAllOrganization] = useState<Organization[]>([]);
  const [organization, setOrganization] = useState<string>('');

  const { currentMedium: medium } = useSelector((state: RootState) => state.globalState);

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
          onChange={(val) => setOrganization(val as string)}
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
          slotProps={{ textField: { size: 'small' } }}
        />
        <Button variant="contained" startIcon={<Search />}>
          Search
        </Button>
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap" my={2}>
        <Card
          sx={{
            flexGrow: 1,
            background: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.1),
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
            background: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.1),
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
            background: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.1),
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
        <Button size="small" startIcon={<Iconify icon="ion:download" />} variant="soft">
          Download PDF
        </Button>

        <Button size="small" startIcon={<Iconify icon="ion:print" />} variant="soft">
          Print Payslip
        </Button>

        <Button size="small" startIcon={<Iconify icon="ion:email" />} variant="contained">
          Email Payslip
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6">Earning Section</Typography>
          <CustomizableTable
            isSearch={false}
            isFilter={false}
            isPagination={false}
            isShowedDense={false}
            tableId="earning-table"
            columns={[
              {
                id: 'employeeType',
                label: 'Employee Type',
                render(value, row) {
                  return (
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: value === 'Total Amount' ? 'bold' : 'normal' }}
                    >
                      {value}
                    </Typography>
                  );
                },
              },
              {
                id: 'amount',
                label: 'Amount',
                render(value, row) {
                  return (
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: row.employeeType === 'Total Amount' ? 'bold' : 'normal' }}
                    >
                      {formatCurrency(value)}
                    </Typography>
                  );
                },
              },
            ]}
            data={[
              { employeeType: 'Teaching Allowance', amount: 5000 },
              { employeeType: 'Transport Allowance', amount: 2000 },
              { employeeType: 'Academic Performance Bonus', amount: 3000 },
              { employeeType: 'Extra-curricular Activities', amount: 2000 },
              { employeeType: 'Total Amount', amount: 12000 },
            ]}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6">Deduction Section</Typography>
          <CustomizableTable
            isSearch={false}
            isFilter={false}
            isPagination={false}
            isShowedDense={false}
            tableId="deduction-table"
            columns={[
              {
                id: 'deductionType',
                label: 'Deduction Type',
                render(value, row) {
                  return (
                    <Typography
                      variant="caption"
                      sx={{ fontWeight: value === 'Total Amount' ? 'bold' : 'normal' }}
                    >
                      {value}
                    </Typography>
                  );
                },
              },
              {
                id: 'amount',
                label: 'Amount',
                render(value, row) {
                  return (
                    <Typography
                      variant="caption"
                      color="error"
                      sx={{ fontWeight: row.deductionType === 'Total Amount' ? 'bold' : 'normal' }}
                    >
                      {formatCurrency(value)}
                    </Typography>
                  );
                },
              },
            ]}
            data={[
              { deductionType: 'Income Tax', amount: 5000, totalDeduction: 5000 },
              { deductionType: 'Provident Fund', amount: 3000, totalDeduction: 3000 },
              { deductionType: 'Professional Tax', amount: 1000, totalDeduction: 1000 },
              { deductionType: 'Insurance Premium', amount: 1000, totalDeduction: 1000 },
              { deductionType: 'Total Amount', amount: 12000 },
            ]}
          />
        </Grid>
        <Grid size={12}>
          <Alert
            variant="outlined"
            icon={false}
            sx={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'inherit' }}
          >
            Net Salary : {formatCurrency(24000)}
          </Alert>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaySlipGenerationScreen;
