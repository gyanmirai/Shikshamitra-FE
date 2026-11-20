import type { ReportFilterProps } from './report-draft-types';

import { Stack, TextField } from '@mui/material';

import { ReportStatusFilters } from './ReportStatusFilters';
import { supportsReportAsOf, supportsReportRange } from './report-draft-types';

export function ReportFilterFields(props: ReportFilterProps) {
  const { report, values, disabled, onChange } = props;
  const dates = [
    { field: 'fromDate' as const, label: 'From', show: supportsReportRange(report.id) },
    { field: 'toDate' as const, label: 'To', show: supportsReportRange(report.id) },
    { field: 'asOfDate' as const, label: 'School as-of date', show: supportsReportAsOf(report.id) },
  ];
  return (
    <>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1}>
        <TextField
          fullWidth
          size="small"
          label="Search"
          value={values.search}
          disabled={disabled}
          onChange={(event) => onChange('search', event.target.value)}
        />
        {dates
          .filter((date) => date.show)
          .map((date) => (
            <TextField
              key={date.field}
              size="small"
              label={date.label}
              type="date"
              value={values[date.field]}
              disabled={disabled}
              onChange={(event) => onChange(date.field, event.target.value)}
              InputLabelProps={{ shrink: true }}
              inputProps={{
                min: date.field === 'toDate' ? values.fromDate || undefined : undefined,
              }}
            />
          ))}
        {report.id.includes('Popular') && (
          <TextField
            size="small"
            label="Top"
            type="number"
            value={values.top}
            disabled={disabled}
            onChange={(event) => onChange('top', event.target.value)}
            inputProps={{ min: 1, max: 100 }}
            sx={{ minWidth: 100 }}
          />
        )}
      </Stack>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
        <ReportStatusFilters {...props} />
      </Stack>
    </>
  );
}
