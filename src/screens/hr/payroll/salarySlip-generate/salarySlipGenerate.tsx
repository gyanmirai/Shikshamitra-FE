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
import { useLazyGetEmployeeSalarySlipQuery } from 'src/redux/employee-salary-slip/employee-salary-slip-api';
import {
  Box,
  Card,
  Grid,
  Button,
  Divider,
  TextField,
  Typography,
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

  const [
    getEmployeeSalarySlip,
    { data: employeeSalarySlip, isLoading: employeeSalarySlipLoading },
  ] = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useLazyGetEmployeeSalarySlipQuery,
    params: {
      employeeId: employee?.id,
      monthYear: monthYear?.format('MMMM-YYYY').toUpperCase(),
    },
    options: {
      skip: !employee?.id || !monthYear,
    },
  });

  useEffect(() => {
    if (employee?.id && monthYear) {
      getEmployeeSalarySlip({
        employeeId: employee?.id,
        monthYear: monthYear?.format('MMMM-YYYY').toUpperCase(),
      });
    }
  }, [employee?.id, getEmployeeSalarySlip, monthYear]);
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <CustomBreadcrumbs
        heading="Generate Salary Slip"
        links={[
          { name: 'HR/Staff' },
          { name: 'Payroll Management' },
          { name: 'Generate Salary Slip' },
        ]}
        sx={{ mb: 0 }}
        description="Generate and download salary slips by selecting the pay period and employee details."
      />

      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          Filter Criteria
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
          <Autocomplete
            loading={isLoading}
            fullWidth
            value={employee}
            onChange={(_, value) => setEmployee(value)}
            options={employees?.items || []}
            getOptionLabel={(option: any) => option?.fullName || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => <TextField {...params} label="Select Employee" />}
            sx={{ maxWidth: 400, flex: 1 }}
            size="small"
          />

          <DatePicker
            minDate={dayjs(currentYear?.startDate)}
            maxDate={dayjs(currentYear?.endDate)}
            value={monthYear}
            onChange={(val) => setMonthYear(val)}
            views={['month', 'year']}
            label="Select Pay Period"
            format="MMMM-YYYY"
            sx={{ maxWidth: 250, width: '100%' }}
            slotProps={{
              textField: {
                size: 'small',
              },
            }}
          />
        </Box>
      </Card>

      {employee?.id && !employeeSalarySlipLoading && (
        <>
          <Box>
            <Grid container spacing={3}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: (theme) => theme.customShadows?.z8 || 4,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      Total Earning
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">
                      {formatCurrency(employeeSalarySlip?.totalEarning || 0)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.16),
                      color: 'success.main',
                    }}
                  >
                    <Iconify icon="solar:wallet-money-bold" width={32} />
                  </Box>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: (theme) => theme.customShadows?.z8 || 4,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 0.5 }}>
                      Total Deduction
                    </Typography>
                    <Typography variant="h4" fontWeight={700} color="error.main">
                      {formatCurrency(employeeSalarySlip?.totalDeduction || 0)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.16),
                      color: 'error.main',
                    }}
                  >
                    <Iconify icon="tabler:moneybag-minus" width={32} />
                  </Box>
                </Card>
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <Card
                  sx={{
                    p: 3,
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    // bgcolor: 'primary.main',
                    color: 'primary.main',
                    boxShadow: (theme) => theme.customShadows?.z8 || 4,
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" sx={{ opacity: 0.8, mb: 0.5 }}>
                      Net Payable
                    </Typography>
                    <Typography variant="h4" fontWeight={700}>
                      {formatCurrency(employeeSalarySlip?.netSalary || 0)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: (theme) => varAlpha(theme.vars.palette.primary.mainChannel, 0.16),
                    }}
                  >
                    <Iconify icon="solar:hand-money-bold" width={32} />
                  </Box>
                </Card>
              </Grid>
            </Grid>
          </Box>

          <Box display="flex" gap={2} my={1} justifyContent="flex-end">
            <Button
              startIcon={<Iconify icon="ion:download" />}
              variant="outlined"
              color="inherit"
              sx={{ px: 3 }}
            >
              Download PDF
            </Button>

            <Button
              startIcon={<Iconify icon="ion:print" />}
              variant="outlined"
              color="inherit"
              sx={{ px: 3 }}
            >
              Print
            </Button>

            <Button
              startIcon={<Iconify icon="ion:email" />}
              variant="contained"
              // color="primary"
              sx={{ px: 3 }}
            >
              Email Payslip
            </Button>
          </Box>

          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    p: 2.5,
                    px: 3,
                    bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                  }}
                >
                  <Typography variant="h6">Earnings</Typography>
                </Box>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <EarningSection data={employeeSalarySlip?.earnings || []} />
                </Box>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <Box
                  sx={{
                    p: 2.5,
                    px: 3,
                    bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                  }}
                >
                  <Typography variant="h6">Deductions</Typography>
                </Box>
                <Divider />
                <Box sx={{ p: 2 }}>
                  <DeductionSection data={employeeSalarySlip?.deductions || []} />
                </Box>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {employeeSalarySlipLoading && <LoadingScreen />}
    </Box>
  );
};

export default PaySlipGenerationScreen;

export const EarningSection = ({ data }: { data: any }) => (
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
              variant="subtitle2"
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
              variant="body2"
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
    data={data || []}
  />
);

export const DeductionSection = ({ data }: { data: any }) => (
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
        render(value, row) {
          return (
            <Typography
              variant="subtitle2"
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
              variant="body2"
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
    data={data || []}
  />
);
