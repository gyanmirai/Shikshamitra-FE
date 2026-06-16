import type { Dispatch, SetStateAction } from 'react';
import type { HrReportField } from 'src/redux/hr/hrReportsApi';

import { Box, Stack, MenuItem, TextField, Typography } from '@mui/material';

import type { HrReportBuilderState } from '../../hr-report-types';

type HrReportAnalyticsSectionProps = {
  state: HrReportBuilderState;
  setState: Dispatch<SetStateAction<HrReportBuilderState>>;
  chartCategoryFields: HrReportField[];
  chartValueFields: HrReportField[];
  chartCategoryValue: string;
  chartValueField: string;
};

export function HrReportAnalyticsSection({
  state,
  setState,
  chartCategoryFields,
  chartValueFields,
  chartCategoryValue,
  chartValueField,
}: HrReportAnalyticsSectionProps) {
  return (
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
  );
}
