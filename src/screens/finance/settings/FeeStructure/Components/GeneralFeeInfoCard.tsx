import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Typography } from '@mui/material';

export default function FeeGeneralInfoCard({ feeStructure }: { feeStructure: any }) {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: (theme) => `1px solid ${varAlpha(theme.palette.grey['500Channel'], 0.12)}`,
        boxShadow: (theme) => `0 4px 12px ${varAlpha(theme.palette.grey['500Channel'], 0.08)}`,
        overflow: 'hidden',
      }}
      elevation={0}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box display="flex" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'background.neutral',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: (theme) => `0 2px 8px ${varAlpha(theme.palette.grey['500Channel'], 0.15)}`,
            }}
          >
            <Iconify icon="solar:document-text-bold-duotone" width={24} color="primary.main" />
          </Box>

          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              {feeStructure?.name || 'New Fee Structure'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Academic Year: {feeStructure?.academicYearName || 'Not selected'}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Card>
  );
}
