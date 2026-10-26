import { Button } from '@mui/material';
import { vi, it, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { HrNotice, HrLoadingNotice } from './hr-notice';

describe('HR feedback announcements and actions', () => {
  it('announces routine context politely and keeps recovery and dismissal usable', () => {
    const retry = vi.fn();
    const close = vi.fn();
    render(
      <HrNotice onClose={close} action={<Button onClick={retry}>Review impact</Button>}>
        Your changes need a new preview.
      </HrNotice>
    );
    expect(screen.getByRole('status')).toHaveTextContent('Your changes need a new preview.');
    fireEvent.click(screen.getByRole('button', { name: 'Review impact' }));
    expect(retry).toHaveBeenCalledOnce();
    // MUI uses action instead of the generated close button when both are supplied.
    expect(close).not.toHaveBeenCalled();
  });

  it.each(['warning', 'error', 'success'] as const)(
    'retains the semantic %s state and its announcement',
    (severity) => {
      render(<HrNotice severity={severity}>Policy result</HrNotice>);
      expect(screen.getByRole('alert')).toHaveClass(
        `MuiAlert-standard${severity[0].toUpperCase()}${severity.slice(1)}`
      );
    }
  );

  it('keeps blocking prerequisites assertive and supports dismissal', () => {
    const close = vi.fn();
    render(
      <HrNotice role="alert" onClose={close}>
        Payroll editing access is required.
      </HrNotice>
    );
    expect(screen.getByRole('alert')).toHaveTextContent('Payroll editing access is required.');
    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    expect(close).toHaveBeenCalledOnce();
  });

  it('announces loading once without exposing a duplicate progress announcement', () => {
    const { rerender } = render(<HrLoadingNotice>Loading impact preview...</HrLoadingNotice>);
    expect(screen.getAllByRole('status')).toHaveLength(1);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
    rerender(<HrNotice>3 staff may be affected.</HrNotice>);
    expect(screen.getByRole('status')).toHaveTextContent('3 staff may be affected.');
    expect(screen.queryByText('Loading impact preview...')).not.toBeInTheDocument();
  });
});
