import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';

import IssuedBooks from './IssuedBooks';
import { recordMember, memberRecordWrapper } from './member-record-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/customizabaleTable', () => ({ default: () => null }));

it('does not label current context as a transaction-year filter or hide cross-year open loans', async () => {
  const requests: URL[] = [];
  mswServer.use(
    http.get(
      'http://library.test/api/library/members/canonical-member/borrowed-books',
      ({ request }) => {
        requests.push(new URL(request.url));
        return HttpResponse.json({ items: [], totalCount: 0, currentPage: 1, pageSize: 20 });
      }
    )
  );
  const fixture = memberRecordWrapper();
  render(<IssuedBooks member={recordMember} />, fixture);
  await waitFor(() => expect(requests).toHaveLength(1));
  expect(requests[0].searchParams.has('academicYearId')).toBe(false);
  await act(async () => {
    fixture.store.dispatch({ type: 'member-test/change-year' });
  });
  expect(requests).toHaveLength(1);
});
