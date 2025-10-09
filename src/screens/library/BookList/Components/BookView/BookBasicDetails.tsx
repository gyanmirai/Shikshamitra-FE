import type { IBook } from 'src/screens/library/BookManagement/Components/type';

import React from 'react';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Card, Stack, Paper, Typography } from '@mui/material';

interface BookViewDetailProps {
  book: IBook | null;
}

const BookViewBasicDetail: React.FC<BookViewDetailProps> = ({ book }) => (
  <Card
    sx={{
      display: 'flex',
      gap: 3,
      borderRadius: 0,
      boxShadow: 'none',
      bgcolor: 'background.paper',
    }}
  >
    <Box
      component="img"
      src={book?.bookCoverImages?.[0] || '/placeholder-book.jpg'}
      sx={{
        width: 240,
        height: 290,
        borderRadius: 2,
        objectFit: 'cover',
        flexShrink: 0,
      }}
    />
    <Box>
      <Typography variant="h6" color="primary.main">
        {book?.title}
      </Typography>
      <Grid container spacing={2} mt={1.5}>
        {/* Author */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Stack direction="row" spacing={3} alignItems="center" ml={2}>
              <Iconify icon="mdi:account" width={22} />
              <Box>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                  Author
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {book?.author || '—'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Publisher */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Stack direction="row" spacing={3} alignItems="center" ml={2}>
              <Iconify icon="mdi:office-building" width={22} color="#637381" />
              <Box>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                  Publisher
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {book?.publisher || '—'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Subject */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Stack direction="row" spacing={3} alignItems="center" ml={2}>
              <Iconify icon="mdi:book-open-variant" width={22} color="#637381" />
              <Box>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                  Subject
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {book?.subject || '—'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* ISBN */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper variant="outlined" sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}>
            <Stack direction="row" spacing={3} alignItems="center" ml={2}>
              <Iconify icon="mdi:barcode" width={22} color="#637381" />
              <Box>
                <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                  ISBN
                </Typography>
                <Typography variant="body1" fontWeight={600}>
                  {book?.isbn || '—'}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>

        {/* Creation Date */}
        {book?.createdOn && (
          <Grid size={{ xs: 12, md: 6 }}>
            <Paper variant="outlined" sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}>
              <Stack direction="row" spacing={3} alignItems="center" ml={2}>
                <Iconify icon="mdi:calendar-month" width={22} color="#637381" />
                <Box>
                  <Typography variant="caption" color="text.secondary" textTransform="uppercase">
                    Creation Date
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {new Date(book?.createdOn).toLocaleDateString()}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Description */}
      <Box mt={3}>
        <Paper variant="outlined" sx={{ p: 0.5, borderRadius: 2, bgcolor: 'grey.50' }}>
          <Stack direction="row" spacing={3} alignItems="center" ml={2}>
            <Iconify icon="mdi:file-document-outline" width={22} color="#637381" />
            <Box>
              <Typography variant="subtitle2" mb={0.5}>
                Description
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vitae eros eget
                tellus tristique bibendum.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      </Box>
    </Box>
  </Card>
);

export default BookViewBasicDetail;
