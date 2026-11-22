import type { Dayjs } from 'dayjs';
import type { AdmissionWorkflowStatus } from 'src/redux/student/admissions/admission-workflows-api';

import dayjs from 'dayjs';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers';
import { Iconify } from 'src/components/iconify';
import { usePopover, CustomPopover } from 'src/components/custom-popover';
import {
  Box,
  Stack,
  Button,
  Divider,
  MenuItem,
  TextField,
  Typography,
  IconButton,
} from '@mui/material';

import { workflowCreatedRange } from './workflow-date-range';
import { ADMISSION_DATE_FORMAT } from '../admission-date-formats';

import type { WorkflowFilters } from './use-workflow-filters';

type FilterValues = Pick<
  WorkflowFilters,
  'status' | 'version' | 'usage' | 'createdFrom' | 'createdTo'
>;

type Props = {
  filters: WorkflowFilters;
  onUpdate: (changes: Partial<WorkflowFilters>) => void;
  onClear: () => void;
};

const pickFilterValues = (filters: WorkflowFilters): FilterValues => ({
  status: filters.status,
  version: filters.version,
  usage: filters.usage,
  createdFrom: filters.createdFrom,
  createdTo: filters.createdTo,
});

const toDayjs = (value: string): Dayjs | null => (value ? dayjs(value) : null);

export function WorkflowListFilters({ filters, onUpdate, onClear }: Props) {
  const popover = usePopover();
  const [draft, setDraft] = useState<FilterValues>(() => pickFilterValues(filters));
  const createdFrom = toDayjs(draft.createdFrom);
  const createdTo = toDayjs(draft.createdTo);
  const invalidRange = !workflowCreatedRange(draft.createdFrom, draft.createdTo);
  const reversed = Boolean(
    createdFrom?.isValid() && createdTo?.isValid() && createdFrom.isAfter(createdTo, 'day')
  );

  const updateDraft = (changes: Partial<FilterValues>) => {
    setDraft((current) => ({ ...current, ...changes }));
  };

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Iconify icon="mdi:filter-variant" />}
        aria-haspopup="dialog"
        aria-expanded={popover.open}
        onClick={(event) => {
          setDraft(pickFilterValues(filters));
          popover.onOpen(event);
        }}
      >
        Filters
      </Button>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{
          arrow: { placement: 'top-right' },
          paper: {
            sx: {
              width: 336,
              maxWidth: 'calc(100vw - 32px)',
              overflow: 'hidden',
            },
          },
        }}
      >
        <Box role="dialog" aria-label="Workflow Filters">
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.25 }}
          >
            <Typography variant="subtitle1">Filters</Typography>
            <IconButton
              size="small"
              aria-label="Close Filters"
              onClick={popover.onClose}
              sx={{
                width: { xs: 44, sm: 36 },
                height: { xs: 44, sm: 36 },
              }}
            >
              <Iconify icon="mdi:close" width={20} />
            </IconButton>
          </Stack>

          <Divider />

          <Stack spacing={1.5} sx={{ p: 2 }}>
            <TextField
              select
              fullWidth
              size="small"
              label="Status"
              value={draft.status}
              onChange={(event) =>
                updateDraft({
                  status:
                    event.target.value === 'all'
                      ? 'all'
                      : (Number(event.target.value) as AdmissionWorkflowStatus),
                })
              }
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value={0}>Draft</MenuItem>
              <MenuItem value={3}>Validated</MenuItem>
              <MenuItem value={4}>Submitted</MenuItem>
              <MenuItem value={5}>Approved</MenuItem>
              <MenuItem value={6}>Scheduled</MenuItem>
              <MenuItem value={1}>Published</MenuItem>
              <MenuItem value={7}>Superseded</MenuItem>
              <MenuItem value={2}>Archived</MenuItem>
            </TextField>

            <TextField
              fullWidth
              size="small"
              type="number"
              label="Version"
              value={draft.version}
              inputProps={{ min: 1 }}
              onChange={(event) => updateDraft({ version: event.target.value })}
            />

            <TextField
              select
              fullWidth
              size="small"
              label="Usage"
              value={draft.usage}
              onChange={(event) =>
                updateDraft({ usage: event.target.value as WorkflowFilters['usage'] })
              }
            >
              <MenuItem value="all">All Usage</MenuItem>
              <MenuItem value="used">In Use</MenuItem>
              <MenuItem value="unused">Not in Use</MenuItem>
            </TextField>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <DatePicker
                label="Created From"
                format={ADMISSION_DATE_FORMAT}
                value={createdFrom}
                onChange={(value) =>
                  updateDraft({ createdFrom: value?.format('YYYY-MM-DD') ?? '' })
                }
                maxDate={createdTo?.isValid() ? createdTo : undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    ...(createdFrom &&
                      !createdFrom.isValid() && { error: true, helperText: 'Enter a valid date.' }),
                  },
                }}
              />
              <DatePicker
                label="Created To"
                format={ADMISSION_DATE_FORMAT}
                value={createdTo}
                onChange={(value) => updateDraft({ createdTo: value?.format('YYYY-MM-DD') ?? '' })}
                minDate={createdFrom?.isValid() ? createdFrom : undefined}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    size: 'small',
                    ...(reversed && {
                      error: true,
                      helperText: 'End date must be on or after the start date.',
                    }),
                    ...(createdTo &&
                      !createdTo.isValid() && { error: true, helperText: 'Enter a valid date.' }),
                  },
                }}
              />
            </Stack>
          </Stack>

          <Divider />

          <Stack direction="row" spacing={1} sx={{ p: 2 }}>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={<Iconify icon="mdi:filter-off-outline" />}
              onClick={() => {
                onClear();
                popover.onClose();
              }}
              sx={{ minHeight: { xs: 44, sm: 36 }, px: 1.25 }}
            >
              Clear
            </Button>
            <Button
              fullWidth
              size="small"
              variant="contained"
              disabled={invalidRange}
              startIcon={<Iconify icon="mdi:check" />}
              onClick={() => {
                if (invalidRange) return;
                onUpdate(draft);
                popover.onClose();
              }}
              sx={{
                minHeight: { xs: 44, sm: 36 },
                px: 1.25,
                bgcolor: 'text.primary',
                color: 'background.paper',
                '&:hover': { bgcolor: 'text.secondary' },
              }}
            >
              Apply Filters
            </Button>
          </Stack>
        </Box>
      </CustomPopover>
    </>
  );
}
