import type { Dayjs } from 'dayjs';

import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { hasGrantedPermission } from 'src/utils/permissions';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import {
  refundIds,
  refundScenario,
  refundPermissions,
} from './AssignChargeProcessForm.refund.fixture';
import {
  ids,
  source,
  revisions,
  permissions,
  mountChargeCashier,
} from './AssignChargeProcessForm.finance.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({
  getSession: async () => ({ accessToken: 'actual-refund-operator-auth' }),
  signOut: vi.fn(),
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn(), warning: vi.fn() },
}));
vi.mock('next/image', () => ({
  default: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
// Only calendar presentation is replaced. The actual dialog, Redux grants/current
// year, RTK transport, Formik, decimal inputs and command decisions remain real.
vi.mock('@mui/x-date-pickers', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@mui/x-date-pickers')>();
  function CalendarPresentation({
    label,
    value,
    onChange,
    disabled,
    slotProps,
  }: {
    label?: string;
    value?: Dayjs | null;
    disabled?: boolean;
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
          value={value?.isValid() ? value.format('YYYY-MM-DDTHH:mm:ssZ') : ''}
          onBlur={() => slotProps?.textField?.onBlur?.()}
          onChange={(event) =>
            onChange?.(event.target.value ? dayjs(event.target.value) : null, {
              validationError: null,
            })
          }
        />
      </label>
    );
  }
  return { ...actual, DatePicker: CalendarPresentation, DateTimePicker: CalendarPresentation };
});
beforeEach(clearCachedAuthSession);
afterEach(cleanup);

async function choose(label: RegExp, option: RegExp) {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: option }));
}
async function openRefunds() {
  await userEvent
    .setup()
    .click(
      await screen.findByRole('button', { name: /^Refunds$|Refund activity|Request refund/i })
    );
}
async function confirmIfNeeded(commandCount: () => number, label: RegExp) {
  await waitFor(() => {
    if (!commandCount()) expect(screen.getByRole('button', { name: label })).toBeVisible();
  });
  if (!commandCount()) await userEvent.setup().click(screen.getByRole('button', { name: label }));
}
const noCollection = (store: ReturnType<typeof mountChargeCashier>['store']) => {
  expect(hasGrantedPermission(store.getState().auth.permissions, permissions.collectionView)).toBe(
    false
  );
  expect(hasGrantedPermission(store.getState().auth.permissions, permissions.collect)).toBe(false);
};

it('requests an Employee refund from an actual settled allocation while preserving requested paise and the server-calculated whole-rupee payout', async () => {
  const scenario = refundScenario('request');
  const { store } = mountChargeCashier([
    permissions.source,
    refundPermissions.view,
    refundPermissions.add,
  ]);
  noCollection(store);
  await openRefunds();
  await waitFor(() => expect(scenario.sourceQueries.length).toBeGreaterThan(0));
  await choose(/Paid receipt|Source receipt|Original receipt/i, /FCH-2026-000084/);
  fireEvent.change(
    await screen.findByRole('textbox', { name: /Refund amount|Requested amount/i }),
    { target: { value: '15.25' } }
  );
  await choose(/Payout method|Refund method/i, /^Cash$/);
  expect(screen.queryByRole('option', { name: /^UPI$/ })).not.toBeInTheDocument();
  fireEvent.change(
    await screen.findByRole('textbox', { name: /Refund reason|Reason for refund/i }),
    { target: { value: 'Approved book recovery correction.' } }
  );
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /Preview refund|Review refund/i }));
  await waitFor(() => expect(scenario.previewBodies).toHaveLength(1));
  expect(scenario.previewBodies[0]).toMatchObject({
    source,
    revision: revisions.settled,
    originalReceiptId: ids.receipt,
    method: 'Cash',
    lines: [
      { sourceAllocationId: refundIds.allocation, sourceReceiptId: ids.receipt, amount: '15.25' },
    ],
  });
  await screen.findByText(/^Requested amount:\s*(?:₹|INR)\s*15\.25$/);
  await screen.findByText(/^Calculated payout:\s*(?:₹|INR)\s*15(?:\.00)?$/);
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /^(?:Submit refund|Request refund)$/i }));
  await confirmIfNeeded(
    () => scenario.requestBodies.length,
    /Confirm refund|Submit refund request/i
  );
  await waitFor(() => expect(scenario.requestBodies).toHaveLength(1));
  expect(scenario.requestBodies[0]).toMatchObject({
    ...scenario.previewBodies[0],
    idempotencyKey: expect.any(String),
    reason: 'Approved book recovery correction.',
  });
  [
    'studentId',
    'memberId',
    'calculatedAmount',
    'processedAmount',
    'paymentStatus',
    'paidDate',
  ].forEach((key) => expect(scenario.requestBodies[0]).not.toHaveProperty(key));
  scenario.sourceQueries.forEach((query) =>
    expect(query).toMatchObject({
      kind: '1',
      sourceId: ids.assessment,
      sourceVersion: source.sourceVersion,
    })
  );
  expect(scenario.common.collectionBodies).toEqual([]);
  expect(scenario.forbidden).toEqual([]);
});

it('independently approves a cash refund through saved-year expense routing and treats its canonical response as the only payout', async () => {
  const scenario = refundScenario('approve-cash');
  const { store } = mountChargeCashier([
    permissions.source,
    refundPermissions.view,
    refundPermissions.approve,
    refundPermissions.process,
  ]);
  noCollection(store);
  expect(hasGrantedPermission(store.getState().auth.permissions, refundPermissions.add)).toBe(
    false
  );
  await openRefunds();
  await screen.findByText('RF-2026-000032');
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /^Approve(?: refund)?$/i }));
  await choose(/Expense category/i, /Library refunds/);
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /Approve.*(?:cash|pay)|Confirm.*approval/i }));
  await confirmIfNeeded(
    () => scenario.approvalBodies.length,
    /Confirm.*(?:approval|cash)|Approve.*pay/i
  );
  await waitFor(() => expect(scenario.approvalBodies).toHaveLength(1));
  expect(scenario.approvalBodies[0]).toMatchObject({
    expenseCategoryId: refundIds.expense,
    method: 'Cash',
  });
  expect(scenario.payoutBodies).toEqual([]);
  scenario.routingQueries.forEach((query) =>
    expect(query).toMatchObject({ academicYearId: ids.sourceYear, operation: 'refund' })
  );
  expect(scenario.routingQueries.length).toBeGreaterThan(0);
  await screen.findAllByText(/Completed|Payment recorded/i);
  expect(scenario.forbidden).toEqual([]);
});

it('records the approved Employee UPI refund using the actual saved-year school bank and explicit payout instant', async () => {
  const scenario = refundScenario('payout-upi');
  const { store } = mountChargeCashier([
    permissions.source,
    refundPermissions.view,
    refundPermissions.process,
  ]);
  noCollection(store);
  await openRefunds();
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /Record payment|Record payout/i }));
  await choose(/Expense category/i, /Library refunds/);
  await choose(/Source school bank|Paying school bank/i, /8318/);
  fireEvent.change(
    await screen.findByRole('textbox', { name: /UPI transaction ID|Payment reference/i }),
    { target: { value: 'UPI202611180042' } }
  );
  fireEvent.change(await screen.findByLabelText(/Payout date|Payment date/i), {
    target: { value: '2026-11-18T13:30:00+05:30' },
  });
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /^Record payment$|^Review payment$/i }));
  await confirmIfNeeded(() => scenario.payoutBodies.length, /Confirm.*payment|Record payment/i);
  await waitFor(() => expect(scenario.payoutBodies).toHaveLength(1));
  expect(scenario.payoutBodies[0]).toMatchObject({
    method: 'UPI',
    amount: 15,
    expenseCategoryId: refundIds.expense,
    bankAccountId: ids.receivingBank,
    externalReference: 'UPI202611180042',
    idempotencyKey: expect.any(String),
  });
  expect(dayjs(String(scenario.payoutBodies[0].paymentDate)).toISOString()).toBe(
    '2026-11-18T08:00:00.000Z'
  );
  expect(scenario.approvalBodies).toEqual([]);
  expect(scenario.requestBodies).toEqual([]);
  expect(scenario.forbidden).toEqual([]);
});

it('returns the actual noncash payout with reason and evidence while retaining the original refund and receipt history', async () => {
  const scenario = refundScenario('return-upi');
  mountChargeCashier([permissions.source, refundPermissions.view, refundPermissions.reverse]);
  await openRefunds();
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /Return payout|Record return/i }));
  fireEvent.change(await screen.findByRole('textbox', { name: /Return reason|Reason/i }), {
    target: { value: 'The bank returned this original payout.' },
  });
  fireEvent.change(await screen.findByRole('textbox', { name: /Evidence reference/i }), {
    target: { value: 'BANK-RETURN-8214' },
  });
  await userEvent
    .setup()
    .click(await screen.findByRole('button', { name: /Confirm return|Record return/i }));
  await waitFor(() => expect(scenario.returnBodies).toHaveLength(1));
  expect(scenario.returnBodies[0]).toEqual({
    settlementId: refundIds.settlement,
    reason: 'The bank returned this original payout.',
    evidenceReference: 'BANK-RETURN-8214',
  });
  expect(scenario.payoutBodies).toEqual([]);
  expect(scenario.common.collectionBodies).toEqual([]);
  await screen.findByText('RF-2026-000032');
  await screen.findAllByText(/FCH-2026-000084/);
  expect(scenario.forbidden).toEqual([]);
});
