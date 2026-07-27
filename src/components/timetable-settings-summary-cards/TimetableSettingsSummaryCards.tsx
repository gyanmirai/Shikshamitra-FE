'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Grid, Typography } from '@mui/material';

export interface ITimetableSummaryCard {
  label: string;
  value: number;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

interface TimetableSettingsSummaryCardsProps {
  cards: ITimetableSummaryCard[];
}

export function TimetableSettingsSummaryCards({ cards }: TimetableSettingsSummaryCardsProps) {
  return (
    <Grid container spacing={1} sx={{ mb: 1 }}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 6, sm: 4, md: 12 / cards.length }}>
          <Card
            sx={{
              p: 1.75,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              boxShadow: 'var(--shadows-3)',
            }}
          >
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                bgcolor: (theme) =>
                  `color-mix(in srgb, ${theme.palette[card.color ?? 'primary'].main} 14%, transparent)`,
                color: `${card.color ?? 'primary'}.main`,
              }}
            >
              <Iconify icon={card.icon} width={20} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h6" fontWeight={700} noWrap>
                {card.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                {card.label}
              </Typography>
            </Box>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
