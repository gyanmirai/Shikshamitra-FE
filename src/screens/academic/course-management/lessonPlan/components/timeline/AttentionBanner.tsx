'use client';

import React from 'react';
import { varAlpha } from 'src/theme/styles';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Button, Typography, Paper } from '@mui/material';

export type AttentionItem = {
  id: string;
  subjectName: string;
  className: string;
  periodName?: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  remarks?: string;
  statusKey: string;
  actionLabel: string;
  onAction: () => void;
};

type Props = {
  items: AttentionItem[];
};

export const AttentionBanner: React.FC<Props> = ({ items }) => {
  if (!items || items.length === 0) return null;

  const count = items.length;

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 1.5,
        mb: 1.5,
        borderRadius: 2,
        bgcolor: (t) => varAlpha(t.vars.palette.warning.mainChannel, 0.06),
        borderColor: (t) => varAlpha(t.vars.palette.warning.mainChannel, 0.35),
        borderLeft: (t) => `4px solid ${t.palette.warning.main}`,
      }}
    >
      <Stack spacing={1.25}>
        {/* Banner Header */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <Box
            sx={{
              width: 26,
              height: 26,
              borderRadius: '50%',
              bgcolor: 'warning.main',
              color: 'warning.contrastText',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:danger-bold" width={16} />
          </Box>
          <Typography variant="subtitle2" fontWeight={800} color="warning.dark">
            {count} {count === 1 ? 'lesson needs' : 'lessons need'} your attention
          </Typography>
        </Stack>

        {/* Compact Attention Item Rows */}
        <Stack spacing={1}>
          {items.map((item) => (
            <Stack
              key={item.id}
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              justifyContent="space-between"
              spacing={1}
              sx={{
                p: 1.25,
                borderRadius: 1.5,
                bgcolor: 'background.paper',
                border: (t) => `1px solid ${varAlpha(t.vars.palette.warning.mainChannel, 0.2)}`,
              }}
            >
              <Stack direction="row" spacing={1.25} alignItems="center">
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: (t) => varAlpha(t.vars.palette.warning.mainChannel, 0.12),
                    color: 'warning.dark',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {item.periodName || 'Class'}
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={700} color="text.primary">
                    {item.subjectName} · {item.className}
                  </Typography>
                  <Typography variant="caption" color="warning.dark" fontWeight={600}>
                    {item.reason}
                    {item.remarks ? `: "${item.remarks}"` : ''}
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                size="small"
                color="inherit"
                onClick={item.onAction}
                startIcon={
                  <Iconify
                    icon={
                      item.statusKey === 'rejected'
                        ? 'solar:refresh-bold'
                        : 'solar:pen-bold'
                    }
                    width={14}
                  />
                }
                sx={{
                  alignSelf: { xs: 'flex-end', sm: 'center' },
                  fontSize: 12,
                  py: 0.5,
                  px: 1.25,
                  fontWeight: 600,
                  flexShrink: 0,
                  bgcolor: 'background.paper',
                  borderColor: 'divider',
                  color: 'text.primary',
                  '&:hover': {
                    bgcolor: 'action.hover',
                    borderColor: 'text.primary',
                  },
                }}
              >
                {item.actionLabel}
              </Button>
            </Stack>
          ))}
        </Stack>
      </Stack>
    </Paper>
  );
};

export default AttentionBanner;
