import { render, screen, fireEvent } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { describe, expect, it, vi } from 'vitest';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings/config-settings';

import { LeaveRequestActions } from './leave-request-actions';

describe('Leave request row actions', () => {
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

    fireEvent.click(screen.getByRole('button', { name: 'Approve leave request for Riya Katariya' }));
    fireEvent.click(screen.getByRole('button', { name: 'Reject leave request for Riya Katariya' }));
    expect(onApprove).toHaveBeenCalledOnce();
    expect(onReject).toHaveBeenCalledOnce();
    expect(screen.queryByRole('button', { name: /View leave request/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Edit leave request/ })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'More actions for Riya Katariya' }));
    fireEvent.click(await screen.findByRole('menuitem', {
      name: 'Edit leave request for Riya Katariya',
    }));
    expect(onEdit).toHaveBeenCalledOnce();
  });
});
