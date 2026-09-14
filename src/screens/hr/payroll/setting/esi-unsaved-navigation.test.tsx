import { useState } from 'react';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';

import { useEsiUnsavedNavigation } from './esi-unsaved-navigation';

vi.mock('react-redux', () => ({
  useSelector: () => ({ isChanges: false }),
  useDispatch: () => vi.fn(),
}));

function Fixture({ push, dirty = true }: { push: (href: string) => void; dirty?: boolean }) {
  const [draft, setDraft] = useState('Unsaved registration');
  const { requestNavigation, confirmation } = useEsiUnsavedNavigation(dirty, push);
  return <>
    <input aria-label="Registration" value={draft} onChange={(event) => setDraft(event.target.value)} />
    <a href="/hr/payroll/structure"><span>Payroll structure</span></a>
    <a href="/hr/payroll/run" target="_blank">New tab</a>
    <a href="#establishment">Establishment section</a>
    <button type="button" onClick={() => requestNavigation(() => push('/next-month'))}>Change month</button>
    {confirmation}
  </>;
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe('ESI unsaved navigation', () => {
  it('guards sidebar navigation and retains edits when cancelled', () => {
    const push = vi.fn();
    render(<Fixture push={push} />);
    fireEvent.click(screen.getByText('Payroll structure'));
    expect(screen.getByRole('dialog', { name: 'Discard unsaved ESI changes?' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Keep editing' })).toHaveFocus();
    fireEvent.click(screen.getByRole('button', { name: 'Keep editing' }));
    expect(push).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Registration')).toHaveValue('Unsaved registration');
  });

  it('continues to the requested sidebar destination only after confirmation', () => {
    const push = vi.fn();
    render(<Fixture push={push} />);
    fireEvent.click(screen.getByText('Payroll structure'));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(push).toHaveBeenCalledExactlyOnceWith('/hr/payroll/structure');
  });

  it('guards programmatic month changes and allows Escape to keep editing', () => {
    const push = vi.fn();
    render(<Fixture push={push} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change month' }));
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape', code: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Change month' }));
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(push).toHaveBeenCalledExactlyOnceWith('/next-month');
  });

  it('allows clean programmatic navigation immediately', () => {
    const push = vi.fn();
    render(<Fixture push={push} dirty={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Change month' }));
    expect(push).toHaveBeenCalledExactlyOnceWith('/next-month');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('does not intercept modified clicks, new tabs, or same-page anchors', () => {
    render(<Fixture push={vi.fn()} />);
    fireEvent.click(screen.getByText('Payroll structure'), { ctrlKey: true });
    fireEvent.click(screen.getByText('New tab'));
    fireEvent.click(screen.getByText('Establishment section'));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it.each(['back-entry', 'forward-entry'])('guards traversal to %s without rewriting history', (key) => {
    const navigation = Object.assign(new EventTarget(), {
      traverseTo: vi.fn(() => ({ finished: Promise.resolve() })),
    });
    vi.stubGlobal('navigation', navigation);
    const pushState = vi.spyOn(window.history, 'pushState');
    render(<Fixture push={vi.fn()} />);
    const event = Object.assign(new Event('navigate', { cancelable: true }), {
      navigationType: 'traverse', destination: { key, url: `${window.location.origin}/previous` },
    });
    act(() => { navigation.dispatchEvent(event); });
    expect(event.defaultPrevented).toBe(true);
    expect(navigation.traverseTo).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
    expect(navigation.traverseTo).toHaveBeenCalledExactlyOnceWith(key);
    const approved = Object.assign(new Event('navigate', { cancelable: true }), {
      navigationType: 'traverse', destination: { key, url: `${window.location.origin}/previous` },
    });
    act(() => { navigation.dispatchEvent(approved); });
    expect(approved.defaultPrevented).toBe(false);
    expect(pushState).not.toHaveBeenCalled();
    pushState.mockRestore();
  });

  it('removes application-wide listeners when unmounted', () => {
    const push = vi.fn();
    const { unmount } = render(<Fixture push={push} />);
    unmount();
    const link = document.createElement('a');
    link.href = '/hr/payroll/structure';
    document.body.append(link);
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    link.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);
    link.remove();
  });
});
