import { it, vi, expect, describe } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GradeEntryWorkflowStatus } from 'src/enums/grade-entry-status';

import { GradeEntryToolbarActions } from './GradeEntryToolbarActions';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} aria-hidden="true" />,
}));

function renderActions(
  allMarksAssigned: boolean,
  canManageMarks = true,
  workflowStatus = GradeEntryWorkflowStatus.Draft,
  onSaveDraft = vi.fn()
) {
  return render(
    <GradeEntryToolbarActions
      canManageMarks={canManageMarks}
      workflowStatus={workflowStatus}
      allMarksAssigned={allMarksAssigned}
      isSaveDraftLoading={false}
      isBulkSaveLoading={false}
      isReviewLoading={false}
      isRequestChangesLoading={false}
      isVerifyLoading={false}
      isPublishLoading={false}
      isUnlockLoading={false}
      onSaveDraft={onSaveDraft}
      onReview={vi.fn()}
      onRequestChanges={vi.fn()}
      onVerify={vi.fn()}
      onPublish={vi.fn()}
      onUnlock={vi.fn()}
    />
  );
}

describe('GradeEntryToolbarActions', () => {
  it('keeps Review & Submit disabled until all marks are assigned', () => {
    const { rerender } = renderActions(false);
    expect(screen.getByRole('button', { name: 'Save Draft' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Review & Submit' })).toBeDisabled();

    rerender(
      <GradeEntryToolbarActions
        canManageMarks
        workflowStatus={GradeEntryWorkflowStatus.Draft}
        allMarksAssigned
        isSaveDraftLoading={false}
        isBulkSaveLoading={false}
        isReviewLoading={false}
        isRequestChangesLoading={false}
        isVerifyLoading={false}
        isPublishLoading={false}
        isUnlockLoading={false}
        onSaveDraft={vi.fn()}
        onReview={vi.fn()}
        onRequestChanges={vi.fn()}
        onVerify={vi.fn()}
        onPublish={vi.fn()}
        onUnlock={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: 'Review & Submit' })).toBeEnabled();
  });

  it.each([
    GradeEntryWorkflowStatus.Draft,
    GradeEntryWorkflowStatus.ChangesRequested,
    GradeEntryWorkflowStatus.Submitted,
    GradeEntryWorkflowStatus.Verified,
    GradeEntryWorkflowStatus.Published,
  ])('hides all write actions in workflow %s without the manage grant', (workflowStatus) => {
    renderActions(true, false, workflowStatus);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('allows an authorized editor to save a draft', () => {
    const onSaveDraft = vi.fn();
    renderActions(true, true, GradeEntryWorkflowStatus.Draft, onSaveDraft);
    fireEvent.click(screen.getByRole('button', { name: 'Save Draft' }));
    expect(onSaveDraft).toHaveBeenCalledOnce();
  });
});
