import type { ReactNode } from 'react';

import Link from 'next/link';
import { Box, Stack, Button, Typography } from '@mui/material';
import { FormSectionCard } from 'src/components/form-section-card';

import { academicInsightsSectionHelp } from '../insights/academic-insights-section-help';
import { getAcademicSettingsFooterLinks } from '../insights/components/academic-settings-data';
import { academicSectionNotes, AcademicDesignSectionNote } from './academic-design-section-note';

import type { AcademicInsightsDisplayArea } from '../insights/academic-insights-model';

export function AcademicDesignSection({ entry, children, retry, refreshing }: {
  entry: AcademicInsightsDisplayArea; children: ReactNode; retry: () => void; refreshing: boolean;
}) {
  const { area, section, links } = entry;
  const note = academicSectionNotes[area.key];
  const destinations = area.key === 'settings' ? getAcademicSettingsFooterLinks(section, links) : links;
  return <FormSectionCard aria-label={area.title} title={area.title} icon={area.icon}
    action={note && <AcademicDesignSectionNote note={note} />}
    iconContainerSize={24} iconSize={22} titleTypographyProps={{ variant: 'subtitle1', fontWeight: 600 }}
    descriptionTooltip={section.status === 'ready' && section.summary ? section.summary : academicInsightsSectionHelp[area.key]}
    contentSpacing={1.5} contentSx={{ width: 1, minWidth: 0 }}
    sx={{ p: 2, borderRadius: 1, boxShadow: 'none' }}>
    <Box sx={{ minWidth: 0 }}>{children}</Box>
    {section.status === 'error' && <Button size="small" onClick={retry} disabled={refreshing}>Retry section</Button>}
    {area.key === 'settings' && <Typography variant="caption" color="text.secondary">
      Record existence does not confirm publication or class coverage.
    </Typography>}
    {destinations.length > 0 && <Stack direction="row" gap={1} useFlexGap flexWrap="wrap"
      sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
      {destinations.map((destination) => <Button key={destination.href} component={Link}
        href={destination.href} size="small" variant={area.key === 'settings' ? 'contained' : 'outlined'}
        sx={{ minHeight: 28, px: 1, py: 0.5, borderRadius: 0.5, typography: 'caption', fontWeight: 600 }}>
        {destination.label}
      </Button>)}
    </Stack>}
  </FormSectionCard>;
}
