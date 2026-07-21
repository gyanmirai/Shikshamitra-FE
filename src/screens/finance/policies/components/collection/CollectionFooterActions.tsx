'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface CollectionFooterActionsProps {
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: () => void;
  isSubmitDisabled: boolean;
}

export default function CollectionFooterActions({
  isSaving,
  onCancel,
  onSubmit,
  isSubmitDisabled,
}: CollectionFooterActionsProps) {
  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      spacing={1.5}
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1.5,
        bgcolor: 'background.paper',
        position: 'sticky',
        bottom: 0,
        zIndex: 1,
      }}
    >
      <Button
        variant="outlined"
        color="inherit"
        onClick={onCancel}
        size="small"
        startIcon={<Iconify icon="basil:cross-solid" />}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <LoadingButton
        variant="contained"
        color="primary"
        loading={isSaving}
        onClick={onSubmit}
        size="small"
        startIcon={<Iconify icon="material-symbols-light:save" width={20} height={20} />}
        disabled={isSubmitDisabled}
        sx={{ minWidth: 90 }}
      >
        Submit
      </LoadingButton>
    </Stack>
  );
}
