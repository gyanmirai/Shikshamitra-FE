'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { LoadingScreen } from 'src/components/loading-screen';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useLazyGetEmployeeQuery } from 'src/redux/employee/employeeApi';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazyGetEmployeeSalarySlipQuery } from 'src/redux/employee-salary-slip/employee-salary-slip-api';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Avatar,
  Divider,
  CardHeader,
  Typography,
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

  const [getEmployees, { data: employees, isLoading }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useLazyGetEmployeeQuery,
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

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Box display="flex" gap={2} flexWrap="wrap" alignItems="center" flex={1}>
          <PaginatedSearchSelect
            label="Select Employee"
            fetchOptions={async (query, page) => {
              const res = await getEmployees({ page, pageSize: 10 }).unwrap();
              const hasMore = res.currentPage !== res.totalPages;
              return {
                data: res?.items?.map((item: any) => ({
                  label: item.fullName,
                  id: item.id,
                })),
                hasMore,
              };
            }}
            value={employee}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderOption={(prop, option: any) => (
              <li {...prop} key={option.id}>
                {option.label}
              </li>
            )}
            getOptionLabel={(option: any) => option?.label || ''}
            minChars={2}
            onChange={(_, value) => setEmployee(value)}
            debounceMs={400}
            placeholder="Search by name or email"
            helperText="Start typing to search for employees"
            error={false}
            sx={{ maxWidth: 300, minWidth: 250 }}
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
            sx={{ maxWidth: 200, width: '100%' }}
            slotProps={{
              textField: {
                size: 'small',
              },
            }}
          />
        </Box>

        <Box display="flex" gap={1}>
          {/* Actions will appear when employee is selected or just default disabled */}
          <Button
            size="small"
            startIcon={<Iconify icon="ion:download" />}
            variant="outlined"
            color="inherit"
            disabled={!employee?.id}
          >
            Download
          </Button>
          <Button
            size="small"
            startIcon={<Iconify icon="ion:print" />}
            variant="outlined"
            color="inherit"
            disabled={!employee?.id}
          >
            Print
          </Button>
          <Button
            size="small"
            startIcon={<Iconify icon="ion:paper-airplane" />}
            variant="contained"
            color="primary"
            disabled={!employee?.id}
          >
            Email
          </Button>
        </Box>
      </Stack>

      {employee?.id && !employeeSalarySlipLoading && (
        <>
          {/* Summary Stats */}
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[3],
                }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'success.lighter',
                    color: 'success.dark',
                  }}
                >
                  <Iconify icon="solar:wallet-bold-duotone" width={32} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total Salary
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(employeeSalarySlip?.totalEarning || 0)}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[3],
                }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'error.lighter',
                    color: 'error.dark',
                  }}
                >
                  <Iconify icon="solar:bill-list-bold-duotone" width={32} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Total Deduction
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(employeeSalarySlip?.totalDeduction || 0)}
                  </Typography>
                </Box>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <Card
                sx={{
                  p: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  bgcolor: 'background.paper',
                  boxShadow: (theme) => theme.customShadows?.z8 || theme.shadows[3],
                  border: (theme) => `1px solid ${theme.palette.divider}`,
                }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 56,
                    height: 56,
                    bgcolor: 'info.lighter',
                    color: 'info.dark',
                  }}
                >
                  <Iconify icon="solar:card-send-bold-duotone" width={32} />
                </Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                    Net Payable
                  </Typography>
                  <Typography variant="h4">
                    {formatCurrency(employeeSalarySlip?.netSalary || 0)}
                  </Typography>
                </Box>
              </Card>
            </Grid>
          </Grid>

          {/* Tables Section */}
          <Grid container spacing={3} sx={{ mt: 3 }}>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader
                  title="Earnings"
                  subheader="Breakdown of earnings"
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: 'success.lighter',
                        color: 'success.main',
                        width: 32,
                        height: 32,
                      }}
                    >
                      <Iconify icon="solar:hand-money-linear" width={20} />
                    </Avatar>
                  }
                />
                <Divider />
                <EarningSection data={employeeSalarySlip?.earnings || []} />
              </Card>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Card>
                <CardHeader
                  title="Deductions"
                  subheader="Breakdown of deductions"
                  avatar={
                    <Avatar
                      sx={{ bgcolor: 'error.lighter', color: 'error.main', width: 32, height: 32 }}
                    >
                      <Iconify icon="solar:minus-circle-linear" width={20} />
                    </Avatar>
                  }
                />
                <Divider />
                <DeductionSection data={employeeSalarySlip?.deductions || []} />
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
