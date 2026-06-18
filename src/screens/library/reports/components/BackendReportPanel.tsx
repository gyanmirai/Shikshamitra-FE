import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useState } from 'react';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import CustomizableTable from 'src/components/customizabaleTable';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  usePreviewLibraryReportMutation,
  useCreateLibraryReportExportMutation,
} from 'src/redux/library/reports-api';
import {
  Alert,
  Stack,
  MenuItem,
  TextField,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import {
  type LibraryReportOptions,
  type LibraryReportPreview,
  buildLibraryReportRequestPayload,
} from 'src/redux/library/library-adapters';

interface BackendReportPanelProps {
  report: {
    id: string;
    name: string;
    description?: string;
    isComingSoon?: boolean;
  };
  options?: LibraryReportOptions;
}

const supportsCopyStatus = (reportType: string) =>
  ['Availability Status', 'Lost Damaged'].some((value) => reportType.includes(value));

const supportsIssueStatus = (reportType: string) =>
  ['Issue Return', 'Overdue Books'].some((value) => reportType.includes(value));

const supportsChargeStatus = (reportType: string) => reportType.includes('Fine Collection');

export default function BackendReportPanel({ report, options }: BackendReportPanelProps) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = (currentYear as any)?.id;
  const [preview, setPreview] = useState<LibraryReportPreview | null>(null);
  const [formValues, setFormValues] = useState({
    format: options?.formats[0]?.id || 'excel',
    search: '',
    fromDate: '',
    toDate: '',
    copyStatus: '',
    issueStatus: '',
    chargeStatus: '',
    top: report.id.includes('Popular') ? '10' : '',
  });

  const [previewReport, previewState] = usePreviewLibraryReportMutation();
  const [createExport, exportState] = useCreateLibraryReportExportMutation();

  const updateField = (field: keyof typeof formValues, value: string) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const buildPayload = () =>
    buildLibraryReportRequestPayload({
      ...formValues,
      reportType: report.id,
      academicYearId,
      page: 1,
      pageSize: 50,
    });

  const handlePreview = async () => {
    try {
      const result = await previewReport(buildPayload()).unwrap();
      setPreview(result);
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      toast.error(parsed.detail);
    }
  };

  const handleExport = async () => {
    try {
      const result = await createExport(buildPayload()).unwrap();
      toast.success(`Export queued (${result.jobId || 'job created'}).`);
    } catch (error) {
      const parsed = parseApiProblemDetail(error);
      toast.error(parsed.detail);
    }
  };

  if (report.isComingSoon) {
    return (
      <Stack spacing={2} sx={{ p: 3 }}>
        <Alert severity="info">This report is marked as coming soon until its domain exists.</Alert>
        <Typography variant="body2" color="text.secondary">
          {report.description}
        </Typography>
      </Stack>
    );
  }

  const previewColumns =
    preview?.columns.map((column) => ({
      id: column.id,
      label: column.label,
      minWidth: 140,
      align: 'left' as const,
    })) || [];

  return (
    <Stack spacing={2} sx={{ p: 2, height: '100%', overflow: 'auto' }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
        <TextField
          fullWidth
          size="small"
          label="Search"
          value={formValues.search}
          onChange={(event) => updateField('search', event.target.value)}
        />
        <TextField
          size="small"
          label="From"
          type="date"
          value={formValues.fromDate}
          onChange={(event) => updateField('fromDate', event.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="To"
          type="date"
          value={formValues.toDate}
          onChange={(event) => updateField('toDate', event.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{
            min: formValues.fromDate || undefined,
          }}
        />
        {report.id.includes('Popular') && (
          <TextField
            size="small"
            label="Top"
            type="number"
            value={formValues.top}
            onChange={(event) => updateField('top', event.target.value)}
            inputProps={{ min: 1, max: 100 }}
            sx={{ width: { xs: '100%', md: 120 } }}
          />
        )}
      </Stack>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
        {supportsCopyStatus(report.id) && (
          <TextField
            select
            size="small"
            label="Copy Status"
            value={formValues.copyStatus}
            onChange={(event) => updateField('copyStatus', event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {options?.copyStatuses.map((option) => (
              <MenuItem value={option.id} key={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}

        {supportsIssueStatus(report.id) && (
          <TextField
            select
            size="small"
            label="Issue Status"
            value={formValues.issueStatus}
            onChange={(event) => updateField('issueStatus', event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {options?.issueStatuses.map((option) => (
              <MenuItem value={option.id} key={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}

        {supportsChargeStatus(report.id) && (
          <TextField
            select
            size="small"
            label="Charge Status"
            value={formValues.chargeStatus}
            onChange={(event) => updateField('chargeStatus', event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {options?.chargeStatuses.map((option) => (
              <MenuItem value={option.id} key={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        )}

        <ToggleButtonGroup
          exclusive
          size="small"
          value={formValues.format}
          onChange={(_, value) => value && updateField('format', value)}
        >
          {(options?.formats.length ? options.formats : [{ id: 'excel', label: 'Excel' }]).map(
            (format) => (
              <ToggleButton key={format.id} value={format.id}>
                {format.label}
              </ToggleButton>
            )
          )}
        </ToggleButtonGroup>

        <Stack direction="row" spacing={1} sx={{ ml: { md: 'auto' } }}>
          <LoadingButton
            variant="outlined"
            size="small"
            onClick={handlePreview}
            loading={previewState.isLoading}
            disabled={!academicYearId || dayjs(formValues.toDate).isBefore(formValues.fromDate)}
          >
            Preview
          </LoadingButton>
          <LoadingButton
            variant="contained"
            size="small"
            onClick={handleExport}
            loading={exportState.isLoading}
            disabled={!academicYearId || dayjs(formValues.toDate).isBefore(formValues.fromDate)}
          >
            Export
          </LoadingButton>
        </Stack>
      </Stack>

      {!academicYearId && <Alert severity="info">Select an academic year to run reports.</Alert>}

      {preview?.queryWarnings?.length ? (
        <Alert severity="warning">{preview.queryWarnings.join(' ')}</Alert>
      ) : null}

      {preview ? (
        <Stack spacing={1}>
          <Typography variant="subtitle2">
            Preview: {preview.totalCount} rows for {preview.reportType}
          </Typography>
          <CustomizableTable
            tableId={`library-report-preview-${report.id}`}
            columns={previewColumns}
            data={preview.rows}
            isPagination={false}
            isSearch={false}
            isFilter={false}
          />
        </Stack>
      ) : (
        <Alert severity="info">Run a preview to inspect the first 50 rows before export.</Alert>
      )}
    </Stack>
  );
}
