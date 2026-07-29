'use client';

import { Iconify } from 'src/components/iconify';
import { Box, Card, Grid, Stack, Typography } from '@mui/material';

type InsightCard = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
};

type Student360InsightCardsProps = {
  cards: InsightCard[];
};

export function Student360InsightCards({ cards }: Student360InsightCardsProps) {
  return (
    <Grid container spacing={1}>
      {cards.map((card) => (
        <Grid key={card.label} size={{ xs: 12, sm: 6, md: 3 }}>
          <Card variant="outlined" sx={{ p: 2, borderRadius: 2, height: '100%' }}>
            <Stack direction="row" spacing={1.25} alignItems="flex-start">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: 1,
                  display: 'grid',
                  placeItems: 'center',
                  bgcolor: (theme) => `${theme.palette[card.color].main}14`,
                  color: `${card.color}.main`,
                  flexShrink: 0,
                }}
              >
                <Iconify icon={card.icon} width={20} />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="caption" color="text.secondary">
                  {card.label}
                </Typography>
                <Typography variant="h5" sx={{ lineHeight: 1.2 }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.helper}
                </Typography>
              </Box>
            </Stack>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

export type { InsightCard };
