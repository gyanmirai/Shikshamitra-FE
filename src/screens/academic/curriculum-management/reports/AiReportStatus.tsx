import type { AcademicDynamicReportSpec } from 'src/redux/academicAPI/AcademicReportApi';

import { Iconify } from 'src/components/iconify';
import { Box, Chip, Alert, Stack, Paper, Typography } from '@mui/material';

const DATASET_LABELS: Record<AcademicDynamicReportSpec['dataset'], string> = {
  'curriculum.subjects': 'Subjects',
  'curriculum.chapters': 'Chapters',
  'curriculum.teachers': 'Subject teachers',
};

export function AiReportPlanPreview({ plan }: { plan: AcademicDynamicReportSpec }) {
  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }} aria-live="polite">
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Iconify icon="solar:clipboard-check-bold" color="success.main" />
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2">Report plan ready</Typography>
            <Typography variant="caption" color="text.secondary">
              Review the agent&apos;s interpretation before generating the PDF.
            </Typography>
          </Box>
        </Stack>
        <Box sx={{ p: 1.5, borderRadius: 1.5, bgcolor: 'background.neutral' }}>
          <Typography variant="caption" color="text.secondary">
            Report title
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {plan.title}
          </Typography>
        </Box>
        {plan.interpretedRequest && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Understood request
            </Typography>
            <Typography variant="body2">{plan.interpretedRequest}</Typography>
          </Box>
        )}
        <Typography variant="body2">{plan.summary}</Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip size="small" label={`Data: ${DATASET_LABELS[plan.dataset]}`} variant="soft" />
          <Chip size="small" label={`${plan.columns.length} columns`} variant="soft" />
          {(plan.appliedFilters ?? []).map((filter) => (
            <Chip
              key={filter.type}
              size="small"
              color="primary"
              label={`${filter.label}: ${filter.values.join(', ')}`}
              variant="soft"
            />
          ))}
          {(plan.appliedFilters?.length ?? 0) === 0 && (
            <Chip size="small" label="Scope: All accessible records" variant="soft" />
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

export function AiReportReady({ reportType, summary }: { reportType: string; summary: string }) {
  return (
    <Alert severity="success" icon={<Iconify icon="solar:file-check-bold" />}>
      <Typography variant="subtitle2">{reportType}</Typography>
      <Typography variant="body2">{summary}</Typography>
      <Typography variant="caption">Your PDF is ready to download.</Typography>
    </Alert>
  );
}
