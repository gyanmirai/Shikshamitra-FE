import type {
  HrReportField,
  HrReportFormat,
  HrReportSource,
  HrReportTemplate,
  HrReportExportJob,
  HrReportFilterCondition,
} from 'src/redux/hr/hrReportsApi';

import { toast } from 'sonner';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Button,
  MenuItem,
  TextField,
  Typography,
  IconButton,
  Autocomplete,
  ToggleButton,
  CircularProgress,
  ToggleButtonGroup,
} from '@mui/material';
import {
  usePreviewHrReportMutation,
  useRetryHrReportExportMutation,
  useCreateHrReportExportMutation,
  useCancelHrReportExportMutation,
  useCreateHrReportScheduleMutation,
  useDownloadHrReportExportMutation,
  useCreateHrReportTemplateMutation,
  useDeleteHrReportTemplateMutation,
  useUpdateHrReportTemplateMutation,
  useRegenerateHrReportExportMutation,
  useDuplicateHrReportTemplateMutation,
} from 'src/redux/hr/hrReportsApi';

import { HrReportPreviewTable } from './HrReportPreviewTable';
import { HrReportChartPreview } from './HrReportChartPreview';
import { HrReportExportHistory } from './HrReportExportHistory';
import {
  buildHrReportRequest,
  getHrReportDateFields,
  isHrReportPayrollSource,
  defaultHrReportOperator,
  getHrReportDateRangeError,
  type HrReportBuilderState,
  DEFAULT_HR_REPORT_PAGE_SIZE,
  getHrReportChartValueFields,
  createHrReportStateFromSource,
  getHrReportChartCategoryFields,
  createHrReportStateFromTemplate,
} from '../hr-report-utils';

import type { HrReportPermissions } from '../hr-report-permissions';

type HrReportBuilderProps = {
  source: HrReportSource;
  template?: HrReportTemplate;
  exportJobs: HrReportExportJob[];
  isFetchingExports: boolean;
  refetchExports: () => any;
  permissions: HrReportPermissions;
};

export function HrReportBuilder({
  source,
  template,
  exportJobs,
  isFetchingExports,
  refetchExports,
  permissions,
}: HrReportBuilderProps) {
  const [previewReport, { data: preview, isLoading: isPreviewLoading }] =
    usePreviewHrReportMutation();
  const [createExport, { isLoading: isCreatingExport }] = useCreateHrReportExportMutation();
  const [createSchedule, { isLoading: isScheduling }] = useCreateHrReportScheduleMutation();
  const [cancelExport] = useCancelHrReportExportMutation();
  const [retryExport] = useRetryHrReportExportMutation();
  const [regenerateExport] = useRegenerateHrReportExportMutation();
  const [downloadExport, { isLoading: isDownloading }] = useDownloadHrReportExportMutation();
  const [createTemplate, { isLoading: isSavingTemplate }] = useCreateHrReportTemplateMutation();
  const [updateTemplate] = useUpdateHrReportTemplateMutation();
  const [duplicateTemplate] = useDuplicateHrReportTemplateMutation();
  const [deleteTemplate] = useDeleteHrReportTemplateMutation();

  const [state, setState] = useState(() =>
    template
      ? createHrReportStateFromTemplate(template, source)
      : createHrReportStateFromSource(source)
  );
  const [lastRequest, setLastRequest] = useState<{ page: number; pageSize: number } | null>(null);

  useEffect(() => {
    setState(
      template
        ? createHrReportStateFromTemplate(template, source)
        : createHrReportStateFromSource(source)
    );
    setLastRequest(null);
  }, [source, template]);

  const columnFields = useMemo(() => source.fields ?? [], [source.fields]);
  const filterFields = useMemo(
    () => columnFields.filter((field) => field.filterable),
    [columnFields]
  );
  const sortableFields = useMemo(
    () => columnFields.filter((field) => field.sortable),
    [columnFields]
  );
  const groupFields = useMemo(
    () => columnFields.filter((field) => field.groupable),
    [columnFields]
  );
  const summaryFields = useMemo(
    () => columnFields.filter((field) => field.summarizable),
    [columnFields]
  );
  const chartCategoryFields = useMemo(() => getHrReportChartCategoryFields(source), [source]);
  const chartValueFields = useMemo(() => getHrReportChartValueFields(source), [source]);
  const chartCategoryValue = chartCategoryFields.some(
    (field) => field.id === state.chartCategoryField
  )
    ? state.chartCategoryField
    : '';
  const chartValueField = chartValueFields.some((field) => field.id === state.chartValueField)
    ? state.chartValueField
    : '';
  const dateFields = useMemo(() => getHrReportDateFields(source), [source]);
  const isPayrollSource = isHrReportPayrollSource(source);
  const dateRangeError = getHrReportDateRangeError(state.fromDate, state.toDate);
  const selectedDateField = dateFields.find((field) => field.id === state.dateField);
  const isTimelineInvalid = Boolean(dateRangeError);
  const timelineChips = useMemo(
    () =>
      [
        selectedDateField ? `Date basis: ${selectedDateField.label}` : '',
        state.fromDate ? `From: ${state.fromDate}` : '',
        state.toDate ? `To: ${state.toDate}` : '',
        state.month ? `Month: ${state.month}` : '',
      ].filter(Boolean),
    [selectedDateField, state.fromDate, state.month, state.toDate]
  );

  const requestFor = useCallback(
    (page = 1, pageSize = DEFAULT_HR_REPORT_PAGE_SIZE, format: HrReportFormat = 'excel') =>
      buildHrReportRequest(state, source, page, pageSize, format),
    [source, state]
  );

  const handlePreview = useCallback(
    async (page = 1, pageSize = DEFAULT_HR_REPORT_PAGE_SIZE) => {
      await previewReport(requestFor(page, pageSize)).unwrap();
      setLastRequest({ page, pageSize });
    },
    [previewReport, requestFor]
  );

  const handleExport = useCallback(
    async (format: HrReportFormat) => {
      await createExport(requestFor(1, DEFAULT_HR_REPORT_PAGE_SIZE, format)).unwrap();
      await refetchExports();
      toast.success(`${format.toUpperCase()} export queued`);
    },
    [createExport, refetchExports, requestFor]
  );

  const handleSchedule = useCallback(async () => {
    await createSchedule({
      name: `${state.reportName || source.label} Schedule`,
      templateId: state.selectedTemplate?.id,
      frequency: 'monthly',
      deliveryMode: 'inAppAndEmail',
      recipientUserIds: [],
      definition: requestFor(1, DEFAULT_HR_REPORT_PAGE_SIZE, 'excel'),
    }).unwrap();
    toast.success('Monthly report schedule created');
  }, [createSchedule, requestFor, source.label, state.reportName, state.selectedTemplate?.id]);

  const handleSaveTemplate = useCallback(
    async (publish = false) => {
      const body = {
        name: state.reportName || source.label,
        category: source.category,
        dataSource: source.id,
        visibility: publish ? 'organization' : state.visibility,
        status: publish ? 'Published' : 'Draft',
        definition: requestFor(1, DEFAULT_HR_REPORT_PAGE_SIZE),
      };

      if (state.selectedTemplate) {
        const updated = await updateTemplate({ id: state.selectedTemplate.id, body }).unwrap();
        setState((current) => ({ ...current, selectedTemplate: updated }));
        toast.success('Template updated');
      } else {
        const created = await createTemplate(body).unwrap();
        setState((current) => ({ ...current, selectedTemplate: created }));
        toast.success('Template saved');
      }
    },
    [createTemplate, requestFor, source, state, updateTemplate]
  );

  const handleDownload = useCallback(
    async (jobId: string, fileName?: string) => {
      const blob = await downloadExport(jobId).unwrap();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'hr-report';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    [downloadExport]
  );

  const handleExportAction = useCallback(
    async (action: 'cancel' | 'retry' | 'regenerate', jobId: string) => {
      if (action === 'cancel') {
        await cancelExport(jobId).unwrap();
        toast.success('Export cancelled');
      } else if (action === 'retry') {
        await retryExport(jobId).unwrap();
        toast.success('Export retry queued');
      } else {
        await regenerateExport(jobId).unwrap();
        toast.success('Export regeneration queued');
      }
      await refetchExports();
    },
    [cancelExport, refetchExports, regenerateExport, retryExport]
  );

  const updateCondition = (
    index: number,
    updater: (condition: HrReportFilterCondition) => HrReportFilterCondition
  ) => {
    setState((current) => ({
      ...current,
      conditions: current.conditions.map((condition, itemIndex) =>
        itemIndex === index ? updater(condition) : condition
      ),
    }));
  };

  const renderConditionValue = (condition: HrReportFilterCondition, index: number) => {
    const field = filterFields.find((item) => item.id === condition.field);
    return (
      <TextField
        size="small"
        label="Value"
        value={condition.value ?? ''}
        type={field?.type === 'number' ? 'number' : field?.type === 'date' ? 'date' : 'text'}
        InputLabelProps={field?.type === 'date' ? { shrink: true } : undefined}
        onChange={(event) =>
          updateCondition(index, (item) => ({ ...item, value: event.target.value }))
        }
      />
    );
  };

  return (
    <Stack
      data-testid="hr-report-builder"
      spacing={2}
      sx={{
        p: 2,
        height: '100%',
        minWidth: 0,
        minHeight: 0,
        overflow: 'auto',
      }}
    >
      <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
        <Stack spacing={2}>
          <Box
            data-testid="hr-report-builder-controls"
            sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' } }}
          >
            <TextField
              size="small"
              label="Report Name"
              value={state.reportName}
              onChange={(event) =>
                setState((current) => ({ ...current, reportName: event.target.value }))
              }
            />
            <TextField
              select
              size="small"
              label="Visibility"
              value={state.visibility}
              onChange={(event) =>
                setState((current) => ({
                  ...current,
                  visibility: event.target.value as 'private' | 'organization',
                }))
              }
            >
              <MenuItem value="private">Private</MenuItem>
              <MenuItem value="organization">Organization</MenuItem>
            </TextField>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={state.sortDirection}
              onChange={(_event, value) =>
                value && setState((current) => ({ ...current, sortDirection: value }))
              }
            >
              <ToggleButton value="asc">Asc</ToggleButton>
              <ToggleButton value="desc">Desc</ToggleButton>
            </ToggleButtonGroup>
          </Box>

          <Autocomplete
            multiple
            size="small"
            options={columnFields}
            value={columnFields.filter((field) => state.columns.includes(field.id))}
            getOptionLabel={(field) => field.label}
            onChange={(_event, value) =>
              setState((current) => ({ ...current, columns: value.map((field) => field.id) }))
            }
            renderInput={(params) => <TextField {...params} label="Columns" />}
          />

          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
            <Stack spacing={1.5}>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Typography variant="subtitle2">Timeline</Typography>
                <Button
                  size="small"
                  variant="text"
                  disabled={!state.dateField && !state.fromDate && !state.toDate && !state.month}
                  onClick={() =>
                    setState((current) => ({
                      ...current,
                      fromDate: '',
                      toDate: '',
                      month: '',
                    }))
                  }
                >
                  Clear Timeline
                </Button>
              </Stack>

              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: {
                    xs: '1fr',
                    md: isPayrollSource ? '1fr 1fr' : '1.2fr 1fr 1fr',
                  },
                }}
              >
                {isPayrollSource ? (
                  <TextField
                    size="small"
                    type="month"
                    label="Payroll Month"
                    value={state.month}
                    InputLabelProps={{ shrink: true }}
                    onChange={(event) =>
                      setState((current) => ({ ...current, month: event.target.value }))
                    }
                  />
                ) : (
                  <>
                    <TextField
                      select
                      size="small"
                      label="Date Basis"
                      value={state.dateField}
                      disabled={dateFields.length === 0}
                      onChange={(event) =>
                        setState((current) => ({ ...current, dateField: event.target.value }))
                      }
                    >
                      {dateFields.map((field) => (
                        <MenuItem key={field.id} value={field.id}>
                          {field.label}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      size="small"
                      type="date"
                      label="From Date"
                      value={state.fromDate}
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(dateRangeError)}
                      onChange={(event) =>
                        setState((current) => ({ ...current, fromDate: event.target.value }))
                      }
                    />
                    <TextField
                      size="small"
                      type="date"
                      label="To Date"
                      value={state.toDate}
                      InputLabelProps={{ shrink: true }}
                      error={Boolean(dateRangeError)}
                      helperText={dateRangeError}
                      onChange={(event) =>
                        setState((current) => ({ ...current, toDate: event.target.value }))
                      }
                    />
                  </>
                )}
              </Box>

              {timelineChips.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {timelineChips.map((chip) => (
                    <Chip key={chip} label={chip} size="small" variant="soft" />
                  ))}
                </Stack>
              ) : null}
            </Stack>
          </Box>

          <Box
            sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' } }}
          >
            <TextField
              select
              size="small"
              label="Sort By"
              value={state.sortField}
              onChange={(event) =>
                setState((current) => ({ ...current, sortField: event.target.value }))
              }
            >
              <MenuItem value="">None</MenuItem>
              {sortableFields.map((field) => (
                <MenuItem key={field.id} value={field.id}>
                  {field.label}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              multiple
              size="small"
              options={groupFields}
              value={groupFields.filter((field) => state.groups.includes(field.id))}
              getOptionLabel={(field) => field.label}
              onChange={(_event, value) =>
                setState((current) => ({ ...current, groups: value.map((field) => field.id) }))
              }
              renderInput={(params) => <TextField {...params} label="Group By" />}
            />

            <TextField
              select
              size="small"
              label="Summary"
              value={state.summaryField}
              onChange={(event) =>
                setState((current) => ({ ...current, summaryField: event.target.value }))
              }
            >
              <MenuItem value="">None</MenuItem>
              {summaryFields.map((field) => (
                <MenuItem key={field.id} value={field.id}>
                  Sum {field.label}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Box sx={{ border: '1px dashed', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
            <Stack spacing={1.5}>
              <Typography variant="subtitle2">Analytics</Typography>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
                }}
              >
                <TextField
                  select
                  size="small"
                  label="Chart Type"
                  value={state.chartType}
                  onChange={(event) =>
                    setState((current) => ({
                      ...current,
                      chartType: event.target.value as HrReportBuilderState['chartType'],
                    }))
                  }
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="kpi">KPI</MenuItem>
                  <MenuItem value="bar">Bar</MenuItem>
                  <MenuItem value="line">Line</MenuItem>
                  <MenuItem value="donut">Donut</MenuItem>
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Chart Category"
                  value={chartCategoryValue}
                  disabled={
                    state.chartType === 'none' ||
                    state.chartType === 'kpi' ||
                    chartCategoryFields.length === 0
                  }
                  onChange={(event) =>
                    setState((current) => ({ ...current, chartCategoryField: event.target.value }))
                  }
                >
                  <MenuItem value="">Auto</MenuItem>
                  {chartCategoryFields.map((field) => (
                    <MenuItem key={field.id} value={field.id}>
                      {field.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  size="small"
                  label="Chart Value"
                  value={chartValueField}
                  disabled={
                    state.chartType === 'none' ||
                    state.chartType === 'kpi' ||
                    chartValueFields.length === 0
                  }
                  onChange={(event) =>
                    setState((current) => ({ ...current, chartValueField: event.target.value }))
                  }
                >
                  <MenuItem value="">Count rows</MenuItem>
                  {chartValueFields.map((field) => (
                    <MenuItem key={field.id} value={field.id}>
                      Sum {field.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>
            </Stack>
          </Box>

          <Stack spacing={1}>
            <Stack direction="row" alignItems="center" justifyContent="space-between">
              <Typography variant="subtitle2">Filters</Typography>
              <Button
                size="small"
                variant="text"
                disabled={filterFields.length === 0}
                onClick={() =>
                  setState((current) => ({
                    ...current,
                    conditions: [
                      ...current.conditions,
                      {
                        field: filterFields[0]?.id ?? '',
                        operator: defaultHrReportOperator(filterFields[0]),
                        value: '',
                      },
                    ],
                  }))
                }
              >
                Add Filter
              </Button>
            </Stack>
            {state.conditions.map((condition, index) => {
              const field = filterFields.find((item) => item.id === condition.field);
              const operators = field?.operators ?? ['equals', 'contains'];
              return (
                <Box
                  key={`${condition.field}-${index}`}
                  sx={{
                    display: 'grid',
                    gap: 1,
                    gridTemplateColumns: { xs: '1fr', md: '1fr 160px 1fr 48px' },
                  }}
                >
                  <TextField
                    select
                    size="small"
                    label="Field"
                    value={condition.field}
                    onChange={(event) =>
                      updateCondition(index, (item) => {
                        const nextField = filterFields.find(
                          (candidate) => candidate.id === event.target.value
                        );
                        return {
                          ...item,
                          field: event.target.value,
                          operator: defaultHrReportOperator(nextField),
                        };
                      })
                    }
                  >
                    {filterFields.map((item: HrReportField) => (
                      <MenuItem key={item.id} value={item.id}>
                        {item.label}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    label="Operator"
                    value={condition.operator}
                    onChange={(event) =>
                      updateCondition(index, (item) => ({ ...item, operator: event.target.value }))
                    }
                  >
                    {operators.map((operator) => (
                      <MenuItem key={operator} value={operator}>
                        {operator}
                      </MenuItem>
                    ))}
                  </TextField>
                  {renderConditionValue(condition, index)}
                  <IconButton
                    size="small"
                    onClick={() =>
                      setState((current) => ({
                        ...current,
                        conditions: current.conditions.filter(
                          (_item, itemIndex) => itemIndex !== index
                        ),
                      }))
                    }
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Box>
              );
            })}
          </Stack>

          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Button
              data-testid="hr-report-preview-button"
              variant="contained"
              size="small"
              startIcon={<Iconify icon={GlobalIcons.report} />}
              disabled={isPreviewLoading || isTimelineInvalid}
              onClick={() => handlePreview(1, lastRequest?.pageSize ?? DEFAULT_HR_REPORT_PAGE_SIZE)}
            >
              Preview
            </Button>
            {permissions.canManageTemplates ? (
              <>
                <Button
                  data-testid="hr-report-save-template-button"
                  variant="outlined"
                  size="small"
                  disabled={isSavingTemplate}
                  onClick={() => handleSaveTemplate(false)}
                >
                  Save Template
                </Button>
                <Button
                  data-testid="hr-report-publish-template-button"
                  variant="outlined"
                  size="small"
                  disabled={isSavingTemplate}
                  onClick={() => handleSaveTemplate(true)}
                >
                  Publish
                </Button>
              </>
            ) : null}
            {permissions.canExport ? (
              <>
                <Button
                  data-testid="hr-report-export-excel-button"
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.excel} />}
                  disabled={isCreatingExport || isTimelineInvalid}
                  onClick={() => handleExport('excel')}
                >
                  Excel
                </Button>
                <Button
                  data-testid="hr-report-export-pdf-button"
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.pdf} />}
                  disabled={isCreatingExport || isTimelineInvalid}
                  onClick={() => handleExport('pdf')}
                >
                  PDF
                </Button>
              </>
            ) : null}
            {permissions.canSchedule ? (
              <Button
                data-testid="hr-report-schedule-button"
                variant="outlined"
                size="small"
                startIcon={<Iconify icon="solar:calendar-add-bold" />}
                disabled={isScheduling || isTimelineInvalid}
                onClick={handleSchedule}
              >
                Schedule
              </Button>
            ) : null}
            {state.selectedTemplate && permissions.canManageTemplates ? (
              <>
                <IconButton
                  data-testid="hr-report-duplicate-template-button"
                  size="small"
                  onClick={async () => {
                    const duplicated = await duplicateTemplate(state.selectedTemplate!.id).unwrap();
                    setState((current) => ({
                      ...current,
                      selectedTemplate: duplicated,
                      reportName: duplicated.name,
                    }));
                    toast.success('Template duplicated');
                  }}
                >
                  <Iconify icon="solar:copy-bold" />
                </IconButton>
                {permissions.canDelete ? (
                  <IconButton
                    data-testid="hr-report-delete-template-button"
                    size="small"
                    onClick={async () => {
                      await deleteTemplate(state.selectedTemplate!.id).unwrap();
                      setState(createHrReportStateFromSource(source));
                      toast.success('Template deleted');
                    }}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                ) : null}
              </>
            ) : null}
            {(isPreviewLoading || isCreatingExport || isFetchingExports || isScheduling) && (
              <CircularProgress size={24} />
            )}
          </Stack>
        </Stack>
      </Box>

      {preview?.queryWarnings?.length ? (
        <Stack spacing={1}>
          {preview.queryWarnings.map((warning) => (
            <Alert key={warning} severity="warning">
              {warning}
            </Alert>
          ))}
        </Stack>
      ) : null}

      <HrReportChartPreview chart={preview?.chart} />

      <HrReportPreviewTable
        preview={preview}
        reportName={state.reportName}
        sourceLabel={source.label}
        isLoading={isPreviewLoading}
        onPageChange={handlePreview}
      />

      <HrReportExportHistory
        exportJobs={exportJobs}
        isFetching={isFetchingExports}
        isDownloading={isDownloading}
        canExport={permissions.canExport}
        onDownload={handleDownload}
        onAction={permissions.canExport ? handleExportAction : undefined}
      />
    </Stack>
  );
}
