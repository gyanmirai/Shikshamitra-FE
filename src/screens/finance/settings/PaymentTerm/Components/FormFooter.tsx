'use client';

import { LoadingButton } from '@mui/lab';
import { Box, Stack, Button, Tooltip, Typography } from '@mui/material';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface FormFooterProps {
  isSavingDraft: boolean;
  isPublishing: boolean;
  isReadyToPublish: boolean;
  hasInstallments: boolean;
  onCancel: () => void;
  onSaveDraft: () => Promise<void>;
  onPublish: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function FormFooter({
  isSavingDraft,
  isPublishing,
  isReadyToPublish,
  hasInstallments,
  onCancel,
  onSaveDraft,
  onPublish,
}: FormFooterProps) {
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
        disabled={isSavingDraft || isPublishing}
      >
        Cancel
      </Button>

      <Stack direction="row" spacing={1.5} alignItems="center">
        {!isReadyToPublish && hasInstallments && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Complete checklist to publish
          </Typography>
        )}

        <LoadingButton
          variant="outlined"
          loading={isSavingDraft}
          onClick={onSaveDraft}
          size="small"
          disabled={isPublishing}
        >
          Save Draft
        </LoadingButton>

        <Tooltip title={!isReadyToPublish ? 'Complete all required fields to publish' : ''} arrow>
          {/* span wrapper required for Tooltip when button is disabled */}
          <span>
            <LoadingButton
              variant="contained"
              color="primary"
              loading={isPublishing}
              onClick={onPublish}
              size="small"
              disabled={!isReadyToPublish || isSavingDraft}
              sx={{ minWidth: 90 }}
            >
              Publish
            </LoadingButton>
          </span>
        </Tooltip>
      </Stack>
    </Box>
  );
}
