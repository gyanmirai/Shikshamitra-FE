import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, within, waitFor } from '@testing-library/react';
import { DEFAULT_REVIEW_POLICY } from 'src/redux/student/admissions/admission-review-policy';

import { reviewerId, setupReviewEditor, chooseReviewOption } from './review-editor-test-fixture';

describe('review stage configuration', { timeout: 30000 }, () => {
  it('saves a scoped reviewer, earlier evidence and approval/due-date options without dropping sibling settings', async () => {
    const user = userEvent.setup();
    const { onSave } = await setupReviewEditor(JSON.stringify({ layout: 'compact' }));
    await user.click(
      screen.getByRole('radio', { name: 'Collect a staff review and recommendation' })
    );
    await chooseReviewOption(user, 'Reviewer role (optional)', 'Admissions lead');
    await chooseReviewOption(user, 'Default assigned reviewer (optional)', 'Asha Shah (asha)');
    await user.click(screen.getByRole('checkbox', { name: 'Entrance assessment' }));
    await user.click(
      screen.getByRole('switch', {
        name: 'Require a different person to make the admission decision',
      })
    );
    await chooseReviewOption(user, 'Final approver role (optional)', 'Admissions lead');
    await user.click(screen.getByRole('button', { name: 'Review timing' }));
    await user.click(screen.getByRole('switch', { name: 'Set a review due date' }));
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson)).toMatchObject({
      layout: 'compact',
      review: {
        enabled: true,
        reviewerRole: 'Admissions lead',
        assignedReviewerId: reviewerId,
        approverRole: 'Admissions lead',
        requireIndependentApprover: true,
        dueInDays: 3,
        prerequisites: [{ kind: 'assessment', sourceStageCode: 'EXAM' }],
      },
    });
  });

  it('validates checklist names and saves an optional item without submitting the surrounding stage', async () => {
    const user = userEvent.setup();
    const { onSave } = await setupReviewEditor(JSON.stringify({ review: DEFAULT_REVIEW_POLICY }));
    await user.click(screen.getByRole('button', { name: 'Add review checklist item' }));
    const dialog = screen.getByRole('dialog', { name: 'Configure review checklist item' });
    await user.click(within(dialog).getByRole('button', { name: 'Save checklist item' }));
    expect(await within(dialog).findByText('Enter a checklist item name')).toBeVisible();
    await user.click(within(dialog).getByRole('textbox', { name: 'Checklist item name *' }));
    await user.paste('Family meeting notes considered');
    await user.click(
      within(dialog).getByRole('switch', { name: 'Required before submitting a recommendation' })
    );
    await user.click(within(dialog).getByRole('button', { name: 'Save checklist item' }));
    await waitFor(() =>
      expect(
        screen.queryByRole('dialog', { name: 'Configure review checklist item' })
      ).not.toBeInTheDocument()
    );
    expect(onSave).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).review.checklist).toEqual([
      { code: 'CHECK_1', name: 'Family meeting notes considered', required: false },
    ]);
  });

  it('clears the named reviewer when its configured role changes', async () => {
    const user = userEvent.setup();
    const { onSave } = await setupReviewEditor(
      JSON.stringify({ review: { ...DEFAULT_REVIEW_POLICY, assignedReviewerId: reviewerId } })
    );
    await chooseReviewOption(user, 'Reviewer role (optional)', 'Admissions lead');
    await user.click(screen.getByRole('button', { name: 'Apply changes' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(
      JSON.parse(onSave.mock.calls[0][0].configurationJson).review.assignedReviewerId
    ).toBeNull();
  });
});
