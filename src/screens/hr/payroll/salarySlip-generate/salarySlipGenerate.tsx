'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { varAlpha } from 'src/theme/styles';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetEmployeeQuery } from 'src/redux/employee/employeeApi';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useGetEmployeeSalarySlipQuery } from 'src/redux/employee-salary-slip/employee-salary-slip-api';
import {
  Box,
  Card,
  Grid,
  Button,
  Divider,
  TextField,
  Typography,
  CardContent,
  Autocomplete,
} from '@mui/material';

const PaySlipGenerationScreen = () => {
  const [employee, setEmployee] = useState<any>(null);
  // const [employeeCode, setEmployeeCode] = useState<string>('');
  const [monthYear, setMonthYear] = useState<null | Dayjs>(dayjs());
  const [, setAllOrganization] = useState<Organization[]>([]);
  const [, setOrganization] = useState<string>('');

  const { currentMedium: medium, currentYear } = useSelector(
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

  const { data: employeeSalarySlip, isLoading: employeeSalarySlipLoading } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useGetEmployeeSalarySlipQuery,
    params: {
      id: employee?.id,
      monthYear: monthYear?.format('YYYY-MM'),
    },
    options: {
      skip: !employee?.id || !monthYear,
    },
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

        <DatePicker
          minDate={dayjs(currentYear?.startDate)}
          maxDate={dayjs(currentYear?.endDate)}
          value={monthYear}
          onChange={(val) => setMonthYear(val)}
          views={['month', 'year']}
          label="Select Year Month"
          format="MMMM-YYYY"
          sx={{ maxWidth: '250px', width: '100%' }}
          slotProps={{ textField: { size: 'small' } }}
        />
      </Box>

      <Divider />

      {employee?.id && !employeeSalarySlipLoading && (
        <>
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
                  <CardContent sx={{ p: 1.5, pb: '12px !important' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: (theme) =>
                            varAlpha(theme.vars.palette.success.mainChannel, 0.16),
                        }}
                      >
                        <Iconify
                          icon="solar:wallet-money-bold"
                          width={20}
                          sx={{ color: 'success.main' }}
                        />
                      </Box>
                      <Typography variant="h5" fontWeight={600} color="success.main">
                        {formatCurrency(employeeSalarySlip?.totalEarning)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" gutterBottom>
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
                  <CardContent sx={{ p: 1.5, pb: '12px !important' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: (theme) =>
                            varAlpha(theme.vars.palette.error.mainChannel, 0.16),
                        }}
                      >
                        <Iconify
                          icon="tabler:moneybag-minus"
                          width={20}
                          sx={{ color: 'error.main' }}
                        />
                      </Box>
                      <Typography variant="h5" fontWeight={600} color="error.main">
                        {formatCurrency(employeeSalarySlip?.totalDeduction)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" gutterBottom>
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
                  <CardContent sx={{ p: 1.5, pb: '12px !important' }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={1}>
                      <Box
                        sx={{
                          width: 40,
                          height: 40,
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: (theme) =>
                            varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                        }}
                      >
                        <Iconify
                          icon="solar:hand-money-bold"
                          width={20}
                          sx={{ color: 'primary.main' }}
                        />
                      </Box>
                      <Typography variant="h5" fontWeight={600} color="primary.main">
                        {formatCurrency(employeeSalarySlip?.netSalary)}
                      </Typography>
                    </Box>
                    <Typography variant="caption" gutterBottom>
                      Net Payable
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap" my={2} justifyContent="flex-end">
            <Button
              size="small"
              startIcon={<Iconify icon="ion:download" />}
              variant="soft"
              sx={{ px: '32px' }}
            >
              Download PDF
            </Button>

            <Button
              size="small"
              startIcon={<Iconify icon="ion:print" />}
              variant="soft"
              sx={{ px: '32px' }}
            >
              Print Payslip
            </Button>

            <Button
              size="small"
              startIcon={<Iconify icon="ion:email" />}
              variant="contained"
              sx={{ px: '32px' }}
            >
              Email Payslip
            </Button>
          </Box>
          <Grid container spacing={3} sx={{ display: 'flex', height: '100%', minHeight: '0' }}>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '0' }}
            >
              <Typography variant="body2" fontWeight={600}>
                Earning Section
              </Typography>
              <CustomizableTable
                noDataText="No Earning Found"
                isSearch={false}
                isFilter={false}
                isPagination={false}
                isShowedDense={false}
                tableId="earning-table"
                columns={[
                  {
                    id: 'name',
                    label: 'Earning Type',
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
                          sx={{
                            fontWeight: row.employeeType === 'Total Amount' ? 'bold' : 'normal',
                          }}
                        >
                          {formatCurrency(value)}
                        </Typography>
                      );
                    },
                  },
                ]}
                data={employeeSalarySlip?.earnings || []}
              />
            </Grid>
            <Grid
              size={{ xs: 12, md: 6 }}
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: '0' }}
            >
              <Typography variant="body2" fontWeight={600}>
                Deduction Section
              </Typography>
              <CustomizableTable
                noDataText="No Deduction Found"
                isSearch={false}
                isFilter={false}
                isPagination={false}
                isShowedDense={false}
                tableId="deduction-table"
                columns={[
                  {
                    id: 'name',
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
                          sx={{
                            fontWeight: row.deductionType === 'Total Amount' ? 'bold' : 'normal',
                          }}
                        >
                          {formatCurrency(value)}
                        </Typography>
                      );
                    },
                  },
                ]}
                data={employeeSalarySlip?.deductions || []}
              />
            </Grid>
          </Grid>
        </>
      )}

      {employeeSalarySlipLoading && <LoadingScreen />}
    </Box>
  );
};

export default PaySlipGenerationScreen;
