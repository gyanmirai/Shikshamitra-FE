import type { Dayjs } from 'dayjs';

import React from 'react';
import dayjs from 'dayjs';
import userEvent from '@testing-library/user-event';
import { hasGrantedPermission } from 'src/utils/permissions';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { it, vi, expect, afterEach, beforeEach } from 'vitest';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

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

const editable = (element: HTMLElement) =>
  !element.hasAttribute('disabled') &&
  !element.hasAttribute('readonly') &&
  element.getAttribute('aria-disabled') !== 'true';
async function choose(label: RegExp, option: RegExp) {
  const user = userEvent.setup();
  await user.click(await screen.findByRole('combobox', { name: label }));
  await user.click(await screen.findByRole('option', { name: option }));
}
function fillReason(preferred: RegExp, value: string) {
  const specific = screen.queryAllByRole('textbox', { name: preferred }).filter(editable);
  const fields = specific.length
    ? specific
    : screen.queryAllByRole('textbox', { name: /Reason|Review note|Notes/i }).filter(editable);
  expect(
    fields.length,
    'The authorized decision requires an editable recorded reason.'
  ).toBeGreaterThan(0);
  fireEvent.change(fields[0], { target: { value } });
}
function expectFreshSourceQueries(queries: Record<string, string>[]) {
  expect(queries.length).toBeGreaterThan(0);
  queries.forEach((query) => {
    expect(query).toMatchObject({
      kind: '1',
      sourceId: ids.assessment,
      sourceVersion: source.sourceVersion,
    });
    expect(query).not.toHaveProperty('memberId');
    expect(query).not.toHaveProperty('academicYearId');
  });
}
function expectFinanceCommand(body: Record<string, unknown>, revision: string) {
  expect(body).toMatchObject({ source, revision, idempotencyKey: expect.any(String) });
  expect(body.idempotencyKey).not.toBe('');
  ['memberId', 'studentId', 'paymentStatus', 'paidDate'].forEach((field) =>
    expect(body).not.toHaveProperty(field)
  );
}

it('posts a reviewed Employee assessment from fresh owning options without requiring a fee assignment or declaring it paid', async () => {
  const scenario = cashierScenario('post');
  mountChargeCashier([permissions.source, permissions.view, permissions.post]);
  await waitFor(() => expect(scenario.seen).toContain('assessment'));
  await waitFor(() => expect(scenario.seen).toContain('posting-options'));
  await choose(/Finance.*category|Charge category/i, /Library recoveries/);
  await userEvent.setup().click(
    await screen.findByRole('button', {
      name: /Post.*Finance|Create.*Finance.*(?:charge|obligation)|Create.*receivable/i,
    })
  );
  await waitFor(() => expect(scenario.postBodies).toHaveLength(1));

  expect(scenario.postBodies[0]).toMatchObject({
    source,
    financeChargeCategoryId: ids.financeCategory,
    idempotencyKey: expect.any(String),
  });
  expect(scenario.postBodies[0].financeChargeCategoryId).not.toBe(ids.libraryCategory);
  expect(scenario.postBodies[0].idempotencyKey).not.toBe('');
  ['memberId', 'studentId', 'amount', 'paymentStatus', 'paidDate'].forEach((field) =>
    expect(scenario.postBodies[0]).not.toHaveProperty(field)
  );
  await screen.findAllByText(/Pending approval|Awaiting independent approval|Awaiting approval/i);
  expect(scenario.collectionBodies).toEqual([]);
  expectFreshSourceQueries(scenario.sourceQueries);
  expect(scenario.forbidden).toEqual([]);
});

it('binds an actual policy version and independently approves using owning contexts without FeeCollections.View', async () => {
  const scenario = cashierScenario('review');
  const { store } = mountChargeCashier([
    permissions.source,
    permissions.view,
    permissions.bind,
    permissions.approve,
  ]);
  expect(hasGrantedPermission(store.getState().auth.permissions, permissions.collectionView)).toBe(
    false
  );
  expect(hasGrantedPermission(store.getState().auth.permissions, permissions.bind)).toBe(true);
  expect(hasGrantedPermission(store.getState().auth.permissions, permissions.approve)).toBe(true);
  const user = userEvent.setup();
  const configureLabel = /Configure.*polic|Set.*polic|Bind.*polic|Confirm.*polic/i;
  await waitFor(() => {
    if (scenario.seen.includes('binding-context')) return;
    expect(screen.getByRole('button', { name: configureLabel })).toBeVisible();
  });
  if (!scenario.seen.includes('binding-context'))
    await user.click(screen.getByRole('button', { name: configureLabel }));
  await waitFor(() => expect(scenario.seen).toContain('binding-context'));
  await choose(/Collection policy/i, /Recorded collection rules v3/);
  fillReason(
    /Policy reason|Reason.*policy|Reason for policy/i,
    'Confirmed the recorded school recovery version.'
  );
  await user.click(
    await screen.findByRole('button', { name: /Confirm.*polic|Bind.*polic|Save.*polic/i })
  );
  await waitFor(() => expect(scenario.bindBodies).toHaveLength(1));
  expectFinanceCommand(scenario.bindBodies[0], revisions.binding);
  expect(scenario.bindBodies[0].collectionPolicyVersionId).toBe(ids.collectionVersion);
  expect(scenario.bindBodies[0].collectionPolicyVersionId).not.toBe(ids.collectionPolicy);

  await waitFor(() => expect(scenario.seen).toContain('approval-context'));
  fillReason(
    /Approval reason|Review reason|Reason.*approv/i,
    'Independently reviewed the original Library assessment.'
  );
  await user.click(await screen.findByRole('button', { name: /^Approve(?:\s+.*)?$/i }));
  await waitFor(() => expect(scenario.approvalBodies).toHaveLength(1));
  expectFinanceCommand(scenario.approvalBodies[0], revisions.approval);
  expect(scenario.seen).toContain('assessment');
  expect(scenario.seen).not.toContain('collect-form');
  expect(scenario.postBodies).toEqual([]);
  expect(scenario.collectionBodies).toEqual([]);
  expectFreshSourceQueries(scenario.sourceQueries);
  expect(scenario.forbidden).toEqual([]);
});

it('collects an approved partial amount with an explicit school receipt date and opens the returned receipt ID through Finance', async () => {
  const scenario = cashierScenario('collect');
  mountChargeCashier([
    permissions.source,
    permissions.view,
    permissions.collectionView,
    permissions.collect,
    permissions.receiptView,
  ]);
  await waitFor(() => expect(scenario.seen).toContain('collect-form'));
  const amount = screen
    .getAllByRole('textbox', { name: /Amount to collect|Payment amount|^Amount(?:\s*\*)?$/i })
    .filter(editable)[0];
  expect(amount).toBeDefined();
  fireEvent.change(amount, { target: { value: '40.25' } });
  expect((amount as HTMLInputElement).value).toContain('40.25');
  const method = screen.getByRole('combobox', { name: /Payment method/i });
  await userEvent.setup().click(method);
  await userEvent.setup().click(await screen.findByRole('option', { name: /^Cash$/i }));
  fireEvent.change(await screen.findByLabelText(/School receipt date|Receipt date/i), {
    target: { value: '2026-11-17' },
  });
  await userEvent.setup().click(
    await screen.findByRole('button', {
      name: /^(?:Collect(?: payment)?|Submit|Review payment)$/i,
    })
  );
  await waitFor(() => {
    if (scenario.collectionBodies.length) return;
    expect(
      screen.getByRole('button', {
        name: /Confirm.*(?:collection|payment)|Accept payment|Record payment|Collect.*issue receipt/i,
      })
    ).toBeVisible();
  });
  if (!scenario.collectionBodies.length) {
    await userEvent.setup().click(
      screen.getByRole('button', {
        name: /Confirm.*(?:collection|payment)|Accept payment|Record payment|Collect.*issue receipt/i,
      })
    );
  }
  await waitFor(() => expect(scenario.collectionBodies).toHaveLength(1));
  const body = scenario.collectionBodies[0];
  expectFinanceCommand(body, revisions.collection);
  expect(body.schoolReceiptDate).toBe('2026-11-17');
  expect(body.payments).toEqual([expect.objectContaining({ paymentMethod: 0, amount: '40.25' })]);
  ['amount', 'dueFeePayments', 'chargePayments', 'paymentConfirmed'].forEach((field) =>
    expect(body).not.toHaveProperty(field)
  );

  await waitFor(() => {
    if (scenario.receiptPdfIds.includes(ids.receipt)) return;
    expect(
      screen.getByRole('button', {
        name: /View.*receipt|Open.*receipt|Preview.*receipt|Download.*receipt/i,
      })
    ).toBeVisible();
  });
  if (!scenario.receiptPdfIds.includes(ids.receipt)) {
    await userEvent.setup().click(
      screen.getByRole('button', {
        name: /View.*receipt|Open.*receipt|Preview.*receipt|Download.*receipt/i,
      })
    );
  }
  await waitFor(() => expect(scenario.receiptPdfIds).toContain(ids.receipt));
  expect(scenario.receiptPdfIds).not.toContain(ids.collection);
  expect(scenario.receiptDetailIds.every((id) => id === ids.receipt)).toBe(true);
  expect(scenario.seen).toContain('assessment');
  expectFreshSourceQueries(scenario.sourceQueries);
  expect(scenario.forbidden).toEqual([]);
});
