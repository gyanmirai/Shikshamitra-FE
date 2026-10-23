import type { ReactNode } from 'react';
import type { AlertProps } from '@mui/material';

import { Button } from '@mui/material';
import { createRef, StrictMode } from 'react';
import { it, vi, expect, describe, afterEach } from 'vitest';
import { act, render, screen, cleanup, fireEvent } from '@testing-library/react';

import { StudentFeedback, StudentScopedFeedback, StudentFeedbackProvider } from './index';

const toast = vi.hoisted(() => ({
  info: vi.fn(
    (_options: { message: ReactNode; alertProps: (id: string) => AlertProps }) => 'info-id'
  ),
  warning: vi.fn(
    (_options: { message: ReactNode; alertProps: (id: string) => AlertProps }) => 'warning-id'
  ),
  error: vi.fn(
    (_options: { message: ReactNode; alertProps: (id: string) => AlertProps }) => 'error-id'
  ),
  success: vi.fn(
    (_options: { message: ReactNode; alertProps: (id: string) => AlertProps }) => 'success-id'
  ),
  dismiss: vi.fn(),
}));

vi.mock('src/components/toast', () => ({ shikshaMitraToast: toast }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

afterEach(async () => {
  cleanup();
  await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
  vi.clearAllMocks();
});

describe('Student toast feedback', () => {
  it('preserves the focus target for an actionable registration error', () => {
    const target = createRef<HTMLDivElement>();
    render(
      <StudentFeedback
        notificationKey="focus"
        severity="error"
        presentation="persistent"
        ref={target}
        tabIndex={-1}
      >
        Registration failed.
      </StudentFeedback>
    );
    target.current?.focus();
    expect(target.current).toHaveFocus();
    expect(screen.getByText('Registration failed.')).toBeVisible();
  });
  it('announces once across StrictMode effect replay and equivalent JSX rerenders', () => {
    const view = (disabled: boolean) => (
      <StrictMode>
        <StudentFeedback
          notificationKey="query"
          severity="error"
          action={<Button disabled={disabled}>Retry</Button>}
        >
          <span>Cases could not be loaded.</span>
        </StudentFeedback>
      </StrictMode>
    );
    const { rerender } = render(view(false));
    rerender(view(true));
    rerender(view(false));
    expect(toast.error).toHaveBeenCalledOnce();
    expect(screen.queryByText('Cases could not be loaded.')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry' })).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('deduplicates nested request notices without leaving separate recovery rows', () => {
    render(
      <>
        <StudentFeedback
          notificationKey="parent"
          severity="warning"
          action={<Button>Reload case</Button>}
        >
          Review the latest case.
        </StudentFeedback>
        <StudentFeedback
          notificationKey="child"
          severity="warning"
          action={<Button>Reload step</Button>}
        >
          Review the latest case.
        </StudentFeedback>
      </>
    );
    expect(toast.warning).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: 'Reload case' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Reload step' })).not.toBeInTheDocument();
  });

  it('notifies for changed content or severity rather than React element identity', () => {
    const { rerender } = render(
      <StudentFeedback notificationKey="result" severity="info">
        Pending review
      </StudentFeedback>
    );
    rerender(
      <StudentFeedback notificationKey="result" severity="info">
        <span>Pending review</span>
      </StudentFeedback>
    );
    expect(toast.info).toHaveBeenCalledOnce();
    rerender(
      <StudentFeedback notificationKey="result" severity="warning">
        Pending review
      </StudentFeedback>
    );
    expect(toast.warning).toHaveBeenCalledOnce();
    rerender(
      <StudentFeedback notificationKey="result" severity="warning">
        The record changed
      </StudentFeedback>
    );
    expect(toast.warning).toHaveBeenCalledTimes(2);
  });

  it('allows a new notification after a condition actually clears', async () => {
    const view = (failed: boolean) =>
      failed ? (
        <StudentFeedback notificationKey="retry" severity="error">
          Could not save.
        </StudentFeedback>
      ) : null;
    const { rerender } = render(view(true));
    rerender(view(false));
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    rerender(view(true));
    expect(toast.error).toHaveBeenCalledTimes(2);
  });

  it('keeps independent record/workspace contexts separate', () => {
    const view = (scope: string) => (
      <StudentFeedbackProvider scopeKey={scope}>
        <StudentFeedback notificationKey="scope-error" severity="error">
          Could not load the record.
        </StudentFeedback>
      </StudentFeedbackProvider>
    );
    const { rerender } = render(view('student/a'));
    rerender(view('student/b'));
    expect(toast.error).toHaveBeenCalledTimes(2);
  });

  it('keeps field, empty and confirmation states local without any toast or banner', () => {
    render(
      <StudentFeedback notificationKey="field" severity="error" presentation="inline">
        Enter a valid date range.
      </StudentFeedback>
    );
    expect(screen.getByText('Enter a valid date range.')).toBeInTheDocument();
    expect(toast.error).not.toHaveBeenCalled();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('retains blocking-error context and current recovery after toast dismissal', () => {
    const retry = vi.fn();
    const { rerender } = render(
      <StudentFeedback
        notificationKey="blocked"
        severity="error"
        presentation="persistent"
        action={<Button disabled>Retry</Button>}
      >
        The table could not be loaded.
      </StudentFeedback>
    );
    rerender(
      <StudentFeedback
        notificationKey="blocked"
        severity="error"
        presentation="persistent"
        action={<Button onClick={retry}>Retry</Button>}
      >
        The table could not be loaded.
      </StudentFeedback>
    );
    const options = toast.error.mock.calls[0][0];
    const props = options.alertProps('error-id');
    props.onClose?.({} as React.SyntheticEvent);
    expect(screen.getByText('The table could not be loaded.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(retry).toHaveBeenCalledOnce();
    expect(toast.error).toHaveBeenCalledOnce();
  });

  it('uses current close guards without re-announcing while a request becomes busy', () => {
    const close = vi.fn();
    const view = (busy: boolean) => (
      <StudentFeedback notificationKey="guard" severity="info" closeDisabled={busy} onClose={close}>
        Check the selected scope.
      </StudentFeedback>
    );
    const { rerender } = render(view(false));
    const props = toast.info.mock.calls[0][0].alertProps('info-id');
    rerender(view(true));
    props.onClose?.({} as React.SyntheticEvent);
    expect(close).not.toHaveBeenCalled();
    rerender(view(false));
    props.onClose?.({} as React.SyntheticEvent);
    expect(close).toHaveBeenCalledOnce();
    expect(toast.info).toHaveBeenCalledOnce();
  });

  it('dismisses an old notice when its condition unmounts', async () => {
    const { unmount } = render(
      <StudentFeedback notificationKey="old" severity="info">
        Old record context.
      </StudentFeedback>
    );
    unmount();
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));
    expect(toast.dismiss).toHaveBeenCalledWith('info-id');
  });

  it('does not change the shared table feedback outside the Student provider', () => {
    render(
      <StudentScopedFeedback notificationKey="outside" severity="error">
        Another module error.
      </StudentScopedFeedback>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Another module error.');
    expect(toast.error).not.toHaveBeenCalled();
  });

  it('uses Student toast feedback for shared tables in the Student provider', () => {
    render(
      <StudentFeedbackProvider scopeKey="/student/records/directory">
        <StudentScopedFeedback notificationKey="inside" severity="error" presentation="persistent">
          Student table error.
        </StudentScopedFeedback>
      </StudentFeedbackProvider>
    );
    expect(toast.error).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByText('Student table error.')).not.toBeInTheDocument();
  });
});
