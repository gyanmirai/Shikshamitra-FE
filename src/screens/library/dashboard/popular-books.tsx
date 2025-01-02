import React, { useRef } from 'react';

import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Card, Button, CardMedia, Typography, CardContent } from '@mui/material';

interface popularBooksProps {
  popularBooks: any;
}

const PopularBooks: React.FC<popularBooksProps> = ({ popularBooks }) => {
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
    <Box sx={{ position: 'relative', pt: '20px', pb: '20px' }}>
      {/* Left Arrow */}
      <Button
        onClick={scrollLeft}
        sx={{
          position: 'absolute',
          left: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          backgroundColor: '#fff',
          boxShadow: 2,
          minWidth: '40px',
          height: '40px',
          borderRadius: '50%',
        }}
      >
        <ArrowBackIosIcon fontSize="small" />
      </Button>

      {/* Scrollable Container */}
      <Box
        ref={scrollContainerRef}
        sx={{
          display: 'flex',
          overflowX: 'auto',
          scrollBehavior: 'smooth',
          gap: '16px',
          padding: '0 50px', // Add padding for arrows
        }}
      >
        {popularBooks.map((book: any) => (
          <Box
            key={book.bookId}
            sx={{
              flex: '0 0 auto',
              width: '300px',
            }}
          >
            <Card>
              <CardMedia component="img" height="230" image={book.coverImage} alt={book.title} />
              <CardContent>
                <Typography variant="h6">{book.title}</Typography>
                <Typography variant="body2">Borrowed: {book.borrowCount} times</Typography>
              </CardContent>
            </Card>
          </Box>
        ))}
      </Box>

      {/* Right Arrow */}
      <Button
        onClick={scrollRight}
        sx={{
          position: 'absolute',
          right: 0,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 1,
          backgroundColor: '#fff',
          boxShadow: 2,
          minWidth: '40px',
          height: '40px',
          borderRadius: '50%',
        }}
      >
        <ArrowForwardIosIcon fontSize="small" />
      </Button>
    </Box>
  );
};

export default PopularBooks;
