'use client';

import { Box, Grid, Typography } from '@mui/material';

import type { ILibraryChargeData } from './type';

export default function LibraryChargeInfo({ charge }: { charge: ILibraryChargeData | null }) {
  return (
    <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 2, mb: 2 }}>
      {/* Heading */}
      <Typography variant="h6" mb={2} color="primary.main">
        Library Charge Details
      </Typography>

      <Grid container spacing={2}>
        {/* Member Name */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Member Name
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {charge?.memberName}
          </Typography>
        </Grid>

        {/* Role */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Role
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {charge?.role}
          </Typography>
        </Grid>

        {/* Member ID */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Member ID
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {charge?.memberId}
          </Typography>
        </Grid>

        {/* Class / Division */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="body2" color="text.secondary">
            Class / Division
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {charge?.class}
            {charge?.division ? `-${charge?.division}` : ''}
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
}
