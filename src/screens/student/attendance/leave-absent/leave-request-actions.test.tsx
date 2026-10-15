import { it, vi, expect, describe } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { render, screen, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import { LeaveRequestActions } from './leave-request-actions';

describe('Leave request row actions', () => {
  it('disables editing without a medium while retaining both decisions', async () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();
    const onEdit = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LeaveRequestActions
          studentName="Riya Katariya"
          onApprove={onApprove}
          onReject={onReject}
          onEdit={onEdit}
          editDisabled
        />
      </ThemeProvider>
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Approve leave request for Riya Katariya' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reject leave request for Riya Katariya' }));
    expect(onApprove).toHaveBeenCalledOnce();
    expect(onReject).toHaveBeenCalledOnce();
    fireEvent.click(screen.getByRole('button', { name: 'More actions for Riya Katariya' }));
    const edit = await screen.findByRole('menuitem', {
      name: 'Edit leave request for Riya Katariya',
    });
    expect(edit).toHaveAttribute('aria-disabled', 'true');
    expect(edit).toHaveAttribute('title', 'Select a medium to edit a leave request.');
    fireEvent.click(edit);
    expect(onEdit).not.toHaveBeenCalled();
  });
  it('shows only the two decisions directly and keeps Edit in the overflow menu', async () => {
    const onApprove = vi.fn();
    const onReject = vi.fn();
    const onEdit = vi.fn();
    render(
      <ThemeProvider theme={createTheme(defaultSettings)}>
        <LeaveRequestActions
          studentName="Riya Katariya"
          onApprove={onApprove}
          onReject={onReject}
          onEdit={onEdit}
        />
      </ThemeProvider>
    );

    fireEvent.click(
      screen.getByRole('button', { name: 'Approve leave request for Riya Katariya' })
    );
    fireEvent.click(screen.getByRole('button', { name: 'Reject leave request for Riya Katariya' }));
    expect(onApprove).toHaveBeenCalledOnce();
    expect(onReject).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: /View leave request/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit leave request/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'More actions for Riya Katariya' }));
    fireEvent.click(
      await screen.findByRole('menuitem', {
        name: 'Edit leave request for Riya Katariya',
      })
    );
    expect(onEdit).toHaveBeenCalledOnce();
  });
});
