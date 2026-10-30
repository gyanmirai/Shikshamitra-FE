'use client';

import { Stack, LinearProgress } from '@mui/material';
import { EmptyContent } from 'src/components/empty-content';

import { AcademicDesignHeader } from './academic-design-header';
import { AcademicDesignSections } from './academic-design-sections';
import { AcademicDesignOverview } from './academic-design-overview';
import { useAcademicInsights } from '../insights/use-academic-insights';
import { orderDesignAreas, getDesignOverview } from './academic-design-model';
import { getAcademicInsightsDisplayAreas } from '../insights/academic-insights-model';
import { AcademicInsightsRequestState } from '../insights/components/academic-insights-request-state';

export default function AcademicDesignScreen() {
  const query = useAcademicInsights();
  const { data } = query;
  const areas = data ? orderDesignAreas(getAcademicInsightsDisplayAreas(data, query.permissions), data.role) : [];
  const metrics = data ? getDesignOverview(areas, data.role) : [];
  const refresh = () => { if (query.hasContext && query.authorized) query.refetch(); };
  return <Stack data-testid="academic-image-dashboard" spacing={2} sx={{ pb: 2, minWidth: 0 }}>
    <AcademicDesignHeader query={query} refresh={refresh} />
    {query.isFetching && data && <LinearProgress aria-label="Refreshing academic insights" />}
    <AcademicInsightsRequestState query={query} onRetry={refresh} />
    {data && !query.isError && <>
      <AcademicDesignOverview metrics={metrics} />
      <AcademicDesignSections entries={areas} retry={refresh} refreshing={query.isFetching} />
      {!areas.length && <EmptyContent title={data.students?.length ? 'Select a student' : 'No academic insights available'}
        description={data.students?.length ? 'Choose a linked student to view their academic information.' : 'No sections are available for your current permissions and academic scope.'}
        sx={{ minHeight: 320 }} />}
    </>}
  </Stack>;
}
