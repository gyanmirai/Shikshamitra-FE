import React from 'react';
import { Box, Card, Grid, Typography, CardContent } from '@mui/material';

import type { IBookInformationCardProps } from './type';

const BookInformationCard: React.FC<IBookInformationCardProps> = ({ book }) => {
  console.log('book--->', book);

  return (
    <Box sx={{ p: 2 }}>
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Typography variant="h6" color="primary.main" gutterBottom>
            Book Information
          </Typography>

          <Grid container spacing={3}>
            {/* Row 1 */}
            <Grid size={{ xs: 12, sm: 2, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Book Title
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {book?.title}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Book Category
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {book?.category}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Language
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {book?.language}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Publisher
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {book?.publisher}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Damaged Book
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {book?.damagedBook}
              </Typography>
            </Grid>

            {/* Row 2 */}
            <Grid size={{ xs: 12, sm: 2, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Author
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {book?.author}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Edition
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {book?.edition}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Subject
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {book?.subject}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                No. of Copies
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {book?.numberOfCopies}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                Available Books
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {book?.availableBook}
              </Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 2, md: 3 }}>
              <Typography variant="subtitle2" color="text.secondary">
                ISBN
              </Typography>
              <Typography variant="body1" fontWeight="600">
                {book?.isbn}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BookInformationCard;
