import type { FinanceReportFormat } from 'src/redux/finance/reports/financeReportsApi';

import { Iconify } from 'src/components/iconify';
import {
  Box,
  Chip,
  Stack,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { CurriculumReportPreviewTable } from 'src/screens/academic/curriculum-management/reports/CurriculumReportPreviewTable';

import type { FinanceAiReview } from '../hooks/useFinanceAiReport';

type Props = {
  review: FinanceAiReview;
  onFormatChange: (format: FinanceReportFormat) => void;
};

function getFilterChips(review: FinanceAiReview) {
  const { filters } = review.plan;
  const chips: string[] = [];
  if (filters.academicYearIds?.length)
    chips.push(`${filters.academicYearIds.length} academic year(s)`);
  if (filters.months?.length) chips.push(`Months: ${filters.months.join(', ')}`);
  if (filters.organizationIds?.length) chips.push(`${filters.organizationIds.length} stage(s)`);
  if (filters.classIds?.length) chips.push(`${filters.classIds.length} class(es)`);
  if (filters.divisionIds?.length) chips.push(`${filters.divisionIds.length} division(s)`);
  if (filters.feeHeadIds?.length) chips.push(`${filters.feeHeadIds.length} fee head(s)`);
  if (filters.receiptBookIds?.length)
    chips.push(`${filters.receiptBookIds.length} receipt book(s)`);
  if (filters.fromDate || filters.toDate)
    chips.push(`${filters.fromDate ?? 'Start'} to ${filters.toDate ?? 'Today'}`);
  return chips;
}

export function FinanceAiReportPlanReview({ review, onFormatChange }: Props) {
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
              <Typography variant="subtitle2">Finance report plan ready</Typography>
            </Box>
          </Stack>
          <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
            <Typography variant="caption" color="text.secondary">
              Selected report
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {plan.reportType}
            </Typography>
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Understood request
            </Typography>
            <Typography variant="body2">{review.interpretedRequest}</Typography>
          </Box>
          <Typography variant="body2">{review.summary}</Typography>
          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap">
            {getFilterChips(review).map((label) => (
              <Chip key={label} size="small" color="secondary" variant="soft" label={label} />
            ))}
          </Stack>
        </Stack>
      </Paper>

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
            onChange={(_, value: FinanceReportFormat | null) => value && onFormatChange(value)}
          >
            <ToggleButton value="pdf">PDF</ToggleButton>
            <ToggleButton value="excel">Excel</ToggleButton>
          </ToggleButtonGroup>
        </Stack>
      </Paper>

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
