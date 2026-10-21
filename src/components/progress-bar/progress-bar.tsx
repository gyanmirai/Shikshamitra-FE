'use client';

// @ts-ignore
import './styles.css';

import type { RootState } from 'src/redux/store';

import NProgress from 'nprogress';
import { useRef, Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';
import { useRouter, usePathname, useSearchParams } from 'src/routes/hooks';

// ----------------------------------------------------------------------

type PushStateInput = [data: any, unused: string, url?: string | URL | null | undefined];

export function ProgressBar() {
  // const [currentPoint, setCurrentPoint] = useState(0);
  // const [point, setPoint] = useState(0);
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();
  // const router = useRouter();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    // Track registered anchors so cleanup removes the exact same listener reference.
    const registeredAnchors = new Map<HTMLAnchorElement, EventListener>();

    const handleAnchorClick = (event: MouseEvent) => {
      const targetUrl = (event.currentTarget as HTMLAnchorElement).href;

      const currentUrl = window.location.href;

      const confirmed = !isChanges
        ? true
        : window.confirm('You have unsaved changes. Do you want to leave?');

      if (!confirmed) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        dispatch(setIsChanges(false));
        if (targetUrl !== currentUrl) {
          NProgress.start();
        }
      }
    };

    const getFilteredAnchors = (): HTMLAnchorElement[] => {
      const anchorElements: NodeListOf<HTMLAnchorElement> = document.querySelectorAll('a[href]');
      return Array.from(anchorElements).filter((element) => {
        const rel = element.getAttribute('rel');
        const href = element.getAttribute('href');
        const target = element.getAttribute('target');
        return href?.startsWith('/') && target !== '_blank' && rel !== 'noopener';
      });
    };

    const handleMutation = () => {
      getFilteredAnchors().forEach((anchor) => {
        // Only add the listener once per anchor per effect lifecycle.
        if (!registeredAnchors.has(anchor)) {
          anchor.addEventListener('click', handleAnchorClick as EventListener);
          registeredAnchors.set(anchor, handleAnchorClick as EventListener);
        }
      });
    };

    const handelPopup = (event: any) => {
      if (isChanges) {
        // Modern browsers ignore custom messages; any text works.
        const message = 'You have unsaved changes. Do you want to leave?';
        event.returnValue = message; // Legacy way for some browsers
        return message; // Standard way to trigger the dialog
      }
      return undefined;
    };

    const mutationObserver = new MutationObserver(handleMutation);

    mutationObserver.observe(document, { childList: true, subtree: true });
    handleMutation();

    // Save the original pushState so we can restore it on cleanup and avoid stacking proxies.
    const originalPushState = window.history.pushState;
    window.history.pushState = new Proxy(originalPushState, {
      apply: (target, thisArg, argArray: PushStateInput) => {
        NProgress.done();
        return target.apply(thisArg, argArray);
      },
    });
    window.addEventListener('beforeunload', handelPopup);

    return () => {
      mutationObserver.disconnect();
      // Remove only the listeners registered during this effect lifecycle.
      registeredAnchors.forEach((listener, anchor) => {
        anchor.removeEventListener('click', listener);
      });
      registeredAnchors.clear();
      // Restore the original pushState to prevent proxy stacking across re-renders.
      window.history.pushState = originalPushState;
      window.removeEventListener('beforeunload', handelPopup);
    };
  }, [isChanges, dispatch]);

  useEffect(() => {
    // @ts-ignore
    window.isChanges = isChanges;
  }, [isChanges]);

  return (
    <Suspense fallback={null}>
      <NProgressDone />
    </Suspense>
  );
}

// ----------------------------------------------------------------------

function NProgressDone() {
  const pathname = usePathname();

  const router = useRouter();

  const searchParams = useSearchParams();

  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const changes = useRef(false);
  const dispatch = useDispatch();

  useEffect(() => {
    changes.current = isChanges;
  }, [isChanges]);

  useEffect(() => {
    // Add a custom entry to the history stack
    window.history.pushState(window.history.state, document.title, window.location.href);

    // Handle the back button click by pushing the same state again
    const handlePopState = () => {
      // Clean pages must not rewrite history or erase the forward destination.
      if (!changes.current) return;
      // Show a custom alert or perform an action when trying to navigate back
      if (
        changes.current &&
        window.confirm('Are you sure you want to leave this page? Unsaved changes will be lost.')
      ) {
        router.back(); // Navigate back if confirmed
        dispatch(setIsChanges(false));
      } else {
        // Push a new state to override the back button
        window.history.pushState(window.history.state, document.title, window.location.href);
      }
    };

    // Listen for the popstate event
    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [dispatch, router]);

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}
