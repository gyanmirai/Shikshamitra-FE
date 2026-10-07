import { it, vi, expect, describe } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GradeEntryWorkflowStatus } from 'src/enums/grade-entry-status';

import { GradeEntryToolbarActions } from './GradeEntryToolbarActions';

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span data-icon={icon} aria-hidden="true" />,
}));

function renderActions(allMarksAssigned: boolean) {
  return render(
    <GradeEntryToolbarActions
      workflowStatus={GradeEntryWorkflowStatus.Draft}
      allMarksAssigned={allMarksAssigned}
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
}

describe('GradeEntryToolbarActions', () => {
  it('keeps Review & Submit disabled until all marks are assigned', () => {
    const { rerender } = renderActions(false);
    expect(screen.getByRole('button', { name: 'Save Draft' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Review & Submit' })).toBeDisabled();

    rerender(
      <GradeEntryToolbarActions
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
});
