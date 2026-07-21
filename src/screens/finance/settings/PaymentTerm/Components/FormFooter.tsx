'use client';

import { LoadingButton } from '@mui/lab';
import { Box, Button } from '@mui/material';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface FormFooterProps {
  isSubmitting: boolean;
  isEdit: boolean;
  onCancel: () => void;
  onSubmit: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function FormFooter({ isSubmitting, isEdit, onCancel, onSubmit }: FormFooterProps) {
  return (
    <Box
      sx={{
        px: 3,
        py: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
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
      >
        Cancel
      </Button>

      <LoadingButton
        variant="contained"
        color="primary"
        loading={isSubmitting}
        onClick={onSubmit}
        size="small"
        sx={{ minWidth: 90 }}
      >
        {isEdit ? 'Update' : 'Submit'}
      </LoadingButton>
    </Box>
  );
}
