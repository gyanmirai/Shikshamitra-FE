'use client';

import React from 'react';

import { Visibility } from '@mui/icons-material';
import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Divider, useTheme, IconButton } from '@mui/material';

import { CONFIG } from 'src/config-global';
// import { AttendanceGraph } from 'src/app/(auth)/student/overview/page';

import { AttendanceGraph } from 'src/app/(auth)/student/overview/enrollments-trends';

import CustomSelect from 'src/components/custom-select';
import { svgColorClasses } from 'src/components/svg-color';
import CustomizableTable from 'src/components/customizabaleTable';

import { CalendarView } from 'src/sections/calendar/view';

import { AppWidget } from './app-widget';
import { AppWidgetSummary } from './app-widget-summary';

export const _appFeatured = [...Array(3)].map((_, index) => ({
  id: `${index + 3}`,
  title: `Approve leave application`,
  description: `test${index + 3}`,
  coverUrl: 'https://minimal-assets-api.vercel.app/assets/images/covers/cover_1.jpg',
}));
export const _appInvoices = [...Array(5)].map((_, index) => {
  const category = ['Android', 'Mac', 'Windows', 'Android', 'Mac'][index];

  const status = ['paid', 'out of date', 'progress', 'paid', 'paid'][index];

  return {
    id: `${index}`,
    invoiceNumber: `INV-199${index}`,
    price: index,
    category,
    status,
  };
});
export const _appRelated = [
  'Microsoft office 365',
  'Opera',
  'Adobe acrobat reader DC',
  'Joplin',
  'Topaz photo AI',
].map((name, index) => ({
  id: `${index}`,
  name,
  downloaded: index,
  ratingNumber: index,
  size: index * 1024,
  totalReviews: index,
  shortcut: `${CONFIG.site.basePath}/assets/icons/app/ic-app-${index + 1}.webp`,
  price: [2, 4].includes(index) ? index : 0,
}));
export const _appInstalled = ['Germany', 'England', 'France', 'Korean', 'USA'].map(
  (country, index) => ({
    id: `${index}`,
    countryName: country,
    android: index,
    windows: index + 1,
    apple: index + 2,
    countryCode: ['de', 'gb', 'fr', 'kr', 'us'][index],
  })
);

export const _appAuthors = [...Array(3)].map((_, index) => ({
  id: `${index}`,
  name: `${index}`,
  avatarUrl: `${index}`,
  totalFavorites: index,
}));
const HrDashboard = () => {
  const theme = useTheme();
  return (
    <>
      <Grid container spacing={3} width="100%">
        <Grid xs={12}>
          <CustomSelect
            label="Organization"
            options={[]}
            value=""
            onChange={() => {}}
            formControlProps={{ sx: { maxWidth: 200, width: '100%' } }}
          />
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          <AppWidgetSummary
            title="Total Employees"
            percent={null}
            total={10000}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          <AppWidgetSummary
            title="Total Male Employees"
            percent={null}
            total={8000}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          <AppWidgetSummary
            title="Total Female Employees"
            percent={null}
            total={2000}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>
        <Grid xs={12}>
          <Divider sx={{ borderStyle: 'doted' }} />
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          <AppWidgetSummary
            title="Leave requests"
            percent={null}
            total={10}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [15, 18, 12, 51, 68, 11, 39, 37],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppWidgetSummary
            title="Open Positions"
            percent={null}
            total={12}
            chart={{
              colors: [theme.vars.palette.info.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [20, 41, 63, 33, 28, 35, 50, 46],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AppWidgetSummary
            title="Upcoming Review"
            percent={null}
            total={678}
            chart={{
              colors: [theme.vars.palette.error.main],
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [18, 19, 31, 8, 16, 37, 12, 33],
            }}
          />
        </Grid>
      </Grid>
      <Grid container spacing={3} width="100%">
        <Grid xs={12} md={6} lg={4}>
          <AppWidget
            title="Attendance Percentage"
            total={89}
            icon="solar:user-rounded-bold"
            chart={{ series: 89 }}
            renderComp={
              <IconButton sx={{ color: 'black', zIndex: 10 }}>
                <Visibility />
              </IconButton>
            }
          />
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          <AppWidget
            title="Payroll Status"
            total={10}
            icon="fluent:payment-48-filled"
            chart={{
              series: 10,
              colors: [theme.vars.palette.info.light, theme.vars.palette.info.main],
            }}
            renderComp={
              <IconButton sx={{ color: 'black', zIndex: 10 }}>
                <Visibility />
              </IconButton>
            }
            sx={{ bgcolor: 'info.dark', [`& .${svgColorClasses.root}`]: { color: 'info.light' } }}
          />
        </Grid>
        <Grid xs={12} md={6} lg={4}>
          <AppWidget
            title="Pending Leave Requests"
            total={10}
            icon="pepicons-pencil:leave-circle-filled"
            chart={{
              series: 10,
              colors: [theme.vars.palette.warning.light, theme.vars.palette.warning.main],
            }}
            renderComp={
              <IconButton sx={{ color: 'black', zIndex: 10 }}>
                <Visibility />
              </IconButton>
            }
            sx={{
              bgcolor: 'warning.dark',
              [`& .${svgColorClasses.root}`]: { color: 'warning.light' },
            }}
          />
        </Grid>
        <Grid xs={12} md={6}>
          <AttendanceGraph
            title="Attendance Analytics"
            subheader="(+43%) than last year"
            chart={{
              series: [
                {
                  name: 'Weekly',
                  categories: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'],
                  data: [
                    { name: '', data: [24, 41, 35, 151, 49] },
                    // { name: 'Savings', data: [24, 56, 77, 88, 99] },
                    // { name: 'Investment', data: [40, 34, 77, 88, 99] },
                  ],
                },
                {
                  name: 'Monthly',
                  categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'],
                  data: [
                    { name: '', data: [83, 112, 119, 88, 103, 112, 114, 108, 93] },
                    // { name: 'Savings', data: [46, 46, 43, 58, 40, 59, 54, 42, 51] },
                    // { name: 'Investment', data: [25, 40, 38, 35, 20, 32, 27, 40, 21] },
                  ],
                },
                {
                  name: 'Yearly',
                  categories: ['2018', '2019', '2020', '2021', '2022', '2023'],
                  data: [
                    { name: '', data: [76, 42, 29, 41, 27, 96] },
                    // { name: 'Savings', data: [46, 44, 24, 43, 44, 43] },
                    // { name: 'Investment', data: [23, 22, 37, 38, 32, 25] },
                  ],
                },
              ],
            }}
          />
        </Grid>
        <Grid xs={12} md={6}>
          <CustomizableTable
            columns={[
              { id: 'name', label: 'Name' },
              { id: 'employeeId', label: 'Employee Id' },
              { id: 'department', label: 'Department' },
            ]}
            data={[]}
          />
        </Grid>
        <Grid xs={12}>
          <CalendarView />
        </Grid>
      </Grid>
    </>
  );
};

export default HrDashboard;
