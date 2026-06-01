'use client';

import type {
  HrReportField,
  HrReportFormat,
  HrReportSource,
  HrReportRequest,
  HrReportTemplate,
  HrReportFilterCondition,
} from 'src/redux/hr/hrReportsApi';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomizableTable from 'src/components/customizabaleTable';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  Box,
  Chip,
  Stack,
  Button,
  Divider,
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
  useGetHrReportExportsQuery,
  useGetHrReportSourcesQuery,
  useGetHrReportTemplatesQuery,
  useCreateHrReportExportMutation,
  useDownloadHrReportExportMutation,
  useCreateHrReportTemplateMutation,
  useDeleteHrReportTemplateMutation,
  useUpdateHrReportTemplateMutation,
  useDuplicateHrReportTemplateMutation,
} from 'src/redux/hr/hrReportsApi';

const DEFAULT_PAGE_SIZE = 25;

const formatDateTime = (value?: string) =>
  value ? dayjs(value).format('DD MMM YYYY, hh:mm A') : '-';

const defaultOperator = (field?: HrReportField) => field?.operators[0] ?? 'equals';

const ReportsScreen = () => {
  const { data: sourcesData, isLoading: isLoadingSources } = useGetHrReportSourcesQuery();
  const { data: templatesData } = useGetHrReportTemplatesQuery();
  const {
    data: exportJobs = [],
    refetch: refetchExports,
    isFetching: isFetchingExports,
  } = useGetHrReportExportsQuery(undefined, { pollingInterval: 5000 });

  const [previewReport, { data: preview, isLoading: isPreviewLoading }] =
    usePreviewHrReportMutation();
  const [createExport, { isLoading: isCreatingExport }] = useCreateHrReportExportMutation();
  const [downloadExport, { isLoading: isDownloading }] = useDownloadHrReportExportMutation();
  const [createTemplate, { isLoading: isSavingTemplate }] = useCreateHrReportTemplateMutation();
  const [updateTemplate] = useUpdateHrReportTemplateMutation();
  const [duplicateTemplate] = useDuplicateHrReportTemplateMutation();
  const [deleteTemplate] = useDeleteHrReportTemplateMutation();

  const sources = useMemo(() => sourcesData?.sources ?? [], [sourcesData?.sources]);
  const templates = useMemo(() => templatesData?.items ?? [], [templatesData?.items]);
  const [selectedSourceId, setSelectedSourceId] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<HrReportTemplate | null>(null);
  const [reportName, setReportName] = useState('Custom HR Report');
  const [columns, setColumns] = useState<string[]>([]);
  const [conditions, setConditions] = useState<HrReportFilterCondition[]>([]);
  const [sortField, setSortField] = useState('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [groups, setGroups] = useState<string[]>([]);
  const [summaryField, setSummaryField] = useState('');
  const [visibility, setVisibility] = useState<'private' | 'organization'>('private');
  const [lastRequest, setLastRequest] = useState<{ page: number; pageSize: number } | null>(null);

  const selectedSource = useMemo(
    () => sources.find((source) => source.id === selectedSourceId),
    [selectedSourceId, sources]
  );

  const columnFields = selectedSource?.fields ?? [];
  const filterFields = columnFields.filter((field) => field.filterable);
  const sortableFields = columnFields.filter((field) => field.sortable);
  const groupFields = columnFields.filter((field) => field.groupable);
  const summaryFields = columnFields.filter((field) => field.summarizable);

  useEffect(() => {
    if (!selectedSourceId && sources.length > 0) {
      const first = sources[0];
      setSelectedSourceId(first.id);
      setReportName(first.label);
      setColumns(first.defaultColumns);
      setSortField(first.defaultSorts[0] ?? '');
    }
  }, [selectedSourceId, sources]);

  const applySource = useCallback((source: HrReportSource) => {
    setSelectedTemplate(null);
    setSelectedSourceId(source.id);
    setReportName(source.label);
    setColumns(source.defaultColumns);
    setConditions([]);
    setGroups([]);
    setSummaryField('');
    setSortField(source.defaultSorts[0] ?? '');
    setSortDirection('asc');
    setLastRequest(null);
  }, []);

  const applyTemplate = useCallback((template: HrReportTemplate) => {
    const { definition } = template;
    setSelectedTemplate(template);
    setSelectedSourceId(template.dataSource);
    setReportName(template.name);
    setColumns(definition.columns ?? []);
    setConditions(definition.filters?.conditions ?? []);
    setGroups(definition.groups ?? []);
    setSummaryField(definition.summaries?.[0]?.field ?? '');
    setSortField(definition.sorts?.[0]?.field ?? '');
    setSortDirection((definition.sorts?.[0]?.direction as 'asc' | 'desc') ?? 'asc');
    setVisibility(template.visibility === 'organization' ? 'organization' : 'private');
    setLastRequest(null);
  }, []);

  const buildRequest = useCallback(
    (page = 1, pageSize = DEFAULT_PAGE_SIZE): HrReportRequest => ({
      reportType: reportName || selectedSource?.label || 'HR Report',
      dataSource: selectedSourceId,
      format: 'excel',
      page,
      pageSize,
      columns,
      groups,
      summaries: summaryField ? [{ field: summaryField, function: 'sum' }] : [],
      sorts: sortField ? [{ field: sortField, direction: sortDirection }] : [],
      filters: {
        conditions: conditions.filter(
          (condition) => condition.field && (condition.value || condition.values?.length)
        ),
      },
    }),
    [
      columns,
      conditions,
      groups,
      reportName,
      selectedSource?.label,
      selectedSourceId,
      sortDirection,
      sortField,
      summaryField,
    ]
  );

  const handlePreview = useCallback(
    async (page = 1, pageSize = DEFAULT_PAGE_SIZE) => {
      await previewReport(buildRequest(page, pageSize)).unwrap();
      setLastRequest({ page, pageSize });
    },
    [buildRequest, previewReport]
  );

  const handleExport = useCallback(
    async (format: HrReportFormat) => {
      await createExport({ ...buildRequest(1, DEFAULT_PAGE_SIZE), format }).unwrap();
      await refetchExports();
      toast.success(`${format.toUpperCase()} export queued`);
    },
    [buildRequest, createExport, refetchExports]
  );

  const handleSaveTemplate = useCallback(
    async (publish = false) => {
      if (!selectedSource) return;
      const body = {
        name: reportName || selectedSource.label,
        category: selectedSource.category,
        dataSource: selectedSource.id,
        visibility: publish ? 'organization' : visibility,
        status: publish ? 'Published' : 'Draft',
        definition: buildRequest(1, DEFAULT_PAGE_SIZE),
      };

      if (selectedTemplate) {
        const updated = await updateTemplate({ id: selectedTemplate.id, body }).unwrap();
        setSelectedTemplate(updated);
        toast.success('Template updated');
      } else {
        const created = await createTemplate(body).unwrap();
        setSelectedTemplate(created);
        toast.success('Template saved');
      }
    },
    [
      buildRequest,
      createTemplate,
      reportName,
      selectedSource,
      selectedTemplate,
      updateTemplate,
      visibility,
    ]
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

  const previewColumns = useMemo(
    () =>
      (preview?.columns ?? []).map((column) => ({
        id: column.id,
        label: column.label,
        minWidth: '12vw',
        align: 'left' as const,
        filterType: 'string' as const,
      })),
    [preview?.columns]
  );

  const previewRows = useMemo(
    () =>
      (preview?.rows ?? []).map((row, index) => ({
        id: `${preview?.page ?? 1}-${index}`,
        ...row,
      })),
    [preview?.page, preview?.rows]
  );

  const historyColumns = useMemo(
    () => [
      { id: 'reportType', label: 'Report', minWidth: '14vw', align: 'left' as const },
      { id: 'format', label: 'Format', minWidth: '7vw', align: 'left' as const },
      {
        id: 'status',
        label: 'Status',
        minWidth: '9vw',
        align: 'left' as const,
        render: (_value: any, row: any) => (
          <Chip
            size="small"
            label={row.status}
            color={
              row.status === 'Completed' ? 'success' : row.status === 'Failed' ? 'error' : 'info'
            }
            variant="soft"
          />
        ),
      },
      {
        id: 'creationTime',
        label: 'Requested',
        minWidth: '13vw',
        align: 'left' as const,
        render: (value: string) => formatDateTime(value),
      },
      {
        id: 'action',
        label: '',
        minWidth: '7vw',
        align: 'left' as const,
        isFilter: false,
        isSort: false,
        render: (_value: any, row: any) => (
          <IconButton
            size="small"
            disabled={row.status !== 'Completed' || isDownloading}
            onClick={() => handleDownload(row.id, row.fileName)}
          >
            <Iconify icon={GlobalIcons.download} />
          </IconButton>
        ),
      },
    ],
    [handleDownload, isDownloading]
  );

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
          setConditions((items) =>
            items.map((item, itemIndex) =>
              itemIndex === index ? { ...item, value: event.target.value } : item
            )
          )
        }
      />
    );
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <CustomBreadcrumbs
        heading="Reports"
        links={[{ name: 'HR/Staff', href: '/hr/dashboard/' }, { name: 'Reports' }]}
        sx={{ px: 2 }}
      />

      <Box
        sx={{
          p: 2,
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '280px minmax(0, 1fr)' },
        }}
      >
        <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 1.5 }}>
          <Stack spacing={1.5}>
            <Typography variant="subtitle2">Sources</Typography>
            {isLoadingSources ? <CircularProgress size={20} /> : null}
            {sources.map((source) => (
              <Button
                key={source.id}
                size="small"
                variant={source.id === selectedSourceId ? 'contained' : 'text'}
                onClick={() => applySource(source)}
                sx={{ justifyContent: 'flex-start' }}
              >
                {source.label}
              </Button>
            ))}

            <Divider />
            <Typography variant="subtitle2">Templates</Typography>
            {templates.map((template) => (
              <Stack
                key={template.id}
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ minWidth: 0 }}
              >
                <Button
                  size="small"
                  variant={selectedTemplate?.id === template.id ? 'outlined' : 'text'}
                  onClick={() => applyTemplate(template)}
                  sx={{ justifyContent: 'flex-start', minWidth: 0, flex: 1 }}
                >
                  <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {template.name}
                  </Box>
                </Button>
                <IconButton
                  size="small"
                  onClick={async () => {
                    await duplicateTemplate(template.id).unwrap();
                    toast.success('Template duplicated');
                  }}
                >
                  <Iconify icon="solar:copy-bold" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={async () => {
                    await deleteTemplate(template.id).unwrap();
                    if (selectedTemplate?.id === template.id) setSelectedTemplate(null);
                    toast.success('Template deleted');
                  }}
                >
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
              </Stack>
            ))}
          </Stack>
        </Box>

        <Stack spacing={2} sx={{ minWidth: 0, minHeight: 0 }}>
          <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
            <Stack spacing={2}>
              <Box
                sx={{
                  display: 'grid',
                  gap: 2,
                  gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
                }}
              >
                <TextField
                  size="small"
                  label="Report Name"
                  value={reportName}
                  onChange={(event) => setReportName(event.target.value)}
                />
                <TextField
                  select
                  size="small"
                  label="Visibility"
                  value={visibility}
                  onChange={(event) => setVisibility(event.target.value as any)}
                >
                  <MenuItem value="private">Private</MenuItem>
                  <MenuItem value="organization">Organization</MenuItem>
                </TextField>
                <ToggleButtonGroup
                  exclusive
                  size="small"
                  value={sortDirection}
                  onChange={(_event, value) => value && setSortDirection(value)}
                >
                  <ToggleButton value="asc">Asc</ToggleButton>
                  <ToggleButton value="desc">Desc</ToggleButton>
                </ToggleButtonGroup>
              </Box>

              <Autocomplete
                multiple
                size="small"
                options={columnFields}
                value={columnFields.filter((field) => columns.includes(field.id))}
                getOptionLabel={(field) => field.label}
                onChange={(_event, value) => setColumns(value.map((field) => field.id))}
                renderInput={(params) => <TextField {...params} label="Columns" />}
              />

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
                  label="Sort By"
                  value={sortField}
                  onChange={(event) => setSortField(event.target.value)}
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
                  value={groupFields.filter((field) => groups.includes(field.id))}
                  getOptionLabel={(field) => field.label}
                  onChange={(_event, value) => setGroups(value.map((field) => field.id))}
                  renderInput={(params) => <TextField {...params} label="Group By" />}
                />

                <TextField
                  select
                  size="small"
                  label="Summary"
                  value={summaryField}
                  onChange={(event) => setSummaryField(event.target.value)}
                >
                  <MenuItem value="">None</MenuItem>
                  {summaryFields.map((field) => (
                    <MenuItem key={field.id} value={field.id}>
                      Sum {field.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Box>

              <Stack spacing={1}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2">Filters</Typography>
                  <Button
                    size="small"
                    variant="text"
                    disabled={filterFields.length === 0}
                    onClick={() =>
                      setConditions((items) => [
                        ...items,
                        {
                          field: filterFields[0]?.id ?? '',
                          operator: defaultOperator(filterFields[0]),
                          value: '',
                        },
                      ])
                    }
                  >
                    Add Filter
                  </Button>
                </Stack>
                {conditions.map((condition, index) => {
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
                          setConditions((items) =>
                            items.map((item, itemIndex) =>
                              itemIndex === index
                                ? {
                                    ...item,
                                    field: event.target.value,
                                    operator: defaultOperator(
                                      filterFields.find(
                                        (candidate) => candidate.id === event.target.value
                                      )
                                    ),
                                  }
                                : item
                            )
                          )
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
                          setConditions((items) =>
                            items.map((item, itemIndex) =>
                              itemIndex === index ? { ...item, operator: event.target.value } : item
                            )
                          )
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
                          setConditions((items) =>
                            items.filter((_item, itemIndex) => itemIndex !== index)
                          )
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
                  variant="contained"
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.report} />}
                  disabled={!selectedSourceId || isPreviewLoading}
                  onClick={() => handlePreview(1, lastRequest?.pageSize ?? DEFAULT_PAGE_SIZE)}
                >
                  Preview
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!selectedSourceId || isSavingTemplate}
                  onClick={() => handleSaveTemplate(false)}
                >
                  Save Template
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  disabled={!selectedSourceId || isSavingTemplate}
                  onClick={() => handleSaveTemplate(true)}
                >
                  Publish
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.excel} />}
                  disabled={!selectedSourceId || isCreatingExport}
                  onClick={() => handleExport('excel')}
                >
                  Excel
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Iconify icon={GlobalIcons.pdf} />}
                  disabled={!selectedSourceId || isCreatingExport}
                  onClick={() => handleExport('pdf')}
                >
                  PDF
                </Button>
                {(isPreviewLoading || isCreatingExport || isFetchingExports) && (
                  <CircularProgress size={24} />
                )}
              </Stack>
            </Stack>
          </Box>

          <Box sx={{ flex: 1, minHeight: 320, display: 'flex', flexDirection: 'column' }}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ mb: 1 }}
            >
              <Typography variant="subtitle1">Preview</Typography>
              {preview && (
                <Typography variant="body2" color="text.secondary">
                  {preview.totalCount} rows - {selectedSource?.label ?? preview.dataSource}
                </Typography>
              )}
            </Stack>
            <CustomizableTable
              tableId="hr-report-preview"
              tableTitle={`${reportName} Preview`}
              columns={previewColumns}
              data={previewRows}
              isLoading={isPreviewLoading}
              totalCount={preview?.totalCount ?? 0}
              serverSidePagination
              serverSideFilter
              serverSideSort
              isSearch={false}
              isFilter={false}
              maxServerRowsPerPage={200}
              noDataText="Build a report and generate a preview."
              onServerPagination={(page, pageSize) => handlePreview(page, pageSize)}
            />
          </Box>

          <Box sx={{ minHeight: 240, display: 'flex', flexDirection: 'column' }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Export History
            </Typography>
            <CustomizableTable
              tableId="hr-report-export-history"
              tableTitle="HR Report Export History"
              columns={historyColumns}
              data={exportJobs}
              isLoading={isFetchingExports}
              isSearch={false}
              noDataText="No export jobs found."
            />
          </Box>
        </Stack>
      </Box>
    </Box>
  );
};

export default ReportsScreen;
