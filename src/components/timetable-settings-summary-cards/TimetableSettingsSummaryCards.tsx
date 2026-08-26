'use client';

import { Iconify } from 'src/components/iconify';
import { varAlpha } from 'src/theme/styles';
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
              minHeight: 66,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              border: '1px solid',
              borderColor: card.isActive ? `${card.color ?? 'primary'}.main` : 'divider',
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              boxShadow: card.isActive
                ? (theme) => `0 0 0 1px ${theme.palette[card.color ?? 'primary'].main}`
                : 'none',
              cursor: card.onClick ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              ...(card.onClick && {
                '&:hover': {
                  borderColor: `${card.color ?? 'primary'}.main`,
                  transform: 'translateY(-1px)',
                },
              }),
            }}
          >
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 1.25,
                display: 'grid',
                placeItems: 'center',
                flexShrink: 0,
                bgcolor: (theme) =>
                  varAlpha(theme.vars.palette[card.color ?? 'primary'].mainChannel, 0.12),
                color: `${card.color ?? 'primary'}.main`,
              }}
            >
              <Iconify icon={card.icon} width={20} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h5" fontWeight={700} lineHeight={1} noWrap>
                {card.value}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block" mt={0.5}>
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

