import React from 'react';

import { Box, Card, Button, Typography } from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import upcomingBookingData from 'src/json/ResourceManagement/facility/upcomingBookingData.json';

import { Iconify } from 'src/components/iconify';

import BookingCard from './upcoming-booking-card';

const UpcomingBookingSection = () => (
  <Card sx={{ p: 3, height: '100%' }}>
    <Typography variant="h6">Upcoming Bookings</Typography>
    {upcomingBookingData.slice(0, 2).map((booking, index) => (
      <Box pt="20px" key={index}>
        <BookingCard
          title={booking.title}
          subtitle={booking.subtitle}
          date={booking.date}
          time={booking.time}
          person={booking.person}
          department={booking.department}
          status={booking.status}
        />
      </Box>
    ))}

    <Box pt="40px" />
    <Button
      startIcon={<Iconify icon={GlobalIcons.calenderIcon} />}
      fullWidth
      onClick={() => {}}
      variant="contained"
      sx={{ my: 1 }}
    >
      View All Bookings
    </Button>
  </Card>
);

export default UpcomingBookingSection;
