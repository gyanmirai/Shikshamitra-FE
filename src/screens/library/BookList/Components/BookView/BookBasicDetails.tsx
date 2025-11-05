import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import Image from 'next/image';
import React, { useMemo, useState } from 'react';
import { Iconify } from 'src/components/iconify';
import { ExpandMore } from '@mui/icons-material';
import {
  Box,
  Grid,
  Stack,
  Accordion,
  Typography,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';

import noCover from '../../../../../assets/icons/no-cover.png';

interface BookViewDetailProps {
  book: IBook | null;
}

const BookViewBasicDetail: React.FC<BookViewDetailProps> = ({ book }) => {
  const [expandedBook, setExpandedBook] = useState(false);

  const details = useMemo(
    () => [
      { label: 'Title', icon: 'mdi:book-outline', value: book?.title || '—' },
      { label: 'Author', icon: 'mdi:account', value: book?.author || '—' },
      { label: 'Publisher', icon: 'mdi:office-building', value: book?.publisher || '—' },
      { label: 'Subject', icon: 'mdi:book-open-variant', value: book?.subject || '—' },
      { label: 'ISBN', icon: 'mdi:barcode', value: book?.isbn || '—' },
      {
        label: 'Added On',
        icon: 'mdi:calendar-month',
        value: book?.createdOn ? new Date(book.createdOn).toLocaleDateString() : '—',
      },
      { label: 'Language', icon: 'mdi:translate', value: book?.language || '—' },
      { label: 'Edition', icon: 'mdi:book-edit-outline', value: book?.edition || '—' },
      { label: 'Category', icon: 'mdi:tag-multiple', value: book?.category || '—' },
      {
        label: 'No. of Pages',
        icon: 'mdi:file-document-multiple-outline',
        value: book?.numberOfPages || '—',
      },
      {
        label: 'Price',
        icon: 'mdi:currency-inr',
        value: book?.price ? `₹${book.price.toFixed(2)}` : '—',
      },
      {
        label: 'Publish Date',
        icon: 'mdi:calendar-check',
        value: book?.publishDate ? new Date(book.publishDate).toLocaleDateString() : '—',
      },
      { label: 'Section', icon: 'uit:web-section', value: book?.section || '—' },
      { label: 'Shelf', icon: 'mdi:bookshelf', value: book?.shelf || '—' },
      {
        label: 'Description',
        icon: 'mdi:file-document-outline',
        value:
          book?.discription ||
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae eros eget tellus tristique bibendum.',
      },
    ],
    [book]
  );

  return (
    <Accordion
      expanded={expandedBook}
      onChange={() => setExpandedBook(!expandedBook)}
      sx={{
        boxShadow: 1,
        borderRadius: '12px !important',
        '&:before': { display: 'none' },
        border: '1px solid',
        borderColor: 'divider',
        mb: 2,
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
        sx={{
          '& .MuiAccordionSummary-content': {
            my: 1.5,
            display: 'block',
          },
        }}
      >
        <Typography variant="h6" color="primary.main" mb={expandedBook ? 0 : 1}>
          Book Details
        </Typography>

        {/* Show preview when collapsed */}
        {!expandedBook && (
          <Grid container spacing={2} mt={0.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon="mdi:book-outline" width={18} color="text.secondary" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                  >
                    Title:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ fontSize: '0.75rem' }}
                    noWrap
                  >
                    {book?.title || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon="mdi:account" width={18} color="text.secondary" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                  >
                    Author:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ fontSize: '0.75rem' }}
                    noWrap
                  >
                    {book?.author || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Iconify icon="mdi:barcode" width={18} color="text.secondary" />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ fontSize: '0.65rem', lineHeight: 1.2 }}
                  >
                    ISBN:
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color="text.primary"
                    sx={{ fontSize: '0.75rem' }}
                    noWrap
                  >
                    {book?.isbn || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        )}
      </AccordionSummary>

      <AccordionDetails sx={{ pt: 0 }}>
        <Box width="100%">
          <Grid container spacing={3}>
            {/* Book Cover */}
            <Grid size={{ xs: 12, md: 2 }}>
              <Image
                src={book?.bookCoverImages?.[0] || noCover}
                alt={book?.title || 'No Preview'}
                width={250}
                height={250}
                unoptimized
                style={{
                  width: '100%',
                  height: '180px',
                  maxWidth: 150,
                  borderRadius: 8,
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              />
            </Grid>

            {/* Book Details - 5 per row */}
            <Grid size={{ xs: 12, md: 10 }}>
              <Grid container spacing={2}>
                {details.map((d) => (
                  <Grid
                    key={d.label}
                    size={{ xs: 12, sm: 6, md: d.label === 'Description' ? 12 : 2.4 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems={d.label === 'Description' ? 'flex-start' : 'center'}
                    >
                      <Iconify
                        icon={d.icon}
                        width={20}
                        color="text.secondary"
                        sx={{ mt: d.label === 'Description' ? 0.5 : 0 }}
                      />
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          display="block"
                          sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                        >
                          {d.label}:
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color="text.primary"
                          sx={{
                            fontSize: '0.8rem',
                            ...(d.label === 'Description' ? { lineHeight: 1.6 } : {}),
                          }}
                          noWrap={d.label !== 'Description'}
                        >
                          {d.value}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
};

export default BookViewBasicDetail;
