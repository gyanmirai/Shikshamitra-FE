
import Link from 'next/link';
import { Label } from 'src/components/label';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Typography, Link as MuiLink } from '@mui/material';

import { getAcademicSettingRows } from '../insights/components/academic-settings-data';

import type { AcademicInsightsDisplayArea } from '../insights/academic-insights-model';

const groups = [
  { key: 'curriculum', label: 'Curriculum', icon: GlobalIcons.notebook },
  { key: 'timetable', label: 'Timetable', icon: GlobalIcons.clock },
  { key: 'homework', label: 'Homework & Assignment', icon: GlobalIcons.documentIcon },
  { key: 'examination', label: 'Examination', icon: GlobalIcons.rubricFile },
];

export function AcademicDesignSettings({ entry }: { entry: AcademicInsightsDisplayArea }) {
  const rows = getAcademicSettingRows(entry.section, entry.links);
  return <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: {
    xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', lg: 'repeat(4, minmax(0, 1fr))',
  } }}>
    {groups.map((group) => {
      const settings = rows.filter((row) => row.group === group.key).sort((a, b) =>
        group.key === 'timetable' ? Number(b.key === 'lecture-slots') - Number(a.key === 'lecture-slots') : 0);
      if (!settings.length) return null;
      return <Box key={group.key} sx={{ minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={0.75} sx={{ mb: 0.75 }}>
          <Iconify icon={group.icon} width={18} aria-hidden sx={{ color: 'text.secondary' }} />
          <Typography component="h3" variant="subtitle2">{group.label}</Typography>
        </Stack>
        <Stack component="ul" aria-label={`${group.label} settings`} spacing={0} sx={{ m: 0, p: 0, listStyle: 'none' }}>
          {settings.map((row) => <Stack component="li" key={row.key} direction="row" alignItems="center" justifyContent="space-between"
            gap={0.75} sx={{ py: 0.75, minWidth: 0, borderBottom: '1px solid', borderColor: 'divider', flexWrap: 'wrap' }}>
            {row.href ? <MuiLink component={Link} href={row.href} variant="caption" color="inherit" underline="hover"
              sx={{ overflowWrap: 'anywhere', minWidth: 0 }}>{row.label}</MuiLink>
              : <Typography variant="caption" sx={{ overflowWrap: 'anywhere' }}>{row.label}</Typography>}
            <Label color={row.status === 'configured' ? 'success' : row.status === 'empty' ? 'warning' : row.status === 'context-required' ? 'info' : 'default'}>
              {row.status === 'configured' ? 'Records available' : row.status === 'empty' ? 'No records' : row.status === 'context-required' ? 'Class needed' : 'Unavailable'}
            </Label>
          </Stack>)}
        </Stack>
      </Box>;
    })}
  </Box>;
}
