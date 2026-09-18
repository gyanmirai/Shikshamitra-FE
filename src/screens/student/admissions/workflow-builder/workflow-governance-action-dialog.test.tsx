import { vi, it, expect, describe } from 'vitest';
import { renderWithProviders } from 'src/test/test-utils';
import { fireEvent, screen, waitFor } from '@testing-library/react';

import { WorkflowGovernanceActionDialog } from './components/workflow-governance-action-dialog';

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

    fireEvent.click(screen.getByRole('button', { name: 'Submit for approval' }));
    expect(await screen.findByText('Select an approver.')).toBeInTheDocument();
    expect(screen.getByText('Enter a reason before continuing.')).toBeInTheDocument();
    expect(onConfirm).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText(/Change reason/), {
      target: { value: 'New admission route for the next intake.' },
    });
    fireEvent.mouseDown(screen.getByLabelText(/Approver/));
    fireEvent.click(await screen.findByRole('option', { name: 'School checker' }));
    fireEvent.click(screen.getByRole('button', { name: 'Submit for approval' }));

    await waitFor(() =>
      expect(onConfirm).toHaveBeenCalledWith({
        reason: 'New admission route for the next intake.',
        approverUserId: 'checker-1',
        effectiveAt: undefined,
      })
    );
  });
});
