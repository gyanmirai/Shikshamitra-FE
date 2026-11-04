import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, waitFor, fireEvent } from '@testing-library/react';

import { WorkflowGovernanceActionDialog } from './components/workflow-governance-action-dialog';

// Governance validation does not depend on remote decorative icon downloads.
vi.mock('src/components/iconify', () => ({ Iconify: () => <span aria-hidden /> }));

describe('WorkflowGovernanceActionDialog', () => {
  it('requires an approver and reason before submitting a workflow', async () => {
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    renderWithProviders(
      <WorkflowGovernanceActionDialog
        mode="submit"
        workflowName="Primary admission"
        approvers={[{ id: 'checker-1', userName: 'checker', name: 'School checker' }]}
        busy={false}
        onClose={vi.fn()}
        onConfirm={onConfirm}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: 'Submit for Approval' }));
    expect(await screen.findByText('Select an approver.')).toBeInTheDocument();
    expect(screen.getByText('Enter a reason before continuing.')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Change Reason/), {
      target: { value: 'New admission route for the next intake.' },
    });
    fireEvent.mouseDown(screen.getByLabelText(/Approver/));
    fireEvent.click(await screen.findByRole('option', { name: 'School checker' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit for Approval' }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        reason: 'New admission route for the next intake.',
        approverUserId: 'checker-1',
        effectiveAt: undefined,
      })
    );
  });
});
