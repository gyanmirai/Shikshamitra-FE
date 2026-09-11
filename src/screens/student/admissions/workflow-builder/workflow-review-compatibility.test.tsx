import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { DEFAULT_REVIEW_POLICY } from 'src/redux/student/admissions/admission-review-policy';

import { setupReviewEditor } from './review-editor-test-fixture';

describe('review configuration compatibility', { timeout: 15000 }, () => {
  it('disallows managed skip and restores the saved legacy skip setting when returning to basic', async () => {
    const user = userEvent.setup();
    const { onSave } = setupReviewEditor(
      JSON.stringify({ review: DEFAULT_REVIEW_POLICY }),
      false,
      true,
      [],
      { allowManualSkip: true }
    );
    const skip = screen.getByRole('switch', { name: 'Allow authorized manual skip' });
    expect(skip).toBeDisabled();
    expect(skip).not.toBeChecked();
    await user.click(screen.getByRole('radio', { name: 'Basic completion (existing process)' }));
    expect(skip).toBeEnabled();
    expect(skip).toBeChecked();
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0].allowManualSkip).toBe(true);
    expect(JSON.parse(onSave.mock.calls[0][0].configurationJson).review.enabled).toBe(false);
  });

  it('keeps an unsupported environment basic without adding a policy on save', async () => {
    const user = userEvent.setup();
    const { onSave } = setupReviewEditor(undefined, false, false);
    expect(
      screen.getByRole('radio', { name: 'Basic completion (existing process)' })
    ).toBeChecked();
    expect(
      screen.getByRole('radio', { name: 'Collect a staff review and recommendation' })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0].configurationJson).toBeUndefined();
  });

  it('preserves future settings and blocks silently replacing them', async () => {
    const user = userEvent.setup();
    const { onSave } = setupReviewEditor(
      JSON.stringify({ review: { ...DEFAULT_REVIEW_POLICY, version: 2 } })
    );
    expect(screen.getByRole('alert')).toHaveTextContent('preserved');
    expect(
      screen.getByRole('radio', { name: 'Collect a staff review and recommendation' })
    ).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    expect(onSave).not.toHaveBeenCalled();
  });

  it('shows published settings without exposing editing actions', async () => {
    setupReviewEditor(
      JSON.stringify({
        review: {
          ...DEFAULT_REVIEW_POLICY,
          checklist: [{ code: 'CHECK', name: 'Identity confirmed', required: true }],
        },
      }),
      true
    );
    expect(screen.getByText('Identity confirmed')).toBeVisible();
    expect(screen.getByRole('switch', { name: 'Set a review due date' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'Allow authorized manual skip' })).toBeDisabled();
    expect(
      screen.getByText('Managed Review requires a recorded decision and cannot be skipped.')
    ).toBeVisible();
    expect(
      screen.queryByRole('button', { name: 'Add review checklist item' })
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save stage' })).not.toBeInTheDocument();
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Reviewer role (optional)' })).toHaveAttribute(
        'aria-disabled',
        'true'
      )
    );
  });

  it('does not offer later or basic source stages and blocks an unavailable saved prerequisite', async () => {
    const user = userEvent.setup();
    const { onSave } = setupReviewEditor(
      JSON.stringify({
        review: {
          ...DEFAULT_REVIEW_POLICY,
          prerequisites: [{ kind: 'assessment', sourceStageCode: 'REMOVED_EXAM' }],
        },
      }),
      false,
      true,
      []
    );
    expect(screen.getByText(/is no longer an earlier configured/)).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    expect(onSave).not.toHaveBeenCalled();
    await user.click(screen.getByRole('button', { name: 'Remove' }));
    await user.click(screen.getByRole('button', { name: 'Save stage' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
  });
});
