'use client';

import React from 'react';

import Grid from '@mui/material/Unstable_Grid2/Grid2';
import { Box, Button, useTheme } from '@mui/material';

import { CONFIG } from 'src/config-global';
import { SeoIllustration } from 'src/assets/illustrations';

import { svgColorClasses } from 'src/components/svg-color';

import { AppWidget } from './app-widget';
import { AppWelcome } from './app-welcome';
import { AppFeatured } from './app-featured';
import { AppTopAuthors } from './app-top-authors';
import { AppWidgetSummary } from './app-widget-summary';
import { AppAreaInstalled } from './app-area-installed';
import { AppCurrentDownload } from './app-current-download';
import { AppTopInstalledCountries } from './app-top-installed-countries';

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
    <Grid container spacing={3} width="100%">
      <Grid xs={12} md={8}>
        <AppWelcome
          title={`Welcome back 👋 \n Parth`}
          description="If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything."
          img={<SeoIllustration hideBackground />}
          action={
            <Button variant="contained" color="primary">
              Go now
            </Button>
          }
        />
      </Grid>

      <Grid xs={12} md={4}>
        <AppFeatured list={_appFeatured} />
      </Grid>

      <Grid xs={12} md={4}>
        <AppWidgetSummary
          title="Leave requests"
          percent={2.6}
          total={10}
          chart={{
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            series: [15, 18, 12, 51, 68, 11, 39, 37],
          }}
        />
      </Grid>

      <Grid xs={12} md={4}>
        <AppWidgetSummary
          title="Open Positions"
          percent={0.2}
          total={12}
          chart={{
            colors: [theme.vars.palette.info.main],
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            series: [20, 41, 63, 33, 28, 35, 50, 46],
          }}
        />
      </Grid>

      <Grid xs={12} md={4}>
        <AppWidgetSummary
          title="Upcoming Review"
          percent={-0.1}
          total={678}
          chart={{
            colors: [theme.vars.palette.error.main],
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
            series: [18, 19, 31, 8, 16, 37, 12, 33],
          }}
        />
      </Grid>

      <Grid xs={12} md={6} lg={4}>
        <AppCurrentDownload
          title="Total Employees"
          subheader="Number of employees"
          chart={{
            series: [
              { label: 'Female', value: 53345 },
              { label: 'Male', value: 12244 },
            ],
          }}
        />
      </Grid>

      <Grid xs={12} md={6} lg={8}>
        <AppAreaInstalled
          title="Organization"
          subheader="(+43%) than last year"
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
                name: '2022',
                data: [
                  { name: 'Primary', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                  { name: 'Secondary', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                  {
                    name: 'Higher-Secondary',
                    data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16],
                  },
                ],
              },
              {
                name: '2023',
                data: [
                  { name: 'Primary', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                  { name: 'Secondary', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                  { name: 'Higher-Secondary', data: [6, 18, 14, 9, 20, 6, 22, 19, 8, 22, 8, 17] },
                ],
              },
              {
                name: '2024',
                data: [
                  { name: 'Primary', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                  { name: 'Secondary', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                  { name: 'Higher-Secondary', data: [6, 20, 15, 18, 7, 24, 6, 10, 12, 17, 18, 10] },
                ],
              },
            ],
          }}
        />
      </Grid>

      {/* <Grid xs={12} lg={8}>
        <AppNewInvoice
          title="New invoice"
          tableData={_appInvoices}
          headLabel={[
            { id: 'id', label: 'Invoice ID' },
            { id: 'category', label: 'Category' },
            { id: 'price', label: 'Price' },
            { id: 'status', label: 'Status' },
            { id: '' },
          ]}
        />
      </Grid> */}

      {/* <Grid xs={12} md={6} lg={4}>
        <AppTopRelated title="Related applications" list={_appRelated} />
      </Grid> */}

      <Grid xs={12} md={6} lg={4}>
        <AppTopInstalledCountries title="Top installed countries" list={_appInstalled} />
      </Grid>

      <Grid xs={12} md={6} lg={4}>
        <AppTopAuthors title="Top Employees" list={_appAuthors} />
      </Grid>

      <Grid xs={12} md={6} lg={4}>
        <Box sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
          <AppWidget
            title="Conversion"
            total={38566}
            icon="solar:user-rounded-bold"
            chart={{ series: 48 }}
          />

          <AppWidget
            title="Applications"
            total={55566}
            icon="fluent:mail-24-filled"
            chart={{
              series: 75,
              colors: [theme.vars.palette.info.light, theme.vars.palette.info.main],
            }}
            sx={{ bgcolor: 'info.dark', [`& .${svgColorClasses.root}`]: { color: 'info.light' } }}
          />
        </Box>
      </Grid>
    </Grid>
  );
};

export default HrDashboard;
