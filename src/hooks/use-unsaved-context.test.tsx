import { vi, it, expect, afterEach } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';

import { useUnsavedNavigation } from './use-unsaved-navigation';
import { guardAcademicContextChange } from './academic-context-change';
import { renderUnsavedConfirmation } from '../components/confirm-dialog/render-unsaved-confirmation';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('react-redux', () => ({
  useSelector: () => ({ isChanges: false }),
  useDispatch: () => vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Draft({ dirty = true, busy = false, optedIn = true }) {
  const { confirmation } = useUnsavedNavigation(dirty, {
    guardContextChanges: optedIn,
    blockNavigation: busy,
    renderConfirmation: renderUnsavedConfirmation,
  });
  return (
    <>
      <input aria-label="Draft value" defaultValue="Retained draft" />
      {confirmation}
    </>
  );
}

function changeYear(proceed: () => void) {
  let intercepted = false;
  act(() => {
    intercepted = guardAcademicContextChange(proceed);
  });
  return { defaultPrevented: intercepted };
}

it('keeps the draft and blocks the year change until the owner confirms discard', () => {
  const proceed = vi.fn();
  render(<Draft />);
  expect(changeYear(proceed).defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(proceed).not.toHaveBeenCalled();
  expect(screen.getByLabelText('Draft value')).toHaveValue('Retained draft');
  expect(changeYear(proceed).defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(proceed).toHaveBeenCalledOnce();
});

it('blocks context changes during a write even after dirty state resets', () => {
  const proceed = vi.fn();
  render(<Draft dirty={false} busy />);
  expect(changeYear(proceed).defaultPrevented).toBe(true);
  expect(proceed).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('leaves clean and non-opted-in workflows to the context selector', () => {
  const proceed = vi.fn();
  const { rerender } = render(<Draft dirty={false} />);
  expect(changeYear(proceed).defaultPrevented).toBe(false);
  rerender(<Draft optedIn={false} />);
  expect(changeYear(proceed).defaultPrevented).toBe(false);
  expect(proceed).not.toHaveBeenCalled();
});

it('uses one confirmation owner when a parent and nested draft both listen', () => {
  const proceed = vi.fn();
  render(
    <>
      <Draft />
      <Draft />
    </>
  );
  expect(changeYear(proceed).defaultPrevented).toBe(true);
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(proceed).toHaveBeenCalledOnce();
});

it('prioritizes any active write over an earlier dirty draft owner', () => {
  const proceed = vi.fn();
  render(
    <>
      <Draft />
      <Draft dirty={false} busy />
    </>
  );
  expect(changeYear(proceed).defaultPrevented).toBe(true);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(proceed).not.toHaveBeenCalled();
});

it('does not discard through an already-open confirmation after a write starts', () => {
  const proceed = vi.fn();
  const { rerender } = render(<Draft />);
  changeYear(proceed);
  rerender(<Draft busy />);
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(proceed).not.toHaveBeenCalled();
});

it.each([true, false])('keeps browser traversal without a router opt-in=%s', (optedIn) => {
  const navigation = new EventTarget() as EventTarget & { traverseTo: ReturnType<typeof vi.fn> };
  navigation.traverseTo = vi.fn().mockReturnValue({ finished: Promise.resolve() });
  vi.stubGlobal('navigation', navigation);
  render(<Draft optedIn={optedIn} />);
  const traverse = () => {
    const event = new Event('navigate', { cancelable: true });
    Object.assign(event, {
      navigationType: 'traverse',
      destination: { key: 'previous', url: `${window.location.origin}/previous` },
    });
    act(() => {
      navigation.dispatchEvent(event);
    });
    return event;
  };
  expect(traverse().defaultPrevented).toBe(optedIn);
  if (!optedIn) {
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    return;
  }
  fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
  expect(navigation.traverseTo).not.toHaveBeenCalled();
  expect(traverse().defaultPrevented).toBe(true);
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(navigation.traverseTo).toHaveBeenCalledExactlyOnceWith('previous');
});

it('uses a single confirmation when nested dialog owners guard browser Back', () => {
  const navigation = new EventTarget();
  vi.stubGlobal('navigation', navigation);
  render(
    <>
      <Draft />
      <Draft />
    </>
  );
  const event = new Event('navigate', { cancelable: true });
  Object.assign(event, {
    navigationType: 'traverse',
    destination: { key: 'previous', url: `${window.location.origin}/previous` },
  });
  act(() => {
    navigation.dispatchEvent(event);
  });
  expect(event.defaultPrevented).toBe(true);
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
});
