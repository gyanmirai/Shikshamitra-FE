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
import { formatCurrency } from 'src/utils/cureencyFormater';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Box,
  Card,
  Grid,
  Button,
  TextField,
  Typography,
  CardContent,
  Autocomplete,
} from '@mui/material';

const PaySlipGenerationScreen = () => {
  const [employee, setEmployee] = useState<string | null>(null);
  // const [employeeCode, setEmployeeCode] = useState<string>('');
  const [monthYear, setMonthYear] = useState<null | Dayjs>(dayjs());
  const [, setAllOrganization] = useState<Organization[]>([]);
  const [, setOrganization] = useState<string>('');

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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CustomBreadcrumbs
        heading="Generate Salary Slip"
        links={[
          { name: 'HR/Staff' },
          { name: 'Payroll Management' },
          { name: 'Generate Salary Slip' },
        ]}
        sx={{ mb: 2 }}
        description="Generate and download salary slips by selecting the pay period and employee details."
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

        {/* <TextField
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
        /> */}
        <DatePicker
          value={monthYear}
          onChange={(val) => setMonthYear(val)}
          views={['month', 'year']}
          label="Select Year Month"
          format="MMMM-YYYY"
          sx={{ maxWidth: '250px', width: '100%' }}
          slotProps={{ textField: { size: 'small' } }}
        />
        <Button size="small" variant="contained" startIcon={<Search />}>
          Search
        </Button>
      </Box>

      <Box my={2}>
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              sx={{
                height: '100%',

                border: (theme) =>
                  `1px solid ${varAlpha(theme.vars.palette.success.mainChannel, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.16),
                    }}
                  >
                    <Iconify
                      icon="solar:wallet-money-bold"
                      width={24}
                      sx={{ color: 'success.main' }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight={600} color="success.main">
                    {formatCurrency(40000)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Earning
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              sx={{
                height: '100%',

                border: (theme) =>
                  `1px solid ${varAlpha(theme.vars.palette.error.mainChannel, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.16),
                    }}
                  >
                    <Iconify icon="tabler:moneybag-minus" width={24} sx={{ color: 'error.main' }} />
                  </Box>
                  <Typography variant="h4" fontWeight={600} color="error.main">
                    {formatCurrency(10000)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Total Deduction
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid size={{ xs: 12, sm: 4 }}>
            <Card
              sx={{
                height: '100%',

                border: (theme) =>
                  `1px solid ${varAlpha(theme.vars.palette.primary.mainChannel, 0.2)}`,
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                    }}
                  >
                    <Iconify
                      icon="solar:hand-money-bold"
                      width={24}
                      sx={{ color: 'primary.main' }}
                    />
                  </Box>
                  <Typography variant="h4" fontWeight={600} color="primary.main">
                    {formatCurrency(30000)}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Net Payable
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
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
      <Grid container spacing={3} sx={{ display: 'flex', height: '100%', minHeight: '0' }}>
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '0' }}
        >
          <Typography variant="h6">Earning Section</Typography>
          <CustomizableTable
            noDataText="No Earning Found"
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
                filterType: 'number',
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
        <Grid
          size={{ xs: 12, md: 6 }}
          sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '0' }}
        >
          <Typography variant="h6">Deduction Section</Typography>
          <CustomizableTable
            noDataText="No Deduction Found"
            isSearch={false}
            isFilter={false}
            isPagination={false}
            isShowedDense={false}
            tableId="deduction-table"
            columns={[
              {
                id: 'deductionType',
                label: 'Deduction Type',
                isFilter: false,
                isSort: false,
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
                isFilter: false,
                isSort: false,
                filterType: 'number',
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
      </Grid>
    </Box>
  );
};

export default PaySlipGenerationScreen;
