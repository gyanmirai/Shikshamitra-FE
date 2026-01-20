import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import Image from 'next/image';
import { alpha } from '@mui/material/styles';
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
        borderRadius: '14px !important',
        '&:before': { display: 'none' },
        mb: 2.5,
        overflow: 'hidden',
        boxShadow: (theme) => `0 2px 8px ${alpha(theme.palette.grey[500], 0.08)}`,
        bgcolor: 'background.paper',
      }}
    >
      <AccordionSummary
        expandIcon={
          <ExpandMore
            sx={{
              color: 'text.secondary',
              fontSize: 22,
            }}
          />
        }
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 0.5,
          minHeight: 56,
          '& .MuiAccordionSummary-content': {
            my: 1.5,
            display: 'block',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} mb={expandedBook ? 0 : 1}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) => alpha(theme.palette.primary.main, 0.1),
            }}
          >
            <Iconify icon="mdi:book-open-page-variant" width={20} color="primary.main" />
          </Box>
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 600,
              color: 'text.primary',
            }}
          >
            Book Details
          </Typography>
        </Stack>

        {/* Show preview when collapsed */}
        {!expandedBook && (
          <Grid container spacing={2} mt={0.5}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                  }}
                >
                  <Iconify icon="mdi:book-outline" width={16} color="primary.main" />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    display="block"
                    sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                  >
                    Title
                  </Typography>
                  <Typography variant="body2" fontWeight={500} color="text.primary" noWrap>
                    {book?.title || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.info.main, 0.08),
                  }}
                >
                  <Iconify icon="mdi:account" width={16} color="info.main" />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    display="block"
                    sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                  >
                    Author
                  </Typography>
                  <Typography variant="body2" fontWeight={500} color="text.primary" noWrap>
                    {book?.author || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: (theme) => alpha(theme.palette.warning.main, 0.08),
                  }}
                >
                  <Iconify icon="mdi:barcode" width={16} color="warning.main" />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography
                    variant="caption"
                    color="text.disabled"
                    display="block"
                    sx={{ fontSize: '0.7rem', lineHeight: 1.2 }}
                  >
                    ISBN
                  </Typography>
                  <Typography variant="body2" fontWeight={500} color="text.primary" noWrap>
                    {book?.isbn || '—'}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
        )}
      </AccordionSummary>

      <AccordionDetails
        sx={{
          px: { xs: 2, sm: 2.5 },
          py: 2.5,
          bgcolor: (theme) => alpha(theme.palette.grey[500], 0.02),
        }}
      >
        <Box width="100%">
          <Grid container spacing={3}>
            {/* Book Cover */}
            <Grid size={{ xs: 12, sm: 4, md: 2 }}>
              <Box
                sx={{
                  borderRadius: '10px',
                  overflow: 'hidden',
                  boxShadow: (theme) => `0 4px 12px ${alpha(theme.palette.grey[500], 0.15)}`,
                  maxWidth: { xs: 140, sm: '100%' },
                  mx: { xs: 'auto', sm: 0 },
                }}
              >
                <Image
                  src={book?.bookCoverImages?.[0] || noCover}
                  alt={book?.title || 'No Preview'}
                  width={250}
                  height={250}
                  unoptimized
                  style={{
                    width: '100%',
                    height: '180px',
                    objectFit: 'cover',
                    display: 'block',
                  }}
                />
              </Box>
            </Grid>

            {/* Book Details - 5 per row */}
            <Grid size={{ xs: 12, sm: 8, md: 10 }}>
              <Grid container spacing={2}>
                {details.map((d, index) => (
                  <Grid
                    key={d.label}
                    size={{ xs: 12, sm: 6, md: d.label === 'Description' ? 12 : 2.4 }}
                  >
                    <Stack
                      direction="row"
                      spacing={1.5}
                      alignItems={d.label === 'Description' ? 'flex-start' : 'center'}
                      sx={{
                        py: 1,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '6px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                          bgcolor: (theme) =>
                            alpha(
                              [
                                theme.palette.primary.main,
                                theme.palette.info.main,
                                theme.palette.success.main,
                                theme.palette.warning.main,
                                theme.palette.secondary.main,
                              ][index % 5],
                              0.08
                            ),
                          mt: d.label === 'Description' ? 0.25 : 0,
                        }}
                      >
                        <Iconify
                          icon={d.icon}
                          width={15}
                          sx={{
                            color: [
                              'primary.main',
                              'info.main',
                              'success.main',
                              'warning.main',
                              'secondary.main',
                            ][index % 5],
                          }}
                        />
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography
                          variant="caption"
                          color="text.disabled"
                          display="block"
                          sx={{
                            fontSize: '0.65rem',
                            lineHeight: 1.2,
                            mb: 0.25,
                          }}
                        >
                          {d.label}
                        </Typography>
                        <Typography
                          variant="body2"
                          fontWeight={500}
                          color="text.primary"
                          sx={{
                            fontSize: '0.8rem',
                            lineHeight: d.label === 'Description' ? 1.6 : 1.4,
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
