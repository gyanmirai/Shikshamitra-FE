'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Grid, Typography } from '@mui/material';

export interface ITimetableSummaryCard {
  label: string;
  value: string | number;
  icon: string;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  onClick?: () => void;
  isActive?: boolean;
}

interface TimetableSettingsSummaryCardsProps {
  cards: ITimetableSummaryCard[];
  cardsPerRow?: number;
}

export function TimetableSettingsSummaryCards({ cards, cardsPerRow }: TimetableSettingsSummaryCardsProps) {
  return (
    <Grid container spacing={1} sx={{ mb: 1 }}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 6, sm: 4, md: cardsPerRow ? (12 / cardsPerRow) : (12 / cards.length) }}>
          <Card
            onClick={card.onClick}
            sx={{
              p: 1.75,
              display: 'flex',
              alignItems: 'center',
              gap: 1.5,
              boxShadow: 'var(--shadows-3)',
              cursor: card.onClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease-in-out',
              ...(card.isActive && {
                border: (theme) => `2px solid ${theme.palette[card.color ?? 'primary'].main}`,
                bgcolor: (theme) =>
                  `color-mix(in srgb, ${theme.palette[card.color ?? 'primary'].main} 8%, transparent)`,
              }),
              ...(card.onClick && {
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: 'var(--shadows-8)',
                },
              }),
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

export default TimetableSettingsSummaryCards;

