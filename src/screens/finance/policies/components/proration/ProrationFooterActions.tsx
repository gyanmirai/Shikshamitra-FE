'use client';

import React from 'react';
import { LoadingButton } from '@mui/lab';
import { Iconify } from 'src/components/iconify';
import { Stack, Button, Tooltip } from '@mui/material';

interface ProrationFooterActionsProps {
  isSaving: boolean;
  isReadyToPublish: boolean;
  onCancel: () => void;
  onPublish: () => void;
}

export default function ProrationFooterActions({
  isSaving,
  isReadyToPublish,
  onCancel,
  onPublish,
}: ProrationFooterActionsProps) {
  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      spacing={1.5}
      sx={{
        px: { xs: 2, sm: 3 },
        py: 1.5,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
        flexShrink: 0,
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

      <Tooltip
        title={
          !isReadyToPublish
            ? 'At least one recurring fee head must have a rule configured before saving'
            : ''
        }
        placement="top"
      >
        <span>
          <LoadingButton
            variant="contained"
            color="primary"
            loading={isSaving}
            onClick={onPublish}
            size="small"
            disabled={!isReadyToPublish}
            startIcon={<Iconify icon="material-symbols-light:save" width={20} />}
          >
            Save Policy
          </LoadingButton>
        </span>
      </Tooltip>
    </Stack>
  );
}
