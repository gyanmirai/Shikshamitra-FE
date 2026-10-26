'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'src/routes/hooks';
import { useSearchParams } from 'next/navigation';
import { RouterLink } from 'src/routes/components';
import { hrReportPaths } from 'src/constants/hr-report-paths';
import { HrNotice } from 'src/screens/hr/components/hr-notice';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { Box, Alert, Stack, Button, LinearProgress } from '@mui/material';
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
const ReportDesigner = dynamic(
  () => import('./workspace/ReportDesigner').then((m) => m.ReportDesigner),
  { loading: loadingReportView }
);
const ReportHistory = dynamic(
  () => import('./workspace/ReportHistory').then((m) => m.ReportHistory),
  { loading: loadingReportView }
);
const ReportRunResult = dynamic(
  () => import('./workspace/ReportRunResult').then((m) => m.ReportRunResult),
  { loading: loadingReportView }
);

type ReportsScreenProps = {
  view?: 'history' | 'templates' | 'choose' | 'generate' | 'design' | 'result';
  templateId?: string;
  runId?: string;
};

function ReportingWorkspace({ view = 'history', templateId, runId }: ReportsScreenProps) {
  const query = useSearchParams();
  const router = useRouter();
  const permissions = useHrReportPermissions();
  const canDesign = permissions.canBuild || permissions.canManageTemplates;
  const isDesign = view === 'design';
  const needsCatalogue = view === 'generate' || (isDesign && canDesign);
  const needsLibrary = view === 'templates' || view === 'choose' || needsCatalogue;
  const {
    currentData: datasets,
    error: catalogueError,
    isFetching: fetchingCatalogue,
    refetch: refetchCatalogue,
  } = useGetReportingCatalogueQuery(undefined, {
    skip: !permissions.canView || !needsCatalogue,
  });
  const {
    currentData: templates,
    error: libraryError,
    isFetching: fetchingLibrary,
    refetch: refetchLibrary,
  } = useGetReportingLibraryQuery(
    { edit: isDesign || view === 'templates' },
    { skip: !permissions.canView || !needsLibrary }
  );
  const copyFrom = isDesign && !templateId ? query.get('copyFrom') : null;
  // Path params can remain encoded after a hard reload in the current Next.js runtime.
  let routeTemplateId: string | null = null;
  if (templateId) {
    try {
      routeTemplateId = decodeURIComponent(templateId);
    } catch {
      routeTemplateId = null;
    }
  }
  const selectedId = templateId ? routeTemplateId : copyFrom;
  const hasTemplateSelection = !!(templateId || copyFrom);
  const template = templates?.find((item) => item.id === selectedId);
  const error = (needsCatalogue && catalogueError) || (needsLibrary && libraryError);
  const loading =
    (needsCatalogue && fetchingCatalogue && !datasets) ||
    (needsLibrary && fetchingLibrary && !templates);
  const chooserHref = `${hrReportPaths.choose}${query.size ? `?${query}` : ''}`;
  const templateArea = view === 'templates' || isDesign;
  const backHref = isDesign
    ? hrReportPaths.library
    : view === 'generate'
      ? chooserHref
      : hrReportPaths.history;
  const title = {
    history: 'Reports',
    templates: 'Report templates',
    choose: 'Choose report template',
    generate: 'Report options',
    design: templateId ? 'Edit template' : 'Create template',
    result: 'Generated report',
  }[view];

  if (
    isDesign &&
    permissions.canView &&
    canDesign &&
    datasets?.length &&
    (!hasTemplateSelection || template) &&
    !loading &&
    !error &&
    (!template || copyFrom || template.canEdit)
  ) {
    return (
      <ReportDesigner
        key={`${selectedId || 'new'}-${!!copyFrom}`}
        datasets={datasets}
        template={template}
        copy={!!copyFrom}
      />
    );
  }

  let content;
  if (!permissions.canView) {
    content = <HrNotice role="alert" severity="info">Report access is required to open this workspace.</HrNotice>;
  } else if (error) {
    content = (
      <Alert
        severity="error"
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => {
              if (needsCatalogue) refetchCatalogue();
              if (needsLibrary) refetchLibrary();
            }}
          >
            Retry
          </Button>
        }
      >
        {reportError(error)}
      </Alert>
    );
  } else if (loading) {
    content = <LinearProgress aria-label="Loading report templates" />;
  } else if (view === 'history') {
    content = <ReportHistory />;
  } else if (view === 'result' && runId) {
    content = <ReportRunResult key={runId} id={runId} />;
  } else if (view === 'generate' && template && template.publishedRevision > 0) {
    content = (
      <ReportGenerate
        key={template.id}
        template={template}
        dataset={datasets?.find((dataset) => dataset.id === template.definition.dataSource)}
        backHref={chooserHref}
      />
    );
  } else if (view === 'templates' || view === 'choose') {
    content = (
      <ReportLibrary
        templates={templates || []}
        purpose={view === 'choose' ? 'choose' : 'manage'}
      />
    );
  } else {
    content = (
      <Alert
        severity="warning"
        action={
          <Button component={RouterLink} href={backHref} color="inherit" size="small">
            {isDesign ? 'Back to templates' : 'Choose another template'}
          </Button>
        }
      >
        {isDesign && !canDesign
          ? 'Template design access is required.'
          : isDesign && template && !copyFrom && !template.canEdit
            ? 'Choose Customize a copy to edit this template.'
            : 'This template is unavailable or outside your access.'}
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading={title}
        description={
          templateArea
            ? 'Create and maintain reusable report templates.'
            : view === 'choose'
              ? 'Step 1 of 2: choose a template for this report.'
              : view === 'generate'
                ? 'Step 2 of 2: choose the period and staff, then generate your report.'
                : 'Generate reports and reopen captured results.'
        }
        links={[
          ...(view === 'history'
            ? []
            : [
                {
                  name: 'Reports',
                  href: hrReportPaths.history,
                },
              ]),
          ...(isDesign ? [{ name: 'Report templates', href: hrReportPaths.library }] : []),
          ...(view === 'generate' ? [{ name: 'Choose template', href: chooserHref }] : []),
          { name: title },
        ]}
        isBack={!['history', 'templates'].includes(view)}
        onBack={() => router.push(backHref)}
        action={
          view === 'history' && permissions.canView ? (
            <Button
              component={RouterLink}
              href={hrReportPaths.choose}
              variant="contained"
              size="small"
            >
              Generate report
            </Button>
          ) : view === 'templates' && permissions.canView && canDesign ? (
            <Button
              component={RouterLink}
              href={hrReportPaths.design()}
              variant="contained"
              size="small"
            >
              Create template
            </Button>
          ) : null
        }
        sx={{ px: 1 }}
      />
      <Stack spacing={1} sx={{ p: 1, flex: 1, minHeight: 0 }}>
        {content}
      </Stack>
    </Box>
  );
}

export default function ReportsScreen(props: ReportsScreenProps) {
  return (
    <Suspense fallback={<LinearProgress aria-label="Loading HR reports" />}>
      <ReportingWorkspace {...props} />
    </Suspense>
  );
}
