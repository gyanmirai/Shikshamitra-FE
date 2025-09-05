import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { exportGraphData } from 'src/utils/exportGraph';
import CustomSelect from 'src/components/custom-select';
import CustomizableTable from 'src/components/customizabaleTable';
import { Box, Card, Grid, Menu, Button, MenuItem, Typography } from '@mui/material';
import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

const budgetOverviewData = [
  {
    budgetName: 'Sports',
    budgetAllocated: '500',
    budgetSpent: '600',
    remainingFund: '-100',
    overSpendingAlert: 'red',
  },
  {
    budgetName: 'Library',
    budgetAllocated: '300',
    budgetSpent: '200',
    remainingFund: '100',
    overSpendingAlert: 'green',
  },
  {
    budgetName: 'Arts and Crafts',
    budgetAllocated: '250',
    budgetSpent: '250',
    remainingFund: '0',
    overSpendingAlert: 'yellow',
  },
  {
    budgetName: 'Technology',
    budgetAllocated: '800',
    budgetSpent: '900',
    remainingFund: '-100',
    overSpendingAlert: 'red',
  },
  {
    budgetName: 'Transportation',
    budgetAllocated: '400',
    budgetSpent: '350',
    remainingFund: '50',
    overSpendingAlert: 'green',
  },
];

const pendigDatacolumns: any = [
  { id: 'budgetName', label: 'Budget Name' },
  { id: 'budgetAllocated', label: 'Budget Allocated' },
  { id: 'budgetSpent', label: 'Budget Spent' },
  { id: 'remainingFund', label: 'Remaining Fund' },
  {
    id: 'overSpendingAlert',
    label: 'Over Spending Alert',
    render(value: any) {
      let color;
      if (value === 'red') {
        color = 'red';
      } else if (value === 'yellow') {
        color = 'yellow';
      } else {
        color = 'green';
      }

      return (
        <div style={{ display: 'flex' }}>
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: color,

              justifyContent: 'center',
              alignItems: 'center',
            }}
          />
        </div>
      );
    },
  },
];
const FinancialBudgetReports = () => {
  const [anchorElTrend, setAnchorElTrend] = useState<null | HTMLElement>(null);

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
      name: 'Budget Allocation',
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
    },
    {
      name: 'Spending',
      data: [49, 51, 35, 10, 41, 35, 51, 49, 62, 69, 91, 148],
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
  return (
    <>
      <CustomSelect
        label="Date Range"
        options={[]}
        onChange={() => {}}
        value=""
        formControlProps={{
          sx: { width: '100%', maxWidth: '200px' },
        }}
      />

      <Grid container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Spending vs. Allocation over time</Typography>
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

            <Box pt="15px" display="flex" flexDirection="row" gap={1}>
              <CustomSelect
                label="Organization"
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
                    name: 'Budget Allocation',
                    data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                  },
                  {
                    name: 'Spending',
                    data: [49, 51, 35, 10, 41, 35, 51, 49, 62, 69, 91, 148],
                  },
                ],
                options: {
                  legend: {
                    show: true,
                    position: 'top',
                  },
                },
              }}
              sx={{ height: '100%', boxShadow: 'none' }}
            />
          </Card>
        </Grid>
      </Grid>

      <Typography sx={{ pt: '15px', pb: '15px' }} variant="subtitle1">
        Budget Overview
      </Typography>

      <CustomizableTable
        columns={pendigDatacolumns}
        data={budgetOverviewData}
        tableId="budget-overview-table"
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

export default FinancialBudgetReports;
