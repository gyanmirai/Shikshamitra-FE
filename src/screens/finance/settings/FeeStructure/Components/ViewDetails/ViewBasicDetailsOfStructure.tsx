import React from 'react';
import { Label } from 'src/components/label';
import { useTheme } from '@mui/material/styles';
import { Box, Card, Grid, Divider, CardHeader, Typography, CardContent } from '@mui/material';

import type { IFeeStructure } from '../../type';

const ViewBasicDetailsOfStructure = ({ feeStructure }: { feeStructure: IFeeStructure | null }) => {
  const theme = useTheme();

  const renderDetailItem = (label: string, value: string | number | undefined | null) => (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ mb: 0.5, display: 'block', fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography variant="subtitle2" color="text.primary" sx={{ fontWeight: 600 }}>
        {value || '-'}
      </Typography>
    </Box>
  );

  return (
    <Card
      sx={{
        mb: 3,
        borderRadius: 2,
        boxShadow: theme.shadows[2], // Soft shadow provided by theme
        overflow: 'visible', // Ensure content doesn't get clipped if we add popovers later, though not needed now
      }}
    >
      <CardHeader
        title="Fee Structure Information"
        subheader="Basic details associated with this structure"
        titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
        subheaderTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
        sx={{ pb: 2 }}
      />
      <Divider sx={{ borderStyle: 'dashed' }} />

      <CardContent sx={{ pt: 3 }}>
        <Grid container spacing={3}>
          {/* Fee Structure Name */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            {renderDetailItem('Fee Structure Name', feeStructure?.feeStructureName)}
          </Grid>

          {/* Academic Year */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            {renderDetailItem('Academic Year', feeStructure?.academicYear)}
          </Grid>

          {/* Board */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            {renderDetailItem('Board', feeStructure?.board)}
          </Grid>

          {/* Medium */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            {renderDetailItem('Medium', feeStructure?.medium)}
          </Grid>

          {/* Receipt Book */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            {renderDetailItem('Receipt Book', feeStructure?.receiptBook)}
          </Grid>

          {/* Status - Special handling for Label */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ mb: 0.5, display: 'block', fontWeight: 500 }}
            >
              Status
            </Typography>
            <Label
              variant="soft"
              color={feeStructure?.status === 1 ? 'success' : 'error'}
              sx={{ textTransform: 'uppercase', fontWeight: 700 }}
            >
              {feeStructure?.status === 1 ? 'Active' : 'Inactive'}
            </Label>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ViewBasicDetailsOfStructure;
