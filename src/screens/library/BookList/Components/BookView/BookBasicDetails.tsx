import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import React from 'react';
import { Label } from 'src/components/label';
import { Box, Card, Stack, Divider, Typography } from '@mui/material';

interface BookViewDetailProps {
  book: IBook;
}

const BookViewBasicDetail: React.FC<BookViewDetailProps> = ({ book }) => (
  <Card
    sx={{
      display: 'flex',
      gap: 3,
      p: 2,
      borderRadius: 2,
      boxShadow: 'var(--shadows-8)',
      bgcolor: 'background.paper',
    }}
  >
    {/* Left: Book Cover */}
    <Box
      component="img"
      src={book.bookCoverImages?.[0] || '/placeholder-book.jpg'}
      alt={book.title}
      sx={{
        width: 240,
        height: 280,
        borderRadius: 2,
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />

    {/* Right: Book Info */}
    <Stack spacing={1.2}>
      <Typography variant="h6" color="primary.main">
        {book.title}
      </Typography>

      <Stack direction="row" spacing={1}>
        <Typography variant="body2" color="text.secondary">
          Author :
        </Typography>
        <Typography sx={{ fontWeight: 300 }} variant="body2">
          {book.author}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Typography variant="body2" color="text.secondary">
          Publisher :
        </Typography>
        <Typography sx={{ fontWeight: 300 }} variant="body2">
          {book.publisher}
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Typography variant="body2" color="text.secondary">
          Subject :
        </Typography>
        <Typography sx={{ fontWeight: 300 }} variant="body2">
          {book.subject}
        </Typography>
      </Stack>

      {/* Description */}
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        <Typography variant="body2" color="text.secondary">
          Description:
        </Typography>
        <Typography sx={{ fontWeight: 300 }} variant="body2">
          A comprehensive guide to advanced programming concepts and techniques. This book covers
          modern programming paradigms.
        </Typography>
      </Stack>

      <Stack direction="row" spacing={1}>
        <Typography variant="body2" color="text.secondary">
          ISBN :
        </Typography>
        <Typography sx={{ fontWeight: 300 }} variant="body2">
          {book.isbn}
        </Typography>
      </Stack>

      {/* Creation Date */}
      {book.createdOn && (
        <Stack direction="row" spacing={1}>
          <Typography variant="body2" color="text.secondary">
            Creation Date :
          </Typography>
          <Typography sx={{ fontWeight: 300 }} variant="body2">
            {new Date(book.createdOn).toLocaleDateString()}
          </Typography>
        </Stack>
      )}

      {/* Book stats */}
      <Divider />
      <Stack direction="row" spacing={1.5}>
        <Label color="default">Total Issued : {book.totalBook || 0}</Label>
        <Divider orientation="vertical" flexItem />
        <Label color="success">Available : {book.availableBook || 0}</Label>
        <Divider orientation="vertical" flexItem />
        <Label color="error">Overdue : {book.overDuedBook || 0}</Label>
      </Stack>
    </Stack>
  </Card>
);

export default BookViewBasicDetail;
