import type { HrReportPreview } from 'src/redux/hr/hrReportsApi';

import { Alert, Stack, Typography } from '@mui/material';

import type { HrReportBuilderState } from '../../hr-report-types';

type HrReportBuilderReviewProps = {
  state: HrReportBuilderState;
  sourceLabel: string;
  preview?: HrReportPreview;
  isPreviewStale: boolean;
};

const countLabel = (count: number, singular: string, plural = `${singular}s`) =>
  `${count} ${count === 1 ? singular : plural}`;

export function HrReportBuilderReview({
  state,
  sourceLabel,
  preview,
  isPreviewStale,
}: HrReportBuilderReviewProps) {
  const items = [
    ['Report', state.reportName || 'HR Report'],
    ['Source', sourceLabel],
    ['Columns', countLabel(state.columns.length, 'column')],
    [
      'Filters',
      countLabel(state.conditions.filter((condition) => condition.field).length, 'filter'),
    ],
    ['Groups', state.groups.length ? state.groups.join(', ') : 'None'],
    ['Summary', state.summaryField || 'None'],
    ['Chart', state.chartType === 'none' ? 'None' : state.chartType],
    ['Latest Preview', preview ? `${preview.totalCount.toLocaleString()} rows` : 'Not generated'],
  ];

  return (
    <Stack spacing={1}>
      <Typography variant="subtitle2">Review</Typography>
      {isPreviewStale ? (
        <Alert severity="warning" variant="outlined">
          Preview has not been generated for the current setup.
        </Alert>
      ) : null}
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{
          p: 1.25,
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 1,
          bgcolor: 'background.neutral',
        }}
      >
        {items.map(([label, value]) => (
          <Stack
            key={label}
            spacing={0.25}
            sx={{ minWidth: 120, flex: { xs: '1 1 45%', md: '0 1 auto' } }}
          >
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="body2">{value}</Typography>
          </Stack>
        ))}
      </Stack>
    </Stack>
  );
}
