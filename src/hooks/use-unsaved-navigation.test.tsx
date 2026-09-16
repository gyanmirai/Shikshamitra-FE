import { vi, it, expect, describe, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';

import { useUnsavedNavigation } from './use-unsaved-navigation';

vi.mock('react-redux', () => ({
  useSelector: () => ({ isChanges: false }),
  useDispatch: () => vi.fn(),
}));

function Fixture({ push, dirty = true }: { push: (href: string) => void; dirty?: boolean }) {
  const { confirmation } = useUnsavedNavigation(dirty, { push });
  return (
    <>
      <a href="/hr/payroll/structure">Payroll structure</a>
      <a href="/new-window" target="_blank">New window</a>
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

    fireEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
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
