import Close from '@mui/icons-material/Close';
import CustomDialog from 'src/components/customDialog';
import DeleteOutline from '@mui/icons-material/DeleteOutline';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Button, Typography, DialogActions, DialogContent } from '@mui/material';

// Keep the guard scoped to this workspace, without consuming another form's Redux dirty state.
type NavigationIntent = { proceed: () => void };
type TraversalEvent = Event & {
  navigationType: string;
  destination: { key: string; url: string };
};
type BrowserNavigation = EventTarget & {
  traverseTo: (key: string) => { finished: Promise<unknown> };
};

export function useEsiUnsavedNavigation(isDirty: boolean, push: (href: string) => void) {
  const [pending, setPending] = useState<NavigationIntent | null>(null);
  const permittedTraversal = useRef<string | null>(null);
  const requestNavigation = useCallback(
    (proceed: () => void) => {
      if (!isDirty) {
        proceed();
        return;
      }
      setPending((current) => current ?? { proceed });
    },
    [isDirty]
  );

  useEffect(() => {
    if (!isDirty) return undefined;

    const guardLink = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      )
        return;
      const anchor = event.target.closest<HTMLAnchorElement>('a[href]');
      if (
        !anchor ||
        anchor.hasAttribute('download') ||
        (anchor.target && anchor.target !== '_self')
      )
        return;
      const destination = new URL(anchor.href, window.location.href);
      if (!['http:', 'https:'].includes(destination.protocol)) return;
      const current = new URL(window.location.href);
      if (
        destination.origin === current.origin &&
        destination.pathname === current.pathname &&
        destination.search === current.search
      )
        return;

      // Capture before Next links and the application's legacy anchor listeners navigate.
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

    // Modern browsers can cancel traversal before the URL and React tree change.
    // Do not add synthetic history entries, which would break back/forward behavior.
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

  const cancel = () => setPending(null);
  const confirmation = pending ? (
    <CustomDialog
      open
      title="Discard unsaved ESI changes?"
      handleClose={cancel}
      hasForm={false}
      guardUnsavedChanges={false}
      maxWidth="xs"
      aria-describedby="esi-unsaved-description"
      sx={{ '& .MuiIconButton-root': { minWidth: 44, minHeight: 44 } }}
    >
      <DialogContent>
        <Typography id="esi-unsaved-description">
          Your establishment or earning classification edits have not been saved. Stay to keep
          editing, or discard these edits and continue.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button size="small" autoFocus variant="outlined" onClick={cancel} startIcon={<Close />}>
          Keep editing
        </Button>
        <Button
          size="small"
          color="error"
          variant="contained"
          startIcon={<DeleteOutline />}
          onClick={() => {
            setPending(null);
            pending.proceed();
          }}
        >
          Discard changes
        </Button>
      </DialogActions>
    </CustomDialog>
  ) : null;

  return { requestNavigation, confirmation };
}
