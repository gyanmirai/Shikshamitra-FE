'use client';

import { Stack, Button, Typography } from '@mui/material';

export default function FinanceSetupFooter({
  first,
  review,
  hasSetting,
  disabled,
  saving,
  message,
  onBack,
  onSave,
  onExit,
  onContinue,
  onDefer,
}: {
  first: boolean;
  review: boolean;
  hasSetting: boolean;
  disabled: boolean;
  saving: boolean;
  message: string;
  onBack: () => void;
  onSave: () => void;
  onExit: () => void;
  onContinue: () => void;
  onDefer: () => void;
}) {
  return (
    <Stack spacing={1}>
      <Typography
        variant="caption"
        color="text.secondary"
        role="status"
        aria-label="Guide save status"
        aria-live="polite"
        aria-atomic="true"
      >
        {saving ? 'Saving…' : message || '\u00a0'}
      </Typography>
      <Stack direction="row" justifyContent="space-between" gap={1} flexWrap="wrap">
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          disabled={disabled || first}
          onClick={onBack}
        >
          Back
        </Button>
        <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="flex-end">
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            disabled={disabled}
            onClick={onExit}
          >
            Save & exit
          </Button>
          {hasSetting && (
            <Button
              size="small"
              color="inherit"
              variant="outlined"
              disabled={disabled}
              onClick={onDefer}
            >
              Do this later
            </Button>
          )}
          <Button
            size="small"
            color="inherit"
            variant="outlined"
            disabled={disabled}
            onClick={onSave}
          >
            Save progress
          </Button>
          <Button
            size="small"
            color="inherit"
            variant="contained"
            disabled={disabled}
            onClick={onContinue}
          >
            {saving ? 'Saving…' : review ? 'Finish review' : 'Save & continue'}
          </Button>
        </Stack>
      </Stack>
    </Stack>
  );
}
