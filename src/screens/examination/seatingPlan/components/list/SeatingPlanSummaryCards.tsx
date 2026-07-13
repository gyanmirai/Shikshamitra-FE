import { Iconify } from 'src/components/iconify';
import { Box, Grid, Paper, Skeleton, Typography } from '@mui/material';

import type { SeatingPlanListRow } from '../../types';

interface SummaryCardDef {
  key: string;
  label: string;
  icon: string;
  color: string;
  count: (rows: SeatingPlanListRow[]) => number;
}

const CARD_DEFS: SummaryCardDef[] = [
  {
    key: 'requiring-seating',
    label: 'Exams Requiring Seating',
    icon: 'mdi:clipboard-list-outline',
    color: 'text.primary',
    count: (rows) => rows.filter((r) => r.status !== 'published').length,
  },
  {
    key: 'in-progress',
    label: 'Allocation In Progress',
    icon: 'mdi:progress-clock',
    color: 'info.main',
    count: (rows) => rows.filter((r) => r.status === 'in-progress').length,
  },
  {
    key: 'ready-for-review',
    label: 'Ready for Review',
    icon: 'mdi:clipboard-check-outline',
    color: 'warning.main',
    count: (rows) => rows.filter((r) => r.status === 'ready').length,
  },
  {
    key: 'fully-allocated',
    label: 'Fully Allocated',
    icon: 'mdi:check-decagram-outline',
    color: 'success.main',
    count: (rows) => rows.filter((r) => r.status === 'completed' || r.status === 'published').length,
  },
  {
    key: 'capacity-issues',
    label: 'Capacity Issues',
    icon: 'mdi:alert-octagon-outline',
    color: 'error.main',
    count: (rows) => rows.filter((r) => r.capacityStatus === 'shortage').length,
  },
  {
    key: 'published',
    label: 'Published Plans',
    icon: 'mdi:send-check-outline',
    color: 'success.dark',
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
    <Grid container spacing={1.5} sx={{ mb: 1.5 }}>
      {CARD_DEFS.map((cardDef) => (
        <Grid key={cardDef.key} size={{ xs: 6, sm: 4, md: 2 }}>
          <Paper
            onClick={() => onFilterClick?.(cardDef.key)}
            elevation={0}
            sx={{
              p: 1.25,
              borderRadius: 2,
              border: '1px solid',
              borderColor: activeFilter === cardDef.key ? 'primary.main' : 'divider',
              cursor: onFilterClick ? 'pointer' : 'default',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              height: '100%',
              transition: 'border-color 0.15s',
              '&:hover': onFilterClick ? { borderColor: 'primary.main' } : undefined,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Iconify icon={cardDef.icon} width={16} sx={{ color: cardDef.color }} />
              <Typography variant="caption" color="text.secondary" noWrap>
                {cardDef.label}
              </Typography>
            </Box>
            {isLoading ? (
              <Skeleton variant="text" width={36} height={28} />
            ) : (
              <Typography variant="h6" fontWeight={700} sx={{ color: cardDef.color }}>
                {cardDef.count(rows)}
              </Typography>
            )}
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
}
