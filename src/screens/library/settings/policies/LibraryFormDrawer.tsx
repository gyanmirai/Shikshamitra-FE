import type { ReactNode, FormEvent } from 'react';

import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';
import { Box, Stack, Button, Drawer, Typography, IconButton } from '@mui/material';

export function LibraryFormDrawer({
  title,
  status,
  help,
  onClose,
  busy = false,
  children,
  onSubmit,
  submitDisabled,
}: {
  title: string;
  status?: ReactNode;
  help: string;
  onClose: () => void;
  busy?: boolean;
  children: ReactNode;
  onSubmit?: () => void;
  submitDisabled?: boolean;
}) {
  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      ModalProps={{ disableEscapeKeyDown: busy }}
      PaperProps={{
        role: 'dialog',
        'aria-label': title,
        sx: { width: { xs: '100%', sm: 'min(840px, 96vw)' }, maxWidth: '100%' },
      }}
    >
      <Box
        component={onSubmit ? 'form' : 'div'}
        onSubmit={
          onSubmit
            ? (event: FormEvent) => {
                event.preventDefault();
                onSubmit();
              }
            : undefined
        }
        sx={{ display: 'flex', flexDirection: 'column', height: 1, minHeight: 0 }}
        aria-busy={busy}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ px: { xs: 2, sm: 3 }, py: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ flex: 1, minWidth: 0 }}
          >
            <Typography variant="h6">{title}</Typography>
            {status}
            <InfoTooltipIcon title={help} label={`${title} information`} />
          </Stack>
          <IconButton aria-label={`Close ${title}`} disabled={busy} onClick={onClose}>
            <Iconify icon={GlobalIcons.cancel} />
          </IconButton>
        </Stack>
        <Stack spacing={2} sx={{ p: { xs: 2, sm: 3 }, flex: 1, minHeight: 0, overflow: 'auto' }}>
          {children}
        </Stack>
        <Stack
          direction="row"
          justifyContent="flex-end"
          spacing={1}
          sx={{ px: { xs: 2, sm: 3 }, py: 1.75, borderTop: 1, borderColor: 'divider' }}
        >
          <Button
            type="button"
            size="small"
            variant="outlined"
            color="inherit"
            disabled={busy}
            onClick={onClose}
            startIcon={<Iconify icon={GlobalIcons.cancel} />}
          >
            {onSubmit ? 'Cancel' : 'Close'}
          </Button>
          {onSubmit && (
            <LoadingButton
              type="submit"
              size="small"
              variant="contained"
              color="inherit"
              loading={busy}
              disabled={submitDisabled}
              startIcon={<Iconify icon={GlobalIcons.submit} />}
            >
              Submit
            </LoadingButton>
          )}
        </Stack>
      </Box>
    </Drawer>
  );
}
