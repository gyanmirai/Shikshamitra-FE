import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { Box, Stack, Typography } from '@mui/material';

import { displayValue, isFiniteValue } from './visualization-data';
import { academicSetupSettings } from '../../setup/academic-setup-catalog';

const settingLabel = (id: string, fallback: string) =>
  academicSetupSettings.find((entry) => entry.key === id)?.title ?? fallback;
function settingStatus(status: string) {
  const labels: Record<string, string> = { configured: 'Configured', empty: 'No records',
    'context-required': 'Select a class', unavailable: 'Unavailable' };
  return typeof labels[status] === 'string' ? labels[status] : status;
}

export function AcademicReadonlyCatalogue({ section }: { section: AcademicInsightsSection }) {
  const matrix = section.key === 'settings';
  const rows = section.series.flatMap((entry) =>
    entry.points.map((point) => ({
      id: `${entry.name}:${point.key}`,
      settingKey: point.key,
      label: point.label,
      detail: entry.name,
      value: point.value,
      status: point.status,
    }))
  );
  const matrixKeys = new Set(
    section.series.flatMap((entry) => entry.points.map((point) => point.key))
  );
  const items = section.items.filter((item) => !matrix || !matrixKeys.has(item.id));

  return (
    <Stack spacing={1.5}>
      {!matrix && (
        <Typography variant="caption" color="text.secondary">
          Read-only notification configuration catalogue
        </Typography>
      )}
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0,
          listStyle: 'none',
          display: 'grid',
          gap: 1,
          gridTemplateColumns: matrix ? { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' } : '1fr',
        }}
      >
        {rows.map((row) => (
          <Box
            component="li"
            key={row.id}
            sx={{
              p: 1.5,
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
              minWidth: 0,
            }}
          >
            <Stack direction="row" justifyContent="space-between" alignItems="baseline" gap={2}>
              <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
                {matrix ? settingLabel(row.settingKey, row.label) : row.label}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: 'right' }}>
                {matrix
                  ? (row.status ? settingStatus(row.status) : undefined) ||
                    (isFiniteValue(row.value)
                      ? row.value > 0
                        ? 'Configured'
                        : 'Not configured'
                      : 'Unavailable')
                  : displayValue(row.value)}
              </Typography>
            </Stack>
            {!matrix && row.status && (
              <Typography variant="caption" color="text.secondary">
                {row.status}
              </Typography>
            )}
          </Box>
        ))}
        {items.map((item) => (
          <Box
            component="li"
            key={item.id}
            sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="subtitle2" sx={{ overflowWrap: 'anywhere' }}>
              {matrix ? settingLabel(item.id, item.label) : item.label}
            </Typography>
            {item.detail && (
              <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: 'anywhere' }}>
                {item.detail}
              </Typography>
            )}
            {(item.status || isFiniteValue(item.value)) && (
              <Typography variant="caption" color="text.secondary">
                {[matrix && item.status ? settingStatus(item.status) : item.status,
                  isFiniteValue(item.value) ? displayValue(item.value) : null]
                  .filter(Boolean)
                  .join(' · ')}
              </Typography>
            )}
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
