'use client';

import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Box, Button, Tooltip } from '@mui/material';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface FormFooterProps {
  isSubmitting: boolean;
  disabled: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function FormFooter({ isSubmitting, disabled, onCancel, onSubmit }: FormFooterProps) {
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 1.5,
        flexShrink: 0,
        bgcolor: 'background.paper',
        boxShadow: '0 -2px 8px 0 rgba(0,0,0,0.06)',
      }}
    >
      <Button
        variant="outlined"
        color="inherit"
        onClick={onCancel}
        size="small"
        disabled={isSubmitting}
        startIcon={<Iconify icon="basil:cross-solid" />}
      >
        Cancel
      </Button>

      <Tooltip title={disabled && !isSubmitting ? 'Make a change before submitting' : ''}>
        <span>
          <LoadingButton
            variant="contained"
            color="primary"
            loading={isSubmitting}
            disabled={disabled}
            onClick={onSubmit}
            size="small"
            startIcon={<Iconify icon="material-symbols-light:save" width={20} height={20} />}
            sx={{ minWidth: 96 }}
          >
            Submit
          </LoadingButton>
        </span>
      </Tooltip>
    </Box>
  );
}
