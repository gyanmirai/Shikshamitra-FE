'use client';

import type { Dayjs } from 'dayjs';
import type { RootState } from 'src/redux/store';
import type { Organization } from 'src/types/school';

import dayjs from 'dayjs';
import { useSelector } from 'react-redux';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { hrPaths } from 'src/constants/hr-menus';
import React, { useState, useEffect } from 'react';
import { formatCurrency } from 'src/utils/cureencyFormater';
import { EmptyContent } from 'src/components/empty-content';
import CustomizableTable from 'src/components/customizabaleTable';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useLazyGetEmployeeQuery } from 'src/redux/hr/employeeApi';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { PaginatedSearchSelect } from 'src/components/paginated-search-select';
import { useLazyGetEmployeeSalarySlipQuery } from 'src/redux/runPayroll/runPayrollApi';
import {
  Box,
  Card,
  Grid,
  Stack,
  Button,
  Avatar,
  Divider,
  Skeleton,
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

  const [getEmployees] = useQueryAndMutation({
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
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <CustomBreadcrumbs
        heading="Generate Salary Slip"
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Payroll Management', href: hrPaths.payroll.runPayroll },
          { name: 'Generate Salary Slip' },
        ]}
        description="Generate and download salary slips by selecting the pay period and employee details."
      />

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={1}
      >
        <Card sx={{ width: '100%' }}>
          <Box sx={{ width: '100%' }} display="flex" alignItems="center" flexWrap="wrap" p={1.5}>
            {/* Filters */}
            <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
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

            {/* Actions */}
            <Box display="flex" gap={1} alignItems="center" ml="auto">
              <Button
                size="small"
                startIcon={<Iconify icon="ion:download-outline" />}
                variant="outlined"
                color="inherit"
                disabled={!employee?.id}
              >
                Download
              </Button>
              <Button
                size="small"
                startIcon={<Iconify icon="ion:print-outline" />}
                variant="outlined"
                color="inherit"
                disabled={!employee?.id}
              >
                Print
              </Button>
              <Button
                size="small"
                startIcon={<Iconify icon="iconamoon:email-thin" />}
                variant="outlined"
                color="inherit"
                disabled={!employee?.id}
              >
                Email
              </Button>
            </Box>
          </Box>
        </Card>
      </Stack>

      {employee?.id && !employeeSalarySlipLoading ? (
        <>
          {/* Summary Stats */}
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 4 }}>
              <SummaryWidget
                title="Total Earning"
                total={employeeSalarySlip?.totalEarning || 0}
                icon="solar:wallet-bold-duotone"
                color="success"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <SummaryWidget
                title="Total Deduction"
                total={employeeSalarySlip?.totalDeduction || 0}
                icon="solar:bill-list-bold-duotone"
                color="error"
              />
            </Grid>

            <Grid size={{ xs: 12, md: 4 }}>
              <SummaryWidget
                title="Net Payable"
                total={employeeSalarySlip?.netSalary || 0}
                icon="solar:card-send-bold-duotone"
                color="info"
              />
            </Grid>
          </Grid>
          <Divider />
          {/* Tables Section */}
          <Grid container spacing={1}>
            <Grid size={{ xs: 12, md: 6 }}>
              <SalaryDetailsTableCard
                title="Earnings"
                subheader="Breakdown of earnings"
                icon="solar:hand-money-linear"
                iconColor={{ bg: 'success.lighter', color: 'success.main' }}
                data={employeeSalarySlip?.earnings || []}
                tableId="earning-table"
                nameColumnLabel="Earning Type"
                noDataText="No Earning Found"
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <SalaryDetailsTableCard
                title="Deductions"
                subheader="Breakdown of deductions"
                icon="solar:minus-circle-linear"
                iconColor={{ bg: 'error.lighter', color: 'error.main' }}
                data={employeeSalarySlip?.deductions || []}
                tableId="deduction-table"
                nameColumnLabel="Deduction Type"
                noDataText="No Deduction Found"
              />
            </Grid>
          </Grid>
        </>
      ) : employeeSalarySlipLoading ? (
        <>
          <Grid container spacing={1}>
            {[1, 2, 3].map((item) => (
              <Grid size={{ xs: 12, md: 4 }} key={item}>
                <Card sx={{ p: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Skeleton variant="rounded" width={56} height={56} />
                  <Box flexGrow={1}>
                    <Skeleton variant="text" width="50%" height={20} sx={{ mb: 0.5 }} />
                    <Skeleton variant="text" width="70%" height={40} />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
          <Divider sx={{ my: 1 }} />
          <Grid container spacing={1}>
            {[1, 2].map((item) => (
              <Grid size={{ xs: 12, md: 6 }} key={item}>
                <Card>
                  <CardHeader
                    avatar={<Skeleton variant="circular" width={32} height={32} />}
                    title={<Skeleton variant="text" width="30%" height={24} />}
                    subheader={<Skeleton variant="text" width="40%" height={20} />}
                    sx={{ p: 2 }}
                  />
                  <Box sx={{ px: 2, py: 2, pt: 0 }}>
                    <Skeleton
                      variant="rectangular"
                      width="100%"
                      height={200}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      ) : (
        <EmptyContent title="No Data Found Search the Employee" />
      )}
    </Box>
  );
};

export default PaySlipGenerationScreen;

interface SalaryDetailsTableCardProps {
  title: string;
  subheader: string;
  icon: string;
  iconColor: { bg: string; color: string };
  data: any[];
  tableId: string;
  nameColumnLabel: string;
  noDataText: string;
}

export const SalaryDetailsTableCard = ({
  title,
  subheader,
  icon,
  iconColor,
  data,
  tableId,
  nameColumnLabel,
  noDataText,
}: SalaryDetailsTableCardProps) => (
  <Card>
    <CardHeader
      title={title}
      subheader={subheader}
      avatar={
        <Avatar
          sx={{
            bgcolor: iconColor.bg,
            color: iconColor.color,
            width: 32,
            height: 32,
          }}
        >
          <Iconify icon={icon} width={20} />
        </Avatar>
      }
      sx={{ p: 2 }}
    />

    <Box sx={{ px: 1, py: 1, pt: 0 }}>
      <CustomizableTable
        noDataText={noDataText}
        isSearch={false}
        isFilter={false}
        isPagination={false}
        isShowedDense={false}
        tableId={tableId}
        columns={[
          {
            id: 'name',
            label: nameColumnLabel,
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
    </Box>
  </Card>
);

interface SummaryWidgetProps {
  title: string;
  total: number;
  icon: string;
  color: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
}

const SummaryWidget = ({ title, total, icon, color }: SummaryWidgetProps) => (
  <Card
    sx={{
      p: 1,
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
        bgcolor: `${color}.lighter`,
        color: `${color}.dark`,
      }}
    >
      <Iconify icon={icon} width={32} />
    </Avatar>

    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      <Typography variant="h4">{formatCurrency(total)}</Typography>
    </Box>
  </Card>
);
