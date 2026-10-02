import { Button } from '@mui/material';
import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AdmissionIntakeNotice } from './admission-intake-notice';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('Admission intake notices', () => {
  it('remembers a dismissed guidance message when the page is reopened', () => {
    const dismissalKey = 'test:intake-guidance:reopen';
    const props = { severity: 'info' as const, dismissalKey };
    const first = render(<AdmissionIntakeNotice {...props}>How it works</AdmissionIntakeNotice>);

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss information message' }));
    first.unmount();
    render(<AdmissionIntakeNotice {...props}>How it works</AdmissionIntakeNotice>);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    window.localStorage.removeItem(dismissalKey);
  });

  it('keeps guidance dismissal separate for different users', () => {
    const firstUser = 'test:intake-guidance:first-user';
    const secondUser = 'test:intake-guidance:second-user';
    const { rerender } = render(
      <AdmissionIntakeNotice severity="info" dismissalKey={firstUser}>
        How it works
      </AdmissionIntakeNotice>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss information message' }));

    rerender(
      <AdmissionIntakeNotice severity="info" dismissalKey={secondUser}>
        How it works
      </AdmissionIntakeNotice>
    );
    expect(screen.getByRole('alert')).toBeInTheDocument();
    rerender(
      <AdmissionIntakeNotice severity="info" dismissalKey={firstUser}>
        How it works
      </AdmissionIntakeNotice>
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    window.localStorage.removeItem(firstUser);
    window.localStorage.removeItem(secondUser);
  });

  it('shows transient warnings again in a new screen session', () => {
    const first = render(
      <AdmissionIntakeNotice severity="warning">New conflict</AdmissionIntakeNotice>
    );
    fireEvent.click(screen.getByRole('button', { name: 'Dismiss warning message' }));
    first.unmount();
    render(<AdmissionIntakeNotice severity="warning">New conflict</AdmissionIntakeNotice>);

    expect(screen.getByRole('alert')).toHaveTextContent('New conflict');
  });

  it('dismisses informational copy without changing the surrounding form', () => {
    render(
      <>
        <AdmissionIntakeNotice severity="info">Journey ownership guidance</AdmissionIntakeNotice>
        <input aria-label="Setup name" defaultValue="General intake" />
      </>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss information message' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Setup name' })).toHaveValue('General intake');
  });

  it('keeps conflict recovery available after the warning is dismissed', () => {
    const reload = vi.fn();
    render(
      <AdmissionIntakeNotice
        severity="warning"
        action={<Button onClick={reload}>Reload latest</Button>}
      >
        This setup changed in another session.
      </AdmissionIntakeNotice>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Dismiss warning message' }));

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reload latest' }));
    expect(reload).toHaveBeenCalledOnce();
  });
});
