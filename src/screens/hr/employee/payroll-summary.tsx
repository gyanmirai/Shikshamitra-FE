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
import { Box, Card, Grid, Stack, Button, Avatar, CardHeader } from '@mui/material';

// ── Animation variants ──────────────────────
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
            {/* Header & Actions */}
            <motion.div variants={slideUpItem}>
              <Card
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  pt: 0,
                  pb: 1,
                  pl: 1,
                  pr: 1,
                }}
              >
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
                    >
                      Preview
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="solar:download-linear" />}
                      variant="outlined"
                      color="inherit"
                    >
                      Download
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="solar:printer-linear" />}
                      variant="outlined"
                      color="inherit"
                    >
                      Print
                    </Button>
                    <Button
                      size="small"
                      startIcon={<Iconify icon="solar:plain-linear" />}
                      variant="outlined"
                      color="inherit"
                    >
                      Email
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </motion.div>

            {/* Summary Stats */}
            <Grid container spacing={1}>
              <Grid size={{ xs: 12, md: 4 }}>
                <motion.div variants={slideUpItem}>
                  <DashboardCard
                    title="Total Salary"
                    value={formatCurrency(40000)}
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
                    value={formatCurrency(10000)}
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
                    value={formatCurrency(30000)}
                    icon="solar:card-send-bold-duotone"
                    color="info.dark"
                    bgColor="info.lighter"
                  />
                </motion.div>
              </Grid>
            </Grid>

            {/* Tables Section */}
            <Grid container spacing={1} alignItems="stretch">
              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                <motion.div
                  variants={slideUpItem}
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
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
                      sx={{ p: 2 }}
                    />

                    <CustomizableTable
                      noDataText="No Data Found For Earning Section"
                      tableId="earning-section"
                      isFilter={false}
                      isSearch={false}
                      columns={[
                        { id: 'employeeType', label: 'Earning Type' },
                        {
                          id: 'amount',
                          label: 'Amount',
                          filterType: 'number',
                          render(value) {
                            return formatCurrency(value);
                          },
                        },
                        {
                          id: 'total',
                          label: 'Total',
                          filterType: 'number',
                          render(value) {
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
                      wrapperProps={{
                        sx: { flex: 1, '& .MuiTable-root': { minWidth: 'auto' } },
                      }}
                    />
                  </Card>
                </motion.div>
              </Grid>

              <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                <motion.div
                  variants={slideUpItem}
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  <Card sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    <CardHeader
                      title="Deductions"
                      subheader="Breakdown of deductions"
                      avatar={
                        <Avatar
                          sx={{
                            bgcolor: 'error.lighter',
                            color: 'error.main',
                            width: 32,
                            height: 32,
                          }}
                        >
                          <Iconify icon="solar:minus-circle-linear" width={20} />
                        </Avatar>
                      }
                      sx={{ p: 2 }}
                    />
                    <CustomizableTable
                      noDataText="No Data Found For Deduction"
                      tableId="deduction-section"
                      isSearch={false}
                      wrapperProps={{ sx: { flex: 1 } }}
                      columns={[
                        { id: 'deductionType', label: 'Deduction Type' },
                        {
                          id: 'amount',
                          label: 'Amount',
                          filterType: 'number',
                          render(value) {
                            return formatCurrency(value);
                          },
                        },
                        {
                          id: 'totalDeduction',
                          label: 'Total',
                          filterType: 'number',
                          render(value) {
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
                  </Card>
                </motion.div>
              </Grid>
            </Grid>
          </Box>
        </motion.div>
      </Scrollbar>
    </Box>
  );
};

export default PayrollSummary;
