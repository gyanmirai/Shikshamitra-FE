'use client';

import Link from 'next/link';
import { Iconify } from 'src/components/iconify';
import { EmptyContent } from 'src/components/empty-content';
import { Box, Card, Chip, Stack, Button, Typography } from '@mui/material';

import type { AcademicActionItem } from './types';

type AcademicActionQueueProps = {
  title: string;
  subtitle: string;
  items: AcademicActionItem[];
};

const severityColor = (severity: AcademicActionItem['severity']): 'error' | 'warning' | 'info' =>
  severity === 'critical' ? 'error' : severity;

export function AcademicActionQueue({ title, subtitle, items }: AcademicActionQueueProps) {
  return (
    <Card
      sx={{
        p: 2,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        border: (theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
        <Box>
          <Typography variant="subtitle1">{title}</Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        <Chip size="small" label={`${items.length} open`} />
      </Stack>

      {items.length === 0 ? (
        <EmptyContent
          title="No priority actions"
          description="There are no academic issues requiring attention right now."
          sx={{ minHeight: 200, py: 2 }}
          slotProps={{ img: { maxWidth: 120 } }}
        />
      ) : (
        <Stack spacing={1} sx={{ mt: 1.5 }}>
          {items.slice(0, 5).map((item) => (
            <Box
              key={item.id}
              sx={{
                p: 1.25,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                border: (theme) => `1px solid ${theme.palette.divider}`,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <Chip
                  size="small"
                  color={severityColor(item.severity)}
                  variant="soft"
                  label={item.severity}
                />
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="subtitle2">{item.title}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {item.summary}
                  </Typography>
                </Box>
              </Stack>
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
                sx={{ mt: 1 }}
              >
                <Typography variant="caption" color="text.secondary">
                  Source: {item.source}
                </Typography>
                {item.actionHref ? (
                  <Button
                    component={Link}
                    href={item.actionHref}
                    size="small"
                    endIcon={<Iconify icon="mdi:arrow-right" />}
                  >
                    {item.actionLabel}
                  </Button>
                ) : null}
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Card>
  );
}
