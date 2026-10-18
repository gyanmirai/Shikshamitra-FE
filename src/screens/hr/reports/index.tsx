'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'src/routes/hooks';
import { hrPaths } from 'src/constants/hr-menus';
import { useSearchParams } from 'next/navigation';
import { hrReportPaths } from 'src/constants/hr-report-paths';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Tab, Tabs, Alert, Stack, Button, LinearProgress } from '@mui/material';
import {
  useGetReportingLibraryQuery,
  useGetReportingCatalogueQuery,
} from 'src/redux/hr/hrReportingWorkspaceApi';

import { ReportLibrary } from './workspace/ReportLibrary';
import { reportError } from './reporting-workspace-utils';
import { ReportGenerate } from './workspace/ReportGenerate';
import { useHrReportPermissions } from './hooks/useHrReportPermissions';

const ReportDesigner = dynamic(() =>
  import('./workspace/ReportDesigner').then((m) => m.ReportDesigner)
);
const ReportHistory = dynamic(() =>
  import('./workspace/ReportHistory').then((m) => m.ReportHistory)
);
const ReportRunResult = dynamic(() =>
  import('./workspace/ReportRunResult').then((m) => m.ReportRunResult)
);

function ReportingWorkspace() {
  const query = useSearchParams();
  const router = useRouter();
  const permissions = useHrReportPermissions();
  const mode = query.get('mode');
  const tab = query.get('tab') === 'generated' ? 'generated' : 'templates';
  const {
    data: datasets,
    error: catalogueError,
    isLoading: loadingCatalogue,
  } = useGetReportingCatalogueQuery(undefined, { skip: !permissions.canView });
  const {
    data: templates,
    error: libraryError,
    isLoading: loadingLibrary,
  } = useGetReportingLibraryQuery({ edit: mode === 'design' }, { skip: !permissions.canView });
  const template = templates?.find((t) => t.id === query.get('template'));
  const error = catalogueError || libraryError;
  const loading = loadingCatalogue || loadingLibrary;
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
        sx={{ px: 2 }}
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
      <Stack spacing={2} sx={{ p: 2, flex: 1, minHeight: 0 }}>
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
            <Tabs
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
            </Tabs>
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
