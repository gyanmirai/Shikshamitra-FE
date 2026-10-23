import type { AlertProps } from '@mui/material';

import { Button } from '@mui/material';
import { vi, it, expect, describe, afterEach, beforeEach } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';

import { AdmissionIntakeNotice } from './admission-intake-notice';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
const notices = vi.hoisted(() => ({
  info: vi.fn(
    (_options: { message: React.ReactNode; alertProps: (id: string) => AlertProps }) => 'info-id'
  ),
  warning: vi.fn(
    (_options: { message: React.ReactNode; alertProps: (id: string) => AlertProps }) => 'warning-id'
  ),
  dismiss: vi.fn(),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: notices }));
beforeEach(() => vi.clearAllMocks());
afterEach(async () => {
  cleanup();
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
});

function dismissNotice(severity: 'info' | 'warning') {
  const options = notices[severity].mock.calls.at(-1)![0];
  act(() => options.alertProps(`${severity}-id`).onClose?.({} as React.SyntheticEvent));
}

describe('Admission intake toast notices', () => {
  it('remembers a dismissed guidance message when the page is reopened', () => {
    const dismissalKey = 'test:intake-guidance:reopen';
    const props = { severity: 'info' as const, dismissalKey };
    const first = render(<AdmissionIntakeNotice {...props}>How it works</AdmissionIntakeNotice>);

    dismissNotice('info');
    first.unmount();
    render(<AdmissionIntakeNotice {...props}>How it works</AdmissionIntakeNotice>);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(notices.info).toHaveBeenCalledOnce();
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
    dismissNotice('info');

    rerender(
      <AdmissionIntakeNotice severity="info" dismissalKey={secondUser}>
        How it works
      </AdmissionIntakeNotice>
    );
    expect(notices.info).toHaveBeenCalledTimes(2);
    rerender(
      <AdmissionIntakeNotice severity="info" dismissalKey={firstUser}>
        How it works
      </AdmissionIntakeNotice>
    );
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(notices.info).toHaveBeenCalledTimes(2);
    window.localStorage.removeItem(firstUser);
    window.localStorage.removeItem(secondUser);
  });

  it('shows transient warnings again in a new screen session', async () => {
    const first = render(
      <AdmissionIntakeNotice severity="warning">New conflict</AdmissionIntakeNotice>
    );
    dismissNotice('warning');
    first.unmount();
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    render(<AdmissionIntakeNotice severity="warning">New conflict</AdmissionIntakeNotice>);

    expect(notices.warning).toHaveBeenCalledTimes(2);
    expect(notices.warning).toHaveBeenLastCalledWith(
      expect.objectContaining({ message: 'New conflict' })
    );
  });

  it('dismisses informational copy without changing the surrounding form', () => {
    render(
      <>
        <AdmissionIntakeNotice severity="info">Journey ownership guidance</AdmissionIntakeNotice>
        <input aria-label="Setup name" defaultValue="General intake" />
      </>
    );

    dismissNotice('info');

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

    dismissNotice('warning');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Reload latest' }));
    expect(reload).toHaveBeenCalledOnce();
  });
});
