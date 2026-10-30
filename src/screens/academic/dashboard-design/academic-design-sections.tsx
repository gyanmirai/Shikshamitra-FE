import Masonry from '@mui/lab/Masonry';
import { Box, Stack } from '@mui/material';

import { AcademicDesignSection } from './academic-design-section';
import { AcademicDesignVisualization } from './academic-design-visualization';

import type { AcademicInsightsDisplayArea } from '../insights/academic-insights-model';

export function AcademicDesignSections({ entries, retry, refreshing }: {
  entries: AcademicInsightsDisplayArea[]; retry: () => void; refreshing: boolean;
}) {
  const groups: AcademicInsightsDisplayArea[][] = [];
  entries.forEach((entry) => {
    const previous = groups.at(-1);
    if (entry.area.key === 'settings' || !previous || previous[0].area.key === 'settings') {
      groups.push([entry]);
    } else {
      previous.push(entry);
    }
  });
  const renderSection = (entry: AcademicInsightsDisplayArea) => (
    <AcademicDesignSection entry={entry} retry={retry} refreshing={refreshing}>
      <AcademicDesignVisualization entry={entry} />
    </AcademicDesignSection>
  );
  return <Stack spacing={2} sx={{ minWidth: 0 }}>
    {groups.map((group) => <Box key={group[0].area.key} sx={{ minWidth: 0 }}>
      {group[0].area.key === 'settings' ? renderSection(group[0]) : (
        <Masonry columns={{ xs: 1, lg: 2 }} spacing={2} sequential
          sx={{ m: -1, width: (theme) => `calc(100% + ${theme.spacing(2)})` }}>
          {group.map((entry) => <Box key={entry.area.key} sx={{ minWidth: 0 }}>
            {renderSection(entry)}
          </Box>)}
        </Masonry>
      )}
    </Box>)}
  </Stack>;
}
