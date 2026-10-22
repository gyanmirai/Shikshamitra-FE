import { alpha } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { formatNumber } from 'src/utils/formate_number';
import { Box, Card, Grid, Typography } from '@mui/material';

// ─── Types ────────────────────────────────────────────────────────────────────

interface SummaryCardConfig {
  label: string;
  value: number;
  icon: string;
  colorKey: string;
  helperText: string;
}

interface Props {
  allocatedAmount: number;
  unallocatedAmount: number;
}

// ─── Sub-component ────────────────────────────────────────────────────────────

const SummaryCard = ({ label, value, icon, colorKey }: SummaryCardConfig) => (
  <Card
    variant="outlined"
    sx={{
      p: 1.25,
      borderRadius: 2,
      display: 'flex',
      alignItems: 'center',
      gap: 1.25,
      borderColor: `${colorKey}.light`,
      bgcolor: (theme) => alpha(theme.palette[colorKey as 'primary']?.main ?? '#000', 0.04),
    }}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        borderRadius: 1.5,
        bgcolor: (theme) => alpha(theme.palette[colorKey as 'primary']?.main ?? '#000', 0.12),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <Iconify icon={icon} width={20} sx={{ color: `${colorKey}.main` }} />
    </Box>
    <Box flex={1} minWidth={0}>
      <Typography variant="caption" color="text.secondary" display="block" noWrap>
        {label}
      </Typography>
      <Typography variant="subtitle2" fontWeight={700} color={`${colorKey}.main`}>
        ₹{formatNumber(value)}
      </Typography>
    </Box>
  </Card>
);

// ─── Component ────────────────────────────────────────────────────────────────

const PaymentSummaryCards = ({ allocatedAmount, unallocatedAmount }: Props) => {
  const cards: SummaryCardConfig[] = [
    {
      label: 'Allocated',
      value: allocatedAmount,
      icon: 'solar:check-circle-bold',
      colorKey: 'success',
      helperText: 'Distributed across items below',
    },
    {
      label: 'Unallocated',
      value: unallocatedAmount,
      icon: 'solar:danger-circle-bold',
      colorKey: unallocatedAmount > 0 ? 'warning' : 'success',
      helperText: unallocatedAmount > 0 ? 'Excess — not applied to any item' : 'Fully utilised',
    },
  ];

  return (
    <Grid container spacing={1}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 6 }}>
          <SummaryCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
};

export default PaymentSummaryCards;
