import type { Dispatch, SetStateAction } from 'react';
import type { HrReportField } from 'src/redux/hr/hrReportsApi';

import { Box, MenuItem, TextField, Autocomplete } from '@mui/material';

import type { HrReportBuilderState } from '../../hr-report-types';

type HrReportGroupingSectionProps = {
  state: HrReportBuilderState;
  setState: Dispatch<SetStateAction<HrReportBuilderState>>;
  sortableFields: HrReportField[];
  groupFields: HrReportField[];
  summaryFields: HrReportField[];
};

export function HrReportGroupingSection({
  state,
  setState,
  sortableFields,
  groupFields,
  summaryFields,
}: HrReportGroupingSectionProps) {
  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' } }}>
      <TextField
        select
        size="small"
        label="Sort By"
        value={state.sortField}
        onChange={(event) => setState((current) => ({ ...current, sortField: event.target.value }))}
      >
        <MenuItem value="">None</MenuItem>
        {sortableFields.map((field) => (
          <MenuItem key={field.id} value={field.id}>
            {field.label}
          </MenuItem>
        ))}
      </TextField>

      <Autocomplete
        multiple
        size="small"
        options={groupFields}
        value={groupFields.filter((field) => state.groups.includes(field.id))}
        getOptionLabel={(field) => field.label}
        onChange={(_event, value) =>
          setState((current) => ({ ...current, groups: value.map((field) => field.id) }))
        }
        renderInput={(params) => <TextField {...params} label="Group By" />}
      />

      <TextField
        select
        size="small"
        label="Summary"
        value={state.summaryField}
        onChange={(event) =>
          setState((current) => ({ ...current, summaryField: event.target.value }))
        }
      >
        <MenuItem value="">None</MenuItem>
        {summaryFields.map((field) => (
          <MenuItem key={field.id} value={field.id}>
            Sum {field.label}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
