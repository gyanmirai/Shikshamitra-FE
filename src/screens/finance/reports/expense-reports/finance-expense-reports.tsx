import React, { useState } from 'react';

import { Box, Grid, Card, Menu, Button, useTheme, MenuItem, Typography } from '@mui/material';

import { exportGraphData } from 'src/utils/exportGraph';
import { exportCurrentVisitsData } from 'src/utils/exportDiffGraph';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const FinanceExpenseReports = () => {
  const theme = useTheme();
  const [anchorElTrend, setAnchorElTrend] = useState<null | HTMLElement>(null);
  const [anchorElCategory, setAnchorElCategory] = useState<null | HTMLElement>(null);

  const expenseData = [
    {
      dateOfExpense: '01-09-2024',
      expenseCategory: 'Utilities',
      description: 'Electricity Bill',
      amountSpent: '1500',
      pendingAmount: '300',
      paymentDueDate: '05-09-2024',
      status: 'Pending',
    },
    {
      dateOfExpense: '05-09-2024',
      expenseCategory: 'Salaries',
      description: 'Teacher Salaries',
      amountSpent: '25000',
      pendingAmount: '0',
      paymentDueDate: '01-09-2024',
      status: 'Collected',
    },
    {
      dateOfExpense: '10-09-2024',
      expenseCategory: 'Maintenance',
      description: 'School Repairs',
      amountSpent: '800',
      pendingAmount: '200',
      paymentDueDate: '15-09-2024',
      status: 'Pending',
    },
    {
      dateOfExpense: '12-09-2024',
      expenseCategory: 'Supplies',
      description: 'Stationery Purchase',
      amountSpent: '1200',
      pendingAmount: '0',
      paymentDueDate: '12-09-2024',
      status: 'Collected',
    },
    {
      dateOfExpense: '20-09-2024',
      expenseCategory: 'Miscellaneous',
      description: 'Field Trip Expenses',
      amountSpent: '5000',
      pendingAmount: '500',
      paymentDueDate: '25-09-2024',
      status: 'Pending',
    },
  ];

  const columns: any = [
    { id: 'dateOfExpense', label: 'Date Of Expense' },
    { id: 'expenseCategory', label: 'Expense Category' },
    { id: 'description', label: 'Description' },
    { id: 'amountSpent', label: 'Amount Spent' },
    { id: 'pendingAmount', label: 'Pending Amount' },
    { id: 'paymentDueDate', label: 'Payment Due Date' },
    { id: 'status', label: 'Status' },
  ];
  const pendingData = [
    {
      expenseCategory: 'Utilities',
      pendingAmount: '1500',
      paymentDueDate: '05-09-2024',
      daysOverDue: 15,
    },
    {
      expenseCategory: 'Maintenance',
      pendingAmount: '800',
      paymentDueDate: '10-09-2024',
      daysOverDue: 10,
    },
    {
      expenseCategory: 'Salaries',
      pendingAmount: '25000',
      paymentDueDate: '01-09-2024',
      daysOverDue: 30,
    },
    {
      expenseCategory: 'Supplies',
      pendingAmount: '1200',
      paymentDueDate: '12-09-2024',
      daysOverDue: 2,
    },
    {
      expenseCategory: 'Miscellaneous',
      pendingAmount: '5000',
      paymentDueDate: '25-09-2024',
      daysOverDue: 5,
    },
  ];

  const pendigDatacolumns: any = [
    { id: 'expenseCategory', label: 'Expense Category' },
    { id: 'pendingAmount', label: 'Pending Amount' },
    { id: 'paymentDueDate', label: 'Payment Due Date' },
    { id: 'daysOverDue', label: 'Days Over Due' },
  ];

  const categoriesForIncomeTrend = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const seriesForIncomeTrend = [
    {
      name: 'Income',
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
    },
  ];

  const exportIncomeTrend = exportGraphData(
    categoriesForIncomeTrend,
    seriesForIncomeTrend,
    'Income_Trend'
  );

  const handleExportExpenseTrendExcel = () => {
    exportIncomeTrend.excelExport();
  };

  const handleExportExpenseTrendPDF = () => {
    exportIncomeTrend.pdfExport();
  };

  const datax = [
    { label: 'Fee', value: 3500 },
    { label: 'Donation', value: 2500 },
  ];

  const exportIncomeCategory = exportCurrentVisitsData(datax, 'category_data');

  const handleExportExpenseCategoryExcel = () => {
    exportIncomeCategory.excelExport();
    handleMenuCloseCategory();
  };

  const handleExportExpenseCategoryPDF = () => {
    exportIncomeCategory.pdfExport();
    handleMenuCloseCategory();
  };

  const handleMenuOpenTrend = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElTrend(event.currentTarget);
  };

  const handleMenuCloseTrend = () => {
    setAnchorElTrend(null);
  };

  const handleMenuOpenCategory = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElCategory(event.currentTarget);
  };

  const handleMenuCloseCategory = () => {
    setAnchorElCategory(null);
  };

  return (
    <>
      <Grid container spacing={3}>
        <Grid item lg={6} xs={12}>
          <Card sx={{ px: 2 }}>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography sx={{ pt: '15px', pb: '15px', pl: '15px' }} variant="subtitle1">
                Category-Wise Distribution
              </Typography>
              <Button onClick={handleMenuOpenCategory} size="small">
                <Iconify icon="solar:download-bold" sx={{ height: '16px', width: '16px' }} />
              </Button>
              <Menu
                anchorEl={anchorElCategory}
                open={Boolean(anchorElCategory)}
                onClose={handleMenuCloseCategory}
              >
                <MenuItem onClick={handleExportExpenseCategoryPDF}>Export to PDF</MenuItem>
                <MenuItem onClick={handleExportExpenseCategoryExcel}>Export to Excel</MenuItem>
              </Menu>
            </Box>

            <Box display="flex" flexDirection="row" gap={1}>
              <CustomSelect
                label="Organization"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 125 } }}
              />

              <CustomSelect
                label="Grade/Class"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
              <CustomSelect
                label="Year"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>
            {/* <Box py="15px" gap={3} display="flex" justifyContent="flex-end">
                <Button onClick={handleExportExpenseCategoryPDF} variant="contained" size="small">
                    Export to PDF
                </Button>
                <Button onClick={handleExportExpenseCategoryExcel} variant="contained" size="small">
                    Export to Excel
                </Button>
            </Box> */}
            <Grid container spacing={3} py="14px">
              <Grid item xs={12}>
                <AnalyticsCurrentVisits
                  chart={{
                    series: [
                      { label: 'Salaries', value: 3500 },
                      { label: 'Maintenance', value: 2500 },
                      { label: 'Utilities', value: 1500 },
                    ],
                  }}
                  sx={{ height: '100%' }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>

        <Grid item lg={6} xs={12}>
          <Card sx={{ px: 2 }}>
            <Box
              display="flex"
              flexDirection="row"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography sx={{ pt: '15px', pb: '15px', pl: '15px' }} variant="subtitle1">
                Monthly/Yearly Trend
              </Typography>
              <Button onClick={handleMenuOpenTrend} size="small">
                <Iconify icon="solar:download-bold" sx={{ height: '16px', width: '16px' }} />
              </Button>
              <Menu
                anchorEl={anchorElTrend}
                open={Boolean(anchorElTrend)}
                onClose={handleMenuCloseTrend}
              >
                <MenuItem onClick={handleExportExpenseTrendPDF}>Export to PDF</MenuItem>
                <MenuItem onClick={handleExportExpenseTrendExcel}>Export to Excel</MenuItem>
              </Menu>
            </Box>

            <Box display="flex" flexDirection="row" gap={1}>
              <CustomSelect
                label="Organization"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 125 } }}
              />

              <CustomSelect
                label="Grade/Class"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 120 } }}
              />

              <CustomSelect
                label="Year"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>

            <Grid container spacing={3} py="14px">
              <Grid item xs={12}>
                <PerformanceOverTime
                  id="demo__4"
                  chart={{
                    categories: [
                      'Jan',
                      'Feb',
                      'Mar',
                      'Apr',
                      'May',
                      'Jun',
                      'Jul',
                      'Aug',
                      'Sep',
                      'Oct',
                      'Nov',
                      'Dec',
                    ],
                    series: [
                      {
                        name: '',
                        data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                      },
                    ],
                  }}
                  sx={{ height: '100%', boxShadow: 'none' }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ pt: '15px', pb: '15px' }}>
        Generate Reports
      </Typography>

      <CustomizableTable columns={columns} data={expenseData} tableId="expense-reports" />
      <Typography variant="h6" sx={{ pt: '15px', pb: '15px' }}>
        Pending Payments
      </Typography>
      <CustomizableTable
        columns={pendigDatacolumns}
        data={pendingData}
        tableId="pending-payments"
      />

      <Box py="15px" gap={3} display="flex" justifyContent="flex-end">
        {/* <Button variant="contained" size="small">
                    Export to PDF
                </Button>
                <Button variant="contained" size="small">
                    Export to Excel
                </Button> */}
      </Box>
    </>
  );
};

export default FinanceExpenseReports;
