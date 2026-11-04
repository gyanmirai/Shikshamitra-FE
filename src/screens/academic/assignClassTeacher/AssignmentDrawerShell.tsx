import type { ReactNode } from 'react';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { FormBusyRegion } from 'src/components/form-busy-region';
import { Box, Stack, Drawer, IconButton, Typography } from '@mui/material';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';

type Props = {
  open: boolean;
  title: string;
  help: string;
  busy?: boolean;
  disableBackdropClick?: boolean;
  children: ReactNode;
  actions: ReactNode;
  onClose: () => void;
};

export function AssignmentDrawerShell({
  open,
  title,
  help,
  busy = false,
  disableBackdropClick = false,
  children,
  actions,
  onClose,
}: Props) {
  return (
    <Drawer
      anchor="right"
      open={open}
      disableEscapeKeyDown={busy}
      onClose={(_event, reason) => {
        if (!busy && (!disableBackdropClick || reason !== 'backdropClick')) onClose();
      }}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-label': title,
          sx: {
            width: { xs: '100%', sm: 480 },
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: { xs: 2, sm: 3 }, py: 2, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          spacing={1}
          useFlexGap
          flexWrap="wrap"
          sx={{ minWidth: 0 }}
        >
          <Typography component="h2" variant="h6" sx={{ overflowWrap: 'anywhere' }}>
            {title}
          </Typography>
          <InfoTooltipIcon title={help} label={`${title} information`} />
        </Stack>
        <IconButton aria-label={`Close ${title}`} disabled={busy} onClick={onClose}>
          <Iconify icon={GlobalIcons.cancel} />
        </IconButton>
      </Stack>
      <Box sx={{ flex: 1, minHeight: 0, overflowY: 'auto', px: { xs: 2, sm: 3 }, py: 2 }}>
        <FormBusyRegion busy={busy} label="Publishing assignments…">
          {children}
        </FormBusyRegion>
      </Box>
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        spacing={1}
        sx={{ px: { xs: 2, sm: 3 }, py: 1.75, borderTop: 1, borderColor: 'divider', flexShrink: 0 }}
      >
        {actions}
      </Stack>
    </Drawer>
  );
}
