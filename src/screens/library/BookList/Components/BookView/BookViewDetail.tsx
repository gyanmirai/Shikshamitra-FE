import type { IBook, IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Grid, Card, Typography } from '@mui/material';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useViewBookDetailsQuery } from 'src/redux/library/bookList/bookList-api';

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
}) => {
  const {
    data: bookDetails,
    isLoading,
    isFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useViewBookDetailsQuery,
    params: {
      bookId: book?.id,
    },
  });

  const currentBook = bookDetails || book;
  const copies = currentBook?.copies?.length ? currentBook.copies : [];

  return (
    <Box display="flex" flexDirection="column" sx={{ flexGrow: 1, minHeight: 0 }}>
      <Scrollbar sx={{ p: 2, flexGrow: 1 }}>
        <Grid container spacing={2} alignItems="flex-start">
          <Box sx={{ bgcolor: 'background.paper', width: '100%', mb: 1 }}>
            <BookViewBasicDetail book={currentBook} />
          </Box>
        </Grid>
        <Card sx={{ p: 2, bgcolor: 'background.paper' }}>
          <Typography variant="h6" color="primary" fontWeight={600} sx={{ mb: 2 }}>
            Book Copies
          </Typography>
          <Grid container spacing={3}>
            {copies.map((copy: any) => (
              <Grid size={{ xs: 12, md: 4 }} key={copy.accessionNo}>
                <BookCopyCard
                  copy={copy as IBookCopyWithBook}
                  onChangeStatus={() => handleChangeStatus({ ...copy, book: currentBook })}
                  onIssueBook={() => handleIssueBook({ ...copy, book: currentBook })}
                  onReturnBook={() => handleReturnBook({ ...copy, book: currentBook })}
                  onBookHistory={() => handleBookHistory({ ...copy, book: currentBook })}
                />
              </Grid>
            ))}
          </Grid>
        </Card>
      </Scrollbar>
    </Box>
  );
};
export default BookViewDetail;
