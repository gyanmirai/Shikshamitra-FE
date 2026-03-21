import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Typography } from '@mui/material';

const DriverAttendanceCards = () => {
  const cards = [
    {
      title: 'Drivers Present',
      total: 15,
      trend: 'up',
      trendLabel: 'Improvement',
      color: 'success.main',
    },
    {
      title: 'Drivers Late',
      total: 3,
      trend: 'down',
      trendLabel: 'Decline',
      color: 'warning.main',
    },
    {
      title: 'Drivers Absent',
      total: 1,
      trend: 'up',
      trendLabel: 'Improvement',
      color: 'error.main',
    },
  ];

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' } }}>
      {cards.map((card) => (
        <Card key={card.title} sx={{ p: 3 }}>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
            {card.title}
          </Typography>

          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="h3">{card.total}</Typography>

            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Iconify
                icon={card.trend === 'up' ? 'eva:trending-up-fill' : 'eva:trending-down-fill'}
                sx={{
                  color: card.trendLabel === 'Improvement' ? 'success.main' : 'error.main',
                  width: 24,
                  height: 24,
                }}
              />
              <Typography
                variant="subtitle2"
                sx={{ color: card.trendLabel === 'Improvement' ? 'success.main' : 'error.main' }}
              >
                {card.trendLabel}
              </Typography>
            </Stack>
          </Stack>
        </Card>
      ))}
    </Box>
  );
};

export default DriverAttendanceCards;
