'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'src/routes/hooks';
import { hrPaths } from 'src/constants/hr-menus';
import { useSearchParams } from 'next/navigation';
import { CustomTabs } from 'src/components/custom-tabs';
import { hrReportPaths } from 'src/constants/hr-report-paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Tab, Alert, Stack, Button, LinearProgress } from '@mui/material';
import {
  useGetReportingLibraryQuery,
  useGetReportingCatalogueQuery,
} from 'src/redux/hr/hrReportingWorkspaceApi';

import { ReportLibrary } from './workspace/ReportLibrary';
import { reportError } from './reporting-workspace-utils';
import { useHrReportPermissions } from './hooks/useHrReportPermissions';

const loadingReportView = () => <LinearProgress aria-label="Loading report view" />;
const ReportGenerate = dynamic(
  () => import('./workspace/ReportGenerate').then((m) => m.ReportGenerate),
  { loading: loadingReportView }
);
const ReportDesigner = dynamic(() =>
  import('./workspace/ReportDesigner').then((m) => m.ReportDesigner)
);
const ReportHistory = dynamic(
  () => import('./workspace/ReportHistory').then((m) => m.ReportHistory),
  { loading: loadingReportView }
);
const ReportRunResult = dynamic(
  () => import('./workspace/ReportRunResult').then((m) => m.ReportRunResult),
  { loading: loadingReportView }
);

function ReportingWorkspace() {
  const query = useSearchParams();
  const router = useRouter();
  const permissions = useHrReportPermissions();
  const mode = query.get('mode');
  const tab = query.get('tab') === 'generated' ? 'generated' : 'templates';
  // History and captured results own their reads. Library navigation needs no designer metadata.
  const needsCatalogue = mode === 'design' || mode === 'generate';
  const needsLibrary = needsCatalogue || (mode !== 'result' && tab === 'templates');
  const {
    currentData: datasets,
    error: catalogueError,
    isFetching: fetchingCatalogue,
  } = useGetReportingCatalogueQuery(undefined, {
    skip: !permissions.canView || !needsCatalogue,
  });
  const {
    currentData: templates,
    error: libraryError,
    isFetching: fetchingLibrary,
  } = useGetReportingLibraryQuery(
    { edit: mode === 'design' },
    { skip: !permissions.canView || !needsLibrary }
  );
  const template = templates?.find((t) => t.id === query.get('template'));
  const error = (needsCatalogue && catalogueError) || (needsLibrary && libraryError);
  const loading =
    (needsCatalogue && fetchingCatalogue && !datasets) ||
    (needsLibrary && fetchingLibrary && !templates);
  if (
    mode === 'design' &&
    datasets?.length &&
    (!query.get('template') || template) &&
    !loading &&
    !error &&
    (permissions.canBuild || permissions.canManageTemplates)
  ) {
    if (template && !query.get('copy') && !template.canEdit)
      return <Alert severity="warning">Choose Customize a copy to edit this template.</Alert>;
    return (
      <ReportDesigner
        key={`${template?.id || 'new'}-${query.get('copy') || 'edit'}`}
        datasets={datasets}
        template={template}
        copy={query.get('copy') === '1'}
      />
    );
  }
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading={
          mode === 'generate'
            ? 'Generate report'
            : mode === 'result'
              ? 'Generated report'
              : 'HR reports'
        }
        description={
          mode === 'generate'
            ? 'Choose the period and staff to capture this report.'
            : 'Create a template once. Generate it whenever your school needs it.'
        }
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'HR reports', ...(mode ? { href: hrReportPaths.library } : {}) },
          ...(mode ? [{ name: mode === 'generate' ? 'Generate' : 'Report result' }] : []),
        ]}
        isBack={!!mode}
        onBack={() => router.push(hrReportPaths.library)}
        sx={{ px: 1 }}
        action={
          !mode && (permissions.canBuild || permissions.canManageTemplates) ? (
            <Button
              variant="contained"
              size="small"
              onClick={() => router.push(hrReportPaths.design())}
            >
              Create template
            </Button>
          ) : null
        }
      />
      <Stack spacing={1} sx={{ p: 1, flex: 1, minHeight: 0 }}>
        {!permissions.canView ? (
          <Alert severity="info">Report access is required to open this workspace.</Alert>
        ) : loading ? (
          <LinearProgress aria-label="Loading report templates" />
        ) : error ? (
          <Alert severity="error">{reportError(error)}</Alert>
        ) : mode === 'generate' ? (
          template ? (
            <ReportGenerate
              key={template.id}
              template={template}
              dataset={datasets?.find((dataset) => dataset.id === template.definition.dataSource)}
            />
          ) : (
            <Alert severity="warning">This template is unavailable or outside your access.</Alert>
          )
        ) : mode === 'result' && query.get('run') ? (
          <ReportRunResult key={query.get('run')} id={query.get('run')!} />
        ) : mode === 'design' ? (
          <Alert severity="warning">
            Template design requires personal design or school template management access and an
            available dataset.
          </Alert>
        ) : (
          <>
            <CustomTabs
              value={tab}
              onChange={(_, value) =>
                router.push(value === 'generated' ? hrReportPaths.history : hrReportPaths.library)
              }
              aria-label="HR reports"
            >
              <Tab
                value="templates"
                label="Templates"
                id="hr-report-templates-tab"
                aria-controls="hr-report-templates-panel"
              />
              <Tab
                value="generated"
                label="Generated reports"
                id="hr-report-generated-tab"
                aria-controls="hr-report-generated-panel"
              />
            </CustomTabs>
            <Box
              role="tabpanel"
              id={`hr-report-${tab}-panel`}
              aria-labelledby={`hr-report-${tab}-tab`}
              sx={{ flex: 1, minHeight: 0 }}
            >
              {tab === 'templates' ? (
                <ReportLibrary templates={templates || []} />
              ) : (
                <ReportHistory />
              )}
            </Box>
          </>
        )}
      </Stack>
    </Box>
  );
}

export default function ReportsScreen() {
  return (
    <Suspense fallback={<LinearProgress aria-label="Loading HR reports" />}>
      <ReportingWorkspace />
    </Suspense>
  );
}
