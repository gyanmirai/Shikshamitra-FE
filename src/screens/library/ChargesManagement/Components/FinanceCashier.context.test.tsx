import type { Dayjs } from 'dayjs';

import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { act, screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { libraryFinanceApi } from 'src/redux/library/charges-management/finance-external-api';

import {
  ids,
  source,
  revisions,
  permissions,
  cashierScenario,
} from './AssignChargeProcessForm.finance.fixture';
import {
  cashierNextYear,
  collectionResponseGate,
  installCashierAcademicResponses,
  mountCashierWithActualAcademicSelector,
} from './FinanceCashier.context.fixture';

const session = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
  return {
    data: {
      accessToken: 'actual-shared-cashier-auth',
      profile: {
        sub: '26d4efc0-07a3-48f4-a40c-896905e23f51',
        tenantId: '6328216a-70aa-4c86-90a8-375c6328967f',
      },
    },
    push: vi.fn<(href: string) => void>(),
  };
});
vi.mock('next-auth/react', () => ({
  getSession: async () => session.data,
  useSession: () => ({ data: session.data }),
  signOut: vi.fn(),
}));
vi.mock('next/navigation', () => ({
  usePathname: () => '/library/charges',
  useRouter: () => ({ push: session.push }),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
  },
}));
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
// Calendar presentation only; real field values/Formik/validation/commands,
// GlobalAcademicSearch, its RTK data and the shared context guard remain real.
vi.mock('@mui/x-date-pickers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/x-date-pickers')>();
  return {
    ...actual,
    DatePicker: function CalendarPresentation({
      label,
      value,
      onChange,
      disabled,
      readOnly,
    }: {
      label?: string;
      value?: Dayjs | null;
      disabled?: boolean;
      readOnly?: boolean;
      onChange?: (date: Dayjs | null, context: { validationError: null }) => void;
    }) {
      const inputId = React.useId();
      return (
        <label htmlFor={inputId}>
          {label}
          <input
            id={inputId}
            aria-label={label}
            disabled={disabled}
            readOnly={readOnly}
            value={value?.isValid() ? value.format('YYYY-MM-DD') : ''}
            onChange={(event) =>
              onChange?.(event.target.value ? dayjs(event.target.value) : null, {
                validationError: null,
              })
            }
          />
        </label>
      );
    },
  };
});
dayjs.extend(customParseFormat);
beforeEach(() => {
  clearCachedAuthSession();
  session.push.mockClear();
});
afterEach(cleanup);

const grants = [
  permissions.source,
  permissions.view,
  permissions.collectionView,
  permissions.collect,
];
async function prepareAndRecordContextPayment() {
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: /Amount to collect/i })).toBeEnabled()
  );
  fireEvent.change(screen.getByRole('textbox', { name: /Amount to collect/i }), {
    target: { value: '40.25' },
  });
  await userEvent.setup().click(screen.getByRole('combobox', { name: /Payment method/i }));
  await userEvent.setup().click(await screen.findByRole('option', { name: /^Cash$/i }));
  fireEvent.change(screen.getByLabelText(/School receipt date/i), {
    target: { value: '2026-11-17' },
  });
  await userEvent.setup().click(screen.getByRole('button', { name: /Review payment/i }));
  const confirmation = await screen.findByRole('dialog', { name: /Confirm payment/i });
  await userEvent
    .setup()
    .click(within(confirmation).getByRole('button', { name: /^Record payment$/i }));
}

async function attemptActualAcademicSelection() {
  // MUI modality is deliberately NOT a browser-reachability assertion. This
  // drives the actual controlled selector and its change/confirmation pipeline.
  const input = screen.getByLabelText(/^Academic Year$/i);
  expect(input).toHaveValue('2025–2026');
  fireEvent.mouseDown(input);
  const list = await screen.findByRole('listbox', { hidden: true });
  await act(async () => fireEvent.click(within(list).getByText(cashierNextYear.name)));
  // If the owner fails to veto, finish the existing generic context confirmation
  // so the assertion observes its actual Redux commit, not an unresolved dialog.
  const confirm = screen.queryByRole('button', { name: /^OK$/i });
  if (confirm) await act(async () => fireEvent.click(confirm));
}

function assertFrozenCommand(body: Record<string, unknown>) {
  expect(body).toMatchObject({
    source,
    revision: revisions.collection,
    schoolReceiptDate: '2026-11-17',
    idempotencyKey: expect.any(String),
    payments: [{ paymentMethod: 0, amount: '40.25' }],
  });
  expect(body.idempotencyKey).not.toBe('');
}

it('blocks the actual academic selector while a Finance payment response is pending and retains its saved source context', async () => {
  const gate = collectionResponseGate();
  const scenario = cashierScenario('collect', {
    paymentMethod: 0,
    collectionResponseGate: gate.promise,
  });
  const academic = installCashierAcademicResponses();
  const { store, onClose } = mountCashierWithActualAcademicSelector(grants);
  try {
    await waitFor(() =>
      expect(academic).toEqual(expect.arrayContaining(['years', 'boards', 'scope']))
    );
    await prepareAndRecordContextPayment();
    await waitFor(() => expect(scenario.collectionBodies).toHaveLength(1));
    const original = structuredClone(scenario.collectionBodies[0]);
    assertFrozenCommand(original);
    await attemptActualAcademicSelection();
    expect(store.getState().globalState.currentYear).toMatchObject({ id: ids.otherYear });
    expect(
      libraryFinanceApi.endpoints.getFinanceExternalCollectForm.select(source)(store.getState())
        .data?.receivable.academicYearId
    ).toBe(ids.sourceYear);
    expect(screen.queryByRole('button', { name: /Discard changes/i })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /Confirm payment/i })).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(scenario.collectionBodies).toEqual([original]);
    expect(scenario.moneyIntentKeys).toEqual([original.idempotencyKey]);
    gate.release();
    await screen.findByText(/Payment recorded.*40\.25.*FCH-2026-000084/i);
    expect(scenario.forbidden).toEqual([]);
  } finally {
    gate.release();
  }
});

it('blocks the actual academic selector after an uncertain payment and retries the same complete command despite a live ledger refresh', async () => {
  const scenario = cashierScenario('collect', {
    paymentMethod: 0,
    loseFirstCollectionResponse: true,
  });
  const academic = installCashierAcademicResponses();
  const { store, onClose } = mountCashierWithActualAcademicSelector(grants);
  await waitFor(() =>
    expect(academic).toEqual(expect.arrayContaining(['years', 'boards', 'scope']))
  );
  await prepareAndRecordContextPayment();
  await screen.findByText(/The payment outcome is not confirmed/i);
  const original = structuredClone(scenario.collectionBodies[0]);
  assertFrozenCommand(original);
  const refreshed = await store
    .dispatch(
      libraryFinanceApi.endpoints.getFinanceExternalCollectForm.initiate(source, {
        subscribe: false,
        forceRefetch: true,
      })
    )
    .unwrap();
  expect(refreshed.revision).toBe(revisions.settled);
  await attemptActualAcademicSelection();
  expect(store.getState().globalState.currentYear).toMatchObject({ id: ids.otherYear });
  expect(
    libraryFinanceApi.endpoints.getFinanceExternalCollectForm.select(source)(store.getState()).data
      ?.receivable.academicYearId
  ).toBe(ids.sourceYear);
  expect(screen.queryByRole('button', { name: /Discard changes/i })).not.toBeInTheDocument();
  expect(screen.getByLabelText(/Amount to collect/i)).toBeDisabled();
  expect(screen.getByLabelText(/School receipt date/i)).toBeDisabled();
  expect(onClose).not.toHaveBeenCalled();
  const confirmation = screen.getByRole('dialog', { name: /Confirm payment/i });
  expect(within(confirmation).getByRole('button', { name: /^Cancel$/i })).toBeDisabled();
  await userEvent
    .setup()
    .click(within(confirmation).getByRole('button', { name: /^Retry same payment$/i }));
  await waitFor(() => expect(scenario.collectionBodies).toHaveLength(2));
  expect(scenario.collectionBodies[1]).toEqual(original);
  expect(scenario.moneyIntentKeys).toEqual([original.idempotencyKey]);
  await screen.findByText(/Payment recorded.*40\.25.*FCH-2026-000084/i);
  expect(scenario.forbidden).toEqual([]);
});
