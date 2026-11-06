import { vi } from 'vitest';
import { useState } from 'react';
import { act, render } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { useUnsavedNavigation } from 'src/hooks/use-unsaved-navigation';
import { defaultSettings } from 'src/components/settings/config-settings';

import { useAdmissionDraftGuard } from './use-admission-draft-guard';

export const callbacks = { push: vi.fn(), reset: vi.fn(), proceed: vi.fn() };

export function GuardHarness({ siblingBusy = false, editorBusy = false } = {}) {
  const [value, setValue] = useState('Saved stage');
  const guard = useAdmissionDraftGuard({
    dirty: value !== 'Saved stage',
    busy: editorBusy,
    push: callbacks.push,
    reset: () => {
      callbacks.reset();
      setValue('Saved stage');
    },
  });
  useUnsavedNavigation(false, { guardContextChanges: true, blockNavigation: siblingBusy });
  return (
    <>
      <input
        aria-label="Stage name"
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <button type="button" onClick={() => guard.requestNavigation(callbacks.proceed)}>
        Close
      </button>
      <a href="/student/next">Next page</a>
      {guard.confirmation}
    </>
  );
}

export const renderGuard = () =>
  render(<GuardHarness />, {
    wrapper: ({ children }) => (
      <ThemeProvider theme={createTheme(defaultSettings)}>{children}</ThemeProvider>
    ),
  });

export function installHistory() {
  const navigation = new EventTarget() as EventTarget & { traverseTo: ReturnType<typeof vi.fn> };
  const traverse = () => {
    const event = new Event('navigate', { cancelable: true });
    Object.assign(event, {
      navigationType: 'traverse',
      destination: { key: 'previous', url: `${window.location.origin}/previous` },
    });
    act(() => navigation.dispatchEvent(event));
    return event;
  };
  navigation.traverseTo = vi.fn(() => {
    traverse();
    return { finished: Promise.resolve() };
  });
  vi.stubGlobal('navigation', navigation);
  return { navigation, traverse };
}
