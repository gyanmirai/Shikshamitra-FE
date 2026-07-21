import type { ReactNode } from 'react';

import { it, vi, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@testing-library/react';

import {
  ApplicantWorkspaceDirtyProvider,
  useApplicantWorkspaceDirtyState,
  useApplicantWorkspaceTransition,
} from './applicant-workspace-dirty-context';

vi.mock('src/components/confirm-dialog', () => ({
  ConfirmDialog: ({
    open,
    title,
    content,
    action,
    onClose,
  }: {
    open: boolean;
    title: string;
    content: string;
    action: ReactNode;
    onClose: () => void;
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        <h2>{title}</h2>
        <p>{content}</p>
        {action}
        <button type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    ) : null,
}));

function DirtyHarness({ dirty, onTransition }: { dirty: boolean; onTransition: () => void }) {
  const { requestTransition } = useApplicantWorkspaceTransition();
  useApplicantWorkspaceDirtyState('test-form', dirty);

  return (
    <button type="button" onClick={() => requestTransition(onTransition)}>
      Change section
    </button>
  );
}

describe('ApplicantWorkspaceDirtyProvider', () => {
  it('allows navigation immediately when there are no unsaved changes', async () => {
    const user = userEvent.setup();
    const onTransition = vi.fn();
    render(
      <ApplicantWorkspaceDirtyProvider>
        <DirtyHarness dirty={false} onTransition={onTransition} />
      </ApplicantWorkspaceDirtyProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Change section' }));

    expect(onTransition).toHaveBeenCalledOnce();
    expect(screen.queryByText('Discard unsaved changes?')).not.toBeInTheDocument();
  });

  it('requires confirmation before leaving an edited form', async () => {
    const user = userEvent.setup();
    const onTransition = vi.fn();
    render(
      <ApplicantWorkspaceDirtyProvider>
        <DirtyHarness dirty onTransition={onTransition} />
      </ApplicantWorkspaceDirtyProvider>
    );

    await user.click(screen.getByRole('button', { name: 'Change section' }));

    expect(onTransition).not.toHaveBeenCalled();
    expect(await screen.findByText('Discard unsaved changes?')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Discard changes' }));

    expect(onTransition).toHaveBeenCalledOnce();
  });
});
