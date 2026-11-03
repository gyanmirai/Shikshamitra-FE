'use client';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
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
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      gap={1}
      flexWrap="wrap"
    >
      <Button
        size="small"
        color="inherit"
        variant="outlined"
        disabled={disabled || first}
        onClick={onBack}
        startIcon={<Iconify icon={GlobalIcons.back} width={18} />}
      >
        Back
      </Button>
      <Typography
        variant="caption"
        color="text.secondary"
        role="status"
        aria-label="Guide save status"
        aria-live="polite"
        aria-atomic="true"
        sx={{ flex: 1, minWidth: 0 }}
      >
        {saving ? 'Saving…' : message}
      </Typography>
      <Stack direction="row" gap={1} flexWrap="wrap" justifyContent="flex-end">
        <Button
          size="small"
          color="inherit"
          variant="outlined"
          disabled={disabled}
          onClick={onExit}
          startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
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
            startIcon={<Iconify icon={GlobalIcons.skipIcon} width={18} />}
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
          startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
        >
          Save progress
        </Button>
        <Button
          size="small"
          color="inherit"
          variant="contained"
          disabled={disabled}
          onClick={onContinue}
          startIcon={<Iconify icon={review ? GlobalIcons.tick : GlobalIcons.submit} width={18} />}
        >
          {saving ? 'Saving…' : review ? 'Finish review' : 'Save & continue'}
        </Button>
      </Stack>
    </Stack>
  );
}
