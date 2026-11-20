import type { IBook, IBookCopyWithBook } from 'src/screens/library/BookManagement/Components/type';

import { useState } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { useViewBookDetailsQuery } from 'src/redux/library/bookList/bookList-api';
import { Box, Grid, Card, Alert, Button, Typography, LinearProgress } from '@mui/material';

import BookCopyCard from './BookCopyCard';
import BookViewBasicDetail from './BookBasicDetails';
import { BookViewDetailSkeleton } from './BookViewDetailSkeleton';
import { CopyLifecycleDialogs } from '../../../circulation/CopyLifecycleDialogs';

interface BookViewDetailProps {
  book: IBook | null;
  handleChangeStatus: (copy: IBookCopyWithBook) => void;
  handleIssueBook: (copy: IBookCopyWithBook) => void;
  handleReturnBook: (copy: IBookCopyWithBook) => void;
  handleBookHistory: (copy: IBookCopyWithBook) => void;
}

export default function BookViewDetail({
  book,
  handleChangeStatus,
  handleIssueBook,
  handleReturnBook,
  handleBookHistory,
}: BookViewDetailProps) {
  const [selected, setSelected] = useState<IBookCopyWithBook | null>(null);
  const query = useViewBookDetailsQuery({ bookId: book?.id }, { skip: !book?.id });
  const currentBook = (book?.id ? query.currentData : undefined) as IBook | undefined;
  const copies = currentBook?.copies || [];
  return (
    <Box display="flex" flexDirection="column" sx={{ flexGrow: 1, minHeight: 0 }}>
      <Scrollbar sx={{ p: 2, flexGrow: 1 }}>
        {!book?.id && <Alert severity="info">Select a saved book to view its details.</Alert>}
        {query.isFetching && <LinearProgress aria-label="Refreshing book details" />}
        {query.isError && (
          <Alert
            severity="error"
            action={
              <Button size="small" onClick={() => query.refetch()}>
                Retry
              </Button>
            }
          >
            Could not load book details. Current saved data and any open copy draft are retained.
          </Alert>
        )}
        {!currentBook && query.isFetching && <BookViewDetailSkeleton />}
        {currentBook && (
          <>
            <Grid container spacing={2} alignItems="flex-start">
              <Box sx={{ bgcolor: 'background.paper', width: '100%', mb: 1 }}>
                <BookViewBasicDetail book={currentBook} />
              </Box>
            </Grid>
            <Card sx={{ p: 2, bgcolor: 'background.paper' }}>
              <Typography variant="h6" color="primary" fontWeight={600} sx={{ mb: 2 }}>
                Book Copies
              </Typography>
              {!copies.length && (
                <EmptyContent
                  title="No physical copies recorded"
                  description="Add saved copies through the book editor before issuing or printing labels."
                />
              )}
              <Grid container spacing={3}>
                {copies.map((copy) => {
                  const savedCopy = { ...copy, bookId: currentBook.id, book: currentBook };
                  return (
                    <Grid size={{ xs: 12, md: 4 }} key={copy.copyId || copy.id || copy.accessionNo}>
                      <BookCopyCard
                        bookId={currentBook.id}
                        copy={copy}
                        onInventoryActions={() => setSelected(savedCopy)}
                        onChangeStatus={() => handleChangeStatus(savedCopy)}
                        onIssueBook={() => handleIssueBook(savedCopy)}
                        onReturnBook={() => handleReturnBook(savedCopy)}
                        onBookHistory={() => handleBookHistory(savedCopy)}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Card>
          </>
        )}
      </Scrollbar>
      {selected && (
        <CopyLifecycleDialogs
          key={`${selected.book.id}:${selected.copyId}`}
          bookId={selected.book.id}
          copyId={selected.copyId || ''}
          accessionNumber={selected.accessionNo}
          onClose={() => setSelected(null)}
          onChangeStatus={() => handleChangeStatus(selected)}
          onReturnBook={() => handleReturnBook(selected)}
        />
      )}
    </Box>
  );
}
