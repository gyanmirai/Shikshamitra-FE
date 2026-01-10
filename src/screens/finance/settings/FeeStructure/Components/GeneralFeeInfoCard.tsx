import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box, Grid, Card, Button, Divider, Collapse, Typography, IconButton } from '@mui/material';

export default function FeeGeneralInfoCard({ feeStructure }: { feeStructure: any }) {
  const isExpanded = useBoolean(false);

  const renderLabelValue = (label: string, value: string) => (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ display: 'block', mb: 0.5, fontWeight: 500 }}
      >
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
        {value || '-'}
      </Typography>
    </Box>
  );

  return (
    <Card
      sx={{
        borderRadius: 2,
        mt: 2,
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
          cursor: 'pointer',
          bgcolor: (theme) => varAlpha(theme.palette.primary.mainChannel, 0.04),
        }}
        onClick={isExpanded.onToggle}
      >
        <Box display="flex" alignItems="center" gap={2}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '10px',
              bgcolor: 'white',
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
              {feeStructure?.feeStructureName || 'New Fee Structure'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Academic Year: {feeStructure?.academicYearName || 'Not selected'}
            </Typography>
          </Box>
        </Box>

        <Box display="flex" alignItems="center" gap={1}>
          <Button
            size="small"
            startIcon={<Iconify icon="solar:pen-bold-duotone" />}
            sx={{ display: isExpanded.value ? 'flex' : 'none' }}
            onClick={(e) => {
              e.stopPropagation();
              // Handle edit action if needed, or rely on just viewing
            }}
          >
            Edit
          </Button>
          <IconButton
            size="small"
            onClick={isExpanded.onToggle}
            sx={{
              transform: isExpanded.value ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s',
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>
      </Box>

      <Collapse in={isExpanded.value}>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <Box sx={{ p: 3, bgcolor: 'white' }}>
          <Grid container spacing={3}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {renderLabelValue('Board', feeStructure?.boardName)}
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {renderLabelValue('Medium', feeStructure?.mediumName)}
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {renderLabelValue('Receipt Book', feeStructure?.receiptBook)}
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              {renderLabelValue('Payment Methods', (feeStructure?.paymentMethod || []).join(', '))}
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Card>
  );
}
