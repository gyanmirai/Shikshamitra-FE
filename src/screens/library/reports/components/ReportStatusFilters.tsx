import { MenuItem, TextField, ToggleButton, ToggleButtonGroup } from '@mui/material';

import type { ReportFilterProps } from './report-draft-types';

export function ReportStatusFilters({
  report,
  options,
  values,
  disabled,
  onChange,
}: ReportFilterProps) {
  const statuses = [
    {
      show: ['Book Availability Status Report', 'Lost Damaged Books Report'].includes(report.id),
      field: 'copyStatus' as const,
      label: 'Copy status',
      items: options?.copyStatuses,
    },
    {
      show: ['Issue Return Report', 'Overdue Books Report'].includes(report.id),
      field: 'issueStatus' as const,
      label: 'Issue status',
      items: options?.issueStatuses,
    },
    {
      show: report.id === 'Fine Collection Report',
      field: 'chargeStatus' as const,
      label: 'Recorded charge status',
      items: options?.chargeStatuses,
    },
  ];
  return (
    <>
      {statuses
        .filter((status) => status.show)
        .map((status) => (
          <TextField
            key={status.field}
            select
            size="small"
            label={status.label}
            value={values[status.field]}
            disabled={disabled}
            onChange={(event) => onChange(status.field, event.target.value)}
            sx={{ minWidth: 180 }}
          >
            <MenuItem value="">All statuses</MenuItem>
            {status.items?.map((option) => (
              <MenuItem value={option.id} key={option.id}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        ))}
      <ToggleButtonGroup
        exclusive
        size="small"
        value={values.format}
        disabled={disabled}
        onChange={(_, value: string | null) => {
          if (value) onChange('format', value);
        }}
      >
        {(options?.formats.length ? options.formats : [{ id: 'excel', label: 'Excel' }]).map(
          (format) => (
            <ToggleButton key={format.id} value={format.id}>
              {format.label}
            </ToggleButton>
          )
        )}
      </ToggleButtonGroup>
    </>
  );
}
