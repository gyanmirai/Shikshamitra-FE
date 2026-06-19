import type { ConcessionDetail } from 'src/redux/feeCollection/feeCollection';

import React from 'react';
import { motion } from 'framer-motion';
import { varAlpha } from 'src/theme/styles';
import { useTheme } from '@mui/material/styles';
import { Scrollbar } from 'src/components/scrollbar';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import { Box, Card, Chip, Stack, Avatar, Typography, CardContent } from '@mui/material';

export default function ConcessionsCard({ concessions }: { concessions?: ConcessionDetail[] }) {
  const theme = useTheme();
  const items = (concessions ?? []).map((c) => ({
    title: c.concessionTypeName,
    amount: c.amount ?? 0,
  }));
  const total = items.reduce((acc, c) => acc + c.amount, 0);

  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 450,
        boxShadow: 'none',
        border: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1.5,
        overflow: 'hidden',
        p: 2,
      }}
    >
      <Box
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
            Concessions
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Applied discounts & waivers
          </Typography>
        </Box>

        <Chip
          label={`₹ ${total.toLocaleString('en-IN')} Saved`}
          variant="soft"
          sx={{
            fontWeight: 700,
            borderRadius: 1,
            height: 28,
            px: 0.5,
            bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.08),
            color: 'text.primary',
            fontSize: 11,
          }}
        />
      </Box>

      <CardContent sx={{ p: 0, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Scrollbar sx={{ flexGrow: 1, maxHeight: '100%' }}>
          <Stack spacing={1}>
            {items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
              >
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: 1.5,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: theme.palette.divider,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      borderColor: 'text.disabled',
                      bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.02),
                    },
                  }}
                >
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 36,
                      height: 36,
                      bgcolor: varAlpha(theme.palette.grey['500Channel'], 0.08),
                      color: 'text.secondary',
                    }}
                  >
                    <LocalOfferIcon sx={{ fontSize: 16 }} />
                  </Avatar>

                  <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, mb: 0.2, color: 'text.primary' }}
                    >
                      {item.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                      Concession
                    </Typography>
                  </Box>

                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    ₹{item.amount.toLocaleString('en-IN')}
                  </Typography>
                </Box>
              </motion.div>
            ))}
          </Stack>
        </Scrollbar>
      </CardContent>
    </Card>
  );
}
