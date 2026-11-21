import type { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
import { configureStore } from '@reduxjs/toolkit';
import { it, vi, expect, beforeEach } from 'vitest';
import { createTheme } from 'src/theme/create-theme';
import { ThemeProvider } from '@mui/material/styles';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmPopup from 'src/redux/confirmPopup/confirmPopupSlice';
import { libraryModuleApi } from 'src/redux/library/libraryModuleApi';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { render, screen, within, waitFor, fireEvent } from '@testing-library/react';

import OpenStockCount from './OpenStockCount';
import StockCountDetail from './StockCountDetail';
import { RecordStockScan } from './RecordStockScan';

const routing = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/routes/hooks', () => ({ useRouter: () => routing }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));

const root = 'http://library.test/api/library/stock-verification';
const theme = createTheme(defaultSettings);
const date = '2026-11-19';

function wrapper(actions: string[]) {
  const state = {
    permissions: ['Library.AllBooks.View', 'Library.InventoryVerification.View', ...actions].map(
      (name) => ({
        name,
        isGranted: true,
      })
    ),
    loading: false,
    permissionsInitialized: true,
  };
  const store = configureStore({
    reducer: {
      auth: (current = state) => current,
      [libraryModuleApi.reducerPath]: libraryModuleApi.reducer,
      confirmPopup,
    },
    middleware: (defaults) => defaults().concat(libraryModuleApi.middleware),
  });
  return ({ children }: PropsWithChildren) => (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>{children}</LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

beforeEach(() => {
  clearCachedAuthSession();
  routing.replace.mockReset();
  mswServer.use(
    http.get(`${root}/options`, () =>
      HttpResponse.json({
        canCountWholeSchool: true,
        schoolDate: date,
        schoolDateSource: 'ConfirmedLibraryClock',
        sections: [],
      })
    )
  );
});

it('requires a fresh preview after edits and replays the same opening request after a timeout', async () => {
  const submissions: unknown[] = [];
  mswServer.use(
    http.post(`${root}/preview`, () =>
      HttpResponse.json({
        schoolDate: date,
        schoolDateSource: 'ConfirmedLibraryClock',
        expectedCopyCount: 7,
        statusTotals: [],
        revision: 'reviewed-stock',
      })
    ),
    http.post(root, async ({ request }) => {
      submissions.push(await request.json());
      return submissions.length === 1
        ? HttpResponse.json({}, { status: 504 })
        : HttpResponse.json({ id: 'opened-id' });
    })
  );
  render(<OpenStockCount />, { wrapper: wrapper(['Library.InventoryVerification.Add']) });
  const preview = screen.getByRole('button', { name: 'Preview count' });
  await waitFor(() => expect(preview).toBeEnabled());
  expect(screen.getByRole('button', { name: 'Open count' })).toBeDisabled();
  const name = screen.getByRole('textbox', { name: /Count name/ });
  fireEvent.change(name, { target: { value: 'Morning count' } });
  fireEvent.click(preview);
  expect(await screen.findByText('7 expected copies')).toBeVisible();
  fireEvent.change(name, { target: { value: 'Afternoon count' } });
  expect(screen.getByRole('button', { name: 'Open count' })).toBeDisabled();
  fireEvent.click(preview);
  await waitFor(() => expect(screen.getByRole('button', { name: 'Open count' })).toBeEnabled());
  fireEvent.click(screen.getByRole('button', { name: 'Open count' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Retry opening count' }));
  await waitFor(() =>
    expect(routing.replace).toHaveBeenCalledWith('/library/stock-verification/opened-id')
  );
  expect(submissions).toHaveLength(2);
  expect(submissions[0]).toEqual(submissions[1]);
  expect(submissions[1]).toMatchObject({
    revision: 'reviewed-stock',
    count: { name: 'Afternoon count', schoolDate: null },
  });
});

it('replays a timed-out scan and assigns a new key to the next deliberate scan of the same barcode', async () => {
  const submissions: { scan: string; idempotencyKey: string }[] = [];
  mswServer.use(
    http.post(`${root}/session/observations`, async ({ request }) => {
      const body = (await request.json()) as (typeof submissions)[number];
      submissions.push(body);
      return submissions.length === 1
        ? HttpResponse.json({}, { status: 504 })
        : HttpResponse.json({
            id: `scan-${submissions.length}`,
            accessionNumber: body.scan,
            copyId: null,
            schoolDate: date,
            sequence: submissions.length - 1,
          });
    })
  );
  render(<RecordStockScan id="session" />, {
    wrapper: wrapper(['Library.InventoryVerification.Update']),
  });
  const record = screen.getByRole('button', { name: 'Record scan' });
  await waitFor(() => expect(record).toBeEnabled());
  const input = screen.getByRole('textbox', { name: /Accession or barcode/ });
  fireEvent.change(input, { target: { value: '00042' } });
  fireEvent.click(record);
  fireEvent.click(await screen.findByRole('button', { name: 'Retry scan' }));
  expect(await screen.findByText(/Unknown accession recorded for review/)).toBeVisible();
  expect(submissions[0]).toEqual(submissions[1]);
  expect(input).toHaveValue('');
  fireEvent.change(input, { target: { value: '00042' } });
  fireEvent.click(screen.getByRole('button', { name: 'Record scan' }));
  await waitFor(() => expect(submissions).toHaveLength(3));
  expect(submissions[2].scan).toBe('00042');
  expect(submissions[2].idempotencyKey).not.toBe(submissions[1].idempotencyKey);
});

it('does not expose scan controls with read or opening grants alone', () => {
  render(<RecordStockScan id="session" />, {
    wrapper: wrapper(['Library.InventoryVerification.Add']),
  });
  expect(screen.queryByRole('textbox', { name: /Accession or barcode/ })).not.toBeInTheDocument();
});

it('shows live reconciliation to readers and keeps unknown scans separate from the baseline', async () => {
  mswServer.use(
    http.get(`${root}/session`, () =>
      HttpResponse.json({
        id: 'session',
        name: 'Shelf check',
        schoolDate: date,
        status: 2,
        expectedCopyCount: 1,
        observationCount: 1,
      })
    ),
    http.get(`${root}/session/observations`, () =>
      HttpResponse.json({ items: [], totalCount: 0, totalPages: 0 })
    ),
    http.get(`${root}/session/reconciliation`, ({ request }) => {
      const source = new URL(request.url).searchParams.get('source');
      return HttpResponse.json({
        items: [
          source === '3'
            ? {
                id: 'scan',
                accessionNumber: 'UNKNOWN-1',
                finding: 15,
                requiresReview: true,
                evidenceRevision: 'scoped-evidence',
              }
            : { id: 'copy', accessionNumber: 'LOAN-1', finding: 5, requiresReview: false },
        ],
        totalCount: 1,
        totalPages: 1,
      });
    })
  );
  render(<StockCountDetail id="session" />, { wrapper: wrapper([]) });
  fireEvent.click(await screen.findByRole('tab', { name: 'Reconciliation' }));
  expect(await screen.findByText('LOAN-1')).toBeVisible();
  expect(screen.getByText('On loan')).toBeVisible();
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Records' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Unknown scans' }));
  expect(await screen.findByText('UNKNOWN-1')).toBeVisible();
  expect(screen.getByText('Unknown accession')).toBeVisible();
  expect(screen.queryByText('LOAN-1')).not.toBeInTheDocument();
  expect(screen.queryByRole('button', { name: 'Record scan' })).not.toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Record decision for UNKNOWN-1' })
  ).not.toBeInTheDocument();
});

it('confirms the recorded scan count and retries an uncertain start-review request with the same key', async () => {
  const requests: unknown[] = [];
  let status = 1;
  mockCountDetail(() => ({ status, observationCount: 4 }));
  mswServer.use(
    http.post(`${root}/session/review`, async ({ request }) => {
      requests.push(await request.json());
      if (requests.length === 1) return HttpResponse.json({}, { status: 504 });
      status = 2;
      return HttpResponse.json({ sessionId: 'session', status, observationCount: 4 });
    })
  );
  render(<StockCountDetail id="session" />, {
    wrapper: wrapper(['Library.InventoryVerification.Update']),
  });
  fireEvent.click(await screen.findByRole('button', { name: 'Start review' }));
  const dialog = await screen.findByRole('dialog', { name: 'Start Stock Count Review?' });
  expect(within(dialog).getByText(/4 recorded scans/)).toBeVisible();
  fireEvent.click(within(dialog).getByRole('button', { name: 'Start review' }));
  fireEvent.click(await within(dialog).findByRole('button', { name: 'Retry starting review' }));
  expect(await screen.findByText('In review')).toBeVisible();
  expect(screen.queryByRole('textbox', { name: /Accession or barcode/ })).not.toBeInTheDocument();
  expect(requests).toHaveLength(2);
  expect(requests[0]).toEqual(requests[1]);
  expect(requests[0]).toMatchObject({ expectedObservationCount: 4 });
});

it('reloads a changed count and requires a fresh confirmation before cancelling with a reason', async () => {
  const requests: unknown[] = [];
  let status = 1;
  let observationCount = 1;
  let reason: string | null = null;
  mockCountDetail(() => ({ status, observationCount, cancellationReason: reason }));
  mswServer.use(
    http.post(`${root}/session/cancel`, async ({ request }) => {
      requests.push(await request.json());
      if (requests.length === 1) {
        status = 2;
        observationCount = 2;
        return HttpResponse.json({}, { status: 409 });
      }
      status = 4;
      reason = 'Room closure';
      return HttpResponse.json({ sessionId: 'session', status, observationCount });
    })
  );
  render(<StockCountDetail id="session" />, {
    wrapper: wrapper(['Library.InventoryVerification.Update']),
  });
  fireEvent.click(await screen.findByRole('button', { name: 'Cancel count' }));
  const dialog = await screen.findByRole('dialog', { name: 'Cancel Stock Count?' });
  expect(within(dialog).getByRole('button', { name: 'Cancel count' })).toBeDisabled();
  fireEvent.change(within(dialog).getByRole('textbox', { name: /Cancellation reason/ }), {
    target: { value: ' Room closure ' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Close' }));
  const discard = await screen.findByRole('dialog', { name: 'Discard Unsaved Changes?' });
  fireEvent.click(within(discard).getByRole('button', { name: 'Keep editing' }));
  await waitFor(() => expect(discard).not.toBeInTheDocument());
  fireEvent.click(within(dialog).getByRole('button', { name: 'Cancel count' }));
  fireEvent.click(await within(dialog).findByRole('button', { name: 'Review current count' }));
  expect(await screen.findByText('In review')).toBeVisible();
  expect(await within(dialog).findByText(/2 recorded scans/)).toBeVisible();
  expect(within(dialog).getByRole('textbox', { name: /Cancellation reason/ })).toHaveValue(
    ' Room closure '
  );
  const confirm = within(dialog).getByRole('button', { name: 'Cancel count' });
  await waitFor(() => expect(confirm).toBeEnabled());
  fireEvent.click(confirm);
  expect(await screen.findByText('Cancelled')).toBeVisible();
  expect(await screen.findByText('Room closure')).toBeVisible();
  expect(requests).toHaveLength(2);
  expect(requests[0]).toMatchObject({ expectedObservationCount: 1, expectedStatus: 1 });
  expect(requests[1]).toMatchObject({
    expectedObservationCount: 2,
    expectedStatus: 2,
    reason: 'Room closure',
  });
  expect(screen.queryByRole('button', { name: 'Cancel count' })).not.toBeInTheDocument();
});

function mockCountDetail(
  read: () => { status: number; observationCount: number; cancellationReason?: string | null }
) {
  mswServer.use(
    http.get(`${root}/session`, () =>
      HttpResponse.json({
        id: 'session',
        name: 'Shelf check',
        schoolDate: date,
        expectedCopyCount: 2,
        ...read(),
      })
    ),
    http.get(`${root}/session/observations`, () =>
      HttpResponse.json({ items: [], totalCount: 0, totalPages: 0 })
    )
  );
}

it('distinguishes a proven receipt after opening from other published scans outside the baseline', async () => {
  mockCountDetail(() => ({ status: 3, observationCount: 2 }));
  mswServer.use(
    http.get(`${root}/session/result`, ({ request }) => {
      const source = new URL(request.url).searchParams.get('source');
      const items =
        source === '2'
          ? [
              {
                id: 'proof',
                accessionNumber: 'DONATION-01',
                finding: 14,
                receivedAfterOpening: true,
              },
              { id: 'manual', accessionNumber: 'UNPROVEN-01', finding: 14 },
            ]
          : [];
      return HttpResponse.json({
        publishedAt: '2026-11-19T08:00:00Z',
        findingCount: 2,
        discrepancyCount: 2,
        findings: { items, totalCount: items.length },
      });
    })
  );
  render(<StockCountDetail id="session" />, { wrapper: wrapper([]) });
  expect(await screen.findByRole('tab', { name: 'Published result' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  fireEvent.mouseDown(await screen.findByRole('combobox', { name: 'Records' }));
  fireEvent.click(await screen.findByRole('option', { name: 'Scans outside baseline' }));
  const received = await screen.findByRole('row', { name: /DONATION-01/ });
  expect(within(received).getByText('Receipt recorded after opening')).toBeVisible();
  const unproven = screen.getByRole('row', { name: /UNPROVEN-01/ });
  expect(within(unproven).getByText('Outside the original count')).toBeVisible();
});

it('requires a refreshed approval preview after a conflict and opens the published result', async () => {
  const requests: { revision: string; idempotencyKey: string }[] = [];
  let status = 2;
  let revision = 'review-one';
  mockCountDetail(() => ({ status, observationCount: 2 }));
  mswServer.use(
    http.get(`${root}/session/reconciliation`, () =>
      HttpResponse.json({ items: [], totalCount: 0, totalPages: 0 })
    ),
    http.get(`${root}/session/approval-preview`, () =>
      HttpResponse.json({
        expectedCopyCount: 2,
        observationCount: 2,
        findingCount: 2,
        discrepancyCount: 1,
        missingDecisionCount: 0,
        staleDecisionCount: 0,
        canFinalize: true,
        revision,
      })
    ),
    http.post(`${root}/session/finalize`, async ({ request }) => {
      requests.push((await request.json()) as (typeof requests)[number]);
      if (requests.length === 1) return HttpResponse.json({}, { status: 504 });
      if (requests.length === 2) {
        revision = 'review-two';
        return HttpResponse.json({}, { status: 409 });
      }
      status = 3;
      return HttpResponse.json({ sessionId: 'session', status, observationCount: 2 });
    }),
    http.get(`${root}/session/result`, () =>
      HttpResponse.json({
        publishedAt: '2026-11-19T08:00:00Z',
        expectedCopyCount: 2,
        observationCount: 2,
        findingCount: 2,
        discrepancyCount: 1,
        findings: {
          items: [
            {
              id: 'frozen-copy',
              accessionNumber: 'FROZEN-7',
              finding: 1,
              currentStatus: 0,
              expectedLocation: 'Main library / Shelf A',
              observationSequence: 1,
            },
          ],
          totalCount: 1,
        },
      })
    )
  );
  render(<StockCountDetail id="session" />, {
    wrapper: wrapper(['Library.InventoryVerification.Approve']),
  });
  expect(await screen.findByRole('button', { name: 'Approve count' })).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Cancel count' })).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Approve count' }));
  const summary = await screen.findByRole('dialog', { name: 'Approve Stock Count?' });
  const viewFindings = within(summary).getByRole('button', { name: 'View findings' });
  await waitFor(() => expect(viewFindings).toBeEnabled());
  fireEvent.click(viewFindings);
  expect(await screen.findByRole('tab', { name: 'Reconciliation' })).toHaveAttribute(
    'aria-selected',
    'true'
  );
  fireEvent.click(await screen.findByRole('button', { name: 'Approve count' }));
  const dialog = await screen.findByRole('dialog', { name: 'Approve Stock Count?' });
  const approve = within(dialog).getByRole('button', { name: 'Approve count' });
  await waitFor(() => expect(approve).toBeEnabled());
  fireEvent.click(approve);
  fireEvent.click(await within(dialog).findByRole('button', { name: 'Retry approval' }));
  fireEvent.click(await within(dialog).findByRole('button', { name: 'Refresh preview' }));
  const approveUpdated = await within(dialog).findByRole('button', { name: 'Approve count' });
  await waitFor(() => expect(approveUpdated).toBeEnabled());
  fireEvent.click(approveUpdated);
  expect(await screen.findByText('FROZEN-7')).toBeVisible();
  expect(screen.getByText('Main library / Shelf A')).toBeVisible();
  expect(requests.map(({ revision: requested }) => requested)).toEqual([
    'review-one',
    'review-one',
    'review-two',
  ]);
  expect(requests[0]).toEqual(requests[1]);
  expect(requests[0].idempotencyKey).not.toBe(requests[2].idempotencyKey);
});

it('refreshes a changed finding before saving the reasoned decision and shows it in history', async () => {
  const requests: unknown[] = [];
  let decision: object | undefined;
  let changed = false;
  mockCountDetail(() => ({ status: 2, observationCount: 0 }));
  mswServer.use(
    http.get(`${root}/session/reconciliation`, () =>
      HttpResponse.json({
        items: [
          {
            id: 'copy',
            accessionNumber: 'SHELF-17',
            finding: 10,
            requiresReview: true,
            currentStatus: changed ? 4 : 0,
            evidenceRevision: changed ? 'refreshed-evidence' : 'confirmed-evidence',
            decision,
            decisionIsCurrent: Boolean(decision),
          },
        ],
        totalCount: 1,
      })
    ),
    http.post(`${root}/session/decisions`, async ({ request }) => {
      const body = (await request.json()) as { reason: string; outcome: number };
      requests.push(body);
      if (requests.length === 1) {
        changed = true;
        return HttpResponse.json({}, { status: 409 });
      }
      decision = {
        id: 'decision-1',
        version: 1,
        source: 1,
        rowId: 'copy',
        accessionNumber: 'SHELF-17',
        finding: 10,
        outcome: body.outcome,
        reason: body.reason,
        decidedAt: '2026-11-19T08:00:00Z',
      };
      return HttpResponse.json(decision);
    }),
    http.get(`${root}/session/decisions`, () =>
      HttpResponse.json({ items: decision ? [decision] : [], totalCount: 1 })
    )
  );
  render(<StockCountDetail id="session" />, {
    wrapper: wrapper(['Library.InventoryVerification.Update']),
  });
  fireEvent.click(await screen.findByRole('tab', { name: 'Reconciliation' }));
  fireEvent.click(await screen.findByRole('button', { name: 'Record decision for SHELF-17' }));
  const dialog = await screen.findByRole('dialog', { name: 'Review Finding' });
  fireEvent.mouseDown(within(dialog).getByRole('combobox', { name: /Decision/ }));
  fireEvent.click(await screen.findByRole('option', { name: 'Follow up' }));
  fireEvent.change(within(dialog).getByRole('textbox', { name: /Reason/ }), {
    target: { value: '  Recheck the shelf tomorrow. ' },
  });
  fireEvent.click(within(dialog).getByRole('button', { name: 'Submit' }));
  fireEvent.click(await within(dialog).findByRole('button', { name: 'Review current finding' }));
  expect(await within(dialog).findByText('Current status Damaged')).toBeVisible();
  expect(within(dialog).getByRole('textbox', { name: /Reason/ })).toHaveValue(
    '  Recheck the shelf tomorrow. '
  );
  const submit = within(dialog).getByRole('button', { name: 'Submit' });
  await waitFor(() => expect(submit).toBeEnabled());
  fireEvent.click(submit);
  await waitFor(() => expect(dialog).not.toBeInTheDocument());
  expect(await screen.findByText('Follow up')).toBeVisible();
  expect(requests[0]).toMatchObject({
    source: 1,
    rowId: 'copy',
    evidenceRevision: 'confirmed-evidence',
    expectedDecisionId: null,
    outcome: 1,
    reason: 'Recheck the shelf tomorrow.',
  });
  expect(requests[1]).toMatchObject({
    source: 1,
    rowId: 'copy',
    evidenceRevision: 'refreshed-evidence',
    expectedDecisionId: null,
    outcome: 1,
    reason: 'Recheck the shelf tomorrow.',
  });
  fireEvent.click(screen.getByRole('tab', { name: 'Decision history' }));
  expect(await screen.findByText('Recheck the shelf tomorrow.')).toBeVisible();
});
