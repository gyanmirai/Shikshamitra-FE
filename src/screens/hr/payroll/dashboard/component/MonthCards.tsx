'use client';

import React, { useRef } from 'react';

import { ArrowBackIos, ArrowForwardIos } from '@mui/icons-material';
import { Box, Card, IconButton, Typography, CardContent } from '@mui/material';

export const monthData = [
  { id: 1, month: 'January', year: '2024' },
  { id: 2, month: 'February', year: '2024' },
  { id: 3, month: 'March', year: '2024' },
  { id: 4, month: 'April', year: '2024' },
  { id: 5, month: 'May', year: '2024' },
  { id: 6, month: 'June', year: '2024' },
  { id: 7, month: 'July', year: '2024' },
  { id: 8, month: 'August', year: '2024' },
  { id: 9, month: 'September', year: '2024' },
  { id: 10, month: 'October', year: '2024' },
  { id: 11, month: 'November', year: '2024' },
  { id: 12, month: 'December', year: '2024' },
];

const MonthCards = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300; // Adjust scroll step
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <Box display="flex" alignItems="center">
      {/* Left Arrow */}
      <IconButton onClick={() => scroll('left')} sx={{ mx: 1 }}>
        <ArrowBackIos />
      </IconButton>

      {/* Scrollable Content */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          gap: '10px',
          padding: '0 10px',
          scrollbarWidth: 'none',
          '&::-webkit-scrollbar': { display: 'none' },
          scrollSnapType: 'x mandatory',
        }}
      >
        {monthData.map((month) => (
          <Box
            key={month.id}
            sx={{
              flex: '0 0 auto',
              width: '170px', // Decreased from 300px
              scrollSnapAlign: 'start',
            }}
          >
            <Card
              sx={{
                height: '100px', // Added explicit height
                boxShadow: 'none', // Removed shadow
                border: '1px solid #e0e0e0', // Optional: added subtle border to maintain visual separation
                justifyItems: 'center',
                alignContent: 'center',
              }}
            >
              <CardContent>
                <Typography variant="h4">{month.month}</Typography>
                <Typography variant="body2">{month.year}</Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Right Arrow */}
      <IconButton onClick={() => scroll('right')} sx={{ mx: 1 }}>
        <ArrowForwardIos />
      </IconButton>
    </Box>
  );
};

export default MonthCards;
