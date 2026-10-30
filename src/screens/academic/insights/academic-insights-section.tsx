import Link from 'next/link';
import { FormSectionCard } from 'src/components/form-section-card';
import { Box, Alert, Stack, Button, Typography } from '@mui/material';

import { academicInsightsSectionHelp } from './academic-insights-section-help';
import { getAcademicSettingsFooterLinks } from './components/academic-settings-data';
import { AcademicInsightsVisualization } from './components/academic-insights-visualization';

import type { AcademicInsightsDisplayArea } from './academic-insights-model';

type Props = { entry: AcademicInsightsDisplayArea; refreshing: boolean; onRetry: () => void };

export function AcademicInsightsSectionCard({ entry, refreshing, onRetry }: Props) {
  const { area, section, links } = entry;
  const hasDailyTimetable =
    area.key === 'timetable' && section.metrics.some((metric) => metric.key === 'timetables');
  const footerLinks =
    area.key === 'settings' ? getAcademicSettingsFooterLinks(section, links) : links;
  return (
    <FormSectionCard
      aria-label={area.title}
      title={area.title}
      icon={area.icon}
      iconSize={22}
      iconContainerSize={28}
      titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
      descriptionTooltip={
        section.status === 'ready' &&
        !['audits', 'classrooms'].includes(area.key) &&
        !hasDailyTimetable &&
        section.summary
          ? section.summary
          : academicInsightsSectionHelp[area.key]
      }
      contentSpacing={2}
      contentSx={{ flex: 1, minWidth: 0 }}
      sx={{ minWidth: 0, height: '100%', display: 'flex', boxShadow: 'none' }}
    >
      {area.key === 'notifications' && (
        <Alert severity="info">
          Templates are read-only. Saving templates and automatic notifications are unavailable.
        </Alert>
      )}
      <Box sx={{ minWidth: 0, flex: 1, minHeight: section.status === 'ready' ? undefined : 120 }}>
        <AcademicInsightsVisualization section={section} links={links} />
        {section.status === 'error' && (
          <Button size="small" onClick={onRetry} disabled={refreshing}>
            Retry section
          </Button>
        )}
      </Box>
      {area.key === 'settings' && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
          Review the setup guide to confirm publication and class coverage.
        </Typography>
      )}
      {footerLinks.length > 0 && (
        <Stack
          direction="row"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ pt: 1.5, borderTop: (theme) => `1px solid ${theme.palette.divider}` }}
        >
          {footerLinks.map((entryLink) => (
            <Button
              key={entryLink.href}
              component={Link}
              href={entryLink.href}
              size="small"
              variant={
                area.key === 'settings' && entryLink.label === 'Setup guide'
                  ? 'contained'
                  : 'outlined'
              }
            >
              {entryLink.label}
            </Button>
          ))}
        </Stack>
      )}
    </FormSectionCard>
  );
}
