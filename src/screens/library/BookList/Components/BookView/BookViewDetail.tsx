import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Typography } from '@mui/material';

import BookCopyCard from './BookCopyCard';
import BookViewBasicDetail from './BookBasicDetails';

interface BookViewDetailProps {
  book: IBook;
}

const BookViewDetail: React.FC<BookViewDetailProps> = ({ book }) => (
  <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
    <Scrollbar sx={{ p: 2, height: '100%' }}>
      <BookViewBasicDetail book={book} />
      <Typography variant="h6" fontWeight={600} color="green" mb={2}>
        Book Copies
      </Typography>

      <Grid container spacing={2}>
        {book?.copies?.map((copy) => (
          <Grid size={{ xs: 12, md: 4 }} key={copy.accessionNo}>
            <BookCopyCard {...copy} />
          </Grid>
        ))}
      </Grid>
    </Scrollbar>
  </Box>
);

export default BookViewDetail;
