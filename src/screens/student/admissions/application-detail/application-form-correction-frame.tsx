import type { ReactNode } from 'react';

import { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import CustomTooltip from 'src/components/custom-tooltip';
import { Box, Stack, Drawer, Divider, IconButton, Typography } from '@mui/material';

export function ApplicationFormCorrectionFrame({
  busy = false,
  onClose,
  children,
}: {
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const titleId = useId();
  return (
    <Drawer
      anchor="right"
      open
      onClose={onClose}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          sx: {
            width: { xs: '100%', md: 960 },
            maxWidth: '100%',
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          },
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={1} sx={{ p: 2, flexShrink: 0 }}>
        <Typography id={titleId} component="h2" variant="h6">
          Edit Application Form
        </Typography>
        <CustomTooltip title="Correct the saved registration form before finalization. Approval, application number and payment history are retained.">
          <IconButton size="small" aria-label="About application corrections">
            <Iconify icon={GlobalIcons.info} color="info.main" />
          </IconButton>
        </CustomTooltip>
        <Box sx={{ flex: 1 }} />
        <IconButton disabled={busy} onClick={onClose} aria-label="Close Edit Application Form">
          <Iconify icon={GlobalIcons.cancel} />
        </IconButton>
      </Stack>
      <Divider />
      <Box
        sx={{
          p: { xs: 1.5, sm: 2 },
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {children}
      </Box>
    </Drawer>
  );
}
