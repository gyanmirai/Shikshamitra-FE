import { vi, it, expect, describe, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { useUnsavedNavigation } from './use-unsaved-navigation';

// Navigation assertions do not depend on downloading icon assets.
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

vi.mock('react-redux', () => ({
  useSelector: () => ({ isChanges: false }),
  useDispatch: () => vi.fn(),
}));

function Fixture({
  push,
  dirty = true,
  blocked = false,
}: {
  push: (href: string) => void;
  dirty?: boolean;
  blocked?: boolean;
}) {
  const { confirmation } = useUnsavedNavigation(dirty, { push, blockNavigation: blocked });
  return (
    <>
      <a href="/hr/payroll/structure">Payroll structure</a>
      <a href="/new-window" target="_blank">
        New window
      </a>
      {confirmation}
    </>
  );
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('shared unsaved navigation', () => {
  it('guards same-origin application links and navigates only after confirmation', () => {
    const push = vi.fn();
    render(<Fixture push={push} />);

    fireEvent.click(screen.getByText('Payroll structure'));
    expect(screen.getByRole('dialog', { name: 'Discard unsaved changes?' })).toBeVisible();
    expect(push).not.toHaveBeenCalled();

    const keepEditingButton = screen.getByRole('button', { name: 'Keep editing' });
    const discardButton = screen.getByRole('button', { name: 'Discard changes' });

    expect(keepEditingButton).toHaveClass('MuiButton-sizeSmall');
    expect(discardButton).toHaveClass('MuiButton-sizeSmall');

    fireEvent.click(discardButton);
    expect(push).toHaveBeenCalledExactlyOnceWith('/hr/payroll/structure');
  });

  it('does not intercept clean navigation, modified clicks, or new-window links', () => {
    const push = vi.fn();
    const { rerender } = render(<Fixture push={push} />);

    const payrollLink = screen.getByText('Payroll structure');
    const newWindowLink = screen.getByText('New window');
    payrollLink.addEventListener('click', (event) => event.preventDefault(), { once: true });
    newWindowLink.addEventListener('click', (event) => event.preventDefault(), { once: true });
    fireEvent.click(payrollLink, { ctrlKey: true });
    fireEvent.click(newWindowLink);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();

    rerender(<Fixture push={push} dirty={false} />);
    const cleanLink = screen.getByText('Payroll structure');
    cleanLink.addEventListener('click', (event) => event.preventDefault(), { once: true });
    fireEvent.click(cleanLink);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});

it('blocks navigation during a save even after the dirty baseline has reset', () => {
  const push = vi.fn();
  render(<Fixture push={push} dirty={false} blocked />);
  const link = screen.getByText('Payroll structure');
  const event = new MouseEvent('click', { bubbles: true, cancelable: true });
  link.dispatchEvent(event);
  expect(event.defaultPrevented).toBe(true);
  expect(push).not.toHaveBeenCalled();
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
