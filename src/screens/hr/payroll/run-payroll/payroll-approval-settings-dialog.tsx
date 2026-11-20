import type { PayrollApprovalSettings } from 'src/redux/runPayroll/payroll-approval-api';

import { useState } from 'react';
import { normalizeHrFailure } from 'src/screens/hr/recovery/hr-failure';
import {
  Alert, Stack, Switch, Button, Dialog, TextField, DialogTitle, Autocomplete,
  DialogContent, DialogActions, FormControlLabel,
} from '@mui/material';
import {
  usePayrollApproversQuery,
  useConfigurePayrollApprovalMutation,
  useChangePayrollApprovalModeMutation,
} from 'src/redux/runPayroll/payroll-approval-api';

export function PayrollApprovalSettingsDialog({
  initial, onClose,
}: {
  initial: PayrollApprovalSettings;
  onClose: () => void;
}) {
  const [approver, setApprover] = useState(initial.approverId || '');
  const [allowSelfFinalization, setAllowSelfFinalization] = useState(initial.allowSelfFinalization);
  const [filter, setFilter] = useState('');
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const users = usePayrollApproversQuery(filter);
  const [configure, configureState] = useConfigurePayrollApprovalMutation();
  const [changeMode, modeState] = useChangePayrollApprovalModeMutation();
  const busy = configureState.isLoading || modeState.isLoading;
  const dirty = approver !== (initial.approverId || '') || allowSelfFinalization !== initial.allowSelfFinalization;
  const action = initial.mode === 'Legacy' ? 'activate' : initial.mode === 'Paused' ? 'resume' : 'pause';
  const modeLabel = { activate: 'Activate', resume: 'Resume', pause: 'Pause' }[action];
  const choices = users.currentData ?? [];
  const value = choices.find((user) => user.id === approver) ??
    (approver ? { id: approver, name: 'Current designated approver' } : null);
  const save = async (updateSettings: boolean) => {
    setError('');
    try {
      const command = { expectedVersion: initial.version, reason: reason.trim() };
      if (updateSettings) await configure({ ...command, approverId: approver, allowSelfFinalization }).unwrap();
      else await changeMode({ ...command, action }).unwrap();
      onClose();
    } catch (caught) {
      setError(normalizeHrFailure(caught).message);
    }
  };
  return (
    <Dialog open onClose={busy ? undefined : onClose} fullWidth maxWidth="sm" aria-labelledby="payroll-approval-settings-title">
      <DialogTitle id="payroll-approval-settings-title">Payroll approval settings</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Alert severity="info">Approval workflow is {initial.mode.toLowerCase()}.</Alert>
          <Autocomplete
            options={choices}
            value={value}
            loading={users.isFetching}
            filterOptions={(options) => options}
            onInputChange={(_event, nextValue, reasonCode) => {
              if (reasonCode === 'input') setFilter(nextValue);
            }}
            onChange={(_event, selected) => setApprover(selected?.id ?? '')}
            getOptionLabel={(user) => user.name}
            isOptionEqualToValue={(option, selected) => option.id === selected.id}
            renderInput={(params) => <TextField {...params} label="Designated principal or admin" />}
          />
          {users.isError && <Alert severity="error">The user directory could not be loaded.</Alert>}
          <FormControlLabel
            control={<Switch checked={allowSelfFinalization} onChange={(event) => setAllowSelfFinalization(event.target.checked)} />}
            label="Allow users with payroll review, submission and lock permissions to finalize their own batches"
          />
          <TextField label="Reason for change" value={reason} onChange={(event) => setReason(event.target.value)} fullWidth slotProps={{ htmlInput: { maxLength: 500 } }} />
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={busy}>Cancel</Button>
        <Button onClick={() => save(false)} loading={modeState.isLoading} disabled={busy || dirty || !approver || !reason.trim()}>
          {modeLabel} workflow
        </Button>
        <Button variant="contained" onClick={() => save(true)} loading={configureState.isLoading} disabled={busy || !dirty || !approver || !reason.trim()}>
          Save settings
        </Button>
      </DialogActions>
    </Dialog>
  );
}
