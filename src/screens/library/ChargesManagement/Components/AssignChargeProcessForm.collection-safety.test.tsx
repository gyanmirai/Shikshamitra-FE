import type { Dayjs } from 'dayjs';

import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { screen, within, cleanup, waitFor, fireEvent } from '@testing-library/react';
import { libraryFinanceApi } from 'src/redux/library/charges-management/finance-external-api';

import {
  ids,
  source,
  revisions,
  permissions,
  cashierScenario,
  mountChargeCashier,
} from './AssignChargeProcessForm.finance.fixture';

dayjs.extend(customParseFormat);
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'actual-shared-cashier-auth' }),
  signOut: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
vi.mock('src/components/preview-document/pdf-preview', () => ({
  default: () => <div aria-label="Receipt document preview" />,
}));
// Picker and PDF canvas presentation only. Redux/permission hooks/RTK/base query,
// component, Formik/schema, source helpers, money input and submit stay real.
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
      slotProps,
    }: {
      label?: string;
      value?: Dayjs | null;
      disabled?: boolean;
      readOnly?: boolean;
      onChange?: (date: Dayjs | null, context: { validationError: null }) => void;
      slotProps?: { textField?: { name?: string; onBlur?: () => void } };
    }) {
      const id = React.useId();
      return (
        <label htmlFor={id}>
          {label}
          <input
            id={id}
            aria-label={label}
            name={slotProps?.textField?.name}
            disabled={disabled}
            readOnly={readOnly}
            value={value?.isValid() ? value.format('YYYY-MM-DD') : ''}
            onBlur={() => slotProps?.textField?.onBlur?.()}
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

const originalCreateUrl = Object.getOwnPropertyDescriptor(URL, 'createObjectURL');
const originalRevokeUrl = Object.getOwnPropertyDescriptor(URL, 'revokeObjectURL');
beforeEach(() => {
  clearCachedAuthSession();
  Object.defineProperty(URL, 'createObjectURL', {
    configurable: true,
    value: vi.fn(() => 'blob:actual-receipt-transport'),
  });
  Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
});
afterEach(() => {
  cleanup();
  if (originalCreateUrl) Object.defineProperty(URL, 'createObjectURL', originalCreateUrl);
  else Reflect.deleteProperty(URL, 'createObjectURL');
  if (originalRevokeUrl) Object.defineProperty(URL, 'revokeObjectURL', originalRevokeUrl);
  else Reflect.deleteProperty(URL, 'revokeObjectURL');
});

const collectionGrants = [
  permissions.source,
  permissions.view,
  permissions.collectionView,
  permissions.collect,
  permissions.receiptView,
];
async function selectOption(label: RegExp, name: RegExp) {
  const control = await screen.findByRole('combobox', { name: label });
  await waitFor(() => expect(control).not.toHaveAttribute('aria-disabled', 'true'));
  await userEvent.setup().click(control);
  await userEvent.setup().click(await screen.findByRole('option', { name }));
}
async function enterCollection(method: RegExp) {
  await waitFor(() =>
    expect(screen.getByRole('textbox', { name: /Amount to collect/i })).toBeEnabled()
  );
  fireEvent.change(screen.getByRole('textbox', { name: /Amount to collect/i }), {
    target: { value: '40.25' },
  });
  expect(
    (screen.getByRole('textbox', { name: /Amount to collect/i }) as HTMLInputElement).value
  ).toContain('40.25');
  await selectOption(/Payment method/i, method);
  fireEvent.change(screen.getByLabelText(/School receipt date/i), {
    target: { value: '2026-11-17' },
  });
}
async function reviewAndRecord() {
  await userEvent.setup().click(screen.getByRole('button', { name: /Review payment/i }));
  const dialog = await screen.findByRole('dialog', { name: /Confirm payment/i });
  await userEvent.setup().click(within(dialog).getByRole('button', { name: /^Record payment$/i }));
}
function expectMoney(label: RegExp, amount: string) {
  const value = screen.getByText(label).nextElementSibling;
  expect(value).toBeInstanceOf(HTMLElement);
  expect(value?.textContent?.replace(/\s/g, '')).toMatch(
    new RegExp(`^(?:₹|INR)${amount.replace('.', '\\.')}$`)
  );
}

it('submits real UPI instrument fields to the selected school bank and preserves pending verification as reserved rather than settled', async () => {
  const scenario = cashierScenario('collect', { paymentMethod: 6 });
  mountChargeCashier(collectionGrants, { guardBusy: true });
  await waitFor(() => expect(scenario.seen).toContain('collect-form'));
  await enterCollection(/^UPI$/i);
  await selectOption(/Receiving school bank/i, /School recovery account.*8318/i);
  fireEvent.change(screen.getByRole('textbox', { name: /UPI ID\/VPA/i }), {
    target: { value: 'maya.jose@okaxis' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /^Transaction ID/i }), {
    target: { value: 'UPI202611170042' },
  });
  // An optional instrument date never acquires browser-today as a financial fact.
  const instrumentDate = screen.queryByLabelText(/^Payment Date$/i);
  if (instrumentDate) expect(instrumentDate).toHaveValue('');
  await reviewAndRecord();
  await waitFor(() => expect(scenario.collectionBodies).toHaveLength(1));

  const command = scenario.collectionBodies[0];
  expect(command).toMatchObject({
    source,
    revision: revisions.collection,
    schoolReceiptDate: '2026-11-17',
    idempotencyKey: expect.any(String),
  });
  expect(command.idempotencyKey).not.toBe('');
  expect(command.payments).toEqual([
    expect.objectContaining({
      paymentMethod: 6,
      amount: '40.25',
      bankAccountId: ids.receivingBank,
      details: expect.objectContaining({
        upiId: 'maya.jose@okaxis',
        upiTransactionId: 'UPI202611170042',
      }),
    }),
  ]);
  const { details } = (command.payments as { details: Record<string, string> }[])[0];
  expect(details).not.toHaveProperty('transactionId');
  ['memberId', 'studentId', 'paymentStatus', 'paidDate'].forEach((field) =>
    expect(command).not.toHaveProperty(field)
  );
  expect(scenario.routingQueries.length).toBeGreaterThan(0);
  scenario.routingQueries.forEach((query) =>
    expect(query).toMatchObject({ academicYearId: ids.sourceYear, operation: 'collection' })
  );
  await screen.findByText(/Payment submitted for bank verification/i);
  expectMoney(/^Settled$/i, '0.00');
  expectMoney(/^Pending verification$/i, '40.25');
  expectMoney(/^Financial outstanding$/i, '100.75');
  expectMoney(/^Collectible$/i, '60.50');
  expect(screen.queryByText(/^Paid$/i)).not.toBeInTheDocument();
  expect(screen.queryByText(/^Amount paid$/i)).not.toBeInTheDocument();
  expect(scenario.moneyIntentKeys).toEqual([command.idempotencyKey]);
  expect(scenario.forbidden).toEqual([]);
});

it('retrieves a lost cash result with the complete frozen command after a live ledger refresh and keeps edits and Close locked until recovery', async () => {
  const scenario = cashierScenario('collect', {
    paymentMethod: 0,
    loseFirstCollectionResponse: true,
  });
  const { store, onClose } = mountChargeCashier(collectionGrants, { guardBusy: true });
  await waitFor(() => expect(scenario.seen).toContain('collect-form'));
  await enterCollection(/^Cash$/i);
  await reviewAndRecord();
  await waitFor(() => expect(scenario.collectionBodies).toHaveLength(1));
  await screen.findByText(/The payment outcome is not confirmed/i);
  const original = structuredClone(scenario.collectionBodies[0]);
  expect(original).toMatchObject({
    source,
    revision: revisions.collection,
    schoolReceiptDate: '2026-11-17',
    idempotencyKey: expect.any(String),
    payments: [{ paymentMethod: 0, amount: '40.25' }],
  });
  expect(original.idempotencyKey).not.toBe('');

  // The server accepted the first intent before the transport failed. Refresh the
  // actual subscribed query to a new ledger revision and lower collectible balance.
  const refreshed = await store
    .dispatch(
      libraryFinanceApi.endpoints.getFinanceExternalCollectForm.initiate(source, {
        subscribe: false,
        forceRefetch: true,
      })
    )
    .unwrap();
  expect(refreshed.revision).toBe(revisions.settled);
  expect(refreshed.revision).not.toBe(original.revision);
  expect(refreshed.receivable).toMatchObject({
    settledPaymentAmount: 40.25,
    outstandingAmount: 60.5,
    financialOutstandingAmount: 60.5,
  });
  await waitFor(() =>
    expect(
      libraryFinanceApi.endpoints.getFinanceExternalCollectForm.select(source)(store.getState())
        .data?.revision
    ).toBe(revisions.settled)
  );
  expect(scenario.collectFormRevisions).toEqual(
    expect.arrayContaining([revisions.collection, revisions.settled])
  );

  expect(screen.getByLabelText(/Amount to collect/i)).toBeDisabled();
  expect(screen.getByLabelText(/School receipt date/i)).toBeDisabled();
  expect(screen.getByLabelText(/Payment method/i)).toHaveAttribute('aria-disabled', 'true');
  const closeButtons = screen
    .getAllByRole('button', { hidden: true })
    .filter((button) =>
      /^close$/i.test(button.getAttribute('aria-label') || button.textContent?.trim() || '')
    );
  expect(closeButtons.length).toBeGreaterThanOrEqual(2);
  closeButtons.forEach((button) => expect(button).toBeDisabled());
  const confirmation = screen.getByRole('dialog', { name: /Confirm payment/i });
  expect(within(confirmation).getByRole('button', { name: /^Cancel$/i })).toBeDisabled();
  expect(onClose).not.toHaveBeenCalled();

  await userEvent
    .setup()
    .click(within(confirmation).getByRole('button', { name: /^Retry same payment$/i }));
  await waitFor(() => expect(scenario.collectionBodies).toHaveLength(2));
  expect(scenario.collectionBodies[1]).toEqual(original);
  expect(scenario.moneyIntentKeys).toEqual([original.idempotencyKey]);
  await screen.findByText(/Payment recorded.*40\.25.*FCH-2026-000084/i);
  await userEvent.setup().click(screen.getByRole('button', { name: /View receipt/i }));
  await waitFor(() => expect(scenario.receiptPdfIds).toContain(ids.receipt));
  expect(scenario.receiptPdfIds).not.toContain(ids.collection);
  expect(scenario.forbidden).toEqual([]);
});
