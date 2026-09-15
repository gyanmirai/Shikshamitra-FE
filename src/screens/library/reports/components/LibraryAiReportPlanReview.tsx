import type { LibraryReportFormat } from 'src/redux/library/reports-api';

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
import { CurriculumReportPreviewTable } from 'src/screens/academic/curriculum-management/reports/CurriculumReportPreviewTable';

import type { LibraryAiReview } from '../hooks/useLibraryAiReport';

type Props = {
  review: LibraryAiReview;
  onFormatChange: (format: LibraryReportFormat) => void;
};

function getFilterChips(review: LibraryAiReview) {
  const { filters } = review.plan;
  const chips: string[] = [];
  if (filters.academicYearId) chips.push('1 academic year');
  if (filters.categoryIds?.length) chips.push(`${filters.categoryIds.length} category(s)`);
  if (filters.sectionIds?.length) chips.push(`${filters.sectionIds.length} section(s)`);
  if (filters.copyStatuses?.length) chips.push(`${filters.copyStatuses.length} copy status(es)`);
  if (filters.issueStatuses?.length) chips.push(`${filters.issueStatuses.length} issue status(es)`);
  if (filters.chargeStatuses?.length) chips.push(`${filters.chargeStatuses.length} charge status(es)`);
  if (filters.memberRole !== undefined) chips.push(filters.memberRole === 0 ? 'Students' : 'Staff');
  if (filters.fromDate || filters.toDate) chips.push(`${filters.fromDate ?? 'Start'} to ${filters.toDate ?? 'Today'}`);
  if (filters.top) chips.push(`Top ${filters.top}`);
  if (filters.search) chips.push(`Search: ${filters.search}`);
  return chips;
}

export function LibraryAiReportPlanReview({ review, onFormatChange }: Props) {
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
              <Typography variant="subtitle2">Library report plan ready</Typography>
              <Typography variant="caption" color="text.secondary">
                Review the interpretation and live authorized preview before approval.
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary">Selected report</Typography>
            <Typography variant="body2" fontWeight={600}>{plan.reportType}</Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">Understood request</Typography>
            <Typography variant="body2">{review.interpretedRequest}</Typography>
          </Box>
          <Typography variant="body2">{review.summary}</Typography>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {getFilterChips(review).map((label) => (
              <Chip key={label} size="small" color="secondary" variant="soft" label={label} />
            ))}
          </Stack>
          <Typography variant="caption" color="text.secondary">
            Columns: {plan.columns?.join(', ') || 'report defaults'}
          </Typography>
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
            value={plan.format}
            onChange={(_, value: LibraryReportFormat | null) => value && onFormatChange(value)}
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

      {preview.queryWarnings.map((warning) => <Alert key={warning} severity="warning">{warning}</Alert>)}

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
