'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import { motion } from 'framer-motion';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { formatCurrency } from 'src/utils/cureencyFormater';
import CustomizableTable from 'src/components/customizabaleTable';
import { DashboardCard } from 'src/components/dashboard-card/dashboard-card';
import { Box, Card, Grid, Stack, Alert, Button, Avatar, Skeleton, CardHeader } from '@mui/material';
import {
  useGetEmployeeSalarySlipQuery,
  useLazyGetEmployeeSalarySlipPdfQuery,
} from 'src/redux/runPayroll/runPayrollApi';

import { toSalarySlipMonthYear } from './payroll-summary-utils';

const enterCurve = [0.22, 1, 0.36, 1] as const;

const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

const slideUpItem = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.28, ease: enterCurve } },
};

const PayrollSummary = ({ employee }: any) => {
  const [monthYear, setMonthYear] = useState<null | Dayjs>(dayjs());
  const employeeId = employee?.id;
  const salarySlipMonth = toSalarySlipMonthYear(monthYear);

  const {
    data: salarySlip,
    isFetching,
    isError,
  } = useGetEmployeeSalarySlipQuery(
    { employeeId, monthYear: salarySlipMonth },
    { skip: !employeeId || !salarySlipMonth }
  );
  const [getSalarySlipPdf, { isFetching: isDownloading }] = useLazyGetEmployeeSalarySlipPdfQuery();

  const hasSalarySlip = !!salarySlip;
  const earnings = salarySlip?.earnings || [];
  const deductions = salarySlip?.deductions || [];

  const handleDownload = async () => {
    if (!employeeId || !salarySlipMonth || !hasSalarySlip || isDownloading) return;

    const blob = await getSalarySlipPdf({ employeeId, monthYear: salarySlipMonth }).unwrap();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const employeeName = (
      employee?.fullName ||
      employee?.name ||
      salarySlip?.employeeName ||
      'Employee'
    )
      .trim()
      .replace(/[<>:"/\\|?*]/g, '-')
      .replace(/\s+/g, '-');
    link.href = url;
    link.download = `Payslip_${employeeName}_${monthYear?.format('MMM-YYYY') || 'unknown'}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 280px)' }}>
      <Scrollbar sx={{ flexGrow: 1, height: '100%' }}>
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          style={{ display: 'flex', flexDirection: 'column' }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 1 }}>
            <motion.div variants={slideUpItem}>
              <Card sx={{ display: 'flex', flexDirection: 'column', gap: 2, p: 1 }}>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  alignItems="center"
                  justifyContent="space-between"
                  spacing={1}
                >
                  <DatePicker
                    value={monthYear}
                    onChange={(val) => setMonthYear(val)}
                    views={['month', 'year']}
                    label="Select Year Month"
                    format="MMMM-YYYY"
                    sx={{ maxWidth: { xs: '100%', md: 240 }, mt: 1 }}
                    slotProps={{ textField: { size: 'small' } }}
                  />

                  <Stack direction="row" flexWrap="wrap" spacing={1} alignItems="center">
                    <Button
                      size="small"
                      startIcon={<Iconify icon="solar:eye-linear" />}
                      variant="outlined"
                      color="inherit"
                      disabled={!hasSalarySlip}
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="solar:download-linear" />}
                      variant="outlined"
                      color="inherit"
                      disabled={!hasSalarySlip || isDownloading}
                      onClick={handleDownload}
                    >
                      {isDownloading ? 'Downloading...' : 'Download'}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="solar:printer-linear" />}
                      variant="outlined"
                      color="inherit"
                      disabled
                    >
                      Print
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="solar:plain-linear" />}
                      variant="outlined"
                      color="inherit"
                      disabled
                    >
                      Email
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </motion.div>

            {isFetching ? (
              <PayrollSummarySkeleton />
            ) : isError ? (
              <Alert severity="info">
                No finalized salary slip found for this staff member and month.
              </Alert>
            ) : hasSalarySlip ? (
              <>
                <Grid container spacing={1}>
                  <Grid size={{ xs: 12, md: 4 }}>
                    <motion.div variants={slideUpItem}>
                      <DashboardCard
                        title="Total Salary"
                        value={formatCurrency(salarySlip.totalEarning || 0)}
                        icon="solar:wallet-bold-duotone"
                        color="success.dark"
                        bgColor="success.lighter"
                      />
                    </motion.div>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <motion.div variants={slideUpItem}>
                      <DashboardCard
                        title="Total Deduction"
                        value={formatCurrency(salarySlip.totalDeduction || 0)}
                        icon="solar:bill-list-bold-duotone"
                        color="error.dark"
                        bgColor="error.lighter"
                      />
                    </motion.div>
                  </Grid>

                  <Grid size={{ xs: 12, md: 4 }}>
                    <motion.div variants={slideUpItem}>
                      <DashboardCard
                        title="Net Payable"
                        value={formatCurrency(salarySlip.netSalary ?? salarySlip.netPay ?? 0)}
                        icon="solar:card-send-bold-duotone"
                        color="info.dark"
                        bgColor="info.lighter"
                      />
                    </motion.div>
                  </Grid>
                </Grid>

                <Grid container spacing={1} alignItems="stretch">
                  <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <PayrollLineTable
                      title="Earnings"
                      subheader="Breakdown of earnings"
                      icon="solar:hand-money-linear"
                      iconColor={{ bgcolor: 'success.lighter', color: 'success.main' }}
                      nameColumnLabel="Earning Type"
                      tableId="earning-section"
                      noDataText="No Data Found For Earning Section"
                      data={earnings}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                    <PayrollLineTable
                      title="Deductions"
                      subheader="Breakdown of deductions"
                      icon="solar:minus-circle-linear"
                      iconColor={{ bgcolor: 'error.lighter', color: 'error.main' }}
                      nameColumnLabel="Deduction Type"
                      tableId="deduction-section"
                      noDataText="No Data Found For Deduction"
                      data={deductions}
                    />
                  </Grid>
                </Grid>
              </>
            ) : (
              <Alert severity="info">Select a month to view finalized payroll summary.</Alert>
            )}
          </Box>
        </motion.div>
      </Scrollbar>
    </Box>
  );
};

const PayrollSummarySkeleton = () => (
  <>
    <Grid container spacing={1}>
      {[1, 2, 3].map((item) => (
        <Grid size={{ xs: 12, md: 4 }} key={item}>
          <Card sx={{ p: 1 }}>
            <Skeleton variant="text" width="45%" height={24} />
            <Skeleton variant="text" width="65%" height={42} />
          </Card>
        </Grid>
      ))}
    </Grid>
    <Grid container spacing={1}>
      {[1, 2].map((item) => (
        <Grid size={{ xs: 12, md: 6 }} key={item}>
          <Card sx={{ p: 2 }}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="rounded" width="100%" height={180} />
          </Card>
        </Grid>
      ))}
    </Grid>
  </>
);

const PayrollLineTable = ({
  title,
  subheader,
  icon,
  iconColor,
  nameColumnLabel,
  tableId,
  noDataText,
  data,
}: any) => (
  <motion.div variants={slideUpItem} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
    <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <CardHeader
        title={title}
        subheader={subheader}
        avatar={
          <Avatar sx={{ ...iconColor, width: 32, height: 32 }}>
            <Iconify icon={icon} width={20} />
          </Avatar>
        }
        sx={{ p: 2 }}
      />
      <CustomizableTable
        variant="embedded"
        showColumns
        showExport
        showFullScreen
        exportScope="all"
        noDataText={noDataText}
        tableId={tableId}
        tableTitle="Salary components"
        isFilter={false}
        isSearch={false}
        columns={[
          { id: 'name', label: nameColumnLabel },
          {
            id: 'amount',
            label: 'Amount',
            filterType: 'number',
            render(value) {
              return formatCurrency(value || 0);
            },
          },
        ]}
        data={data}
        wrapperProps={{ sx: { flex: 1, '& .MuiTable-root': { minWidth: 'auto' } } }}
      />
    </Card>
  </motion.div>
);

export default PayrollSummary;
