import { it, vi, expect } from 'vitest';
import { useState } from 'react';
import userEvent from '@testing-library/user-event';
import { Button } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';

import StudentAssignmentDrawer from './student-assignment-drawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));

it('provides a named task drawer, body and stationary action footer', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentAssignmentDrawer
        title="Assign Division"
        busy={false}
        onClose={onClose}
        actions={<Button>Assign</Button>}
      >
        <div>Target division</div>
      </StudentAssignmentDrawer>
    </ThemeProvider>
  );
  expect(screen.getByRole('dialog', { name: 'Assign Division' })).toHaveAttribute(
    'aria-modal',
    'true'
  );
  expect(screen.getByText('Target division')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Assign' }).closest('footer')).not.toBeNull();
  await user.click(screen.getByRole('button', { name: 'Close Assign Division' }));
  expect(onClose).toHaveBeenCalledOnce();
});

it('does not dismiss through Close or Escape during an assignment', async () => {
  const user = userEvent.setup();
  const onClose = vi.fn();
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <StudentAssignmentDrawer
        title="Assign Division"
        busy
        onClose={onClose}
        actions={<Button disabled>Assign</Button>}
      >
        <div>Saving</div>
      </StudentAssignmentDrawer>
    </ThemeProvider>
  );
  expect(screen.getByRole('dialog')).toHaveAttribute('aria-busy', 'true');
  const close = screen.getByRole('button', { name: 'Close Assign Division' });
  expect(close).toBeDisabled();
  fireEvent.click(close);
  await user.keyboard('{Escape}');
  expect(onClose).not.toHaveBeenCalled();
});

it('returns focus after the parent unlocks the opening control', async () => {
  const user = userEvent.setup();
  function Workspace() {
    const [open, setOpen] = useState(false);
    return (
      <>
        <Button disabled={open} onClick={() => setOpen(true)}>
          Open assignment
        </Button>
        {open && (
          <StudentAssignmentDrawer
            title="Assign Division"
            busy={false}
            onClose={() => setOpen(false)}
            actions={<Button>Assign</Button>}
          >
            <div>Target division</div>
          </StudentAssignmentDrawer>
        )}
      </>
    );
  }
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <Workspace />
    </ThemeProvider>
  );
  await user.click(screen.getByRole('button', { name: 'Open assignment' }));
  await user.keyboard('{Escape}');
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Open assignment' })).toHaveFocus()
  );
});
