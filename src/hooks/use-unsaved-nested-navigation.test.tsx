import { vi, it, expect, afterEach } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';

import { useUnsavedNavigation } from './use-unsaved-navigation';
import { guardAcademicContextChange } from './academic-context-change';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('react-redux', () => ({
  useSelector: () => ({ isChanges: false }),
  useDispatch: () => vi.fn(),
}));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

function Draft({
  dirty = true,
  busy = false,
  push,
}: {
  dirty?: boolean;
  busy?: boolean;
  push?: (href: string) => void;
}) {
  const { confirmation } = useUnsavedNavigation(dirty, {
    guardContextChanges: true,
    blockNavigation: busy,
    push,
  });
  return <>{confirmation}</>;
}

function Owners({
  busy = false,
  firstDirty = true,
  secondDirty = false,
  push,
}: {
  busy?: boolean;
  firstDirty?: boolean;
  secondDirty?: boolean;
  push?: (href: string) => void;
}) {
  return (
    <>
      <Draft dirty={firstDirty} push={push} />
      <Draft dirty={secondDirty} busy={busy} />
      <a href="/student/records">Records</a>
    </>
  );
}

function history() {
  const navigation = new EventTarget() as EventTarget & { traverseTo: ReturnType<typeof vi.fn> };
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
  navigation.traverseTo = vi.fn(() => {
    const replay = traverse();
    return {
      finished: replay.defaultPrevented
        ? Promise.reject(new Error('Intercepted'))
        : Promise.resolve(),
    };
  });
  vi.stubGlobal('navigation', navigation);
  return { navigation, traverse };
}

it('replays nested browser Back after one discard without a second owner confirming again', () => {
  const { navigation, traverse } = history();
  render(<Owners secondDirty />);
  expect(traverse().defaultPrevented).toBe(true);
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(navigation.traverseTo).toHaveBeenCalledOnce();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});

it('blocks browser Back before showing a parent discard prompt when a sibling is writing', () => {
  const { navigation, traverse } = history();
  render(<Owners busy />);
  expect(traverse().defaultPrevented).toBe(true);
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(navigation.traverseTo).not.toHaveBeenCalled();
});

it('blocks an application link when any opted-in sibling is writing', () => {
  const push = vi.fn();
  render(<Owners busy push={push} />);
  fireEvent.click(screen.getByRole('link', { name: 'Records' }));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  expect(push).not.toHaveBeenCalled();
});

it('lets a clean router owner protect the draft in a sibling without a router', () => {
  const push = vi.fn();
  render(<Owners firstDirty={false} secondDirty push={push} />);
  const link = screen.getByRole('link', { name: 'Records' });
  link.addEventListener('click', (event) => event.preventDefault(), { once: true });
  fireEvent.click(link);
  expect(screen.getByRole('dialog')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(push).toHaveBeenCalledExactlyOnceWith('/student/records');
});

it('rechecks a late busy sibling before applying a previously confirmed year change', () => {
  const proceed = vi.fn();
  const view = render(<Owners />);
  act(() => {
    guardAcademicContextChange(proceed);
  });
  view.rerender(<Owners busy />);
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(proceed).not.toHaveBeenCalled();
});

it('rechecks a late busy sibling before replaying a previously confirmed browser Back', () => {
  const { navigation, traverse } = history();
  const view = render(<Owners />);
  traverse();
  view.rerender(<Owners busy />);
  fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(navigation.traverseTo).not.toHaveBeenCalled();
});
