// @vitest-environment jsdom

import { vi, it, expect, afterEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { act, render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { AcademicSetupEmbeddingProvider } from './index';
import { useLectureSlotsNavigation } from './useLectureSlotsNavigation';

function Navigation({
  dirty = true,
  busy = false,
  close,
}: {
  dirty?: boolean;
  busy?: boolean;
  close: () => void;
}) {
  const guard = useLectureSlotsNavigation({ dirty, busy }, vi.fn());
  return (
    <>
      <button type="button" onClick={() => guard.requestNavigation(close)}>
        Close slots
      </button>
      {guard.confirmation}
    </>
  );
}

afterEach(() => {
  Reflect.deleteProperty(window, 'navigation');
});

it('keeps entered slots on browser Back until the user explicitly discards them', () => {
  const navigation = new EventTarget();
  const traverseTo = vi.fn(() => ({ finished: Promise.resolve() }));
  Object.assign(navigation, { traverseTo });
  Object.defineProperty(window, 'navigation', { configurable: true, value: navigation });
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AcademicSetupEmbeddingProvider onFormStateChange={vi.fn()}>
        <Navigation close={vi.fn()} />
      </AcademicSetupEmbeddingProvider>
    </ThemeProvider>
  );
  const back = () =>
    Object.assign(new Event('navigate', { cancelable: true }), {
      navigationType: 'traverse',
      destination: { key: 'previous', url: 'http://localhost/academic/setup?stage=curriculum' },
    });
  let accepted = true;
  act(() => {
    accepted = navigation.dispatchEvent(back());
  });
  expect(accepted).toBe(false);
  const unload = new Event('beforeunload', { cancelable: true });
  window.dispatchEvent(unload);
  expect(unload.defaultPrevented).toBe(true);
  expect(screen.getByRole('dialog', { name: 'Discard Unsaved Changes?' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: /Keep editing/i }));
  expect(traverseTo).not.toHaveBeenCalled();
  act(() => {
    navigation.dispatchEvent(back());
  });
  fireEvent.click(screen.getByRole('button', { name: /Discard changes/i }));
  expect(traverseTo).toHaveBeenCalledWith('previous');
});

it('blocks local close while a slot save is busy and uses one dirty-close decision otherwise', () => {
  const close = vi.fn();
  const view = render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AcademicSetupEmbeddingProvider onFormStateChange={vi.fn()}>
        <Navigation close={close} busy />
      </AcademicSetupEmbeddingProvider>
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close slots' }));
  expect(close).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  view.rerender(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <AcademicSetupEmbeddingProvider onFormStateChange={vi.fn()}>
        <Navigation close={close} />
      </AcademicSetupEmbeddingProvider>
    </ThemeProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: 'Close slots' }));
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: /Discard changes/i }));
  expect(close).toHaveBeenCalledOnce();
});
