import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';
import { Box, Grid, Paper, Skeleton, Stack, Typography } from '@mui/material';

import type { SeatingPlanListRow } from '../../types';

interface SummaryCardDef {
  key: string;
  label: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
  count: (rows: SeatingPlanListRow[]) => number;
}

const CARD_DEFS: SummaryCardDef[] = [
  {
    key: 'requiring-seating',
    label: 'Exams Requiring Seating',
    icon: 'mdi:clipboard-list-outline',
    color: 'primary',
    count: (rows) => rows.filter((r) => r.status !== 'published').length,
  },
  {
    key: 'in-progress',
    label: 'Allocation In Progress',
    icon: 'mdi:progress-clock',
    color: 'info',
    count: (rows) => rows.filter((r) => r.status === 'in-progress').length,
  },
  {
    key: 'ready-for-review',
    label: 'Ready for Review',
    icon: 'mdi:clipboard-check-outline',
    color: 'warning',
    count: (rows) => rows.filter((r) => r.status === 'ready').length,
  },
  {
    key: 'fully-allocated',
    label: 'Fully Allocated',
    icon: 'mdi:check-decagram-outline',
    color: 'success',
    count: (rows) => rows.filter((r) => r.status === 'completed' || r.status === 'published').length,
  },
  {
    key: 'capacity-issues',
    label: 'Capacity Issues',
    icon: 'mdi:alert-octagon-outline',
    color: 'error',
    count: (rows) => rows.filter((r) => r.capacityStatus === 'shortage').length,
  },
  {
    key: 'published',
    label: 'Published Plans',
    icon: 'mdi:send-check-outline',
    color: 'success',
    count: (rows) => rows.filter((r) => r.status === 'published').length,
  },
];

interface Props {
  rows: SeatingPlanListRow[];
  isLoading?: boolean;
  activeFilter?: string | null;
  onFilterClick?: (key: string) => void;
}

export default function SeatingPlanSummaryCards({ rows, isLoading, activeFilter, onFilterClick }: Props) {
  return (
    <Grid container spacing={1} sx={{ mb: 1.5 }}>
      {CARD_DEFS.map((cardDef) => (
        <Grid key={cardDef.key} size={{ xs: 6, sm: 4, md: 2 }}>
          <Paper
            onClick={() => onFilterClick?.(cardDef.key)}
            elevation={0}
            sx={{
              minHeight: 66,
              p: 1.5,
              borderRadius: 1.5,
              border: '1px solid',
              borderColor: activeFilter === cardDef.key ? `${cardDef.color}.main` : 'divider',
              boxShadow:
                activeFilter === cardDef.key
                  ? (theme) => `0 0 0 1px ${theme.palette[cardDef.color].main}`
                  : 'none',
              cursor: onFilterClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              '&:hover': onFilterClick
                ? { borderColor: `${cardDef.color}.main`, transform: 'translateY(-1px)' }
                : undefined,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.25,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => varAlpha(theme.vars.palette[cardDef.color].mainChannel, 0.12),
                  color: `${cardDef.color}.main`,
                  flexShrink: 0,
                }}
              >
                <Iconify icon={cardDef.icon} width={20} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                {isLoading ? (
                  <Skeleton variant="text" width={36} height={24} />
                ) : (
                  <Typography variant="h5" fontWeight={700} lineHeight={1}>
                    {cardDef.count(rows)}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary" noWrap display="block" mt={0.5}>
                  {cardDef.label}
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
