'use client';

import type { ReactNode } from 'react';

import { GlobalIcons } from 'src/utils/icons';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { useId, useRef, useState, useEffect, useCallback } from 'react';
import { Box, Stack, Drawer, IconButton, Typography } from '@mui/material';
import { InfoTooltipIcon } from 'src/components/custom-tooltip/info-tooltip-icon';

/** Assignment-only shell; callers retain their existing save and unsaved-work guards. */
export default function StudentAssignmentDrawer({
  title,
  busy,
  onClose,
  open = true,
  onExited,
  children,
  actions,
  wide = false,
  expanded = false,
  context,
  titleInfo,
  contentLayout = 'scroll',
}: {
  title: string;
  busy: boolean;
  onClose: () => void;
  open?: boolean;
  onExited?: () => void;
  children: ReactNode;
  actions: ReactNode;
  wide?: boolean;
  expanded?: boolean;
  context?: ReactNode;
  titleInfo?: string;
  contentLayout?: 'scroll' | 'workspace' | 'split';
}) {
  const titleId = useId();
  const mounted = useRef(false);
  const isOpen = useRef(open);
  isOpen.current = open;
  const split = contentLayout === 'split';
  const [returnFocusTarget] = useState(() =>
    typeof document !== 'undefined' && document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
  );
  const restoreFocus = useCallback(() => {
    if (!returnFocusTarget?.isConnected) return;
    const activeDialog = document.activeElement?.closest('[role="dialog"]');
    if (activeDialog && !activeDialog.contains(returnFocusTarget)) return;
    const target = returnFocusTarget.matches(':disabled')
      ? returnFocusTarget.closest<HTMLElement>('[role="region"][tabindex]')
      : returnFocusTarget;
    target?.focus();
  }, [returnFocusTarget]);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      // The workspace unlocks its initiating control during unmount. Restore after that update.
      window.requestAnimationFrame(() => {
        if (!mounted.current) restoreFocus();
      });
    };
  }, [restoreFocus]);
  const handleExited = () => {
    onExited?.();
    window.requestAnimationFrame(() => {
      if (mounted.current && !isOpen.current) restoreFocus();
    });
  };
  return (
    <Drawer
      open={open}
      anchor="right"
      onTransitionExited={onExited ? handleExited : undefined}
      ModalProps={{ disableRestoreFocus: Boolean(onExited) }}
      onClose={() => {
        if (open && !busy) onClose();
      }}
      slotProps={{
        paper: {
          role: 'dialog',
          'aria-modal': true,
          'aria-labelledby': titleId,
          'aria-busy': busy,
          inert: !open || undefined,
          sx: {
            width: { xs: '100%', sm: expanded ? 'min(1440px, 96vw)' : wide ? 800 : 560 },
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
        sx={{
          px: expanded ? { xs: 2, sm: 3 } : 2,
          py: expanded ? 2 : 1.5,
          flexShrink: 0,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography
            id={titleId}
            component="h2"
            variant="h6"
            sx={{ minWidth: 0, overflowWrap: 'anywhere' }}
          >
            {title}
          </Typography>
          {titleInfo && <InfoTooltipIcon title={titleInfo} label={`${title} information`} />}
        </Stack>
        <IconButton
          aria-label={`Close ${title}`}
          disabled={busy || !open}
          onClick={onClose}
          sx={{ flexShrink: 0 }}
        >
          <Iconify icon={GlobalIcons.cancel} width={20} />
        </IconButton>
      </Stack>
      {context}
      {contentLayout === 'workspace' ? (
        <Box sx={{ flex: 1, minHeight: 0, overflow: 'hidden', p: 2 }}>{children}</Box>
      ) : (
        <Scrollbar
          ariaLabel={split ? 'Drawer content' : undefined}
          sx={{
            flex: 1,
            minHeight: 0,
            ...(split && {
              // Bound only the outer body so its desktop panes can scroll independently.
              '& > .simplebar-wrapper > .simplebar-mask > .simplebar-offset > .simplebar-content-wrapper > .simplebar-content':
                { height: { lg: 1 } },
            }),
          }}
        >
          <Box sx={{ p: expanded ? { xs: 2, sm: 3 } : 2, height: split ? { lg: 1 } : undefined }}>
            {children}
          </Box>
        </Scrollbar>
      )}
      {contentLayout !== 'workspace' && (
        <Box component="footer" sx={{ flexShrink: 0, borderTop: 1, borderColor: 'divider' }}>
          {actions}
        </Box>
      )}
    </Drawer>
  );
}
