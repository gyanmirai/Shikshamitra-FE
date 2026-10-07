'use client';

import { Iconify } from 'src/components/iconify';
import { useBoolean } from 'src/hooks/use-boolean';
import { Scrollbar } from 'src/components/scrollbar';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Paper, Stack, Button, Drawer, Divider, IconButton, Typography } from '@mui/material';

import { AcademicInsightChart } from './AcademicInsightChart';
import { AcademicInsightMetricGrid } from './AcademicInsightMetricGrid';

import type { AcademicInsightMetric, AcademicInsightsProps } from './types';

export function AcademicInsights({
  title,
  description,
  metrics,
  chart,
  afterChart,
  focus,
  isLoading = false,
  buttonSx,
  open,
  onClose,
  hideTrigger = false,
}: AcademicInsightsProps) {
  const drawer = useBoolean();
  const isOpen = open ?? drawer.value;
  const closeDrawer = onClose ?? drawer.onFalse;

  const handleMetricClick = (metric: AcademicInsightMetric) => {
    metric.onClick?.();
    if (metric.onClick) closeDrawer();
  };

  return (
    <>
      {!hideTrigger && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1, ...buttonSx }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<Iconify icon="solar:chart-2-outline" width={18} />}
            onClick={drawer.onTrue}
          >
            View full insights
          </Button>
        </Box>
      )}

      <Drawer
        anchor="right"
        open={isOpen}
        onClose={closeDrawer}
        PaperProps={{
          sx: {
            width: { xs: 1, sm: 560 },
            maxWidth: 1,
            bgcolor: 'background.default',
          },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ p: 2.5, py: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              display: 'grid',
              placeItems: 'center',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1.5,
              bgcolor: 'background.paper',
              flexShrink: 0,
            }}
          >
            <Iconify icon="solar:chart-square-outline" width={22} />
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Typography variant="h6">{title}</Typography>
              <CustomTooltip title={description} placement="right" arrow>
                <IconButton size="small" aria-label={`About ${title}`}>
                  <Iconify icon="lucide:info" width={18} color="info.main" />
                </IconButton>
              </CustomTooltip>
            </Stack>
          </Box>
          <IconButton aria-label="Close insights" onClick={closeDrawer}>
            <Iconify icon="mingcute:close-line" />
          </IconButton>
        </Stack>

        <Divider />

        <Scrollbar sx={{ flex: 1 }}>
          <Stack spacing={2} sx={{ p: 2.5 }}>
            {!isLoading && chart && <AcademicInsightChart config={chart} />}
            {!isLoading && afterChart}

            {(metrics.length > 0 || isLoading) && (
              <Box>
                <Typography
                  variant="overline"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 1 }}
                >
                  Key metrics
                </Typography>
                <AcademicInsightMetricGrid
                  metrics={metrics}
                  isLoading={isLoading}
                  onMetricClick={handleMetricClick}
                />
              </Box>
            )}

            {!isLoading && focus && (
              <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" spacing={1.25} alignItems="flex-start">
                  <Iconify
                    icon="solar:target-outline"
                    width={22}
                    sx={{ color: 'text.secondary' }}
                  />
                  <Box>
                    <Typography variant="subtitle2">{focus.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {focus.description}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            )}
          </Stack>
        </Scrollbar>
      </Drawer>
    </>
  );
}
