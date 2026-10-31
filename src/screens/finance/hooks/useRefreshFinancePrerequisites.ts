'use client';

import { useRef, useEffect } from 'react';

/** Setup opens in a new tab; returning refreshes lookups without resetting Formik state. */
export function useRefreshFinancePrerequisites(onRefresh?: () => void, enabled = true) {
  const latest = useRef(onRefresh);
  latest.current = onRefresh;
  const canRefresh = Boolean(onRefresh);
  useEffect(() => {
    if (!enabled || !canRefresh) return undefined;
    let hasLeftPage = document.visibilityState === 'hidden';
    let filePickerOpen = false;
    const isFileInput = (event: Event) =>
      event.target instanceof HTMLInputElement && event.target.type === 'file';
    const handleFilePickerOpen = (event: Event) => {
      if (isFileInput(event)) {
        filePickerOpen = true;
        hasLeftPage = false;
      }
    };
    const handleFilePickerClose = (event: Event) => {
      if (isFileInput(event)) {
        filePickerOpen = false;
        hasLeftPage = false;
      }
    };
    const refreshOnReturn = () => {
      if (!hasLeftPage || document.visibilityState === 'hidden') return;
      hasLeftPage = false;
      latest.current?.();
    };
    const handleBlur = (event: Event) => {
      if (event.target === event.currentTarget && !filePickerOpen) hasLeftPage = true;
    };
    const handleFocus = (event: Event) => {
      if (event.target !== event.currentTarget) return;
      // Native file choosers also restore window focus, including on cancel.
      if (filePickerOpen) {
        filePickerOpen = false;
        hasLeftPage = false;
        return;
      }
      refreshOnReturn();
    };
    const handleVisibilityChange = () => {
      if (filePickerOpen) return;
      if (document.visibilityState === 'hidden') hasLeftPage = true;
      else refreshOnReturn();
    };
    // Capture programmatic input.click() from shared upload controls before
    // the native picker blurs the window. Uploads do not change eligibility.
    document.addEventListener('click', handleFilePickerOpen, true);
    document.addEventListener('change', handleFilePickerClose, true);
    document.addEventListener('cancel', handleFilePickerClose, true);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('click', handleFilePickerOpen, true);
      document.removeEventListener('change', handleFilePickerClose, true);
      document.removeEventListener('cancel', handleFilePickerClose, true);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, canRefresh]);
}
