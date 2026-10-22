'use client';

import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Box, Button, Stack, Typography } from '@mui/material';

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
        px: 2,
        py: 1.5,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        flexWrap: 'wrap',
        flexShrink: 0,
        bgcolor: 'background.paper',
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        role="status"
        sx={{ flex: '1 1 200px', minWidth: 0 }}
      >
        {disabled && !isSubmitting ? disabledReason : ''}
      </Typography>
      <Stack direction="row" spacing={1} sx={{ ml: 'auto', flexShrink: 0 }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          size="small"
          disabled={isSubmitting}
          startIcon={<Iconify icon="basil:cross-solid" />}
        >
          Cancel
        </Button>

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
      </Stack>
    </Box>
  );
}
