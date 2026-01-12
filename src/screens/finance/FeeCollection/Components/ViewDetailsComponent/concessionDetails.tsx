import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { alpha, useTheme } from '@mui/material/styles';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Box, Card, Chip, Stack, Avatar, Typography, CardContent } from '@mui/material';

const concessions = [
  {
    title: 'Sibling Discount',
    subTitle: 'Tuition Fee',
    amount: 2000,
  },
  {
    title: 'Scholarship',
    subTitle: 'Tuition Fee, Transport Fee',
    amount: 800,
  },
  {
    title: 'Parents Child',
    subTitle: 'Tuition Fee',
    amount: 1000,
  },
];

export default function ConcessionsCard() {
  const theme = useTheme();
  const total = concessions.reduce((acc, c) => acc + c.amount, 0);

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 450,
        boxShadow: theme.customShadows?.card || theme.shadows[3],
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Concessions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Applied discounts & waivers
          </Typography>
        </Box>

        <Chip
          label={`₹ ${total.toLocaleString('en-IN')} Saved`}
          color="primary"
          variant="soft"
          sx={{
            fontWeight: 700,
            borderRadius: 1,
            height: 32,
            px: 0.5,
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: 'primary.main',
          }}
        />
      </Box>

      <CardContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Scrollbar sx={{ flexGrow: 1, px: 3, pb: 3, maxHeight: '100%' }}>
          <Stack spacing={2}>
            {concessions.map((item, index) => (
              <Box
                key={index}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.neutral || theme.palette.grey[100], 0.5),
                  border: '1px solid',
                  borderColor: alpha(theme.palette.grey[500], 0.08),
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'background.paper',
                    boxShadow: theme.customShadows?.z4 || theme.shadows[4],
                    borderColor: 'transparent',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Avatar
                  variant="rounded"
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: 'primary.main',
                  }}
                >
                  <LocalOfferIcon />
                </Avatar>

                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {item.subTitle}
                  </Typography>
                </Box>

                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'success.main' }}>
                  ₹{item.amount.toLocaleString('en-IN')}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      </CardContent>
    </Card>
  );
}
