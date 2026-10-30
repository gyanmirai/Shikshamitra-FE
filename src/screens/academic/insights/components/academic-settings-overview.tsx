import type { AcademicInsightsSection } from 'src/redux/academicAPI/academicInsightsTypes';

import { Label } from 'src/components/label';
import { Box, Stack, Typography } from '@mui/material';

import { getAcademicSettingRows } from './academic-settings-data';
import { AcademicSettingStatusRow } from './academic-setting-row';

import type { AcademicInsightsLink } from '../academic-insights-catalog';

const groups = [
  { key: 'curriculum', title: 'Curriculum' },
  { key: 'timetable', title: 'Timetable' },
  { key: 'homework', title: 'Homework & Assignment' },
  { key: 'examination', title: 'Examination' },
  { key: 'other', title: 'Other Settings' },
];

export function AcademicSettingsOverview({
  section,
  links,
}: {
  section: AcademicInsightsSection;
  links: AcademicInsightsLink[];
}) {
  const rows = getAcademicSettingRows(section, links);
  const configured = rows.filter((row) => row.status === 'configured').length;
  const empty = rows.filter((row) => row.status === 'empty').length;
  const classNeeded = rows.filter((row) => row.status === 'context-required').length;
  const unavailable = rows.length - configured - empty - classNeeded;
  return (
    <Stack spacing={2}>
      <Stack direction="row" alignItems="center" gap={1} flexWrap="wrap">
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {configured} {configured === 1 ? 'setting' : 'settings'} with records
        </Typography>
        {empty > 0 && <Label color="warning">{empty} without records</Label>}
        {classNeeded > 0 && <Label color="info">{classNeeded} need a class</Label>}
        {unavailable > 0 && <Label>{unavailable} unavailable</Label>}
      </Stack>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(4, minmax(0, 1fr))',
          },
          gap: 2,
        }}
      >
        {groups.map((group) => {
          const settings = rows
            .filter((row) => row.group === group.key)
            .sort((a, b) =>
              group.key === 'timetable'
                ? Number(b.key === 'lecture-slots') - Number(a.key === 'lecture-slots')
                : 0
            );
          if (settings.length === 0) return null;
          return (
            <Box key={group.key} sx={{ minWidth: 0 }}>
              <Typography component="h3" variant="subtitle2" sx={{ mb: 0.5 }}>
                {group.title}
              </Typography>
              {group.key === 'timetable' &&
                settings.some((row) => row.status === 'context-required') && (
                  <Typography variant="caption" color="text.secondary">
                    Choose a class on the settings page.
                  </Typography>
                )}
              <Box
                component="ul"
                aria-label={`${group.title} settings`}
                sx={{ m: 0, p: 0, listStyle: 'none' }}
              >
                {settings.map((row) => (
                  <AcademicSettingStatusRow row={row} key={row.key} />
                ))}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Stack>
  );
}
