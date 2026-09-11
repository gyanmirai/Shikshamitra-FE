import { it, expect, describe } from 'vitest';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { chooseReviewOption } from './review-editor-test-fixture';
import { reviewRouteJson, renderReviewRoute } from './review-route-test-fixture';

describe('review decision routes', { timeout: 15000 }, () => {
  it.each([
    ['Admission approved', 'approve'],
    ['Applicant waitlisted (explicit route)', 'waitlist'],
    ['Application rejected (explicit route)', 'reject'],
  ])('saves %s using the actual decision fact', async (label, value) => {
    const user = userEvent.setup();
    const { onSave } = renderReviewRoute();
    await chooseReviewOption(user, 'Continue after review decision', label);
    await user.click(screen.getByRole('button', { name: 'Save transition' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0].isDefault).toBe(false);
    expect(JSON.parse(onSave.mock.calls[0][0].conditionRuleJson)).toEqual({
      operator: 'Equals',
      field: 'review.decision',
      value,
    });
  });

  it('labels default as approval only and clears an explicitly replaced negative route', async () => {
    const user = userEvent.setup();
    const { onSave } = renderReviewRoute(reviewRouteJson('reject'));
    await chooseReviewOption(
      user,
      'Continue after review decision',
      'Admission approved (default route)'
    );
    await user.click(screen.getByRole('button', { name: 'Save transition' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      isDefault: true,
      conditionRuleJson: undefined,
    });
  });

  it('clears a known decision preset when the source changes to basic review', async () => {
    const user = userEvent.setup();
    const { onSave } = renderReviewRoute(reviewRouteJson('waitlist'));
    await chooseReviewOption(user, 'From stage *', 'Basic review');
    await user.click(screen.getByRole('button', { name: 'Save transition' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      fromStageId: 'basic',
      isDefault: true,
      conditionRuleJson: undefined,
    });
  });

  it('preserves exact grouped JSON while editing a non-rule detail', async () => {
    const json = JSON.stringify(
      {
        operator: 'ALL',
        conditions: [
          JSON.parse(reviewRouteJson('approve')),
          { field: 'application.CATEGORY', operator: 'Equals', value: 'transfer' },
        ],
      },
      null,
      2
    );
    const user = userEvent.setup();
    const { onSave } = renderReviewRoute(json);
    expect(screen.getByRole('alert')).toHaveTextContent('preserved');
    await user.clear(screen.getByRole('spinbutton', { name: 'Priority *' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Priority *' }), '2');
    await user.click(screen.getByRole('button', { name: 'Save transition' }));
    await waitFor(() => expect(onSave).toHaveBeenCalledOnce());
    expect(onSave.mock.calls[0][0]).toMatchObject({
      priority: 2,
      isDefault: false,
      conditionRuleJson: json,
    });
  });

  it('keeps published decision routes read-only', () => {
    renderReviewRoute(reviewRouteJson('approve'), true);
    expect(
      screen.getByRole('combobox', { name: 'Continue after review decision' })
    ).toHaveAttribute('aria-disabled', 'true');
    expect(screen.queryByRole('button', { name: 'Save transition' })).not.toBeInTheDocument();
  });
});
