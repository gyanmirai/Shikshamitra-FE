'use client';

import React from 'react';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Card, Stack, CardHeader, Typography } from '@mui/material';

// ----------------------------------------------------------------------

type StatusLevel = 'success' | 'warning' | 'error' | 'info';

interface OperationItem {
  module: string;
  status: string;
  level: StatusLevel;
  progress: number;
  icon: string;
}

const ACCENT: Record<StatusLevel, string> = {
  success: 'success.main',
  warning: 'warning.main',
  error: 'error.main',
  info: 'info.main',
};

// ----------------------------------------------------------------------

export default function OperationalStatus({ items }: { items?: OperationItem[] }) {
  const displayItems = items ?? [];

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        p: 2,
        boxShadow: 'none',
        border: (t) => `1px solid ${t.palette.divider}`,
      }}
    >
      <CardHeader
        title="School-wide Operations"
        subheader="Readiness across every class and academic workflow"
        sx={{ p: 0, mb: 1.5, flexShrink: 0 }}
      />

      {displayItems.length === 0 ? (
        <EmptyContent
          filled
          title="No operations status available"
          description="Academic workflow readiness will appear after modules are configured."
          sx={{ minHeight: 220 }}
          slotProps={{ img: { maxWidth: 88 } }}
        />
      ) : (
        <Scrollbar sx={{ flexGrow: 1 }}>
          <Stack spacing={1} sx={{ pb: 1 }}>
            {displayItems.map((item) => (
              <Box
                key={item.module}
                sx={{
                  p: 1.5,
                  border: (t) => `1px solid ${t.palette.divider}`,
                  borderRadius: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  transition: 'all 0.2s',
                  '&:hover': {
                    bgcolor: 'background.neutral',
                    borderColor: 'transparent',
                  },
                }}
              >
                {/* Left colour accent — same 4px bar as reference */}
                <Box
                  sx={{
                    width: 4,
                    height: 48,
                    borderRadius: 0.5,
                    bgcolor: ACCENT[item.level] || 'info.main',
                    flexShrink: 0,
                  }}
                />

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  {/* Title row — module name + status label */}
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    <Typography variant="subtitle2" sx={{ fontSize: '0.925rem' }} noWrap>
                      {item.module}
                    </Typography>
                    <Label variant="soft" color={item.level} sx={{ flexShrink: 0 }}>
                      {item.level === 'success'
                        ? 'On Track'
                        : item.level === 'warning'
                          ? 'Attention'
                          : 'Action Needed'}
                    </Label>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {item.status}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </Scrollbar>
      )}
    </Card>
  );
}
