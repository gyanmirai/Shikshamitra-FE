'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Stack, Button } from '@mui/material';
import { Iconify } from 'src/components/iconify';

interface CollectionFooterActionsProps {
  isSaving: boolean;
  invalid?: boolean;
  onCancel: () => void;
}

export default function CollectionFooterActions({
  isSaving,
  invalid = false,
  onCancel,
}: CollectionFooterActionsProps) {
  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      spacing={1}
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1.75,
        bgcolor: (theme) => theme.vars.palette.background.paper,
        flexShrink: 0,
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Button
        variant="outlined"
        onClick={onCancel}
        size="small"
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <LoadingButton
        variant="contained"
        loading={isSaving}
        type="submit"
        size="small"
        startIcon={<Iconify icon={GlobalIcons.submit} width={18} />}
        disabled={isSaving || invalid}
      >
        Submit
      </LoadingButton>
    </Stack>
  );
}
