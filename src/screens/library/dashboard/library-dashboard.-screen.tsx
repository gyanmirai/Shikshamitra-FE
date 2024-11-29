'use client';

import React from 'react';

import { Box, Grid, Card, Button, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

const LibraryDashboardScreen = () => (
  <Box>
    <CustomBreadcrumbs
      heading="Library Dashboard"
      links={[{ name: 'Library' }, { name: 'Dashboard' }]}
      sx={{ px: 1, mb: 2 }}
    />

    <Grid container spacing={3}>
      {/* Total Books Available Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total Books</Typography>
          <Typography variant="h4" color="primary">
            1,250
          </Typography>
        </Card>
      </Grid>

      {/* Books Issued Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Books Issued</Typography>
          <Typography variant="h4" color="warning">
            350
          </Typography>
        </Card>
      </Grid>

      {/* Total Students Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Total Students</Typography>
          <Typography variant="h4" color="success">
            800
          </Typography>
        </Card>
      </Grid>

      {/* Reserved Books Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Reserved Books</Typography>
          <Typography variant="h4" color="secondary">
            50
          </Typography>
        </Card>
      </Grid>

      {/* Pending Returns Card */}
      <Grid item xs={12} sm={6} md={4}>
        <Card sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Pending Returns</Typography>
          <Typography variant="h4" color="error">
            20
          </Typography>
        </Card>
      </Grid>
    </Grid>

    <Box sx={{ mt: 3 }}>
      {/* Quick Actions */}
      <Typography variant="h6" gutterBottom>
        Quick Actions
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            color="primary"
            startIcon={<Iconify icon="mdi:book-plus" />}
          >
            Add New Book
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            color="secondary"
            startIcon={<Iconify icon="mdi:book-open-page-variant" />}
          >
            Issue Book
          </Button>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            fullWidth
            variant="contained"
            color="warning"
            startIcon={<Iconify icon="mdi:book-minus" />}
          >
            Return Book
          </Button>
        </Grid>
      </Grid>
    </Box>
  </Box>
);

export default LibraryDashboardScreen;
