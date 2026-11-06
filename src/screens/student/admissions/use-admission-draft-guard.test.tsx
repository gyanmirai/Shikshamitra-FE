import { vi, it, expect, afterEach, beforeEach } from 'vitest';
import { act, screen, cleanup, fireEvent } from '@testing-library/react';
import { guardAcademicContextChange } from 'src/hooks/academic-context-change';

import {
  callbacks,
  renderGuard,
  GuardHarness,
  installHistory,
} from './use-admission-draft-guard.test-fixture';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('react-redux', () => ({
  useSelector: () => ({ isChanges: false }),
  useDispatch: () => vi.fn(),
}));
beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function edit() {
  fireEvent.change(screen.getByRole('textbox', { name: 'Stage name' }), {
    target: { value: 'Draft stage' },
  });
}

function leave(path: string, back: () => unknown) {
  if (path === 'year')
    act(() => {
      guardAcademicContextChange(callbacks.proceed);
    });
  else if (path === 'link') fireEvent.click(screen.getByRole('link', { name: 'Next page' }));
  else back();
}

it.each(['year', 'link', 'back'])(
  'retains the draft when a late busy sibling cancels approved %s navigation',
  (path) => {
    const history = installHistory();
    const view = renderGuard();
    edit();
    leave(path, history.traverse);
    expect(screen.getByRole('dialog')).toBeVisible();
    view.rerender(<GuardHarness siblingBusy />);
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(callbacks.reset).not.toHaveBeenCalled();
    expect(screen.getByRole('textbox', { name: 'Stage name' })).toHaveValue('Draft stage');
    expect(callbacks.proceed).not.toHaveBeenCalled();
    expect(callbacks.push).not.toHaveBeenCalled();
    expect(history.navigation.traverseTo).not.toHaveBeenCalled();
  }
);

it.each(['year', 'link', 'back'])('resets once when %s navigation is actually approved', (path) => {
  const history = installHistory();
  renderGuard();
  edit();
  leave(path, history.traverse);
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(callbacks.reset).toHaveBeenCalledOnce();
  expect(screen.getByRole('textbox', { name: 'Stage name' })).toHaveValue('Saved stage');
  if (path === 'year') expect(callbacks.proceed).toHaveBeenCalledOnce();
  if (path === 'link') expect(callbacks.push).toHaveBeenCalledExactlyOnceWith('/student/next');
  if (path === 'back') expect(history.navigation.traverseTo).toHaveBeenCalledOnce();
});

it('keeps local close locked while busy and resets only when discard can close', () => {
  const view = renderGuard();
  edit();
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  view.rerender(<GuardHarness editorBusy />);
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(callbacks.reset).not.toHaveBeenCalled();
  expect(callbacks.proceed).not.toHaveBeenCalled();
  view.rerender(<GuardHarness />);
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(callbacks.reset).toHaveBeenCalledOnce();
  expect(callbacks.proceed).toHaveBeenCalledOnce();
});

it('retains the draft when the user keeps editing', () => {
  renderGuard();
  edit();
  fireEvent.click(screen.getByRole('button', { name: 'Close' }));
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(callbacks.reset).not.toHaveBeenCalled();
  expect(callbacks.proceed).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox', { name: 'Stage name' })).toHaveValue('Draft stage');
});
