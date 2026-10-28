'use client';

import { Stack, Button, Typography } from '@mui/material';

const visuallyHidden = {
  border: 0, margin: -1, padding: 0, width: '1px', height: '1px',
  overflow: 'hidden', position: 'absolute', whiteSpace: 'nowrap', clip: 'rect(0 0 0 0)',
} as const;

export default function AcademicSetupFooter({ welcome, review, disabled, blocked, saving, saveStatus,
  onBack, onSave, onExit, onContinue, onDefer }: {
  welcome: boolean; review: boolean; disabled: boolean; blocked: boolean; saving: boolean;
  saveStatus: string;
  onBack: () => void; onSave: () => void; onExit: () => void; onContinue: () => void; onDefer: () => void;
}) {
  return (
    <Stack spacing={1}>
      {blocked && <Typography variant="caption" color="text.secondary" role="status">
        Save or cancel the open form before moving to another setting.
      </Typography>}
      <Stack direction="row" justifyContent="space-between" gap={1} flexWrap="wrap">
        <Stack direction="row" alignItems="center" spacing={1}>
          <Button size="small" color="inherit" variant="outlined" disabled={disabled || welcome} onClick={onBack}>Back</Button>
          <Typography variant="caption" color="text.secondary" role="status" aria-label="Guide save status"
            aria-live="polite" aria-atomic="true"
            sx={(theme) => ({ minWidth: 48, whiteSpace: 'nowrap', [theme.breakpoints.down('sm')]: visuallyHidden })}>
            {saveStatus || '\u00a0'}
          </Typography>
        </Stack>
        <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="flex-end">
          <Button size="small" color="inherit" variant="text" disabled={disabled} onClick={onExit}>Save & exit</Button>
          {!welcome && !review && <Button size="small" color="inherit" variant="text" disabled={disabled} onClick={onDefer}>Do this later</Button>}
          <Button size="small" color="inherit" variant="outlined" disabled={disabled} onClick={onSave}>Save progress</Button>
          <Button size="small" color="inherit" variant="contained" disabled={disabled} onClick={onContinue}>
            {saving ? 'Saving…' : welcome ? 'Get started' : review ? 'Finish review' : 'Save & continue'}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
