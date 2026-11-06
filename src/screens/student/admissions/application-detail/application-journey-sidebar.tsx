'use client';

import type { ComponentProps } from 'react';

import { Iconify } from 'src/components/iconify';
import { useId, useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import { useResponsive } from 'src/hooks/use-responsive';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Drawer, Skeleton, IconButton, Typography } from '@mui/material';

import { ApplicationStageJourney } from './application-stage-journey';

type Props = ComponentProps<typeof ApplicationStageJourney> & { loading?: boolean };

export function ApplicationJourneySidebar({ loading, busy, onChange, ...journey }: Props) {
  const desktop = useResponsive('up', 'md');
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  useEffect(() => {
    if (desktop) setMobileOpen(false);
  }, [desktop]);
  const panelId = useId();
  const collapsed = !desktop || !expanded;
  const title = collapsed ? 'Expand Admission Journey' : 'Collapse Admission Journey';
  const steps = (compact: boolean) =>
    loading ? (
      <Stack spacing={2} role="status" aria-label="Loading Admission Journey" sx={{ p: 1 }}>
        {[0, 1, 2, 3].map((key) => (
          <Skeleton key={key} variant="rounded" height={28} width={compact ? 28 : '100%'} />
        ))}
      </Stack>
    ) : (
      <ApplicationStageJourney
        {...journey}
        collapsed={compact}
        busy={busy}
        onChange={(stageId) => {
          onChange?.(stageId);
          setMobileOpen(false);
        }}
      />
    );

  return (
    <>
      <Box
        component="aside"
        aria-label="Admission Journey Navigation"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          minHeight: 0,
          width: collapsed ? 60 : 240,
          borderRight: 1,
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={collapsed ? 'center' : 'space-between'}
          sx={{ p: 1 }}
        >
          {!collapsed && <Typography variant="subtitle2">Admission Journey</Typography>}
          <CustomTooltip title={title} arrow>
            <span>
              <IconButton
                aria-label={title}
                aria-expanded={!collapsed || mobileOpen}
                aria-controls={desktop ? panelId : `${panelId}-mobile`}
                disabled={busy}
                onClick={() => (desktop ? setExpanded((value) => !value) : setMobileOpen(true))}
                sx={{ width: 44, height: 44 }}
              >
                <Iconify icon={collapsed ? 'mdi:chevron-right' : 'mdi:chevron-left'} />
              </IconButton>
            </span>
          </CustomTooltip>
        </Stack>
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <Box id={panelId} sx={{ px: 1, pb: 1 }}>
            {steps(collapsed)}
          </Box>
        </Scrollbar>
      </Box>
      <Drawer
        open={!desktop && mobileOpen}
        onClose={() => {
          if (!busy) setMobileOpen(false);
        }}
        slotProps={{
          paper: {
            id: `${panelId}-mobile`,
            sx: { width: 280, maxWidth: '100%' },
            role: 'dialog',
            'aria-label': 'Admission Journey',
          },
        }}
      >
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ p: 1 }}>
          <Typography variant="subtitle1">Admission Journey</Typography>
          <CustomTooltip title="Collapse Admission Journey" arrow>
            <span>
              <IconButton
                aria-label="Collapse Admission Journey"
                disabled={busy}
                onClick={() => setMobileOpen(false)}
                sx={{ width: 44, height: 44 }}
              >
                <Iconify icon="mdi:chevron-left" />
              </IconButton>
            </span>
          </CustomTooltip>
        </Stack>
        <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
          <Box sx={{ px: 1 }}>{steps(false)}</Box>
        </Scrollbar>
      </Drawer>
    </>
  );
}
