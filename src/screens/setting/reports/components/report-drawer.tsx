import type { ReactNode } from 'react';

import { useId } from 'react';
import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Box, Stack, Drawer, Tooltip, Divider, Typography, IconButton } from '@mui/material';

export function ReportDrawer({
  title,
  info,
  busy,
  onClose,
  children,
  footer,
  wide = false,
  scrollBody = true,
}: {
  title: string;
  info: string;
  busy?: boolean;
  onClose: () => void;
  children: ReactNode;
  footer: ReactNode;
  wide?: boolean;
  scrollBody?: boolean;
}) {
  const titleId = useId();
  const close = () => {
    if (!busy) onClose();
  };
  return (
    <Drawer
      anchor="right"
      open
      onClose={close}
      slotProps={{
        paper: {
          sx: {
            width: { xs: '100%', md: wide ? 1000 : 640 },
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
          },
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
        },
      }}
    >
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{ px: { xs: 2, sm: 3 }, py: 2, flexShrink: 0 }}
      >
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          useFlexGap
          flexWrap="wrap"
          sx={{ flex: 1, minWidth: 0 }}
        >
          <Typography id={titleId} variant="h6" component="h2" sx={{ overflowWrap: 'anywhere' }}>
            {title}
          </Typography>
          <Tooltip title={info} arrow>
            <IconButton aria-label={`About ${title}`} size="small">
              <Iconify icon={GlobalIcons.info} width={16} sx={{ color: 'info.main' }} />
            </IconButton>
          </Tooltip>
        </Stack>
        <Tooltip title={`Close ${title}`}>
          <IconButton aria-label={`Close ${title}`} disabled={busy} onClick={close}>
            <Iconify icon={GlobalIcons.cancel} />
          </IconButton>
        </Tooltip>
      </Stack>
      <Divider />
      <Box
        aria-busy={busy}
        sx={{
          flex: 1,
          minHeight: 0,
          minWidth: 0,
          overflow: scrollBody ? 'auto' : 'hidden',
          p: { xs: 2, sm: 3 },
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {children}
      </Box>
      <Divider />
      <Stack
        direction="row"
        justifyContent="flex-end"
        alignItems="center"
        useFlexGap
        flexWrap="wrap"
        spacing={1}
        sx={{ px: { xs: 2, sm: 3 }, py: 1.75, flexShrink: 0 }}
      >
        {footer}
      </Stack>
    </Drawer>
  );
}
