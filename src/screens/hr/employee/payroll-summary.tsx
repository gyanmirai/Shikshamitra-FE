'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { formatCurrency } from 'src/utils/cureencyFormater';
import CustomizableTable from 'src/components/customizabaleTable';
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

const PayrollSummary = ({ employee }: any) => {
  const [monthYear, setMonthYear] = useState<null | Dayjs>(dayjs());

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header & Actions */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <DatePicker
          value={monthYear}
          onChange={(val) => setMonthYear(val)}
          views={['month', 'year']}
          label="Select Year Month"
          format="MMMM-YYYY"
          sx={{ maxWidth: { xs: '100%', md: 240 } }}
          slotProps={{ textField: { size: 'small' } }}
        />

        <Stack direction="row" flexWrap="wrap" spacing={1}>
          <Button
            size="small"
            startIcon={<Iconify icon="ion:email" />}
            variant="outlined"
            color="inherit"
          >
            Preview
          </Button>
          <Button
            size="small"
            startIcon={<Iconify icon="ion:download" />}
            variant="outlined"
            color="inherit"
          >
            Download
          </Button>
          <Button
            size="small"
            startIcon={<Iconify icon="ion:print" />}
            variant="outlined"
            color="inherit"
          >
            Print
          </Button>
          <Button
            size="small"
            startIcon={<Iconify icon="ion:paper-airplane" />}
            variant="contained"
            color="primary"
          >
            Email
          </Button>
        </Stack>
      </Stack>

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
              <Typography variant="h4">{formatCurrency(40000)}</Typography>
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
              <Typography variant="h4">{formatCurrency(10000)}</Typography>
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
              <Typography variant="h4">{formatCurrency(30000)}</Typography>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Tables Section */}
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
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
            />
            <Divider />
            <CustomizableTable
              noDataText="No Data Found For Earning Section"
              tableId="earning-section"
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
            <CustomizableTable
              noDataText="No Data Found For Deduction"
              tableId="deduction-section"
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

      {/* Net Salary Footer */}
      <Card
        sx={{
          p: 3,
          bgcolor: 'primary.darker',
          color: 'common.white',
          backgroundImage: (theme) =>
            theme.palette.mode === 'dark'
              ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.darker} 100%)`
              : `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        }}
      >
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems="center"
          spacing={2}
        >
          <Box>
            <Typography variant="h6" sx={{ opacity: 0.72 }}>
              Net Salary Payable
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.72 }}>
              Calculated after all earnings and deductions for the selected month.
            </Typography>
          </Box>
          <Typography variant="h3">{formatCurrency(24000)}</Typography>
        </Stack>
      </Card>
    </Box>
  );
};

export default PayrollSummary;
