import { it, vi, expect } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';

import { ReviewAssigneeSelect } from './components/review-assignee-select';
import { renderDocumentUi } from '../document-verification/document-ui-test-fixture';

it('searches on Enter without saving the containing form or losing its assigned reviewer', async () => {
  const user = userEvent.setup();
  const submitted = vi.fn();
  const changed = vi.fn();
  const policy = { reviewerRole: null };
  const filters: string[] = [];
  mswServer.use(
    http.get('*/api/student/enrollment/admissions/reviews/reviewers', ({ request }) => {
      const filter = new URL(request.url).searchParams.get('filter') ?? '';
      filters.push(filter);
      return HttpResponse.json({
        data: filter
          ? [{ id: 'bob', name: 'Bob Patel', userName: 'bob' }]
          : [{ id: 'asha', name: 'Asha Shah', userName: 'asha' }],
      });
    })
  );
  renderDocumentUi(
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submitted();
      }}
    >
      <ReviewAssigneeSelect
        value="asha"
        savedName="Asha Shah"
        role={policy.reviewerRole}
        available
        disabled={false}
        onChange={changed}
      />
      <button type="submit">Save assignment</button>
    </form>
  );
  await waitFor(() => expect(screen.getByRole('combobox')).toHaveTextContent('Asha Shah (asha)'));
  await user.click(screen.getByRole('textbox', { name: 'Find a reviewer' }));
  await user.paste('bob');
  await user.keyboard('{Enter}');
  await waitFor(() => expect(filters).toEqual(['', 'bob']));
  expect(submitted).not.toHaveBeenCalled();
  expect(changed).not.toHaveBeenCalled();
  expect(screen.getByRole('combobox')).toHaveTextContent('Asha Shah');
  await waitFor(() =>
    expect(screen.getByRole('combobox')).not.toHaveAttribute('aria-disabled', 'true')
  );
  await user.click(screen.getByRole('combobox'));
  expect(await screen.findByRole('option', { name: 'Bob Patel (bob)' })).toBeVisible();
});
