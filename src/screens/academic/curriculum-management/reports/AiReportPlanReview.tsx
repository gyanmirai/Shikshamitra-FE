import type { AcademicDynamicReportSpec } from 'src/redux/academicAPI/AcademicReportApi';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import { AiReportPlanPreview } from './AiReportStatus';
import { CurriculumReportPreviewTable } from './CurriculumReportPreviewTable';

import type { AiReportReview } from './ai-report-workflow-types';

interface Props {
  review: AiReportReview;
  onFormatChange: (format: AcademicDynamicReportSpec['format']) => void;
}

const FORMAT_LABELS: Record<AcademicDynamicReportSpec['format'], string> = {
  pdf: 'PDF',
  excel: 'Excel',
  csv: 'CSV',
};

export function AiReportPlanReview({ review, onFormatChange }: Props) {
  const { plan, preview, permissionSummary, assumptions, confidence } = review;
  const rows = preview.rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value ?? '—']))
  );

  return (
    <Stack spacing={1.5}>
      <AiReportPlanPreview plan={plan} />
      <Alert severity="success" icon={<Iconify icon="solar:shield-check-bold" />}>
        <Typography variant="subtitle2">Permission-safe scope</Typography>
        <Typography variant="body2">{permissionSummary}</Typography>
      </Alert>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={1.25}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="subtitle2">Output format</Typography>
              <Typography variant="caption" color="text.secondary">
                Choose the best format before approval.
              </Typography>
            </Box>
            <Chip
              size="small"
              variant="soft"
              color={confidence >= 0.8 ? 'success' : 'warning'}
              label={`${Math.round(confidence * 100)}% confidence`}
            />
          </Stack>
          <ToggleButtonGroup
            exclusive
            fullWidth
            size="small"
            value={plan.format}
            onChange={(_, value: AcademicDynamicReportSpec['format'] | null) => {
              if (value) onFormatChange(value);
            }}
          >
            {Object.entries(FORMAT_LABELS).map(([value, label]) => (
              <ToggleButton key={value} value={value}>
                {label}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {assumptions.length > 0 && (
        <Alert severity="info">
          <Typography variant="subtitle2">Defaults used</Typography>
          {assumptions.map((assumption) => (
            <Typography key={assumption} variant="body2">
              • {assumption}
            </Typography>
          ))}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2">Authorized data preview</Typography>
          <Typography variant="caption" color="text.secondary">
            Showing {preview.pageSize} of {preview.totalCount} matching rows. The full report is
            queried again after approval.
          </Typography>
        </Box>
        <CurriculumReportPreviewTable
          columns={preview.columns}
          rows={rows}
          rowsPerPage={Math.min(preview.pageSize, 5)}
          isLoading={false}
        />
      </Paper>
    </Stack>
  );
}
