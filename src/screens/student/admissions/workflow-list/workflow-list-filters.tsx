import type { Dayjs } from 'dayjs';
import type { AdmissionWorkflowStatus } from 'src/redux/student/admissions/admission-workflows-api';

import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, MenuItem, TextField } from '@mui/material';

import type { WorkflowFilters } from './use-workflow-filters';

type Props = {
  filters: WorkflowFilters;
  createdFrom: Dayjs | null;
  createdTo: Dayjs | null;
  onUpdate: (changes: Partial<WorkflowFilters>) => void;
  onClear: () => void;
};

export function WorkflowListFilters({ filters, createdFrom, createdTo, onUpdate, onClear }: Props) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }}>
      <TextField select size="small" label="Status" value={filters.status} onChange={(event) => onUpdate({ status: event.target.value === 'all' ? 'all' : Number(event.target.value) as AdmissionWorkflowStatus })} sx={{ minWidth: 150 }}>
        <MenuItem value="all">All statuses</MenuItem><MenuItem value={0}>Draft</MenuItem><MenuItem value={1}>Published</MenuItem><MenuItem value={2}>Archived</MenuItem>
      </TextField>
      <TextField size="small" type="number" label="Version" value={filters.version} inputProps={{ min: 1 }} onChange={(event) => onUpdate({ version: event.target.value })} sx={{ width: 120 }} />
      <TextField select size="small" label="Usage" value={filters.usage} onChange={(event) => onUpdate({ usage: event.target.value as WorkflowFilters['usage'] })} sx={{ minWidth: 140 }}>
        <MenuItem value="all">All usage</MenuItem><MenuItem value="used">In use</MenuItem><MenuItem value="unused">Not in use</MenuItem>
      </TextField>
      <DatePicker label="Created from" value={createdFrom} onChange={(value) => onUpdate({ createdFrom: value?.format('YYYY-MM-DD') ?? '' })} maxDate={createdTo ?? undefined} slotProps={{ textField: { size: 'small', sx: { width: 170 } } }} />
      <DatePicker label="Created to" value={createdTo} onChange={(value) => onUpdate({ createdTo: value?.format('YYYY-MM-DD') ?? '' })} minDate={createdFrom ?? undefined} slotProps={{ textField: { size: 'small', sx: { width: 170 } } }} />
      <Button size="small" variant="text" startIcon={<Iconify icon="mdi:filter-off-outline" />} onClick={onClear}>Clear</Button>
    </Stack>
  );
}
