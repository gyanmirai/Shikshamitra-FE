import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import { PolicyDraftDrawer } from './PolicyDraftDrawer';
import { manualPolicy, policyOptions, manualPolicyWrapper } from './manual-policy.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
beforeEach(clearCachedAuthSession);
it('edits an actual saved Manual policy through the owning form without inventing automated durations', async () => {
  let body: Record<string, unknown> | undefined;
  mswServer.use(
    http.put('http://library.test/api/library/policies/version-id', async ({ request }) => {
      body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(manualPolicy);
    })
  );
  const onClose = vi.fn();
  render(
    <PolicyDraftDrawer
      item={manualPolicy}
      academicYearId="year-id"
      options={policyOptions}
      onClose={onClose}
    />,
    { wrapper: manualPolicyWrapper() }
  );
  expect(screen.getByRole('combobox', { name: /Due date mode/i })).toHaveTextContent(/Manual/i);
  expect(screen.getByRole('combobox', { name: /Member role/i })).toHaveAttribute(
    'aria-disabled',
    'true'
  );
  fireEvent.change(screen.getByRole('textbox', { name: /Policy name/i }), {
    target: { value: 'Reviewed manual policy' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(body).toMatchObject({
    name: 'Reviewed manual policy',
    concurrencyStamp: 'opened-policy-version',
    terms: { dueDateMode: 0, loanDays: 0, renewalDays: 0, pickupWindowDays: 0 },
  });
});
