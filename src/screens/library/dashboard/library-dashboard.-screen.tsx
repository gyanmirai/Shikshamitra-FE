'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Grid, Typography } from '@mui/material';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { AppAreaInstalled } from 'src/screens/hr/dashboard/app-area-installed';
import { EcommerceYearlySales } from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

import { popularBooksData } from './data';
import { PopularBooks } from './popular-books-carousel';

const LibraryDashboard = () => {
  // State to manage selected class and category in the dashboard
  const [selectedClass, setSelectedClass] = useState<string>('borrowingTrend');
  const [selectedCategory, setSelectedCategory] = useState<string>('booksByCategory');

  // Sample data representing different book categories and their quantities
  const bookCategoryData = [
    { label: 'Fiction', value: 300 },
    { label: 'Non-Fiction', value: 150 },
    { label: 'Textbooks', value: 200 },
    { label: 'Reference', value: 100 },
  ];
  // Initialize data array and populate it based on selected category
  let data: any = [];
  switch (selectedCategory) {
    case 'booksByCategory':
      data = bookCategoryData;
      break;
    default:
      data = bookCategoryData;
  }

  const theme = useTheme();

  return (
    <>
      {/* Dropdowns for selecting class and data type */}
      <CustomBreadcrumbs
        heading="Dashboard"
        links={[{ name: 'Library' }, { name: 'Dashboard' }]}
        sx={{ px: 1, mb: 2 }}
      />
      <Grid container spacing={3} sx={{ marginBottom: 1, padding: 3 }}>
        <Box
          sx={{
            gap: 3,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' },
            width: '100%',
          }}
        >
          <Box
            component={Link}
            href="/library/book-management/"
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.02)',
                transition: '0.3s ease-in-out',
                textDecoration: 'none',
              },
            }}
            onClick={() => {}}
          >
            <Card sx={{ py: 3, pl: 3, pr: 2.5 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'h3' }}>{2500}</Box>
                <Typography
                  noWrap
                  variant="subtitle2"
                  component="div"
                  sx={{ color: 'text.secondary' }}
                >
                  Total Books
                </Typography>
              </Box>

              <Iconify
                icon="ix:library"
                sx={{
                  top: 24,
                  right: 10,
                  width: 36,
                  height: 36,
                  position: 'absolute',
                }}
              />
              <Box
                sx={{
                  top: -44,
                  width: 160,
                  zIndex: -1,
                  height: 160,
                  right: -104,
                  opacity: 0.12,
                  borderRadius: 3,
                  position: 'absolute',
                  transform: 'rotate(40deg)',
                  background: `linear-gradient(to right, ${theme.vars.palette.success.main} 0%, ${varAlpha(theme.vars.palette.success.mainChannel, 0)} 100%)`,
                }}
              />
            </Card>
          </Box>
          <Box
            component={Link}
            href="/library/member-management/"
            sx={{
              cursor: 'pointer',
              textDecoration: 'none', // remove underline
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.02)',
                transition: '0.3s ease-in-out',
                textDecoration: 'none', // ensure it's still removed on hover
              },
            }}
          >
            <Card sx={{ py: 3, pl: 3, pr: 2.5 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'h3' }}>{500}</Box>
                <Typography
                  noWrap
                  variant="subtitle2"
                  component="div"
                  sx={{ color: 'text.secondary' }}
                >
                  Books Issued
                </Typography>
              </Box>

              <Iconify
                icon="map:library"
                sx={{
                  top: 24,
                  right: 10,
                  width: 36,
                  height: 36,
                  position: 'absolute',
                }}
              />

              <Box
                sx={{
                  top: -44,
                  width: 160,
                  zIndex: -1,
                  height: 160,
                  right: -104,
                  opacity: 0.12,
                  borderRadius: 3,
                  position: 'absolute',
                  transform: 'rotate(40deg)',
                  background: `linear-gradient(to right, ${theme.vars.palette.info.main} 0%, ${varAlpha(theme.vars.palette.info.mainChannel, 0)} 100%)`,
                }}
              />
            </Card>
          </Box>

          <Box
            component={Link}
            href="/library/circulation/?tab=reservations-Management"
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.02)',
                transition: '0.3s ease-in-out',
                textDecoration: 'none',
              },
            }}
          >
            <Card sx={{ py: 3, pl: 3, pr: 2.5 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'h3' }}>{100}</Box>
                <Typography
                  noWrap
                  variant="subtitle2"
                  component="div"
                  sx={{ color: 'text.secondary' }}
                >
                  Reserved Books
                </Typography>
              </Box>

              <Iconify
                icon="material-symbols-light:slide-library-sharp"
                sx={{
                  top: 24,
                  right: 10,
                  width: 36,
                  height: 36,
                  position: 'absolute',
                }}
              />

              <Box
                sx={{
                  top: -44,
                  width: 160,
                  zIndex: -1,
                  height: 160,
                  right: -104,
                  opacity: 0.12,
                  borderRadius: 3,
                  position: 'absolute',
                  transform: 'rotate(40deg)',
                  background: `linear-gradient(to right, ${theme.vars.palette.warning.main} 0%, ${varAlpha(theme.vars.palette.warning.mainChannel, 0)} 100%)`,
                }}
              />
            </Card>
          </Box>
          <Box
            component={Link}
            href="/library/member-management/"
            sx={{
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.02)',
                transition: '0.3s ease-in-out',
                textDecoration: 'none',
              },
            }}
          >
            <Card sx={{ py: 3, pl: 3, pr: 2.5 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'h3' }}>{50}</Box>
                <Typography
                  noWrap
                  variant="subtitle2"
                  component="div"
                  sx={{ color: 'text.secondary' }}
                >
                  Books Due for Return
                </Typography>
              </Box>

              <Iconify
                icon="tabler:calendar-due"
                sx={{
                  top: 24,
                  right: 10,
                  width: 36,
                  height: 36,
                  position: 'absolute',
                }}
              />

              <Box
                sx={{
                  top: -44,
                  width: 160,
                  zIndex: -1,
                  height: 160,
                  right: -104,
                  opacity: 0.12,
                  borderRadius: 3,
                  position: 'absolute',
                  transform: 'rotate(40deg)',
                  background: `linear-gradient(to right, ${theme.vars.palette.error.main} 0%, ${varAlpha(theme.vars.palette.error.mainChannel, 0)} 100%)`,
                }}
              />
            </Card>
          </Box>
          <Box
            component={Link}
            href="/library/member-management/"
            sx={{
              cursor: 'pointer',
              textDecoration: 'none',
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.02)',
                transition: '0.3s ease-in-out',
                textDecoration: 'none',
              },
            }}
          >
            <Card sx={{ py: 3, pl: 3, pr: 2.5 }}>
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'h3' }}>{500}</Box>
                <Typography
                  noWrap
                  variant="subtitle2"
                  component="div"
                  sx={{ color: 'text.secondary' }}
                >
                  Active Borrowers
                </Typography>
              </Box>

              <Iconify
                icon="heroicons:user-group"
                sx={{
                  top: 24,
                  right: 10,
                  width: 36,
                  height: 36,
                  position: 'absolute',
                }}
              />

              <Box
                sx={{
                  top: -44,
                  width: 160,
                  zIndex: -1,
                  height: 160,
                  right: -104,
                  opacity: 0.12,
                  borderRadius: 3,
                  position: 'absolute',
                  transform: 'rotate(40deg)',
                  background: `linear-gradient(to right, ${theme.vars.palette.success.main} 0%, ${varAlpha(theme.vars.palette.success.mainChannel, 0)} 100%)`,
                }}
              />
            </Card>
          </Box>
        </Box>
      </Grid>

      {/* Main Dashboard Content */}
      <Grid container spacing={3} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
          <AnalyticsCurrentVisits
            title="Books by Category"
            chart={{ series: data }}
            sx={{ flexGrow: 1 }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex' }}>
          <AppAreaInstalled
            isShowChartLegendValue={false}
            height={350} // or a unified height if needed
            title="Books by Status"
            selectSeries="Standard 1"
            chart={{
              colors: [
                theme.palette.info.main,
                theme.palette.primary.main,
                theme.palette.warning.main,
              ],
              categories: ['Fiction', 'Non-fiction', 'TextBook', 'Refrences'],
              series: [
                {
                  name: 'Standard 1',
                  data: [
                    { name: 'Issued', data: [12, 10, 18, 22] },
                    { name: 'Reserved', data: [12, 10, 18, 0] },
                    { name: 'Due', data: [12, 20, 14, 15] },
                  ],
                },
                {
                  name: 'Standard 2',
                  data: [
                    { name: 'Issued', data: [8, 22, 8, 17] },
                    { name: 'Reserved', data: [6, 18, 14, 9] },
                    { name: 'Due', data: [8, 22, 8, 17] },
                  ],
                },
                {
                  name: 'Standard 3',
                  data: [
                    { name: 'Issued', data: [12, 17, 18, 10] },
                    { name: 'Reserved', data: [6, 20, 15, 18] },
                    { name: 'Due', data: [6, 10, 12, 17] },
                  ],
                },
              ],
            }}
            sx={{ flexGrow: 1 }}
          />
        </Grid>
      </Grid>

      <Box pt="20px" />
      <Grid>
        {/* <Typography variant='h6' >Borrowing & Reservation Trends</Typography>;
        <Typography fontSize="12px">Gain insights into borrowing patterns and popular books over time</Typography>; */}
        <Grid size={{ xs: 12, md: 6 }}>
          <EcommerceYearlySales
            isShowChartLegend={false}
            title="Monthly Borrowing Trends"
            subheader=""
            chart={{
              colors: [
                theme.palette.primary.main,
                theme.palette.warning.main,
                theme.palette.secondary.main,
                theme.palette.error.main,
              ],
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
                  name: 'Standard 1',
                  data: [
                    {
                      name: 'Fiction',
                      data: [10, 41, 35, 51, 49, 62, 69, 91, 148, 35, 51, 49],
                    },
                    {
                      name: 'Non-Fiction',
                      data: [10, 34, 13, 56, 77, 88, 99, 77, 45, 13, 56, 77],
                    },
                    {
                      name: 'TextBook',
                      data: [56, 13, 34, 10, 77, 99, 88, 45, 77, 99, 88, 77],
                    },
                    {
                      name: 'Refrences',
                      data: [56, 13, 34, 10, 77, 99, 69, 91, 148, 35, 51, 49],
                    },
                  ],
                },
              ],
            }}
          />
        </Grid>
      </Grid>

      {/* Replenishment Chart */}
      <Grid container spacing={3} sx={{ marginTop: 3 }}>
        <Grid size={12}>
          <AppAreaInstalled
            isShowChartLegendValue={false}
            title="Reservation Trends Over Time"
            selectSeries="Standard 1"
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
                  name: 'Standard 1',
                  data: [
                    { name: 'Fiction', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Textbook', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Non-Fiction', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Refrences', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                  ],
                },
                {
                  name: 'Standard 2',
                  data: [
                    { name: 'Fiction', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Textbook', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Non-Fiction', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Refrences', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                  ],
                },
                {
                  name: 'Standard 3',
                  data: [
                    { name: 'Fiction', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Textbook', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Non-Fiction', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                    { name: 'Refrences', data: [12, 10, 18, 22, 20, 12, 8, 21, 20, 14, 15, 16] },
                  ],
                },
              ],
            }}
          />
        </Grid>
      </Grid>
      <Box>
        <Box pt="20px" />
        <PopularBooks title="Popular Books" list={popularBooksData} />
      </Box>
    </>
  );
};

export default LibraryDashboard;
