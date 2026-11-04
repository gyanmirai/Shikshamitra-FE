import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { AssignmentDrawerShell } from './AssignmentDrawerShell';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

describe('assignment review dismissal', () => {
  it('blocks header close and Escape while publishing', () => {
    const onClose = vi.fn();
    render(
      <AssignmentDrawerShell
        open
        title="Review & Confirm"
        help="Review assignments."
        busy
        onClose={onClose}
        actions={null}
      >
        <button type="button">Edit</button>
      </AssignmentDrawerShell>
    );
    expect(screen.getByRole('button', { name: 'Close Review & Confirm' })).toBeDisabled();
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('status', { name: 'Publishing assignments…' })).toBeInTheDocument();
  });

  it('allows Escape once the publishing operation has finished', () => {
    const onClose = vi.fn();
    render(
      <AssignmentDrawerShell
        open
        title="Review & Confirm"
        help="Review assignments."
        onClose={onClose}
        actions={null}
      >
        Changes
      </AssignmentDrawerShell>
    );
    fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
    expect(onClose).toHaveBeenCalledOnce();
  });
});
