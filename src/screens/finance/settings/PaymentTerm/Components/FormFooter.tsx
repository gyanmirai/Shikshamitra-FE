'use client';

import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Box, Button, Tooltip, IconButton } from '@mui/material';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface FormFooterProps {
  isSubmitting: boolean;
  disabled: boolean;
  disabledReason?: string;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function FormFooter({
  isSubmitting,
  disabled,
  disabledReason,
  onCancel,
  onSubmit,
}: FormFooterProps) {
  return (
    <Box
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1.75,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1,
        flexShrink: 0,
        bgcolor: 'background.paper',
      }}
    >
      <Button
        variant="outlined"
        onClick={onCancel}
        size="small"
        disabled={isSubmitting}
        startIcon={<Iconify icon="basil:cross-solid" />}
      >
        Cancel
      </Button>

      {disabled && !isSubmitting && disabledReason && (
        <Tooltip title={disabledReason}>
          <IconButton size="small" aria-label={`Submit unavailable: ${disabledReason}`}>
            <Iconify icon="lucide:info" width={16} sx={{ color: 'info.main' }} aria-hidden />
          </IconButton>
        </Tooltip>
      )}
      <LoadingButton
        variant="contained"
        loading={isSubmitting}
        disabled={disabled}
        onClick={onSubmit}
        size="small"
        startIcon={<Iconify icon="material-symbols-light:save" width={20} height={20} />}
        sx={{ minWidth: 96 }}
      >
        Submit
      </LoadingButton>
    </Box>
  );
}
