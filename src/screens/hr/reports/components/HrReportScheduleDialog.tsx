import { useState, useEffect } from 'react';
import { useGetHrReportRecipientsQuery } from 'src/redux/hr/hrReportsApi';
import {
  Stack,
  Button,
  Dialog,
  MenuItem,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { getHrReportSchedulePreviewRuns } from '../hr-report-center-utils';

import type { HrReportScheduleFormState } from '../hr-report-types';

type HrReportScheduleDialogProps = {
  open: boolean;
  defaultValue: HrReportScheduleFormState;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (form: HrReportScheduleFormState) => Promise<void>;
};

export function HrReportScheduleDialog({
  open,
  defaultValue,
  isSubmitting,
  onClose,
  onSubmit,
}: HrReportScheduleDialogProps) {
  const [form, setForm] = useState(defaultValue);
  const [filter, setFilter] = useState('');
  const { data: recipients = [], isFetching } = useGetHrReportRecipientsQuery(
    { filter, maxResultCount: 20 },
    { skip: !open }
  );
  const previewRuns = getHrReportSchedulePreviewRuns(form.frequency, form.firstRunAt);

  useEffect(() => {
    if (open) {
      setForm(defaultValue);
      setFilter('');
    }
  }, [defaultValue, open]);

  const handleSubmit = async () => {
    await onSubmit(form);
    onClose();
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={onClose}>
      <DialogTitle>Schedule report</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            size="small"
            label="Schedule Name"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          />
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <TextField
              select
              fullWidth
              size="small"
              label="Frequency"
              value={form.frequency}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  frequency: event.target.value as HrReportScheduleFormState['frequency'],
                }))
              }
            >
              <MenuItem value="daily">Daily</MenuItem>
              <MenuItem value="weekly">Weekly</MenuItem>
              <MenuItem value="monthly">Monthly</MenuItem>
            </TextField>
            <TextField
              select
              fullWidth
              size="small"
              label="Delivery"
              value={form.deliveryMode}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  deliveryMode: event.target.value as HrReportScheduleFormState['deliveryMode'],
                }))
              }
            >
              <MenuItem value="inApp">In-app</MenuItem>
              <MenuItem value="inAppAndEmail">In-app + email</MenuItem>
            </TextField>
          </Stack>
          <TextField
            size="small"
            type="datetime-local"
            label="First Run"
            value={form.firstRunAt}
            InputLabelProps={{ shrink: true }}
            onChange={(event) =>
              setForm((current) => ({ ...current, firstRunAt: event.target.value }))
            }
          />
          <Stack
            spacing={0.75}
            sx={{ p: 1.25, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}
          >
            <Typography variant="caption" color="text.secondary">
              Next 3 runs
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {previewRuns.map((run) => (
                <Typography
                  key={run.toISOString()}
                  variant="body2"
                  sx={{ px: 1, py: 0.5, borderRadius: 1, bgcolor: 'background.neutral' }}
                >
                  {run.format('DD MMM YYYY, hh:mm A')}
                </Typography>
              ))}
            </Stack>
          </Stack>
          <Autocomplete
            multiple
            size="small"
            loading={isFetching}
            options={recipients}
            value={form.recipients}
            getOptionLabel={(option) =>
              option.email ? `${option.displayName} (${option.email})` : option.displayName
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onInputChange={(_event, value) => setFilter(value)}
            onChange={(_event, value) => setForm((current) => ({ ...current, recipients: value }))}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Additional Recipients"
                placeholder="Current user included"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button size="small" variant="outlined" color="inherit" onClick={onClose}>
          Cancel
        </Button>
        <Button
          data-testid="hr-report-schedule-submit-button"
          size="small"
          variant="contained"
          disabled={!form.name.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          Create Schedule
        </Button>
      </DialogActions>
    </Dialog>
  );
}
