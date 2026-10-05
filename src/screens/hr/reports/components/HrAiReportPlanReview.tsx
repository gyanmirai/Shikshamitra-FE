import type { HrReportFormat } from 'src/redux/hr/hrReportsApi';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Alert, Stack, Paper, Typography, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { CurriculumReportPreviewTable } from 'src/screens/academic/curriculum-management/reports/CurriculumReportPreviewTable';

import type { HrAiReportReview } from '../hooks/useHrAiReport';

const SOURCE_LABELS: Record<string, string> = {
  employee: 'Staff',
  payroll: 'Payroll',
  attendance: 'Attendance',
  leave: 'Leave',
  policies: 'Policies and audit',
  performance: 'Performance',
};

type Props = {
  review: HrAiReportReview;
  onFormatChange: (format: HrReportFormat) => void;
};

export function HrAiReportPlanReview({ review, onFormatChange }: Props) {
  const { plan, preview } = review;
  const rows = preview.rows.map((row) =>
    Object.fromEntries(Object.entries(row).map(([key, value]) => [key, value ?? '—']))
  );

  return (
    <Stack spacing={1.5}>
      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }} aria-live="polite">
        <Stack spacing={1.25}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Iconify icon="solar:clipboard-check-bold" color="success.main" />
            <Box>
              <Typography variant="subtitle2">HR report plan ready</Typography>
              <Typography variant="caption" color="text.secondary">
                Review the interpretation and authorized live preview before approval.
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary">Report title</Typography>
            <Typography variant="body2" fontWeight={600}>{plan.reportType}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Understood request</Typography>
            <Typography variant="body2">{review.interpretedRequest}</Typography>
          </Box>
          <Typography variant="body2">{review.summary}</Typography>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            <Chip size="small" variant="soft" label={`Data: ${SOURCE_LABELS[plan.dataSource ?? ''] ?? plan.dataSource}`} />
            <Chip size="small" variant="soft" label={`${plan.columns?.length ?? 0} columns`} />
            {(plan.filters?.conditions ?? []).map((condition, index) => (
              <Chip
                key={`${condition.field}-${condition.operator}-${index}`}
                size="small"
                color="secondary"
                variant="soft"
                label={`${condition.field} ${condition.operator} ${condition.value ?? condition.values?.join(', ') ?? ''}`}
              />
            ))}
            {(plan.groups ?? []).map((group) => (
              <Chip key={group} size="small" color="primary" variant="soft" label={`Group: ${group}`} />
            ))}
          </Stack>
        </Stack>
      </Paper>

      <Alert severity="success" icon={<Iconify icon="solar:shield-check-bold" />}>
        <Typography variant="subtitle2">Permission-safe scope</Typography>
        <Typography variant="body2">{review.permissionSummary}</Typography>
      </Alert>

      <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="subtitle2">Output format</Typography>
            <Typography variant="caption" color="text.secondary">
              {Math.round(review.confidence * 100)}% planning confidence
            </Typography>
          </Box>
          <ToggleButtonGroup
            exclusive
            size="small"
            value={plan.format ?? 'excel'}
            onChange={(_, value: HrReportFormat | null) => value && onFormatChange(value)}
          >
            <ToggleButton value="pdf">PDF</ToggleButton>
            <ToggleButton value="excel">Excel</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

      {review.assumptions.length > 0 && (
        <Alert severity="info">
          <Typography variant="subtitle2">Defaults used</Typography>
          {review.assumptions.map((assumption) => (
            <Typography key={assumption} variant="body2">• {assumption}</Typography>
          ))}
        </Alert>
      )}

      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2">Authorized data preview</Typography>
          <Typography variant="caption" color="text.secondary">
            Showing up to {preview.pageSize} of {preview.totalCount} matching rows.
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
