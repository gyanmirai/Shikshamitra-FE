import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Grid, Paper, Stack, Skeleton, ButtonBase, Typography } from '@mui/material';

import SeatingPlanSummaryChips from './SeatingPlanSummaryChips';
import { SEATING_PLAN_SUMMARIES } from './seating-plan-summary-config';

import type { SeatingPlanListRow } from '../../types';

interface Props {
  rows: SeatingPlanListRow[];
  isLoading?: boolean;
  activeFilter?: string | null;
  onFilterClick?: (key: string) => void;
}

export default function SeatingPlanSummaryCards({
  rows,
  isLoading,
  activeFilter,
  onFilterClick,
}: Props) {
  return (
    <>
      <SeatingPlanSummaryChips
        rows={rows}
        isLoading={isLoading}
        activeFilter={activeFilter}
        onFilterClick={onFilterClick}
      />
      <Grid container spacing={1} sx={{ mb: 1.5, display: { xs: 'none', sm: 'flex' } }}>
        {SEATING_PLAN_SUMMARIES.map((cardDef) => (
          <Grid key={cardDef.key} size={{ xs: 6, sm: 4, md: 2 }}>
            <Paper
              elevation={0}
              sx={{
                minHeight: 66,
                borderRadius: 1.5,
                border: '1px solid',
                borderColor: activeFilter === cardDef.key ? `${cardDef.color}.main` : 'divider',
                boxShadow:
                  activeFilter === cardDef.key
                    ? (theme) => `0 0 0 1px ${theme.palette[cardDef.color].main}`
                    : 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease',
                '&:hover': onFilterClick
                  ? { borderColor: `${cardDef.color}.main`, transform: 'translateY(-1px)' }
                  : undefined,
              }}
            >
              <ButtonBase
                disabled={!onFilterClick}
                aria-pressed={activeFilter === cardDef.key}
                onClick={() => onFilterClick?.(cardDef.key)}
                sx={{ width: 1, minHeight: 66, p: 1.5, justifyContent: 'flex-start' }}
              >
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.25,
                      display: 'grid',
                      placeItems: 'center',
                      bgcolor: (theme) =>
                        varAlpha(theme.vars.palette[cardDef.color].mainChannel, 0.12),
                      color: `${cardDef.color}.main`,
                      flexShrink: 0,
                    }}
                  >
                    <Iconify icon={cardDef.icon} width={20} />
                  </Box>
                  <Box sx={{ minWidth: 0, textAlign: 'left' }}>
                    {isLoading ? (
                      <Skeleton variant="text" width={36} height={24} />
                    ) : (
                      <Typography variant="h5" fontWeight={700} lineHeight={1}>
                        {cardDef.count(rows)}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      display="block"
                      mt={0.5}
                    >
                      {cardDef.label}
                    </Typography>
                  </Box>
                </Stack>
              </ButtonBase>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
