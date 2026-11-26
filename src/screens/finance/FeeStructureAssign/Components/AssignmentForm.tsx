import type { ReactNode, FormEventHandler } from 'react';
import type { Theme, SxProps } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { Box, Stack, Button, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

export function assignmentBatchGrid(results: boolean): SxProps<Theme> {
  return {
    display: 'grid',
    gap: 2,
    alignItems: 'start',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gridTemplateAreas: results ? '"students" "preview"' : '"students" "setup" "preview"',
    '@container (min-width: 760px)': {
      gridTemplateColumns: 'minmax(180px, 1fr) minmax(0, 3fr)',
      gridTemplateAreas: results ? '"students preview"' : '"students setup" "students preview"',
    },
    ...(!results && {
      '@container (min-width: 1056px)': {
        gridTemplateColumns: 'minmax(180px, 0.6fr) minmax(0, 1.4fr) minmax(0, 1fr)',
        gridTemplateAreas: '"students setup preview"',
      },
    }),
  };
}

export default function AssignmentForm({
  busy,
  busyLabel,
  onPreview,
  onAssign,
  onCancel,
  previewDisabled,
  assignDisabled,
  assignLabel,
  resultAction,
  children,
}: {
  busy: boolean;
  busyLabel: string;
  onPreview: FormEventHandler<HTMLFormElement>;
  onAssign?: () => void;
  onCancel: () => void;
  previewDisabled: boolean;
  assignDisabled?: boolean;
  assignLabel?: string;
  resultAction?: { label: string; icon: string; onClick: () => void };
  children: ReactNode;
}) {
  return (
    <Box
      component="form"
      noValidate
      onSubmit={(event) => {
        if (event.target === event.currentTarget) onPreview(event);
      }}
      sx={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, minWidth: 0 }}
    >
      <FormBusyRegion busy={busy} label={busyLabel} fillContent flattenFieldset>
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: 'auto',
            px: { xs: 2, sm: 3 },
            py: 2,
            containerType: 'inline-size',
          }}
        >
          {children}
        </Box>
        <Stack
          direction="row"
          justifyContent={resultAction ? 'flex-end' : 'space-between'}
          alignItems="center"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{
            flexShrink: 0,
            borderTop: 1,
            borderColor: 'divider',
            bgcolor: 'background.paper',
            px: { xs: 2, sm: 3 },
            py: 1.75,
          }}
        >
          {resultAction ? (
            <Button
              type="button"
              variant="contained"
              size="small"
              disabled={busy}
              onClick={resultAction.onClick}
              startIcon={<Iconify icon={resultAction.icon} />}
            >
              {resultAction.label}
            </Button>
          ) : (
            <>
              <Button
                type="button"
                variant="outlined"
                color="inherit"
                size="small"
                disabled={busy}
                onClick={onCancel}
                startIcon={<Iconify icon="mdi:close" />}
              >
                Cancel
              </Button>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                <Button
                  type="submit"
                  variant="outlined"
                  color="inherit"
                  size="small"
                  disabled={previewDisabled}
                  startIcon={<Iconify icon="mdi:eye-outline" />}
                >
                  Preview
                </Button>
                {onAssign && (
                  <Button
                    type="button"
                    variant="contained"
                    size="small"
                    disabled={assignDisabled}
                    onClick={onAssign}
                    startIcon={<Iconify icon="mdi:check" />}
                  >
                    {assignLabel}
                  </Button>
                )}
              </Stack>
            </>
          )}
        </Stack>
      </FormBusyRegion>
    </Box>
  );
}

export function AssignmentPreviewDialog({
  title = 'Assignment Preview',
  busy,
  children,
  onClose,
  action,
}: {
  title?: string;
  busy: boolean;
  children: ReactNode;
  onClose: () => void;
  action?: { label: string; disabled?: boolean; onClick: () => void };
}) {
  return (
    <CustomDialog
      open
      hasForm={false}
      title={title}
      titleInfo="Review the fee breakdown, policies and installment schedule."
      maxWidth="md"
      handleClose={onClose}
      disableClose={busy}
      guardUnsavedChanges={false}
    >
      <DialogScrollContent>
        <FormBusyRegion busy={busy} label="Saving…">
          <Stack spacing={2}>{children}</Stack>
        </FormBusyRegion>
      </DialogScrollContent>
      <DialogActions>
        <Button
          size="small"
          variant="outlined"
          color="inherit"
          disabled={busy}
          onClick={onClose}
          startIcon={<Iconify icon={action ? 'mdi:arrow-left' : 'mdi:close'} />}
        >
          {action ? 'Back to form' : 'Close'}
        </Button>
        {action && (
          <Button
            size="small"
            variant="contained"
            disabled={busy || action.disabled}
            onClick={action.onClick}
            startIcon={<Iconify icon="mdi:check" />}
          >
            {action.label}
          </Button>
        )}
      </DialogActions>
    </CustomDialog>
  );
}
