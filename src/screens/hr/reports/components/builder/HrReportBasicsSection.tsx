import type { Dispatch, SetStateAction } from 'react';
import type { HrReportField } from 'src/redux/hr/hrReportsApi';

import {
  Box,
  MenuItem,
  TextField,
  Autocomplete,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';

import type { HrReportBuilderState } from '../../hr-report-types';

type HrReportBasicsSectionProps = {
  state: HrReportBuilderState;
  setState: Dispatch<SetStateAction<HrReportBuilderState>>;
  columnFields: HrReportField[];
};

export function HrReportBasicsSection({
  state,
  setState,
  columnFields,
}: HrReportBasicsSectionProps) {
  return (
    <>
      <Box
        data-testid="hr-report-builder-controls"
        sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' } }}
      >
        <TextField
          size="small"
          label="Report Name"
          value={state.reportName}
          onChange={(event) =>
            setState((current) => ({ ...current, reportName: event.target.value }))
          }
        />
        <TextField
          select
          size="small"
          label="Visibility"
          value={state.visibility}
          onChange={(event) =>
            setState((current) => ({
              ...current,
              visibility: event.target.value as 'private' | 'organization',
            }))
          }
        >
          <MenuItem value="private">Private</MenuItem>
          <MenuItem value="organization">Organization</MenuItem>
        </TextField>
        <ToggleButtonGroup
          exclusive
          size="small"
          value={state.sortDirection}
          onChange={(_event, value) =>
            value && setState((current) => ({ ...current, sortDirection: value }))
          }
        >
          <ToggleButton value="asc">Asc</ToggleButton>
          <ToggleButton value="desc">Desc</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Autocomplete
        multiple
        size="small"
        options={columnFields}
        value={columnFields.filter((field) => state.columns.includes(field.id))}
        getOptionLabel={(field) => field.label}
        onChange={(_event, value) =>
          setState((current) => ({ ...current, columns: value.map((field) => field.id) }))
        }
        renderInput={(params) => <TextField {...params} label="Columns" />}
      />
    </>
  );
}
