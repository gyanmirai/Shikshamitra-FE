// eslint-disable-next-line import/no-extraneous-dependencies
import React, { useState } from 'react';

import Grid2 from '@mui/material/Unstable_Grid2/Grid2';
import {
  Box,
  Card,
  Grid,
  Menu,
  alpha,
  Button,
  useTheme,
  MenuItem,
  Typography,
} from '@mui/material';

import { exportGraphData } from 'src/utils/exportGraph';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';

import { AnalyticsWidgetSummary } from 'src/sections/overview/analytics/analytics-widget-summary';
import { AnalyticsWebsiteVisits } from 'src/sections/overview/analytics/analytics-website-visits';

const monthlyFeeCollectedData = [
  {
    studentName: 'JeetRam',
    class: '01',
    feeType: 'Tuition',
    amountPaid: '500',
    pendingAmount: '300',
    dueDate: '08-08-2024',
    status: 'Collected',
  },
  {
    studentName: 'Jayesh',
    class: '02',
    feeType: 'Transportation',
    amountPaid: '450',
    pendingAmount: '250',
    dueDate: '08-08-2024',
    status: 'Collected',
  },
  {
    studentName: 'Hiren',
    class: '03',
    feeType: 'Sports',
    amountPaid: '600',
    pendingAmount: '100',
    dueDate: '08-08-2024',
    status: 'Pending',
  },
  {
    studentName: 'Prena',
    class: '04',
    feeType: 'Tuition',
    amountPaid: '550',
    pendingAmount: '150',
    dueDate: '08-08-2024',
    status: 'Collected',
  },
  {
    studentName: 'Parth',
    class: '05',
    feeType: 'Transportation',
    amountPaid: '500',
    pendingAmount: '200',
    dueDate: '08-08-2024',
    status: 'Pending',
  },
  {
    studentName: 'Aditi',
    class: '01',
    feeType: 'Activity',
    amountPaid: '300',
    pendingAmount: '200',
    dueDate: '08-08-2024',
    status: 'Collected',
  },
  {
    studentName: 'Nikhil',
    class: '02',
    feeType: 'Sports',
    amountPaid: '400',
    pendingAmount: '100',
    dueDate: '08-08-2024',
    status: 'Collected',
  },
  {
    studentName: 'Riya',
    class: '03',
    feeType: 'Transportation',
    amountPaid: '550',
    pendingAmount: '50',
    dueDate: '08-08-2024',
    status: 'Collected',
  },
  {
    studentName: 'Karan',
    class: '04',
    feeType: 'Tuition',
    amountPaid: '500',
    pendingAmount: '500',
    dueDate: '08-08-2024',
    status: 'Pending',
  },
  {
    studentName: 'Sita',
    class: '05',
    feeType: 'Tuition',
    amountPaid: '650',
    pendingAmount: '0',
    dueDate: '08-08-2024',
    status: 'Collected',
  },
];

const columns: any = [
  { id: 'studentName', label: 'Student Name' },
  { id: 'class', label: 'Class' },
  { id: 'feeType', label: 'Fee Type' },
  { id: 'amountPaid', label: 'Amount Paid' },
  { id: 'pendingAmount', label: 'Pending Amount' },
  { id: 'dueDate', label: 'Due Date' },
  { id: 'status', label: 'Status' },
];

const FinanceFeeReportsScreen = () => {
  const theme = useTheme();
  const [anchorElTrend, setAnchorElTrend] = useState<null | HTMLElement>(null);
  const [anchorElBar, setAnchorElBar] = useState<null | HTMLElement>(null);

  const categoriesTrend = [
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
  const seriesForTrend = [
    {
      name: 'Fee Collection Progress',
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
    },
  ];

  const exportTrend = exportGraphData(
    categoriesTrend,
    seriesForTrend,
    'Income_vs_ExpensesOverTime'
  );

  const handleExportTrendExcel = () => {
    exportTrend.excelExport();
  };

  const handleExportTrendPDF = () => {
    exportTrend.pdfExport();
  };

  const handleMenuOpenTrend = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElTrend(event.currentTarget);
  };

  const handleMenuCloseTrend = () => {
    setAnchorElTrend(null);
  };

  const handelSave = () => {};

  const categories1 = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
  const series1 = [
    { name: 'Class 2', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
    { name: 'Class 3', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
  ];

  // Create export functions for each dataset
  const exportBar = exportGraphData(categories1, series1, 'class_data');

  const handleExportBarExcel = () => {
    exportBar.excelExport();
  };

  const handleExportBarPDF = () => {
    exportBar.pdfExport();
  };

  const handleMenuOpenBar = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElBar(event.currentTarget);
  };

  const handleMenuCloseBar = () => {
    setAnchorElBar(null);
  };

  // // Export functions to be called on button clicks
  // const handleExportClassData = () => {
  //     exportClassData.excelExport();
  // };

  // const handleExportClassDataPDF = () => {
  //     exportClassData.pdfExport();
  // };

  // const handleExportPerformanceData = () => {
  //     exportPerformanceData.excelExport()
  // };

  // const handleExportPerformanceDataPDF = () => {
  //     exportPerformanceData.pdfExport();
  // };

  return (
    <>
      <Grid2 container spacing={3} py="14px">
        <Grid2 xs={12} md={6} lg={4}>
          <AnalyticsWidgetSummary
            title="Total Fees Collected"
            percent={2.6}
            total={714000}
            icon={<Iconify icon="solar:money" sx={{ height: '16px', width: '16px' }} />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [22, 8, 35, 50, 82, 84, 77, 12],
            }}
          />
        </Grid2>
        <Grid2 xs={12} md={6} lg={4}>
          <AnalyticsWidgetSummary
            title="Total Fees Pending"
            percent={2.8}
            total={1723315}
            color="warning"
            icon={<Iconify icon="solar:money" sx={{ height: '16px', width: '16px' }} />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid2>
        <Grid2 xs={12} md={6} lg={4}>
          <AnalyticsWidgetSummary
            title="Total Fees Due"
            percent={3.6}
            total={234}
            color="error"
            icon={<Iconify icon="solar:money" sx={{ height: '16px', width: '16px' }} />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid2>
      </Grid2>

      <Grid container spacing={3}>
        <Grid item xl={12} xs={12}>
          <Card sx={{ px: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ pt: '15px', pb: '15px', pl: '15px' }} variant="subtitle1">
                Fee Collection Progress Over Time
              </Typography>
              <Button onClick={handleMenuOpenTrend} size="small">
                <Iconify icon="solar:download-bold" sx={{ height: '16px', width: '16px' }} />
              </Button>
              <Menu
                anchorEl={anchorElTrend}
                open={Boolean(anchorElTrend)}
                onClose={handleMenuCloseTrend}
              >
                <MenuItem onClick={handleExportTrendPDF}>Export to PDF</MenuItem>
                <MenuItem onClick={handleExportTrendExcel}>Export to Excel</MenuItem>
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
              <Box pr="15px" />
              <CustomSelect
                label="Grade/Class"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
              <Box pr="15px" />
              <CustomSelect
                label="Fee Type"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>
            {/* <Box py="15px" gap={3} display="flex" justifyContent="flex-end">
                <Button onClick={handleExportPerformanceDataPDF} variant="contained" size="small">
                    Export to PDF
                </Button>
                <Button onClick={handleExportPerformanceData} variant="contained" size="small">
                    Export to Excel
                </Button>
            </Box> */}

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
                        name: 'Fee Collection Progress ',
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

        <Grid item lg={12} xs={12}>
          <Card sx={{ px: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography sx={{ pt: '15px', pb: '15px', pl: '15px' }} variant="subtitle1">
                Fee collections across different classes
              </Typography>
              <Button onClick={handleMenuOpenBar} size="small">
                <Iconify icon="solar:download-bold" sx={{ height: '16px', width: '16px' }} />
              </Button>
              <Menu anchorEl={anchorElBar} open={Boolean(anchorElBar)} onClose={handleMenuCloseBar}>
                <MenuItem onClick={handleExportBarPDF}>Export to PDF</MenuItem>
                <MenuItem onClick={handleExportBarExcel}>Export to Excel</MenuItem>
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
              <Box pr="15px" />
              <CustomSelect
                label="Grade/Class"
                options={[]}
                value=""
                onChange={() => {}}
                formControlProps={{ sx: { minWidth: 120 } }}
              />
            </Box>
            {/* <Box py="15px" gap={3} display="flex" justifyContent="flex-end">
                            <Button onClick={handleExportClassDataPDF} variant="contained" size="small">
                                Export to PDF
                            </Button>
                            <Button onClick={handleExportClassData} variant="contained" size="small">
                                Export to Excel
                            </Button>
                        </Box> */}

            <Grid container spacing={3} py="14px">
              <Grid item xs={12}>
                <AnalyticsWebsiteVisits
                  // title="Fee Collections Across Different Classes Or Fee Types"
                  chart={{
                    categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                    series: [
                      { name: 'Class 2', data: [43, 33, 22, 37, 67, 68, 37, 24, 55] },
                      { name: 'Class 3', data: [51, 70, 47, 67, 40, 37, 24, 70, 24] },
                    ],
                    colors: [
                      alpha(theme.palette.primary.dark, 0.8),
                      alpha(theme.palette.warning.main, 0.8),
                    ],
                  }}
                  sx={{ height: '100%' }}
                />
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ pt: '15px', pb: '15px' }}>
        Generate Custom Reports
      </Typography>

      <CustomizableTable
        columns={columns}
        data={monthlyFeeCollectedData}
        tableId="monthly-fee-collected"
      />
    </>
  );
};

export default FinanceFeeReportsScreen;
