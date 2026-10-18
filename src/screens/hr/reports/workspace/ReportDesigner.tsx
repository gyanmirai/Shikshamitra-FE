import type { ReportDataset, ReportTemplate } from 'src/redux/hr/hrReportingWorkspaceApi';

import { useState } from 'react';
import { useRouter } from 'src/routes/hooks';
import { hrPaths } from 'src/constants/hr-menus';
import { shikshaMitraToast } from 'src/components/toast';
import { hrReportPaths } from 'src/constants/hr-report-paths';
import { ConfirmDialog } from 'src/components/confirm-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import {
  Box,
  Tab,
  Tabs,
  Stack,
  Alert,
  Button,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';
import {
  useSaveReportingTemplateMutation,
  usePreviewReportingDesignMutation,
} from 'src/redux/hr/hrReportingWorkspaceApi';

import { ReportParameters } from './ReportParameters';
import { ReportResultTable } from './ReportResultTable';
import { ReportFilterEditor } from './ReportFilterEditor';
import { ReportColumnsEditor } from './ReportColumnsEditor';
import { ReportAdvancedEditor } from './ReportAdvancedEditor';
import { useHrReportPermissions } from '../hooks/useHrReportPermissions';
import {
  reportError,
  isMonthlyRegister,
  emptyReportDesign,
  defaultReportParameters,
} from '../reporting-workspace-utils';

export function ReportDesigner({
  datasets,
  template,
  copy,
}: {
  datasets: ReportDataset[];
  template?: ReportTemplate;
  copy: boolean;
}) {
  const router = useRouter();
  const permissions = useHrReportPermissions();
  const [definition, setDefinition] = useState(() =>
    template
      ? structuredClone(template.definition)
      : emptyReportDesign(datasets.find((dataset) => dataset.id === 'employee') || datasets[0])
  );
  const [name, setName] = useState(template ? `${template.name}${copy ? ' copy' : ''}` : '');
  const [description, setDescription] = useState(template?.description || '');
  const [visibility, setVisibility] = useState(
    copy || !template ? (permissions.canBuild ? 'private' : 'organization') : template.visibility
  );
  const [savedId, setSavedId] = useState(!copy && !template?.isBuiltIn ? template?.id : undefined);
  const [stamp, setStamp] = useState(template?.concurrencyStamp);
  const [publishedRevision, setPublishedRevision] = useState(
    copy ? 0 : template?.publishedRevision || 0
  );
  const [baseline, setBaseline] = useState(() =>
    JSON.stringify({ definition, name, description, visibility })
  );
  const [tab, setTab] = useState('columns');
  const [error, setError] = useState('');
  const [nextDataset, setNextDataset] = useState('');
  const [parameters, setParameters] = useState(() =>
    defaultReportParameters(definition.defaultPeriod)
  );
  const [save, saving] = useSaveReportingTemplateMutation();
  const [preview, previewState] = usePreviewReportingDesignMutation();
  const [previewSignature, setPreviewSignature] = useState('');
  const signature = JSON.stringify({ definition, name, description, visibility });
  const { confirmation, requestNavigation } = useUnsavedNavigation(signature !== baseline, {
    push: router.push,
    blockNavigation: saving.isLoading,
  });
  const dataset = datasets.find((d) => d.id === definition.dataSource)!;
  const saveTemplate = async (publish = false) => {
    setError('');
    if (!name.trim()) {
      setError('Enter a template name.');
      return;
    }
    try {
      const result = await save({
        id: savedId,
        body: {
          name: name.trim(),
          description,
          visibility,
          publish,
          definition,
          concurrencyStamp: stamp,
        },
      }).unwrap();
      setSavedId(result.id);
      setStamp(result.concurrencyStamp);
      setPublishedRevision(result.publishedRevision);
      setBaseline(signature);
      shikshaMitraToast.success({
        message: publish ? 'School template published.' : 'Template saved.',
      });
    } catch (e) {
      setError(reportError(e));
    }
  };
  const previewReport = async () => {
    setError('');
    try {
      await preview({ definition, parameters }).unwrap();
      setPreviewSignature(JSON.stringify({ definition, parameters }));
    } catch (e) {
      setError(reportError(e));
    }
  };
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}>
      <CustomBreadcrumbs
        heading={savedId ? 'Edit report template' : 'Create report template'}
        description="Define a reusable report. Choose dates and staff when you generate it."
        links={[
          { name: 'HR/Staff', href: hrPaths.dashboard },
          { name: 'Report templates', href: hrReportPaths.library },
          { name: savedId ? 'Edit template' : 'Create template' },
        ]}
        isBack
        onBack={() => requestNavigation(() => router.push(hrReportPaths.library))}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              disabled={saving.isLoading}
              onClick={() => saveTemplate(false)}
            >
              {saving.isLoading
                ? 'Saving…'
                : visibility === 'organization'
                  ? 'Save draft'
                  : 'Save template'}
            </Button>
            {visibility === 'organization' && permissions.canManageTemplates && (
              <Button
                size="small"
                variant="contained"
                disabled={saving.isLoading}
                onClick={() => saveTemplate(true)}
              >
                Publish template
              </Button>
            )}
          </Stack>
        }
        sx={{ px: 2 }}
      />
      <Stack spacing={2} sx={{ p: 2, flex: 1, minHeight: 0, overflow: 'auto' }}>
        {error && (
          <Alert severity="error" role="alert">
            {error}
          </Alert>
        )}
        <Box
          sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' }, gap: 2 }}
        >
          <TextField
            size="small"
            required
            label="Template name"
            value={name}
            inputProps={{ maxLength: 128 }}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            size="small"
            select
            label="Dataset"
            value={definition.dataSource}
            disabled={!!savedId && publishedRevision > 0}
            onChange={(e) => setNextDataset(e.target.value)}
          >
            {datasets.map((d) => (
              <MenuItem key={d.id} value={d.id}>
                {d.label}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            size="small"
            select
            label="Visibility"
            value={visibility === 'builtin' ? 'private' : visibility}
            disabled={!!savedId}
            onChange={(e) => setVisibility(e.target.value)}
          >
            {permissions.canBuild && <MenuItem value="private">My template</MenuItem>}
            {permissions.canManageTemplates && (
              <MenuItem value="organization">School template</MenuItem>
            )}
          </TextField>
        </Box>
        <TextField
          size="small"
          label="Purpose"
          value={description}
          inputProps={{ maxLength: 512 }}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <TextField
            size="small"
            select
            label="Report layout"
            sx={{ minWidth: 220 }}
            value={definition.layout}
            onChange={(e) =>
              setDefinition((current) => {
                const next = { ...current, layout: e.target.value as typeof current.layout };
                if (
                  isMonthlyRegister(next) &&
                  !['thisMonth', 'lastMonth'].includes(next.defaultPeriod)
                )
                  next.defaultPeriod = 'thisMonth';
                return next;
              })
            }
          >
            {dataset.layouts.map((layout) => (
              <MenuItem key={layout} value={layout}>
                {
                  {
                    detail: 'Detail table',
                    summary: 'Grouped summary',
                    attendanceMatrix: 'Monthly attendance register',
                    salaryComponents: 'Salary component register',
                  }[layout]
                }
              </MenuItem>
            ))}
          </TextField>
          <Typography variant="body2" color="text.secondary">
            {dataset.rowMeaning}
          </Typography>
        </Stack>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          variant="scrollable"
          aria-label="Template settings"
        >
          {['columns', 'filters', 'advanced', 'preview'].map((t) => (
            <Tab
              key={t}
              value={t}
              label={
                t === 'filters'
                  ? 'Fixed filters'
                  : t === 'columns' && definition.layout === 'summary'
                    ? 'Grouping & columns'
                    : t
              }
              disabled={t === 'preview' && !permissions.canBuild}
              id={`report-tab-${t}`}
              aria-controls={`report-panel-${t}`}
            />
          ))}
        </Tabs>
        <Box role="tabpanel" id={`report-panel-${tab}`} aria-labelledby={`report-tab-${tab}`}>
          {tab === 'columns' && definition.layout === 'summary' && (
            <ReportAdvancedEditor
              design={definition}
              dataset={dataset}
              onChange={setDefinition}
              section="summary"
            />
          )}
          {tab === 'columns' && definition.layout !== 'summary' && (
            <ReportColumnsEditor
              columns={definition.columns}
              fields={dataset.fields}
              onChange={(columns) => setDefinition({ ...definition, columns })}
            />
          )}
          {tab === 'filters' && (
            <ReportFilterEditor
              value={definition.filters}
              fields={dataset.fields}
              onChange={(filters) => {
                setDefinition({ ...definition, filters });
                setParameters({ ...parameters, filterValues: {} });
              }}
            />
          )}
          {tab === 'advanced' && (
            <ReportAdvancedEditor design={definition} dataset={dataset} onChange={setDefinition} />
          )}
          {tab === 'preview' && (
            <Stack spacing={2}>
              <ReportParameters
                design={definition}
                fields={dataset.fields}
                value={parameters}
                onChange={setParameters}
              />
              <Button
                size="small"
                variant="outlined"
                disabled={previewState.isLoading}
                sx={{ alignSelf: 'flex-start' }}
                onClick={previewReport}
              >
                {previewState.isLoading ? 'Preparing preview…' : 'Preview report'}
              </Button>
              {previewState.data && (
                <>
                  {previewSignature !== JSON.stringify({ definition, parameters }) && (
                    <Alert severity="info">
                      Settings changed. Refresh the preview to see the current design.
                    </Alert>
                  )}
                  <Typography variant="body2">
                    Showing the first {previewState.data.rows.length} of{' '}
                    {previewState.data.totalCount.toLocaleString('en-IN')} matching output rows.
                  </Typography>
                  {previewState.data.warnings.map((w) => (
                    <Alert key={w} severity="info">
                      {w}
                    </Alert>
                  ))}
                  <Box sx={{ height: 400, minWidth: 0 }}>
                    <ReportResultTable
                      columns={previewState.data.columns}
                      rows={previewState.data.rows}
                      count={previewState.data.totalCount}
                      timezone={previewState.data.timeZone}
                    />
                  </Box>
                </>
              )}
            </Stack>
          )}
        </Box>
      </Stack>
      {confirmation}
      <ConfirmDialog
        open={!!nextDataset}
        onClose={() => setNextDataset('')}
        title="Change report dataset?"
        content="Columns, filters and calculations will reset to the selected dataset."
        action={
          <Button
            size="small"
            variant="contained"
            onClick={() => {
              setDefinition(emptyReportDesign(datasets.find((d) => d.id === nextDataset)!));
              setParameters(defaultReportParameters());
              setNextDataset('');
            }}
          >
            Change dataset
          </Button>
        }
      />
    </Box>
  );
}
