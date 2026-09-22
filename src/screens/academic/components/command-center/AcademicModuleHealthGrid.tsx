'use client';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { Box, Card, Stack, Button, Typography, LinearProgress } from '@mui/material';

import type { AcademicModuleHealthItem } from './types';

type AcademicModuleHealthGridProps = {
  items: AcademicModuleHealthItem[];
  subtitle?: string;
};

export function AcademicModuleHealthGrid({
  items,
  subtitle = 'Setup, workload and readiness by academic area',
}: AcademicModuleHealthGridProps) {
  return (
    <Card sx={{ p: 2, height: '100%', border: (theme) => `1px solid ${theme.palette.divider}` }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1">Module Health</Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          gap: 1,
        }}
      >
        {items.map((item) => (
          <Box
            key={item.id}
            sx={{
              p: 1.25,
              borderRadius: 1,
              bgcolor: 'background.neutral',
              border: (theme) => `1px solid ${theme.palette.divider}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Iconify icon={item.icon} width={20} sx={{ color: `${item.tone}.main` }} />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" noWrap>
                  {item.module}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {item.status}
                </Typography>
              </Box>
              {item.href ? (
                <Button component={Link} href={item.href} size="small">
                  Open
                </Button>
              ) : null}
            </Stack>
            <LinearProgress
              value={Math.min(Math.max(item.progress, 0), 100)}
              variant="determinate"
              color={item.tone}
              sx={{ mt: 1, height: 6, borderRadius: 1 }}
            />
          </Box>
        ))}
      </Box>
    </Card>
  );
}
