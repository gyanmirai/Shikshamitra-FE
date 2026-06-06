'use client';

// @ts-ignore
import './styles.css';

import type { RootState } from 'src/redux/store';

import NProgress from 'nprogress';
import { Suspense, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePathname, useSearchParams } from 'src/routes/hooks';
import { setIsChanges } from 'src/redux/confirmPopup/confirmPopupSlice';

// ----------------------------------------------------------------------

export function ProgressBar() {
  const { isChanges } = useSelector((state: RootState) => state.confirmPopup);
  const dispatch = useDispatch();

  useEffect(() => {
    NProgress.configure({ showSpinner: false });

    const handleAnchorClick = (event: MouseEvent): void => {
      const target = event.target as Element | null;
      const anchor = target?.closest?.('a[href]') as HTMLAnchorElement | null;

      if (!anchor || anchor.target === '_blank' || anchor.rel === 'noopener') {
        return;
      }

      const targetUrl = new URL(anchor.href, window.location.href);
      const currentUrl = new URL(window.location.href);
      const isInternalNavigation = targetUrl.origin === currentUrl.origin;

      if (!isInternalNavigation) {
        return;
      }

      if (isChanges && !window.confirm('You have unsaved changes. Do you want to leave?')) {
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (isChanges) {
        dispatch(setIsChanges(false));
      }

      if (targetUrl.href !== currentUrl.href) {
        NProgress.start();
      }
    };

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (isChanges) {
        event.preventDefault();
        event.returnValue = '';
      }
    };

    document.addEventListener('click', handleAnchorClick, true);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('click', handleAnchorClick, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
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

  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  return null;
}
