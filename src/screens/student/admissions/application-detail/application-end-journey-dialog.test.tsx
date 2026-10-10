import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { ApplicationEndJourneyDialog } from './application-end-journey-dialog';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/customDialog', () => ({
  default: ({ title, children, disableClose, handleClose }: any) => (
    <div role="dialog" aria-label={title}>
      <button type="button" aria-label="Close dialog" disabled={disableClose} onClick={handleClose}>
        Close
      </button>
      {children}
    </div>
  ),
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));

describe('ApplicationEndJourneyDialog', () => {
  it('requires a nonblank reason and enforces the server length limit', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn(async () => true);
    render(
      <ApplicationEndJourneyDialog
        open
        applicantName="Rohan"
        loading={false}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />
    );
    await user.click(screen.getByRole('button', { name: 'End Journey' }));
    expect(await screen.findByText('A reason is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
    await user.type(screen.getByRole('textbox', { name: 'Reason' }), 'x'.repeat(513));
    await user.click(screen.getByRole('button', { name: 'End Journey' }));
    expect(await screen.findByText('Use 512 characters or fewer')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  }, 15000);

  it('retains the reason on failure and closes only after successful retry', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    const onSubmit = vi.fn().mockResolvedValueOnce(false).mockResolvedValueOnce(true);
    render(
      <ApplicationEndJourneyDialog
        open
        applicantName="Rohan"
        loading={false}
        onClose={onClose}
        onSubmit={onSubmit}
      />
    );
    await user.type(
      screen.getByRole('textbox', { name: 'Reason' }),
      '  Parent chose another school  '
    );
    await user.click(screen.getByRole('button', { name: 'End Journey' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('The journey could not be ended');
    expect(screen.getByRole('textbox', { name: 'Reason' })).toHaveValue(
      '  Parent chose another school  '
    );
    expect(onSubmit).toHaveBeenCalledWith('Parent chose another school');
    expect(onClose).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'End Journey' }));
    await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  });

  it('locks the reason and every dismissal action while the request is pending', () => {
    render(
      <ApplicationEndJourneyDialog
        open
        applicantName="Rohan"
        loading
        onClose={vi.fn()}
        onSubmit={vi.fn()}
      />
    );
    expect(screen.getByRole('textbox', { name: 'Reason' })).toBeDisabled();
    ['End Journey', 'Cancel', 'Close dialog'].forEach((name) =>
      expect(screen.getByRole('button', { name })).toBeDisabled()
    );
  });
});
