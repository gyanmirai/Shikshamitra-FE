import type { HrReportRecipient, HrReportExportJob } from 'src/redux/hr/hrReportsApi';

import { useMemo, useState, useEffect } from 'react';
import { useGetHrReportRecipientsQuery } from 'src/redux/hr/hrReportsApi';
import {
  Stack,
  Button,
  Dialog,
  TextField,
  Typography,
  DialogTitle,
  Autocomplete,
  DialogActions,
  DialogContent,
} from '@mui/material';

type HrReportShareExportDialogProps = {
  open: boolean;
  job: HrReportExportJob | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (recipients: HrReportRecipient[]) => Promise<void>;
};

export function HrReportShareExportDialog({
  open,
  job,
  isSubmitting,
  onClose,
  onSubmit,
}: HrReportShareExportDialogProps) {
  const [filter, setFilter] = useState('');
  const [recipients, setRecipients] = useState<HrReportRecipient[]>([]);
  const sharedUserIdsKey = job?.sharedUserIds?.join('|') ?? '';
  const sharedUserIds = useMemo(
    () => (sharedUserIdsKey ? sharedUserIdsKey.split('|').filter(Boolean) : []),
    [sharedUserIdsKey]
  );
  const { data: options = [], isFetching } = useGetHrReportRecipientsQuery(
    { filter, maxResultCount: 20, ids: sharedUserIds },
    { skip: !open }
  );
  const optionsById = useMemo(
    () => new Map(options.map((option) => [option.id, option])),
    [options]
  );

  useEffect(() => {
    if (open) {
      setFilter('');
      setRecipients(sharedUserIds.map((id) => ({ id, displayName: id })));
    }
  }, [open, job?.id, sharedUserIds]);

  useEffect(() => {
    if (!open || optionsById.size === 0) {
      return;
    }

    setRecipients((current) => {
      const next = current.map((recipient) => optionsById.get(recipient.id) ?? recipient);
      const unchanged =
        next.length === current.length &&
        next.every(
          (recipient, index) =>
            recipient.id === current[index].id &&
            recipient.displayName === current[index].displayName &&
            recipient.email === current[index].email
        );

      return unchanged ? current : next;
    });
  }, [open, optionsById]);

  const handleSubmit = async () => {
    if (recipients.length === 0 || isSubmitting) {
      return;
    }

    await onSubmit(recipients);
  };

  return (
    <Dialog fullWidth maxWidth="sm" open={open} onClose={isSubmitting ? undefined : onClose}>
      <DialogTitle>Share export</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle1">{job?.reportType ?? 'HR Report'}</Typography>
            <Typography variant="body2" color="text.secondary">
              Select HR report viewers who should see this export in Reports Center.
            </Typography>
          </Stack>
          <Autocomplete
            multiple
            size="small"
            loading={isFetching}
            options={options}
            value={recipients}
            getOptionLabel={(option) =>
              option.email ? `${option.displayName} (${option.email})` : option.displayName
            }
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onInputChange={(_event, value) => setFilter(value)}
            onChange={(_event, value) => setRecipients(value)}
            renderInput={(params) => (
              <TextField {...params} label="Recipients" placeholder="Search users" />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={isSubmitting}
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          data-testid="hr-report-share-export-submit-button"
          size="small"
          variant="contained"
          disabled={recipients.length === 0 || isSubmitting}
          onClick={handleSubmit}
        >
          Share Export
        </Button>
      </DialogActions>
    </Dialog>
  );
}
