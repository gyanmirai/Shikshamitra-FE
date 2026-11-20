import { useFormik } from 'formik';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, waitFor } from '@testing-library/react';

import { LoanMemberPicker } from './LoanMemberPicker';
import { makeCirculationTestWrapper } from './circulation-test-fixtures';

import type { IssueValues } from './useIssueDraft';

vi.hoisted(() => { process.env.NEXT_PUBLIC_API_URL = 'http://library.test'; });
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
beforeEach(() => clearCachedAuthSession());

function Harness({ onSubmit }: { onSubmit: () => void }) {
  const formik = useFormik<IssueValues>({
    initialValues: { memberId: '', memberScan: '', accessionNumber: '', issueDate: null, dueDate: null },
    onSubmit,
  });
  return (
    <form onSubmit={formik.handleSubmit}>
      <LoanMemberPicker formik={formik} disabled={false} />
      <output aria-label="Selected borrower">{formik.values.memberId}</output>
    </form>
  );
}

function setup() {
  const onSubmit = vi.fn();
  const user = userEvent.setup();
  render(<Harness onSubmit={onSubmit} />, makeCirculationTestWrapper([
    { name: 'Library.IssueReturn.View', isGranted: true },
  ]));
  return { user, onSubmit };
}

it('searches by printed identifier under circulation access without a member-management grant', async () => {
  const requests: string[] = [];
  mswServer.use(http.get('http://library.test/api/library/circulation/members', ({ request }) => {
    const url = new URL(request.url);
    requests.push(url.searchParams.get('search') || '');
    expect(url.searchParams.get('page')).toBe('1');
    return HttpResponse.json({ items: [{ id: 'staff-person-id', memberName: 'Asha Patel', memberIdentifier: 'T-42', role: 1, isEligibleForIssue: true }], totalCount: 1 });
  }));
  const { user } = setup();
  await user.type(screen.getByRole('combobox', { name: /Library member/i }), 'T-42');
  await user.click(await screen.findByRole('option', { name: /Asha Patel.*T-42.*Staff/ }));
  await waitFor(() => expect(screen.getByLabelText('Selected borrower')).toHaveTextContent('staff-person-id'));
  expect(requests).toContain('T-42');
});

it('uses Enter to resolve the printed ID without submitting an issue and clears it when the next card starts', async () => {
  const { user, onSubmit } = setup();
  await user.click(screen.getByRole('button', { name: 'Scan ID' }));
  const scan = screen.getByRole('textbox', { name: /Printed member ID/ });
  await user.type(scan, 'M/001#?{Enter}');
  expect(screen.getByLabelText('Selected borrower')).toHaveTextContent('M/001#?');
  expect(onSubmit).not.toHaveBeenCalled();
  await user.type(scan, '2');
  expect(screen.getByLabelText('Selected borrower')).toBeEmptyDOMElement();
});
