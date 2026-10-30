import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { fDate, fDateTime } from 'src/utils/format-time';
import { Box, Stack, Table, TableRow, TableBody, TableCell, TableHead, Typography, TableContainer } from '@mui/material';

import { ChartDataAlternative } from '../insights/components/chart-data-alternative';
import { displayValue, isFiniteValue } from '../insights/components/visualization-data';

export function AcademicDesignRecords({ section }: { section: AcademicInsightsSection }) {
  if (section.key === 'calendar') {
    const items = section.items.filter((item) => !(item.detail?.trim().toLowerCase() === 'holiday' &&
      /^(?:(?:saturday|sunday)\s+weekend|weekend|alternate saturday\s+\([24](?:nd|th|nd\/th)\s+saturday\))$/i.test(item.label.trim()))).slice(0, 5);
    if (!items.length) return <Typography variant="body2" color="text.secondary">No upcoming events to display.</Typography>;
    return <Stack component="ol" aria-label="Calendar events" spacing={0} sx={{ m: 0, p: 0, listStyle: 'none' }}>
    {items.map((item) => <Stack component="li" key={item.id} direction="row" alignItems="center" gap={1.5}
      sx={{ py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
      <Box component="time" dateTime={item.date ?? undefined} sx={{ width: 54, flexShrink: 0, textAlign: 'center', bgcolor: 'background.neutral', borderRadius: 0.5, py: 0.5 }}>
        <Typography component="div" variant="h6" sx={{ lineHeight: 1.1 }}>{item.date ? fDate(item.date, 'DD') : '?'}</Typography>
        <Typography component="div" variant="caption">{item.date ? fDate(item.date, 'MMM YYYY') : 'No date'}</Typography>
      </Box>
      <Box sx={{ minWidth: 0 }}><Typography variant="body2" sx={{ fontWeight: 600, overflowWrap: 'anywhere' }}>{item.label}</Typography>
        {item.detail && <Typography variant="caption" color="text.secondary">{item.detail}</Typography>}
        {(item.status || isFiniteValue(item.value)) && <Typography component="div" variant="caption" color="text.secondary">
          {[item.status, isFiniteValue(item.value) ? displayValue(item.value) : null].filter(Boolean).join(' · ')}
        </Typography>}
      </Box>
    </Stack>)}
  </Stack>;
  }
  const items = section.key === 'audits' ? section.items.slice(0, 5) : section.items;
  const notifications = section.key === 'notifications';
  return <Stack spacing={1}>
    {notifications && <Box role="alert" sx={{ py: 0.75, px: 1, bgcolor: 'background.neutral', borderRadius: 0.5 }}>
      <Typography variant="caption">Templates are read-only. Saving templates and automatic notifications are unavailable.</Typography>
    </Box>}
    <TableContainer><Table size="small" aria-label={notifications ? 'Notification template catalogue' : 'Audit activity'}
      sx={{ '& th, & td': { px: 1, py: 0.75, borderColor: 'divider' } }}>
      <TableHead><TableRow><TableCell>{notifications ? 'Template category' : 'Date'}</TableCell>
        <TableCell>{notifications ? 'Status' : 'Action'}</TableCell></TableRow></TableHead>
      <TableBody>{items.map((item) => <TableRow key={item.id}>
        <TableCell sx={{ verticalAlign: 'top' }}>{notifications ? item.label : item.date ? <Box component="time" dateTime={item.date}>{fDateTime(item.date)}</Box> : 'Date unavailable'}</TableCell>
        <TableCell>{notifications ? 'Read-only' : item.label}
          {!notifications && item.detail && <Typography component="div" variant="caption" color="text.secondary">{item.detail}</Typography>}
          {isFiniteValue(item.value) && <Typography component="div" variant="caption">{displayValue(item.value)}</Typography>}
          {!notifications && item.status && <Typography component="div" variant="caption">{item.status}</Typography>}
        </TableCell>
      </TableRow>)}</TableBody>
    </Table></TableContainer>
    {notifications && section.series.map((series) => <Box key={series.name}>
      <Typography variant="caption" color="text.secondary">{series.name}</Typography>
      {series.points.map((point) => <Typography key={point.key} variant="body2">{point.label} · {displayValue(point.value)} · Read-only</Typography>)}
    </Box>)}
    <ChartDataAlternative series={section.series} />
  </Stack>;
}
