import React, { useState } from 'react';

import { Box, Grid, Card, Menu, Button, useTheme, MenuItem, Typography } from '@mui/material';

import { exportGraphData } from 'src/utils/exportGraph';
import { exportCurrentVisitsData } from 'src/utils/exportDiffGraph';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

const FinanceIncomeReports = () => {
  const theme = useTheme();
  const [anchorElTrend, setAnchorElTrend] = useState<null | HTMLElement>(null);
  const [anchorElCategory, setAnchorElCategory] = useState<null | HTMLElement>(null);

  const incomeData = [
    {
      dateOfPayment: '15-09-2024',
      sourceOfIncome: 'Tuition Fees',
      description: 'Payment from Class 1',
      amountReceived: '2000',
      pendingAmount: '0',
      dueDate: '15-09-2024',
      status: 'Collected',
    },
    {
      dateOfPayment: '18-09-2024',
      sourceOfIncome: 'Transportation Fees',
      description: 'Monthly bus service fee',
      amountReceived: '1200',
      pendingAmount: '300',
      dueDate: '20-09-2024',
      status: 'Pending',
    },
    {
      dateOfPayment: '20-09-2024',
      sourceOfIncome: 'Activity Fees',
      description: 'Annual sports day fee',
      amountReceived: '800',
      pendingAmount: '0',
      dueDate: '20-09-2024',
      status: 'Collected',
    },
    {
      dateOfPayment: '22-09-2024',
      sourceOfIncome: 'Donations',
      description: 'Fundraising event contributions',
      amountReceived: '5000',
      pendingAmount: '0',
      dueDate: '22-09-2024',
      status: 'Collected',
    },
    {
      dateOfPayment: '25-09-2024',
      sourceOfIncome: 'Miscellaneous',
      description: 'Lost & found items sale',
      amountReceived: '300',
      pendingAmount: '0',
      dueDate: '25-09-2024',
      status: 'Collected',
    },
  ];

  const columns: any = [
    { id: 'dateOfPayment', label: 'Date Of Payment' },
    { id: 'sourceOfIncome', label: 'Source Of Income' },
    { id: 'description', label: 'Description' },
    { id: 'amountReceived', label: 'Amount Receievd' },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'status', label: 'Status' },
  ];
  const pendingData = [
    {
      source: 'Tuition Fees',
      amountDue: '1500000',
      dueDate: '15-09-2024',
      daysOverDue: 5,
    },
    {
      source: 'Transportation Fees',
      amountDue: '3000000',
      dueDate: '20-09-2024',
      daysOverDue: 0,
    },
    {
      source: 'Activity Fees',
      amountDue: '80000',
      dueDate: '20-09-2024',
      daysOverDue: 0,
    },
    {
      source: 'Library Fees',
      amountDue: '200000',
      dueDate: '01-09-2024',
      daysOverDue: 15,
    },
    {
      source: 'Sports Fees',
      amountDue: '400000',
      dueDate: '05-09-2024',
      daysOverDue: 10,
    },
  ];

  const pendigDatacolumns: any = [
    { id: 'source', label: 'Source' },
    { id: 'amountDue', label: 'Amount Due' },
    { id: 'dueDate', label: 'Due Date' },
    { id: 'daysOverDue', label: 'Days Overdue' },
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

  const handleExportIncomeTrendExcel = () => {
    exportIncomeTrend.excelExport();
  };

  const handleExportIncomeTrendPDF = () => {
    exportIncomeTrend.pdfExport();
  };

  const datax = [
    { label: 'Fee', value: 3500 },
    { label: 'Donation', value: 2500 },
  ];

  const exportIncomeCategory = exportCurrentVisitsData(datax, 'category_data');

  const handleExportIncomeCategoryExcel = () => {
    exportIncomeCategory.excelExport();
    handleMenuCloseCategory();
  };

  const handleExportIncomeCategoryPDF = () => {
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
                <MenuItem onClick={handleExportIncomeCategoryPDF}>Export to PDF</MenuItem>
                <MenuItem onClick={handleExportIncomeCategoryExcel}>Export to Excel</MenuItem>
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
                <AnalyticsCurrentVisits
                  //   title="Income Source Breakdown"
                  chart={{
                    series: [
                      { label: 'Fees', value: 3500 },
                      { label: 'Donation', value: 2500 },
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
                <MenuItem onClick={handleExportIncomeTrendPDF}>Export to PDF</MenuItem>
                <MenuItem onClick={handleExportIncomeTrendExcel}>Export to Excel</MenuItem>
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

            <Grid container spacing={3} pb="85px">
              <Grid item xs={12}>
                <PerformanceOverTime
                  id="demo__4"
                  // title="Monthly/Yearly Trend"
                  // subheader="(+43%) than last year"
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
      <Box display="flex" flexDirection="row" gap={3} justifyItems="center" alignItems="center">
        <CustomSelect
          label="Date Range"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 120 } }}
        />
        <CustomSelect
          label="Category Filter"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 140 } }}
        />

        <CustomSelect
          label="Payment Status"
          options={[]}
          value=""
          onChange={() => {}}
          formControlProps={{ sx: { minWidth: 140 } }}
        />
      </Box>

      <CustomizableTable columns={columns} data={incomeData} />

      <Typography variant="h6" sx={{ pt: '15px', pb: '15px' }}>
        Pending Income
      </Typography>
      <CustomizableTable columns={pendigDatacolumns} data={pendingData} />

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

export default FinanceIncomeReports;
