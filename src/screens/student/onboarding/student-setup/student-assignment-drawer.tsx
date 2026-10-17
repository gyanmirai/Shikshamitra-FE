'use client';

import type { ReactNode } from 'react';

import { useId, useRef, useState, useEffect } from 'react';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { Box, Stack, Drawer, IconButton, Typography } from '@mui/material';

/** Assignment-only shell; callers retain their existing save and unsaved-work guards. */
export default function StudentAssignmentDrawer({
  title,
  busy,
  onClose,
  children,
  actions,
  wide = false,
}: {
  title: string;
  busy: boolean;
  onClose: () => void;
  children: ReactNode;
  actions: ReactNode;
  wide?: boolean;
}) {
  const titleId = useId();
  const mounted = useRef(false);
  const [returnFocusTarget] = useState(() =>
    typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  );
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // The workspace unlocks its initiating control during unmount. Restore after that update.
      window.requestAnimationFrame(() => {
        if (mounted.current || !returnFocusTarget?.isConnected) return;
        const target = returnFocusTarget.matches(':disabled')
          ? returnFocusTarget.closest<HTMLElement>('[role="region"][tabindex]')
          : returnFocusTarget;
        target?.focus();
      });
    };
  }, [returnFocusTarget]);
  return (
    <Drawer
      open
      anchor="right"
      onClose={() => {
        if (!busy) onClose();
      }}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          'aria-busy': busy,
          sx: {
            width: { xs: '100%', sm: wide ? 800 : 560 },
            maxWidth: '100%',
            display: 'flex',
            flexDirection: 'column',
            overscrollBehavior: 'contain',
          },
        },
      }}
    >
      <Stack
        component="header"
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1}
        sx={{ px: 2, py: 1.5, flexShrink: 0, borderBottom: 1, borderColor: 'divider' }}
      >
        <Typography id={titleId} component="h2" variant="subtitle1" sx={{ minWidth: 0 }}>
          {title}
        </Typography>
        <IconButton aria-label={`Close ${title}`} disabled={busy} onClick={onClose}>
          <Iconify icon="mdi:close" width={20} />
        </IconButton>
      </Stack>
      <Scrollbar sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ p: 2 }}>{children}</Box>
      </Scrollbar>
      <Box component="footer" sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider' }}>
        {actions}
      </Box>
    </Drawer>
  );
}
