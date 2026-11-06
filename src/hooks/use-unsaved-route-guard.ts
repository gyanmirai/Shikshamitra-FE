import { useRef, useEffect } from 'react';

import { guardStudentNavigation } from './academic-context-change';
import { replayStudentTraversal, isStudentTraversalReplay } from './student-navigation-replay';

import type { BrowserNavigation } from './student-navigation-replay';

type TraversalEvent = Event & {
  navigationType: string;
  destination: { key: string; url: string };
};
type Options = {
  dirty: boolean;
  busy: boolean;
  allowWithoutRouter: boolean;
  push?: (href: string) => void;
  onBeforeTraversal?: () => void;
  requestNavigation: (proceed: () => void) => void;
};

export function useUnsavedRouteGuard({
  dirty,
  busy,
  allowWithoutRouter,
  push,
  onBeforeTraversal,
  requestNavigation,
}: Options) {
  const permittedTraversal = useRef<string | null>(null);
  const beforeTraversal = useRef(onBeforeTraversal);
  beforeTraversal.current = onBeforeTraversal;
  const handlesTraversal = Boolean(onBeforeTraversal);

  useEffect(() => {
    if (
      (!allowWithoutRouter && !dirty && !busy && !handlesTraversal) ||
      (!push && !allowWithoutRouter)
    )
      return undefined;
    const request = (event: Event, proceed: () => void, interceptClean = false) => {
      if (!allowWithoutRouter) {
        event.preventDefault();
        requestNavigation(proceed);
        return true;
      }
      const guarded = guardStudentNavigation(proceed);
      if (!guarded && !interceptClean) return false;
      event.preventDefault();
      if (!guarded) proceed();
      return true;
    };
    const guardLink = (event: MouseEvent) => {
      if (
        !push ||
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
      const current = new URL(window.location.href);
      if (!['http:', 'https:'].includes(destination.protocol)) return;
      if (
        destination.origin === current.origin &&
        destination.pathname === current.pathname &&
        destination.search === current.search
      )
        return;
      const intercepted = request(event, () => {
        if (destination.origin === current.origin)
          push(`${destination.pathname}${destination.search}${destination.hash}`);
        else window.location.assign(destination.href);
      });
      if (intercepted) event.stopPropagation();
    };
    const { navigation } = window as Window & { navigation?: BrowserNavigation };
    const guardTraversal = (event: Event) => {
      const traversal = event as TraversalEvent;
      if (traversal.navigationType !== 'traverse' || !event.cancelable) return;
      if (allowWithoutRouter && isStudentTraversalReplay(event, traversal.destination.key)) return;
      if (allowWithoutRouter && event.defaultPrevented) return;
      if (permittedTraversal.current === traversal.destination.key) {
        permittedTraversal.current = null;
        return;
      }
      if (traversal.destination.url === window.location.href) return;
      request(
        event,
        () => {
          beforeTraversal.current?.();
          if (allowWithoutRouter) replayStudentTraversal(navigation, traversal.destination.key);
          else {
            permittedTraversal.current = traversal.destination.key;
            navigation?.traverseTo(traversal.destination.key).finished.catch(() => {
              permittedTraversal.current = null;
            });
          }
        },
        handlesTraversal
      );
    };
    if (push) document.addEventListener('click', guardLink, true);
    navigation?.addEventListener('navigate', guardTraversal);
    return () => {
      if (push) document.removeEventListener('click', guardLink, true);
      navigation?.removeEventListener('navigate', guardTraversal);
    };
  }, [dirty, busy, allowWithoutRouter, handlesTraversal, push, requestNavigation]);
}
