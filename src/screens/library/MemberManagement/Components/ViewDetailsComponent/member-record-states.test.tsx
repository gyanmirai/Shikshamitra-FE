import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect } from 'vitest';
import { act, within, render, screen, fireEvent, waitFor } from '@testing-library/react';

import IssuedBooks from './IssuedBooks';
import { memberRecord, recordMember, memberRecordWrapper } from './member-record-test-fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

it('keeps raw legacy dates explicitly unconfirmed when canonical date evidence is absent', async () => {
  mswServer.use(
    http.get('http://library.test/api/library/members/canonical-member/borrowed-books', () =>
      HttpResponse.json({
        items: [
          {
            ...memberRecord,
            schoolIssueDate: null,
            schoolDueDate: null,
            issueDateProvenance: 0,
            dueDateProvenance: 0,
          },
        ],
        totalCount: 1,
        currentPage: 1,
        pageSize: 20,
      })
    )
  );
  render(<IssuedBooks member={recordMember} />, memberRecordWrapper());
  const row = await screen.findByRole('row', { name: new RegExp(memberRecord.bookTitle) });
  expect(within(row).getAllByText('Unconfirmed')).toHaveLength(2);
});

it('requests the next server page, exposes its failure and retries that same page without showing prior-page rows', async () => {
  const requests: URL[] = [];
  let retry = false;
  mswServer.use(
    http.get(
      'http://library.test/api/library/members/canonical-member/borrowed-books',
      ({ request }) => {
        const url = new URL(request.url);
        requests.push(url);
        const page = Number(url.searchParams.get('page'));
        if (page === 2 && !retry)
          return HttpResponse.json(
            { detail: 'Could not load the next member page.' },
            { status: 500 }
          );
        return HttpResponse.json({
          items:
            page === 1
              ? Array.from({ length: 20 }, (_, index) => ({
                  ...memberRecord,
                  id: `loan-${index}`,
                  bookTitle: `First page ${index + 1}`,
                }))
              : [{ ...memberRecord, id: 'last-loan', bookTitle: 'Last saved loan' }],
          totalCount: 21,
          totalPages: 2,
          currentPage: page,
          pageSize: 20,
        });
      }
    )
  );
  render(<IssuedBooks member={recordMember} />, memberRecordWrapper());
  await screen.findByRole('row', { name: /First page 20/ });
  fireEvent.click(screen.getByRole('button', { name: 'Go to next page' }));
  expect(await screen.findByText('Could not load the next member page.')).toBeInTheDocument();
  expect(screen.queryByRole('row', { name: /First page 1 / })).not.toBeInTheDocument();
  retry = true;
  await act(async () => fireEvent.click(screen.getByRole('button', { name: 'Retry' })));
  expect(await screen.findByRole('row', { name: /Last saved loan/ })).toBeInTheDocument();
  await waitFor(() => expect(requests).toHaveLength(3));
  expect(requests.map((url) => url.searchParams.get('page'))).toEqual(['1', '2', '2']);
  expect(requests.every((url) => !url.searchParams.has('academicYearId'))).toBe(true);
});
