import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Paper, Typography } from '@mui/material';

export default function FeeGeneralInfoCard({ feeStructure }: { feeStructure: any }) {
  return (
    <Paper
      sx={{
        borderRadius: 2,
        p: 2,
        mt: 2,
      }}
      elevation={6}
    >
      {/* Header */}
      <Box display="flex" alignItems="center" mb={2} gap={1}>
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: '6px',
            bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.15),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Iconify icon="solar:document-outline" width={20} color="primary.main" />
        </Box>

        <Typography variant="h6" color="primary.main">
          General Information
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Fee Structure Name */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Fee Structure Name
          </Typography>
          <Typography variant="subtitle2">{feeStructure?.feeStructureName || '-'}</Typography>
        </Grid>

        {/* Academic Year */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Academic Year
          </Typography>
          <Typography variant="subtitle2">{feeStructure?.academicYearName || '-'}</Typography>
        </Grid>

        {/* Board */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Board
          </Typography>
          <Typography variant="subtitle2">{feeStructure?.boardName || '-'}</Typography>
        </Grid>

        {/* Medium */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Medium
          </Typography>
          <Typography variant="subtitle2">{feeStructure?.mediumName || '-'}</Typography>
        </Grid>

        {/* Receipt Book */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Receipt Book
          </Typography>
          <Typography variant="subtitle2">{feeStructure?.receiptBook || '-'}</Typography>
        </Grid>

        {/* Payment Methods */}
        <Grid size={{ xs: 12, md: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Payment Methods
          </Typography>
          <Typography variant="subtitle2">
            {(feeStructure?.paymentMethod || []).join(', ') || '-'}
          </Typography>
        </Grid>
      </Grid>
    </Paper>
  );
}
