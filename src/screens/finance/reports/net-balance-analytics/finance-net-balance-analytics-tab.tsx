// eslint-disable-next-line import/no-extraneous-dependencies
import React, { useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { exportGraphData } from 'src/utils/exportGraph';
import CustomSelect from 'src/components/custom-select';
import { Box, Card, Grid, Chip, Menu, Button, Tooltip, MenuItem, Typography } from '@mui/material';
import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

const FinanceNetbalanceAnalyticsTab = () => {
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
      name: 'Income',
      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
    },
    {
      name: 'Expense',
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
      <Box pt="20px" pb="20px" display="flex" flexDirection="column">
        <Typography variant="subtitle1">Total Net Balance</Typography>
        <Typography variant="h5">$36,963</Typography>
      </Box>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              width: 1,
              display: 'flex',
              gap: { xs: 1, md: 2.5 },
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-start' },
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
              p: 2,
              position: 'relative',
            }}
          >
            <Chip
              label="10%"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'orange',
                color: 'white',
                fontWeight: 'bold',
                zIndex: 1,
              }}
            />
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: '50%',
                alignItems: 'center',
                color: 'primary.lighter',
                justifyContent: 'center',
                bgcolor: 'primary.darker',
                display: { xs: 'none', md: 'inline-flex' },
              }}
            >
              <Iconify width={24} icon="eva:diagonal-arrow-left-down-fill" />
            </Box>

            <div>
              <Box
                sx={{
                  mb: 1,
                  gap: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  typography: 'subtitle2',
                }}
              >
                <Typography variant="subtitle1">Income</Typography>
                <Tooltip title="Income" placement="top">
                  <Iconify width={16} icon="eva:info-outline" sx={{ color: 'text.disabled' }} />
                </Tooltip>
              </Box>

              <Box sx={{ typography: 'h4' }}>3998</Box>
            </div>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Box
            sx={{
              width: 1,
              display: 'flex',
              gap: { xs: 1, md: 2.5 },
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: { xs: 'center', md: 'flex-start' },
              bgcolor: 'background.paper',
              borderRadius: 2,
              boxShadow: 1,
              p: 2,
              position: 'relative',
            }}
          >
            <Chip
              label="10%"
              size="small"
              sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                bgcolor: 'orange',
                color: 'white',
                fontWeight: 'bold',
                zIndex: 1,
              }}
            />
            <Box
              sx={{
                width: 48,
                height: 48,
                flexShrink: 0,
                borderRadius: '50%',
                alignItems: 'center',
                color: 'primary.lighter',
                justifyContent: 'center',
                bgcolor: 'rgba(255, 165, 0, 0.2)',
                display: { xs: 'none', md: 'inline-flex' },
              }}
            >
              <Iconify
                width={24}
                icon="eva:diagonal-arrow-right-up-fill"
                sx={{ color: 'orange' }}
              />
            </Box>

            <div>
              <Box
                sx={{
                  mb: 1,
                  gap: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  typography: 'subtitle2',
                }}
              >
                <Typography variant="subtitle1">Expense</Typography>
                <Tooltip title="Expense" placement="top">
                  <Iconify width={16} icon="eva:info-outline" sx={{ color: 'text.disabled' }} />
                </Tooltip>
              </Box>

              <Box sx={{ typography: 'h4' }}>3998</Box>
            </div>
          </Box>
        </Grid>
      </Grid>

      <Box pb="20px" />

      <Grid container spacing={3}>
        <Grid size={{ xs: 12 }}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Income vs. Expenses Over Time</Typography>
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
                formControlProps={{ sx: { minWidth: 125 } }}
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
                    name: 'Income',
                    data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                  },
                  {
                    name: 'Expense',
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

        {/*
  <Grid size={{ xs: 12, md: 4 }}>
    <EcommerceWidgetSummary
      title="Largest Income Source"
      percent={2.6}
      total={765}
      chart={{
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
        series: [22, 8, 35, 50, 82, 84, 77, 12],
      }}
    />
  </Grid>

  <Grid size={{ xs: 12, md: 8 }}>
    <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
      <AnalyticsCurrentVisits
        title="Largest Income Source"
        chart={{
          series: [
            { label: 'Salaries', value: 3500 },
            { label: 'Maintenance', value: 2500 },
            { label: 'Utilities', value: 1500 },
          ],
        }}
        sx={{ height: '100%' }}
      />
    </Card>
  </Grid>
  */}
      </Grid>

      <Box py="15px" gap={3} display="flex" justifyContent="flex-end">
        {/* <Button onClick={exportToPDF} variant="contained" size="small">
          Export to PDF
        </Button >
        <Button onClick={exportToExcel} variant="contained" size="small">
          Export to Excel
        </Button> */}
      </Box>
    </>
  );
};

export default FinanceNetbalanceAnalyticsTab;
