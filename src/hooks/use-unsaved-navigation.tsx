import Close from '@mui/icons-material/Close';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Typography, DialogActions } from '@mui/material';
import CustomDialog, { DialogScrollContent } from 'src/components/customDialog';

type Options = {
  title?: string;
  description?: string;
  push?: (href: string) => void;
};

type TraversalEvent = Event & {
  navigationType: string;
  destination: { key: string; url: string };
};

type BrowserNavigation = EventTarget & {
  traverseTo: (key: string) => { finished: Promise<unknown> };
};

export function useUnsavedNavigation(isDirty: boolean, options: Options = {}) {
  const { title, description, push } = options;
  const [pending, setPending] = useState<(() => void) | null>(null);
  const permittedTraversal = useRef<string | null>(null);
  const requestNavigation = useCallback(
    (proceed: () => void) => {
      if (!isDirty) proceed();
      else setPending(() => proceed);
    },
    [isDirty]
  );

  useEffect(() => {
    if (!isDirty) return undefined;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty || !push) return undefined;

    const guardLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }
      const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
      if (
        !anchor ||
        anchor.hasAttribute('download') ||
        (anchor.target && anchor.target !== '_self')
      ) {
        return;
      }
      const destination = new URL(anchor.href, window.location.href);
      const current = new URL(window.location.href);
      if (!['http:', 'https:'].includes(destination.protocol)) return;
      if (
        destination.origin === current.origin &&
        destination.pathname === current.pathname &&
        destination.search === current.search
      ) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      requestNavigation(() => {
        if (destination.origin === current.origin) {
          push(`${destination.pathname}${destination.search}${destination.hash}`);
        } else {
          window.location.assign(destination.href);
        }
      });
    };

    const { navigation } = window as Window & { navigation?: BrowserNavigation };
    const guardTraversal = (event: Event) => {
      const traversal = event as TraversalEvent;
      if (traversal.navigationType !== 'traverse' || !event.cancelable) return;
      if (permittedTraversal.current === traversal.destination.key) {
        permittedTraversal.current = null;
        return;
      }
      if (traversal.destination.url === window.location.href) return;
      event.preventDefault();
      requestNavigation(() => {
        permittedTraversal.current = traversal.destination.key;
        navigation?.traverseTo(traversal.destination.key).finished.catch(() => {
          permittedTraversal.current = null;
        });
      });
    };

    document.addEventListener('click', guardLink, true);
    navigation?.addEventListener('navigate', guardTraversal);
    return () => {
      document.removeEventListener('click', guardLink, true);
      navigation?.removeEventListener('navigate', guardTraversal);
    };
  }, [isDirty, push, requestNavigation]);

  const confirmation = pending ? (
    <CustomDialog
      open
      title={title || 'Discard unsaved changes?'}
      handleClose={() => setPending(null)}
      hasForm={false}
      guardUnsavedChanges={false}
      maxWidth="xs"
      aria-describedby="unsaved-changes-description"
      paperProps={{ sx: { maxWidth: 460 } }}
    >
      <DialogScrollContent sx={{ py: 2, px: 2.5 }}>
        <Typography
          id="unsaved-changes-description"
          variant="body2"
          color="text.secondary"
          sx={{ lineHeight: 1.6 }}
        >
          {description ||
            'Your changes have not been saved. Keep editing, or discard them and continue.'}
        </Typography>
      </DialogScrollContent>
      <DialogActions
        sx={{
          px: 2,
          py: 1.5,
          gap: 1,
          borderTop: 1,
          flexWrap: 'wrap',
          borderColor: 'divider',
          '& > :not(style) ~ :not(style)': { ml: 0 },
        }}
      >
        <Button
          autoFocus
          size="small"
          variant="outlined"
          color="inherit"
          onClick={() => setPending(null)}
          startIcon={<Close fontSize="small" />}
        >
          Keep editing
        </Button>
        <Button
          size="small"
          color="error"
          variant="contained"
          startIcon={<DeleteOutline fontSize="small" />}
          onClick={() => {
            const proceed = pending;
            setPending(null);
            proceed();
          }}
        >
          Discard changes
        </Button>
      </DialogActions>
    </CustomDialog>
  ) : null;

  return { requestNavigation, confirmation };
}
