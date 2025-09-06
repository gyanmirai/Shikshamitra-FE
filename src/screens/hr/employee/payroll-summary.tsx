'use client';

import type { Dayjs } from 'dayjs';

import dayjs from 'dayjs';
import React, { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { formatCurrency } from 'src/utils/cureencyFormater';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Grid, Alert, Button, CardHeader, Typography, CardContent } from '@mui/material';

const PayrollSummary = ({ employee }: any) => {
  const [monthYear, setMonthYear] = useState<null | Dayjs>(dayjs());

  return (
    <Box>
      <Box display="flex" gap={2} flexWrap="wrap" mb={2}>
        <DatePicker
          value={monthYear}
          onChange={(val) => setMonthYear(val)}
          views={['month', 'year']}
          label="Select Year Month"
          format="MMMM-YYYY"
          sx={{ maxWidth: '250px', width: '100%' }}
          slotProps={{ textField: { size: 'small' } }}
        />
      </Box>

      <Box display="flex" gap={2} flexWrap="wrap" my={2}>
        <Card
          sx={{
            flexGrow: 1,
            // background: (theme) => varAlpha(theme.vars.palette.success.mainChannel, 0.1),
          }}
        >
          <CardHeader
            title={
              <Box display="flex" alignItems="center" gap={1}>
                <Iconify icon="pepicons-pop:dollar-circle-filled" /> Total Salary
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
            // background: (theme) => varAlpha(theme.vars.palette.error.mainChannel, 0.1),
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
            // background: (theme) => varAlpha(theme.vars.palette.info.mainChannel, 0.1),
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
        <Button startIcon={<Iconify icon="ion:email" />} variant="outlined">
          Preview Payslip
        </Button>

        <Button startIcon={<Iconify icon="ion:download" />} variant="outlined">
          Download PDF
        </Button>

        <Button startIcon={<Iconify icon="ion:print" />} variant="outlined">
          Print Payslip
        </Button>

        <Button startIcon={<Iconify icon="ion:email" />} variant="outlined">
          Email Payslip
        </Button>
      </Box>
      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h5">Earning Section</Typography>
          <CustomizableTable
            noDataText={<>No Data Found For Earning Section </>}
            tableId="earning-section"
            columns={[
              { id: 'employeeType', label: 'Employee Type' },
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
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h5">Deductions Section</Typography>
          <CustomizableTable
            noDataText={<>No Data Found For Deduction </>}
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
        </Grid>

        <Grid size={{ xs: 12 }} pb="20px">
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

export default PayrollSummary;
