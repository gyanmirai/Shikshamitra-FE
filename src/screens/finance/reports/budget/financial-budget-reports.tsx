import React from 'react';

import { Label } from '@mui/icons-material';
import { Box, Card, Grid, Button, Typography, useTheme, Tooltip, Chip } from '@mui/material';

import { PerformanceOverTime } from 'src/screens/academic/gradebook-performance-tracking/progress-report';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';

import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';
import { EcommerceWidgetSummary } from 'src/sections/overview/e-commerce/ecommerce-widget-summary';
import CustomizableTable from 'src/components/customizabaleTable';

const pendingData = [

    {
        budgetName: "Sports",
        budgetAllocated: "200",
        budgetSpent:"300",
        remainingFund: "-100",
        overSpendingAlert: "red"
    },
    {
        budgetName: "Sports",
        budgetAllocated: "200",
        budgetSpent:"150",
        remainingFund: "50",
        overSpendingAlert: "yellow"
    },

    {
        budgetName: "Sports",
        budgetAllocated: "200",
        budgetSpent:"100",
        remainingFund: "100",
        overSpendingAlert: "green"
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
        render(value:any,) {
       
          let color;
          if (value === 'red') {
            color = 'red'; 
          } else if (value === 'yellow') {
            color = 'yellow'; 
          } else {
            color = 'green'; 
          }
      
         
          return (
            <div style={{ display: 'flex',}}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: color,
             
              justifyContent:'center',
              alignItems:'center',

             
            }} />
            </div>
          );
        }
      }
      
];
const FinancialBudgetReports = () => {
    const data = [];
  return (
    <>
    <CustomSelect
        label="Date Range"
        options={[]}
        onChange={() => { }}
        value=""
        formControlProps={{
          sx: { width: '100%', maxWidth: '200px' },
        }}
      />
     
       
      
      <Grid item xs={12}>
          <Card sx={{ height: '100%', p: 2, boxShadow: 'var(--shadows-2)' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1">Spending vs. Allocation over time</Typography>
            </Box>
            <Box pt="15px" display="flex" flexDirection="row" gap={1}>
                <CustomSelect
                    label="Organizer"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
               
                <CustomSelect
                    label="Year"
                    options={[]}
                    value=""
                    onChange={() => { }}
                    formControlProps={{ sx: { minWidth: 120 } }}
                />
            </Box>
            <PerformanceOverTime
              id="demo__4"
              chart={{
                categories: [
                  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
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
        <Typography sx={{pt:"15px", pb:"15px"}} variant="subtitle1">Budget Overview</Typography>

        <CustomizableTable columns={pendigDatacolumns} data={pendingData} />

<Box py="15px" gap={3} display="flex" justifyContent="flex-end">
    <Button variant="contained" size="small">
        Export to PDF
    </Button>
    <Button variant="contained" size="small">
        Export to Excel
    </Button>
</Box>
    </>
  )
}

export default FinancialBudgetReports