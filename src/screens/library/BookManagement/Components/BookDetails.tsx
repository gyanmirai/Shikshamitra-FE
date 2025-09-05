import React from 'react';
import { Box } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

import IssuedBooksTable from './BookIssuedTable';
import BookInformationCard from './BookInformationCard';

import type { IBookPayload } from './type';

const BookDetails = ({ book }: { book: IBookPayload }) => (
  <Box sx={{ height: '100%' }}>
    <Scrollbar sx={{ height: '500px' }}>
      <BookInformationCard book={book} />
      <IssuedBooksTable />
    </Scrollbar>
  </Box>
);

export default BookDetails;
