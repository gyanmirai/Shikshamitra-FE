import type { IBook, IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Typography } from '@mui/material';

import BookCopyCard from './BookCopyCard';
import BookViewBasicDetail from './BookBasicDetails';

interface BookViewDetailProps {
  book: IBook | null;
  handleChangeStatus: (copy: IBookCopyWithBook) => void;
  handleIssueBook: (copy: IBookCopyWithBook) => void;
  handleReturnBook: (copy: IBookCopyWithBook) => void;
  handleBookHistory: (copy: IBookCopyWithBook) => void;
}

const BookViewDetail: React.FC<BookViewDetailProps> = ({
  book,
  handleChangeStatus,
  handleIssueBook,
  handleReturnBook,
  handleBookHistory,
}) => (
  <Box display="flex" flexDirection="column" sx={{ height: '100%' }}>
    <Scrollbar sx={{ p: 2, height: '100%' }}>
      <BookViewBasicDetail book={book} />
      <Typography variant="h6" color="primary" mb={2} mt={3}>
        Book Copies
      </Typography>

      <Grid container spacing={2} sx={{ pb: 2 }}>
        {book?.copies?.map((copy) => (
          <Grid size={{ xs: 12, md: 4, sm: 2 }} key={copy.accessionNo}>
            <BookCopyCard
              copy={copy as IBookCopyWithBook}
              onChangeStatus={() => handleChangeStatus({ ...copy, book })}
              onIssueBook={() => handleIssueBook({ ...copy, book })}
              onReturnBook={() => handleReturnBook({ ...copy, book })}
              onBookHistory={() => handleBookHistory({ ...copy, book })}
            />
          </Grid>
        ))}
      </Grid>
    </Scrollbar>
  </Box>
);

export default BookViewDetail;
