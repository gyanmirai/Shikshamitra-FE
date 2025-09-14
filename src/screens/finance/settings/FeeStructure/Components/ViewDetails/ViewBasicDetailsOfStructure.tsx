import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

import type { IFeeStructure } from '../../type';

const ViewBasicDetailsOfStructure = ({ feeStructure }: { feeStructure: IFeeStructure | null }) => (
  <Paper sx={{ p: 2, mb: 3, position: 'relative' }} elevation={6}>
    {/* Heading */}
    <Typography variant="h6" mb={2} color="primary.main">
      Fee Structure Information
    </Typography>

    <Grid container spacing={2}>
      {/* Fee Structure Name */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Fee Structure Name
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {feeStructure?.feeStructureName || '-'}
        </Typography>
      </Grid>

      {/* Academic Year */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Academic Year
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {feeStructure?.academicYear || '-'}
        </Typography>
      </Grid>

      {/* Board */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Board
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {feeStructure?.board || '-'}
        </Typography>
      </Grid>

      {/* Medium */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Medium
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {feeStructure?.medium || '-'}
        </Typography>
      </Grid>

      {/* Status */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Status
        </Typography>
        <Typography
          variant="body1"
          fontWeight="600"
          color={feeStructure?.status === 1 ? 'success.main' : 'error.main'}
        >
          {feeStructure?.status === 1 ? 'Active' : 'Inactive'}
        </Typography>
      </Grid>

      {/* Receipt Book */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Typography variant="body2" color="text.secondary">
          Receipt Book
        </Typography>
        <Typography variant="body1" fontWeight="600">
          {feeStructure?.receiptBook || '-'}
        </Typography>
      </Grid>
    </Grid>
  </Paper>
);

export default ViewBasicDetailsOfStructure;
