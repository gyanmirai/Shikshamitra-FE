'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Stack, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';


interface CollectionFooterActionsProps {
  isSaving: boolean;
  onCancel: () => void;
  submitLabel: string;
}

export default function CollectionFooterActions({
  isSaving,
  onCancel,
  submitLabel,
}: CollectionFooterActionsProps) {
  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      spacing={1.5}
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1.75,
        bgcolor: (theme) => alpha(theme.palette.background.paper, 0.95),
        backdropFilter: 'blur(8px)',
        position: 'sticky',
        bottom: 0,
        zIndex: 2,
        borderTop: '1px solid',
        borderColor: 'divider',
        boxShadow: (theme) => `0 -4px 16px -4px ${alpha(theme.palette.grey[500], 0.12)}`,
      }}
    >
      <Button
        variant="outlined"
        color="inherit"
        onClick={onCancel}
        size="small"
        startIcon={<Iconify icon={GlobalIcons.cancel} />}
        disabled={isSaving}
      >
        Cancel
      </Button>
      <LoadingButton
        variant="contained"
        color="primary"
        loading={isSaving}
        type="submit"
        size="small"
        startIcon={
          <Iconify
            icon={submitLabel.toLowerCase().includes('draft') ? GlobalIcons.submit : GlobalIcons.publish}
            width={18}
            height={18}
          />
        }
        disabled={isSaving}
        sx={{ minWidth: 110 }}
      >
        {submitLabel}
      </LoadingButton>
    </Stack>
  );
}
