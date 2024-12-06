'use client'

import Link from 'next/link';
import React, { useRef, useState } from 'react';

import { useTheme } from '@mui/material/styles';
import { Box, Card, Grid, Typography, } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { AppAreaInstalled } from 'src/screens/hr/dashboard/app-area-installed';

import { Iconify } from 'src/components/iconify';

import { EcommerceYearlySales } from 'src/sections/overview/e-commerce/ecommerce-yearly-sales';
import { AnalyticsCurrentVisits } from 'src/sections/overview/analytics/analytics-current-visits';

import { PopularBooks } from './popular-books-carousel';

const LibraryDashboard = () => {

  const [selectedClass, setSelectedClass] = useState<string>('borrowingTrend');
  const [selectedCategory, setSelectedCategory] = useState<string>('booksByCategory');

  const booksOverview = {
    totalBooks: 500,
    booksIssued: 150,
    reservedBooks: 30,
    booksDueForReturn: 20,
    pendingReturns: 10,
  };

  const studentInsights = {
    totalStudents: 400,
    activeBorrowers: 200,
    studentDemographics: [
      { standard: 'Class 1', count: 50 },
      { standard: 'Class 2', count: 70 },
      { standard: 'Class 3', count: 80 },
      { standard: 'Class 4', count: 60 },
      { standard: 'Class 5', count: 40 },
    ],
    studentsWithOverdueBooks: [
      { name: 'John Doe', overdueDays: 5 },
      { name: 'Jane Smith', overdueDays: 3 },
    ],
  };

  const bookCategoryData = [
    { label: 'Fiction', value: 300 },
    { label: 'Non-Fiction', value: 150 },
    { label: 'Textbooks', value: 200 },
    { label: 'Reference', value: 100 },
  ];

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
  };

  let data: any = [];
  switch (selectedCategory) {
    case 'booksByCategory':
      data = bookCategoryData;
      break;
    default:
      data = bookCategoryData;
  }

  const bookCategoryDataForTable = [
    {
      category: 'Fiction',
      availableCount: 120,
      issuedCount: 50,
      reservedCount: 30,
      overdueCount: 10,
    },
    {
      category: 'Non-Fiction',
      availableCount: 80,
      issuedCount: 20,
      reservedCount: 15,
      overdueCount: 5,
    },
    {
      category: 'Textbooks',
      availableCount: 200,
      issuedCount: 150,
      reservedCount: 50,
      overdueCount: 20,
    },
    {
      category: 'Reference',
      availableCount: 60,
      issuedCount: 10,
      reservedCount: 5,
      overdueCount: 2,
    },
  ];

  const popularBooks = [
    { bookId: 'B2', title: 'JavaScript The Good Parts', borrowCount: 90, coverImage: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png' },
    { bookId: 'B3', title: 'Advanced Mathematics', borrowCount: 85, coverImage: 'https://cdn01.sapnaonline.com/product_media/9789360532703/md_9789360532703_030920241419332.jpg' },
    { bookId: 'B1', title: 'Indian Politics', borrowCount: 120, coverImage: 'https://rukminim2.flixcart.com/image/850/1000/jwtkk280/regionalbooks/h/z/y/indian-polity-original-imaf7fzkrdhdhwgv.jpeg?q=90&crop=false' },
    { bookId: 'B2', title: 'Database', borrowCount: 90, coverImage: 'https://media.springernature.com/full/springer-static/cover-hires/book/978-3-030-32587-9' },
    { bookId: 'B1', title: 'Introduction to Algorithms', borrowCount: 120, coverImage: 'https://lh4.googleusercontent.com/9t8B0-Mphz6OK8JI9-Nsh_JzWKd56QleeqRyUyCDoWunX0QTNXd2YDmVWCfmaus-Bb-U341ZQOzMl8IesJg5WWggAfplZ1cd1Qr9to3jlwCMjcLlKX8SET7fgcvtCcnCHk3ueApe=s0' },

  ];

  const theme = useTheme();
  const scrollContainerRef = useRef<any>(null);



  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };
  return (
    <>
      {/* Dropdowns for selecting class and data type */}
      <Grid container spacing={3} sx={{ marginBottom: 1, padding: 3 }}>

        <Box
          sx={{
            gap: 3,
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(3, 1fr)' },
            width: '100%',
          }}
        >


          <Box component={Link} href="/library/book-management/" sx={{
            cursor: 'pointer',
            '&:hover': {
              boxShadow: 6,
              transform: 'scale(1.02)',
              transition: '0.3s ease-in-out',
            },
          }}
            onClick={() => { }}
          >
            <Card sx={{ py: 3, pl: 3, pr: 2.5, }} >
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'h3' }}>{2500}</Box>
                <Typography noWrap variant="subtitle2" component="div" sx={{ color: 'text.secondary' }}>
                  Total Books
                </Typography>
              </Box>

              <Iconify icon="ix:library" sx={{
                top: 24,
                right: 10,
                width: 36,
                height: 36,
                position: 'absolute',
              }} />

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
          <Box component={Link} href='/library/member-management/'
            sx={{
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.02)',
                transition: '0.3s ease-in-out',
              },
            }}
          >

            <Card sx={{ py: 3, pl: 3, pr: 2.5, }} >
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'h3' }}>{500}</Box>
                <Typography noWrap variant="subtitle2" component="div" sx={{ color: 'text.secondary' }}>
                  Books Issued
                </Typography>
              </Box>

              <Iconify icon="map:library" sx={{
                top: 24,
                right: 10,
                width: 36,
                height: 36,
                position: 'absolute',
              }} />

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

          <Box component={Link} href='/library/circulation/?tab=reservations-Management'
            sx={{
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.02)',
                transition: '0.3s ease-in-out',
              },
            }}>
            <Card sx={{ py: 3, pl: 3, pr: 2.5, }} >
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'h3' }}>{100}</Box>
                <Typography noWrap variant="subtitle2" component="div" sx={{ color: 'text.secondary' }}>
                  Reserved Books
                </Typography>
              </Box>

              <Iconify icon="material-symbols-light:slide-library-sharp" sx={{
                top: 24,
                right: 10,
                width: 36,
                height: 36,
                position: 'absolute',
              }} />

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
          <Box component={Link} href='/library/member-management/'
            sx={{
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.02)',
                transition: '0.3s ease-in-out',
              },
            }}>
            <Card sx={{ py: 3, pl: 3, pr: 2.5, }} >
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'h3' }}>{50}</Box>
                <Typography noWrap variant="subtitle2" component="div" sx={{ color: 'text.secondary' }}>
                  Books Due for Return
                </Typography>
              </Box>

              <Iconify icon="tabler:calendar-due" sx={{
                top: 24,
                right: 10,
                width: 36,
                height: 36,
                position: 'absolute',
              }} />

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
          <Box component={Link} href='/library/member-management/'
            sx={{
              cursor: 'pointer',
              '&:hover': {
                boxShadow: 6,
                transform: 'scale(1.02)',
                transition: '0.3s ease-in-out',
              },
            }}>
            <Card sx={{ py: 3, pl: 3, pr: 2.5, }} >
              <Box sx={{ flexGrow: 1 }}>
                <Box sx={{ typography: 'h3' }}>{500}</Box>
                <Typography noWrap variant="subtitle2" component="div" sx={{ color: 'text.secondary' }}>
                  Active Borrowers

                </Typography>
              </Box>

              <Iconify icon="heroicons:user-group" sx={{
                top: 24,
                right: 10,
                width: 36,
                height: 36,
                position: 'absolute',
              }} />

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
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>

          <AnalyticsCurrentVisits
            title="Books by Category"
            chart={{ series: data }}

          />

        </Grid>
        <Grid item xs={12} md={6}>

          <AppAreaInstalled
            isShowChartLegendValue={false}
            height={400}
            title="Books by Status"
            selectSeries="Standard 1"
            chart={{
              colors: [theme.palette.info.main, theme.palette.primary.main, theme.palette.warning.main,],
              categories: ['Fiction', 'Non-fiction', "TextBook", "Refrences"],
              series: [
                {
                  name: 'Standard 1',
                  data: [
                    { name: 'Issued', data: [12, 10, 18, 22,] },
                    { name: 'Reserved', data: [12, 10, 18, 0] },
                    { name: 'Due', data: [12, 20, 14, 15,] },
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
                    { name: 'Reserved', data: [6, 20, 15, 18,] },
                    { name: 'Due', data: [6, 10, 12, 17,] },
                  ],
                },
              ],
            }}

          />

        </Grid>

      </Grid>

      {/* Analytics Section */}

      {/* <Grid item xs={12}>
        <Typography variant='h5' sx={{ pb: "15px", pt: "20px", pl: "15px" }}>Book Status Details </Typography>
        <CustomizableTable
          isShowedDense={false}
          columns={[
            { id: 'category', label: 'Category' },
            {
              id: 'availableCount',
              label: 'Available',
              render(value, row) {
                return <Typography fontSize="12px" textAlign="center">{value}</Typography>;
              },
            },
            {
              id: 'issuedCount',
              label: 'Issued',
              render(value) {
                return <Typography fontSize="12px" textAlign="center">{value}</Typography>;
              },
            },
            {
              id: 'reservedCount',
              label: 'Reserved',
              render(value) {
                return <Typography fontSize="12px" textAlign="center">{value}</Typography>;
              },
            },
            {
              id: 'overdueCount',
              label: 'Overdue',
              render(value) {
                return (
                  <Typography fontSize="12px" textAlign="center" color={value > 0 ? 'error' : 'text.primary'}>
                    {value}
                  </Typography>
                );
              },
            },

          ]}
          data={bookCategoryDataForTable}
        />
      </Grid> */}
      <Box pt="20px" />
      <Grid>
        {/* <Typography variant='h6' >Borrowing & Reservation Trends</Typography>;
        <Typography fontSize="12px">Gain insights into borrowing patterns and popular books over time</Typography>; */}
        <Grid item xs={12} md={6} >


          <EcommerceYearlySales
            isShowChartLegend={false}
            title="Monthly Borrowing Trends"
            subheader=""
            chart={{
              colors: [theme.palette.primary.main, theme.palette.warning.main, theme.palette.secondary.main, theme.palette.error.main],
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
        <Grid item xs={12}>

          <AppAreaInstalled
            isShowChartLegendValue={false}
            title="Reservation Trends Over Time"
            selectSeries="Standard 1"
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
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
        {/* Title and Navigation */}
        {/* <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" sx={{ pb: "15px", pt: "20px", pl: "15px" }}>
            Popular Books
          </Typography>
          <Box display="flex" flexDirection="row" gap={2} sx={{ pr: "15px" }}>
            <Box
              onClick={scrollLeft}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                boxShadow: 1,
              }}
            >
              <Iconify icon="iconamoon:arrow-left-2-thin" width={24} height={24} />
            </Box>
            <Box
              onClick={scrollRight}
              sx={{
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                backgroundColor: '#f0f0f0',
                boxShadow: 1,
              }}
            >
              <Iconify icon="iconamoon:arrow-right-2-thin" width={24} height={24} />
            </Box>
          </Box>
        </Box> */}

        {/* Scrollable Grid */}
        {/* <Box
          ref={scrollContainerRef}
          sx={{
            display: 'flex',
            gap: 2,
            overflowX: 'auto',
            scrollBehavior: 'smooth',
            pt: "20px",
            pb: "20px",
            px: "15px",
            "&::-webkit-scrollbar": {
              display: 'none',
            },
          }}
        >
          {popularBooks.map((book) => (
            <Card
              key={book.bookId}
              sx={{
                flex: '0 0 auto',
                width: '300px',
              }}
            >
              <CardMedia
                component="img"
                height="230"
                image={book.coverImage}
                alt={book.title}
              />
              <CardContent>
                <Typography variant="h6">{book.title}</Typography>
                <Typography variant="body2">Borrowed: {book.borrowCount} times</Typography>
              </CardContent>
            </Card>
          ))}
        </Box> */}
        <Box pt="20px" />
        <PopularBooks title="Popular Books" list={popularBooks} />
      </Box>
    </>
  );
}

export default LibraryDashboard;






















