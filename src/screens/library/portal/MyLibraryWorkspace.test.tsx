import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { it, vi, expect, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, fireEvent } from '@testing-library/react';

import MyLibraryWorkspace from './MyLibraryWorkspace';
import {
  catalogueTestStore,
  catalogueTestWrapper,
} from '../settings/catalogue-configuration/catalogue-test-fixture';

const navigation = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
  return { tab: '' };
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/routes/hooks/use-search-params', () => ({
  useSearchParams: () => new URLSearchParams({ tab: navigation.tab }),
}));
beforeEach(() => {
  clearCachedAuthSession();
  navigation.tab = '';
});

const root = 'http://library.test/api/mobile/v1';
const child = 'linked-student';
const library = `${root}/students/${child}/library`;
const book = {
  id: 'book',
  title: 'The Reading Garden',
  author: 'A School Author',
  isbn: null,
  availableCopies: 0,
};
const view = 'Library.Portal.View';
const reserve = 'Library.Portal.Reserve';
const viewReceipts = 'Finance.Fees.InvoiceReceipt.View';
const mount = (permissions: string[]) =>
  render(<MyLibraryWorkspace />, {
    wrapper: catalogueTestWrapper(catalogueTestStore(permissions)),
  });

function seedCatalogue() {
  mswServer.use(
    http.get(`${root}/library/students`, () =>
      HttpResponse.json([{ studentId: child, name: 'Linked Student' }])
    ),
    http.get(`${library}/catalogue`, () =>
      HttpResponse.json({ items: [book], currentPage: 1, pageSize: 20, totalCount: 1 })
    )
  );
}

it('shows only the selected linked student activity and keeps the catalogue view read-only', async () => {
  seedCatalogue();
  mswServer.use(
    http.get(`${library}/loans`, () =>
      HttpResponse.json({
        items: [
          {
            id: 'loan',
            title: book.title,
            accession: 'OWN-01',
            dueOn: '2026-11-24',
            isOpen: true,
            canPreviewRenewal: false,
          },
        ],
        currentPage: 1,
        pageSize: 20,
        totalCount: 1,
      })
    )
  );
  const screenRoot = mount([view]);
  expect(await screen.findByText(book.title)).toBeVisible();
  expect(screen.getByText('No copies currently available')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Review reservation' })).not.toBeInTheDocument();
  expect(screen.queryByRole('tab', { name: 'Receipts' })).not.toBeInTheDocument();
  expect(screen.getByRole('tab', { name: 'Loans' })).toHaveAttribute(
    'href',
    '/dashboard/my-library?tab=loans'
  );
  navigation.tab = 'loans';
  screenRoot.rerender(<MyLibraryWorkspace />);
  expect(await screen.findByText('OWN-01')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Review renewal' })).not.toBeInTheDocument();
});

it('uses the same linked student and book for reservation preview and submission', async () => {
  seedCatalogue();
  const submitted = vi.fn();
  mswServer.use(
    http.get(`${library}/pickup-locations`, () => HttpResponse.json([])),
    http.post(`${library}/reservations/preview`, async ({ request }) => {
      expect(await request.json()).toEqual({ bookId: book.id, pickupSectionId: null });
      return HttpResponse.json({ canRequest: true, reasons: [] });
    }),
    http.post(`${library}/reservations`, async ({ request }) => {
      submitted(await request.json());
      return HttpResponse.json({ id: 'saved', title: book.title, state: 0 });
    })
  );
  mount([view, reserve]);
  fireEvent.click(await screen.findByRole('button', { name: 'Review reservation' }));
  const submit = screen.getByRole('button', { name: 'Submit request' });
  expect(submit).toBeDisabled();
  fireEvent.click(screen.getByRole('button', { name: 'Review request' }));
  expect(await screen.findByText(/You can submit this request/)).toBeVisible();
  fireEvent.click(submit);
  expect(await screen.findByText(/Reservation recorded/)).toBeVisible();
  expect(submitted).toHaveBeenCalledExactlyOnceWith({ bookId: book.id, pickupSectionId: null });
});

it('shows a Finance receipt with its recorded verification status for the linked student', async () => {
  seedCatalogue();
  mswServer.use(
    http.get(`${library}/receipt-years`, () =>
      HttpResponse.json([{ id: 'receipt-year', name: '2026–2027' }])
    ),
    http.get(`${library}/receipts`, ({ request }) => {
      expect(new URL(request.url).searchParams.get('academicYearId')).toBe('receipt-year');
      return HttpResponse.json({
        items: [
          {
            id: 'receipt-id',
            number: 'KCH-2026-000001',
            receivedOn: '2026-11-20',
            kind: 'ProvisionalFee',
            verificationStatus: 'PendingVerification',
          },
        ],
        currentPage: 1,
        pageSize: 20,
        totalCount: 1,
      });
    })
  );
  navigation.tab = 'receipts';
  mount([view, viewReceipts]);
  expect(await screen.findByRole('tab', { name: 'Receipts' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  expect(await screen.findByText('KCH-2026-000001')).toBeVisible();
  expect(screen.getByText('Receipt academic year 2026–2027')).toBeVisible();
  expect(screen.getByText(/Provisional receipt/)).toBeVisible();
  expect(screen.getByText('Pending verification')).toBeVisible();
  expect(
    screen.getByRole('button', { name: 'Download PDF for receipt KCH-2026-000001' })
  ).toBeEnabled();
});

it('clears a definitively stale loan preview and requires another review', async () => {
  seedCatalogue();
  navigation.tab = 'loans';
  const loanId = 'own-loan';
  const loan = {
    id: loanId,
    title: book.title,
    accession: 'OWN-02',
    dueOn: '2026-11-24',
    isOpen: true,
    canPreviewRenewal: true,
  };
  let reviews = 0;
  mswServer.use(
    http.get(`${library}/loans`, () =>
      HttpResponse.json({ items: [loan], currentPage: 1, pageSize: 20, totalCount: 1 })
    ),
    http.get(`${library}/loans/${loanId}/renewal-preview`, () =>
      HttpResponse.json({
        canRenew: true,
        dueOn: '2026-12-01',
        schoolDate: '2026-11-20',
        revision: `revision-${++reviews}`,
        reasons: [],
      })
    ),
    http.post(`${library}/loans/${loanId}/renew`, () =>
      HttpResponse.json({ errorCode: 'Library:Circulation:010082' }, { status: 403 })
    )
  );
  mount([view, 'Library.Portal.Renew']);
  fireEvent.click(await screen.findByRole('button', { name: 'Review renewal' }));
  const review = screen.getByRole('button', { name: 'Review due date' });
  const confirm = screen.getByRole('button', { name: 'Confirm renewal' });
  fireEvent.click(review);
  expect(await screen.findByText(/New due date/)).toBeVisible();
  fireEvent.click(confirm);
  expect(await screen.findByText(/Review the due date again/)).toBeVisible();
  expect(screen.queryByText(/New due date/)).not.toBeInTheDocument();
  expect(confirm).toBeDisabled();
  fireEvent.click(review);
  expect(await screen.findByText(/New due date/)).toBeVisible();
  expect(reviews).toBe(2);
});
