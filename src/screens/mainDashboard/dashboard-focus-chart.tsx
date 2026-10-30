import { useId } from 'react';
import { useTheme } from '@mui/material/styles';
import { Iconify } from 'src/components/iconify';
import { Chart, useChart } from 'src/components/chart';
import { Box, Stack, Accordion, Typography, AccordionDetails, AccordionSummary } from '@mui/material';

import { formatFocusValue } from './dashboard-focus-metrics';

import type { DashboardFocus } from './dashboard-focus-types';

function escapeLabel(value: string) {
  const entities: Record<string, string> = {
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  };
  return value.replace(/[&<>"']/g, (char) => entities[char]);
}

export function DashboardFocusChart({ focus }: { focus: DashboardFocus }) {
  const id = useId();
  const theme = useTheme();
  const categories = new Map<string, string>();
  focus.series.forEach((entry) => entry.points.forEach((point) => {
    if (!categories.has(point.key)) categories.set(point.key, point.label);
  }));
  const keys = [...categories.keys()];
  const series = focus.series.map((entry) => {
    const values = new Map(entry.points.map((point) => [point.key, point.value]));
    return { name: entry.label, data: keys.map((key) => values.get(key) ?? null) };
  });
  const hasValues = series.some((entry) => entry.data.some((value) => value !== null));
  const unitLabel = focus.unit === 'INR' ? 'Amount (INR)' : focus.unit === 'percent' ? 'Percent (%)'
    : focus.unit === 'count' ? 'Count' : 'Value (unit unavailable)';
  const tone = theme.palette.mode === 'dark' ? 'light' : 'dark';
  const options = useChart({
    colors: [theme.palette.primary[tone], theme.palette.info[tone], theme.palette.warning[tone]],
    chart: { animations: { enabled: false } },
    stroke: { curve: 'straight', width: 2 },
    fill: { type: 'solid', opacity: 1 },
    legend: { show: true, position: 'bottom', horizontalAlign: 'left' },
    xaxis: { categories: [...categories.values()] },
    yaxis: { title: { text: unitLabel },
      labels: { formatter: (value: number) => formatFocusValue(value, focus.unit) } },
    tooltip: { shared: true, custom: ({ dataPointIndex }: { dataPointIndex: number }) => {
      const label = categories.get(keys[dataPointIndex]) || '';
      const rows = series.map((entry) => `${escapeLabel(entry.name)}: ${
        escapeLabel(formatFocusValue(entry.data[dataPointIndex] ?? null, focus.unit))}`).join('<br/>');
      return `<div style="padding:8px;max-width:280px;overflow-wrap:anywhere"><b>${escapeLabel(label)}</b><br/>${rows}</div>`;
    } },
  });

  return (
    <Box sx={{ minWidth: 0 }}>
      {hasValues ? (
        <Chart type={focus.kind === 'attendance' ? 'line' : 'bar'} series={series} options={options}
          height={240} aria-label={`${focus.title}, ${unitLabel}`} />
      ) : (
        <Stack justifyContent="center" sx={{ height: 240 }}>
          <Typography variant="body2" color="text.secondary">No measured values are available.</Typography>
        </Stack>
      )}
      {keys.length > 0 && (
        <Accordion disableGutters elevation={0} sx={{ '&:before': { display: 'none' } }}>
          <AccordionSummary id={`${id}-summary`} aria-controls={`${id}-data`}
            expandIcon={<Iconify icon="mdi:chevron-down" width={18} aria-hidden />} sx={{ px: 0 }}>
            <Typography variant="caption">View chart data</Typography>
          </AccordionSummary>
          <AccordionDetails aria-label="Chart data values" sx={{ px: 0 }}>
            <Typography variant="caption" color="text.secondary">{unitLabel}</Typography>
            <Box component="dl" sx={{ m: 0 }}>
              {keys.map((key, index) => (
                <Box key={key} sx={{ py: 1, borderBottom: 1, borderColor: 'divider' }}>
                  <Typography component="dt" variant="subtitle2">{categories.get(key)}</Typography>
                  {series.map((entry, seriesIndex) => (
                    <Typography key={focus.series[seriesIndex].id} component="dd" variant="body2"
                      sx={{ m: 0, overflowWrap: 'anywhere' }}>
                      {entry.name}: {formatFocusValue(entry.data[index], focus.unit)}
                    </Typography>
                  ))}
                </Box>
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
}
