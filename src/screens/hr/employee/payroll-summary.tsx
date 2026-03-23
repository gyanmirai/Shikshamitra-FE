'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { formatCurrency } from 'src/utils/cureencyFormater';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Grid, Card, Stack, Avatar, CardHeader } from '@mui/material';
import { DashboardCard } from 'src/components/dashboard-card/dashboard-card';

const PayrollSummary = ({ employee }: any) => {
  const [monthYear, setMonthYear] = useState<null | Dayjs>(dayjs());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, pb: 1 }}>
      {/* Header & Actions */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
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
      </Stack>

      {/* Summary Stats */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardCard
            title="Total Salary"
            value={formatCurrency(40000)}
            icon="solar:wallet-linear"
            color="success.dark"
            bgColor="success.lighter"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardCard
            title="Total Deduction"
            value={formatCurrency(10000)}
            icon="solar:bill-list-linear"
            color="error.dark"
            bgColor="error.lighter"
          />
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <DashboardCard
            title="Net Payable"
            value={formatCurrency(30000)}
            icon="solar:card-send-linear"
            color="info.dark"
            bgColor="info.lighter"
          />
        </Grid>
      </Grid>

      {/* Tables Section */}
      <Grid container spacing={1}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
            <CardHeader
              title="Earnings"
              subheader="Breakdown of earnings"
              avatar={
                <Avatar
                  sx={{ bgcolor: 'success.lighter', color: 'success.main', width: 32, height: 32 }}
                >
                  <Iconify icon="solar:hand-money-linear" width={20} />
                </Avatar>
              }
              sx={{ p: 1 }}
            />

            <CustomizableTable
              noDataText="No Data Found For Earning Section"
              tableId="earning-section"
              isFilter={false}
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
                sx: { '& .MuiTable-root': { minWidth: 'auto' } },
              }}
            />
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined">
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
              sx={{ p: 1 }}
            />
            <CustomizableTable
              noDataText="No Data Found For Deduction"
              tableId="deduction-section"
              isFilter={false}
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
        </Grid>
      </Grid>
    </Box>
  );
};

export default PayrollSummary;
