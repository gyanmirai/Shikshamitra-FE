'use client';

import { Iconify } from 'src/components/iconify';
import CustomSelect from 'src/components/custom-select';
import { EmptyContent } from 'src/components/empty-content';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Stack, Button, Typography, LinearProgress } from '@mui/material';

import { useAcademicInsights } from './use-academic-insights';
import { AcademicInsightsOverview } from './academic-insights-overview';
import { AcademicInsightsSectionCard } from './academic-insights-section';
import { AcademicInsightsRequestState } from './components/academic-insights-request-state';
import {
  getAcademicInsightsRoleLabel,
  getAcademicInsightsDisplayAreas,
} from './academic-insights-model';

export default function AcademicInsightsScreen() {
  const query = useAcademicInsights();
  const { data } = query;
  const areas = data ? getAcademicInsightsDisplayAreas(data, query.permissions) : [];
  const refresh = () => {
    if (query.hasContext && query.authorized) query.refetch();
  };
  const refreshAction = (
    <Button
      size="small"
      variant="outlined"
      startIcon={<Iconify icon="mdi:refresh" />}
      disabled={!query.hasContext || !query.authorized || query.isFetching}
      onClick={refresh}
    >
      {query.isFetching ? 'Refreshing' : 'Refresh'}
    </Button>
  );

  return (
    <Stack spacing={2} sx={{ pb: 2 }}>
      <CustomBreadcrumbs
        heading="Academic Dashboard"
        description="Academic insights and permitted workflows for your assigned responsibilities."
        links={[{ name: 'Academics' }, { name: 'Dashboard' }]}
        action={refreshAction}
      />
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        spacing={1}
        sx={{ px: 1 }}
      >
        <Typography variant="body2" color="text.secondary">
          {data
            ? `${getAcademicInsightsRoleLabel(data.role)} · ${data.scopeLabel}`
            : query.contextLabel}
        </Typography>
        {data && (
          <Typography variant="caption" color="text.secondary">
            Updated{' '}
            {new Intl.DateTimeFormat('en-IN', {
              dateStyle: 'medium',
              timeStyle: 'short',
              timeZone: 'Asia/Kolkata',
            }).format(new Date(data.generatedAt))}{' '}
            IST
          </Typography>
        )}
      </Stack>
      {data && (data.students?.length ?? 0) > 1 && (
        <Box sx={{ maxWidth: 360 }}>
          <CustomSelect
            label="Student"
            size="small"
            value={query.studentId}
            options={data.students ?? []}
            labelKey="label"
            valueKey="id"
            onChange={(value) => query.selectStudent(String(value))}
          />
        </Box>
      )}
      {query.studentId && (
        <Box>
          <Button
            size="small"
            variant="text"
            onClick={() => query.selectStudent('')}
            startIcon={<Iconify icon="mdi:account-switch-outline" />}
          >
            Choose another student
          </Button>
        </Box>
      )}
      {query.isFetching && data && <LinearProgress aria-label="Refreshing academic insights" />}
      <AcademicInsightsRequestState query={query} onRetry={refresh} />
      {data && !query.isError && (
        <>
          <AcademicInsightsOverview areas={areas} />
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              alignItems: 'stretch',
              gridTemplateColumns: { xs: 'minmax(0, 1fr)', lg: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            {areas.map((entry) => (
              <Box
                key={entry.area.key}
                sx={{
                  minWidth: 0,
                  gridColumn: entry.area.key === 'settings' ? '1 / -1' : undefined,
                }}
              >
                <AcademicInsightsSectionCard
                  entry={entry}
                  refreshing={query.isFetching}
                  onRetry={refresh}
                />
              </Box>
            ))}
          </Box>
          {!areas.length && (
            <EmptyContent
              title={data.students?.length ? 'Select a student' : 'No academic insights available'}
              description={
                data.students?.length
                  ? 'Choose a linked student to view their academic information.'
                  : 'No sections are available for your current permissions and academic scope.'
              }
              sx={{ minHeight: 320 }}
            />
          )}
        </>
      )}
    </Stack>
  );
}
