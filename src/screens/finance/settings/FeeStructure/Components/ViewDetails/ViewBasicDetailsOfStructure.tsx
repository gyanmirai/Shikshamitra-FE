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
        mb: 1,
        borderRadius: 2,
        boxShadow: theme.shadows[2], // Soft shadow provided by theme
        overflow: 'visible', // Ensure content doesn't get clipped if we add popovers later, though not needed now
      }}
    >
      <CardHeader
        title="Fee Structure Information"
        subheader="Basic details associated with this structure"
        sx={{ p: 1 }}
        titleTypographyProps={{ variant: 'h6', fontWeight: 700 }}
        subheaderTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
        action={
          <Label
            variant="soft"
            color={feeStructure?.status === 1 ? 'success' : 'error'}
            sx={{ mr: 1 }}
          >
            {feeStructure?.status === 1 ? 'Active' : 'Inactive'}
          </Label>
        }
      />
      <Divider sx={{ borderStyle: 'dashed' }} />

      <CardContent sx={{ p: 1 }}>
        <Grid container spacing={2}>
          {/* Fee Structure Name */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            {renderDetailItem('Fee Structure Name', feeStructure?.name)}
          </Grid>

          {/* Academic Year */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            {renderDetailItem('Academic Year', feeStructure?.academicYearName)}
          </Grid>

          {/* Board */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            {renderDetailItem('Board', feeStructure?.boardName)}
          </Grid>

          {/* Medium */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            {renderDetailItem('Medium', feeStructure?.mediumName)}
          </Grid>

          {/* Receipt Book */}
          <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
            {renderDetailItem('Receipt Book', feeStructure?.receiptBookName)}
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ViewBasicDetailsOfStructure;
