import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { Label } from 'src/components/label';
import { fDate } from 'src/utils/format-time';
import { Box, Stack, Table, TableRow, TableBody, TableCell, TableHead, Typography, TableContainer } from '@mui/material';

import { ChartDataAlternative } from '../insights/components/chart-data-alternative';
import { displayValue, isFiniteValue, displaySeriesName } from '../insights/components/visualization-data';

export function AcademicDesignCounts({ section }: { section: AcademicInsightsSection }) {
  const points = section.series.flatMap((series) => series.points);
  const maximum = Math.max(1, ...points.flatMap((point) => isFiniteValue(point.value) ? [point.value] : []));
  if (section.key === 'lesson') return <>
    <TableContainer><Table size="small" aria-label="Lesson plan states" sx={{ '& th, & td': { py: 1, px: 1, borderColor: 'divider' } }}>
      <TableHead><TableRow><TableCell>Plan status</TableCell><TableCell align="right">Plans</TableCell></TableRow></TableHead>
      <TableBody>{points.map((point) => <TableRow key={point.key}>
        <TableCell><Label color={/draft/i.test(point.label) ? 'warning' : /completed|published/i.test(point.label) ? 'success' : 'default'}>{point.label}</Label></TableCell>
        <TableCell align="right">{displayValue(point.value)}</TableCell>
      </TableRow>)}</TableBody>
    </Table></TableContainer>
    <ChartDataAlternative series={section.series} />
  </>;
  return <Stack spacing={1.5}>
    {section.series.map((series) => <Stack key={series.name} spacing={1}>
      <Typography variant="caption" color="text.secondary">{displaySeriesName(series.name)}</Typography>
      {series.points.map((point) => <Box key={point.key} sx={{ display: 'grid', alignItems: 'center',
        gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr) auto', gap: 1.5 }}>
        <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{point.label}</Typography>
        <Box aria-hidden sx={{ height: 9, bgcolor: 'background.neutral', borderRadius: 0.5 }}>
          {isFiniteValue(point.value) && <Box sx={{ height: 1, width: `${Math.max(0, point.value) / maximum * 100}%`,
            bgcolor: 'primary.main', borderRadius: 0.5 }} />}
        </Box>
        <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{displayValue(point.value)}</Typography>
      </Box>)}
    </Stack>)}
    {section.items.length > 0 && <Box component="ul" sx={{ listStyle: 'none', m: 0, p: 0 }}>
      {section.items.map((item) => <Stack component="li" key={item.id} direction="row" alignItems="center" justifyContent="space-between" gap={1}
        sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>{item.label}</Typography>
          {item.detail && <Typography variant="caption" color="text.secondary">{item.detail}</Typography>}
          {item.date && <Typography component="time" dateTime={item.date} variant="caption" color="text.secondary" sx={{ display: 'block' }}>{fDate(item.date)}</Typography>}
          {isFiniteValue(item.value) && <Typography variant="caption">{displayValue(item.value)}</Typography>}
        </Box>
        {item.status && <Label color="info">{item.status}</Label>}
      </Stack>)}
    </Box>}
    <ChartDataAlternative series={section.series} />
  </Stack>;
}
