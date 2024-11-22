// src/Dashboard.js
import React from 'react';

import { Grid } from '@mui/material';

import { formatCurrency } from 'src/utils/cureencyFormater';

import { EmployeeDashboardCard } from '../../dashboard/dashboard';

const Dashboard = () => (
  <Grid container spacing={2}>
    <Grid item xs={12} sm={6} md={4}>
      <EmployeeDashboardCard
        title="Payroll Summary"
        icon="solar:wallet-bold"
        color="primary.main"
        value={formatCurrency(200000)}
        labels={[
          // { name: `Total Payroll Cost: ${formatCurrency(200000)}`, color: 'success' },
          { name: `Total Employees Paid: ${formatCurrency(20000)}`, color: 'secondary' },
          { name: `Overtime Costs: ${formatCurrency(5000)}`, color: 'error' },
          { name: `Bonuses/Allowances: ${formatCurrency(2000)}`, color: 'warning' },
        ]}
      />
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <EmployeeDashboardCard
        title="Payroll Breakdown by Department"
        icon="tabler:credit-card-pay"
        color="secondary.main"
        value={formatCurrency(110000)}
        labels={[
          // { name: `Total Payroll Cost: ${formatCurrency(200000)}`, color: 'success' },
          { name: `Engineering: ${formatCurrency(80000)}`, color: 'secondary' },
          { name: `Marketing: ${formatCurrency(50000)}`, color: 'error' },
          { name: `Sales: ${formatCurrency(10000)}`, color: 'warning' },
        ]}
      />
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <EmployeeDashboardCard
        title="Salary Distribution"
        icon="lsicon:amount-dollar-filled"
        color="warning.main"
        value={formatCurrency(110000)}
        labels={[
          // { name: `Total Payroll Cost: ${formatCurrency(200000)}`, color: 'success' },
          { name: `Average: ${formatCurrency(60000)}`, color: 'secondary' },
          { name: `Top 10% Earners: ${formatCurrency(10000)}+`, color: 'error' },
          { name: `Median: ${formatCurrency(5500)}`, color: 'warning' },
        ]}
      />
    </Grid>
    <Grid item xs={12} sm={6} md={4}>
      <EmployeeDashboardCard
        title="Deductions and Benefits"
        icon="carbon:cut-out"
        color="error.main"
        value={formatCurrency(110000)}
        labels={[
          // { name: `Total Payroll Cost: ${formatCurrency(200000)}`, color: 'success' },
          { name: `Taxes Deducted: ${formatCurrency(20000)}`, color: 'secondary' },
          { name: `Other Deductions: ${formatCurrency(5000)}`, color: 'error' },
          { name: `Benefits Costs: ${formatCurrency(10000)}`, color: 'warning' },
        ]}
      />
    </Grid>

    <Grid item xs={12} sm={6} md={4}>
      <EmployeeDashboardCard
        title="Attendance Insights"
        icon="healthicons:i-schedule-school-date-time"
        color="secondary.main"
        value="160hrs"
        labels={[
          // { name: `Total Payroll Cost: ${formatCurrency(200000)}`, color: 'success' },
          { name: `Average Working Hours: 160 hrs`, color: 'secondary' },
          { name: `Absenteeism Rate: 5%`, color: 'error' },
        ]}
      />
    </Grid>

    <Grid item xs={12} sm={6} md={4}>
      <EmployeeDashboardCard
        title="Retention Insights"
        icon="fluent:data-usage-edit-24-filled"
        color="warning.main"
        value="5"
        labels={[
          // { name: `Total Payroll Cost: ${formatCurrency(200000)}`, color: 'success' },
          { name: `Attrition Rate: 3%`, color: 'secondary' },
        ]}
      />
    </Grid>
  </Grid>
);

export default Dashboard;
