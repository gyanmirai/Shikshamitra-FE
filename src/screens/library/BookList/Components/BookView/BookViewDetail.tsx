import type { IBook, IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { Box, Grid, Card, Skeleton, Typography } from '@mui/material';
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
    isLoading: isBookDetailsLoading,
    isFetching: isBookDetailsFetching,
  } = useQueryAndMutation({
    type: 'query',
    currentQueryAndMutation: useViewBookDetailsQuery,
    params: {
      bookId: book?.id,
    },
    options: { skip: !book?.id },
  });

  const currentBook = bookDetails || book;
  const copies = currentBook?.copies?.length ? currentBook.copies : [];
  const isLoading = isBookDetailsLoading || isBookDetailsFetching;

  if (isLoading) {
    return (
      <Box display="flex" flexDirection="column" sx={{ flexGrow: 1, minHeight: 0 }}>
        <Scrollbar sx={{ p: 2, flexGrow: 1 }}>
          <Box sx={{ bgcolor: 'background.paper', width: '100%', mb: 1, p: 2 }}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 3 }}>
                <Skeleton
                  variant="rectangular"
                  width="100%"
                  height={180}
                  sx={{ borderRadius: 2 }}
                />
              </Grid>
              <Grid size={{ xs: 12, md: 9 }}>
                <Skeleton variant="text" width="60%" height={36} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="40%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="50%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="35%" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" width="45%" height={24} />
              </Grid>
            </Grid>
          </Box>
          <Card sx={{ p: 2, bgcolor: 'background.paper' }}>
            <Skeleton variant="text" width={120} height={32} sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              {[1, 2, 3].map((i) => (
                <Grid size={{ xs: 12, md: 4 }} key={i}>
                  <Skeleton
                    variant="rectangular"
                    width="100%"
                    height={160}
                    sx={{ borderRadius: 2 }}
                  />
                </Grid>
              ))}
            </Grid>
          </Card>
        </Scrollbar>
      </Box>
    );
  }

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
