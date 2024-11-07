// src/Dashboard.js
import React from 'react';

import { Box, Grid, Paper, Divider, Typography } from '@mui/material';
import { red, blue, green, orange, purple } from '@mui/material/colors';
import {
  Error,
  People,
  Insights,
  Equalizer,
  TrendingUp,
  AccessTime,
  AttachMoney,
  VerifiedUser,
  EventAvailable,
  AccountBalanceWallet,
} from '@mui/icons-material';

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  color: Record<number, string>;
  data: string[];
}

const DashboardCard = ({ title, icon, color, data }: DashboardCardProps) => (
  <Paper
    elevation={4}
    style={{
      padding: 20,
      borderRadius: 12,
      display: 'flex',
      flexDirection: 'column',
      // alignItems: 'center',
      // justifyContent: 'center',
      backgroundColor: color[50],
      color: color[700],
      height: '100%',
    }}
  >
    <Box display="flex" alignItems="center" marginBottom={1}>
      {icon}
      <Typography variant="h6" style={{ marginLeft: 8, fontWeight: 600 }}>
        {title}
      </Typography>
    </Box>
    <Divider style={{ width: '100%', marginBottom: 12 }} />
    {data.map((item, index) => (
      <Typography key={index} style={{ fontWeight: 500, textAlign: 'left' }}>
        {item}
      </Typography>
    ))}
  </Paper>
);

const Dashboard = () => (
  <Grid container spacing={3} padding={3} style={{ minHeight: '100vh' }}>
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardCard
          title="Payroll Summary"
          icon={<AccountBalanceWallet fontSize="large" style={{ color: green[700] }} />}
          color={green}
          data={[
            'Total Payroll Cost: $200,000',
            'Total Employees Paid: 50',
            'Overtime Costs: $5,000',
            'Bonuses/Allowances: $3,000',
          ]}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardCard
          title="Payroll Breakdown by Department"
          icon={<People fontSize="large" style={{ color: blue[700] }} />}
          color={blue}
          data={['Engineering: $80,000', 'Marketing: $50,000', 'Sales: $70,000']}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardCard
          title="Salary Distribution"
          icon={<TrendingUp fontSize="large" style={{ color: orange[700] }} />}
          color={orange}
          data={['Average Salary: $60,000', 'Top 10% Earners: $100,000+', 'Median Salary: $55,000']}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardCard
          title="Deductions and Benefits"
          icon={<AttachMoney fontSize="large" style={{ color: red[700] }} />}
          color={red}
          data={['Taxes Deducted: $20,000', 'Other Deductions: $5,000', 'Benefits Costs: $10,000']}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardCard
          title="Overtime and Additional Hours"
          icon={<AccessTime fontSize="large" style={{ color: purple[700] }} />}
          color={purple}
          data={['Total Overtime Hours: 200 hrs', 'Overtime Cost: $5,000']}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardCard
          title="Attendance Insights"
          icon={<Insights fontSize="large" style={{ color: blue[800] }} />}
          color={blue}
          data={['Average Working Hours: 160 hrs', 'Absenteeism Rate: 5%']}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardCard
          title="Payroll Trends"
          icon={<Equalizer fontSize="large" style={{ color: green[700] }} />}
          color={green}
          data={['Past 3 Months Comparison']}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardCard
          title="Retention Insights"
          icon={<EventAvailable fontSize="large" style={{ color: orange[700] }} />}
          color={orange}
          data={['New Hires: 5', 'Attrition Rate: 3%']}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardCard
          title="Compliance and Error Tracking"
          icon={<Error fontSize="large" style={{ color: red[700] }} />}
          color={red}
          data={['Payroll Errors: 2', 'Adjustments Made: 1']}
        />
      </Grid>
      <Grid item xs={12} sm={6} md={4}>
        <DashboardCard
          title="KPIs and Metrics"
          icon={<VerifiedUser fontSize="large" style={{ color: purple[700] }} />}
          color={purple}
          data={['Payroll as % of Revenue: 30%', 'Cost per Employee: $4,000']}
        />
      </Grid>
    </Grid>
  </Grid>
);

export default Dashboard;
