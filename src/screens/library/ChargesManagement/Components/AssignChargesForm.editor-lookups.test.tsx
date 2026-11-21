import type { Dayjs } from 'dayjs';

import React from 'react';
import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { mswServer } from 'src/test/mswServer';
import { http, delay, HttpResponse } from 'msw';
import { configureStore } from '@reduxjs/toolkit';
import userEvent from '@testing-library/user-event';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import confirmReducer from 'src/redux/confirmPopup/confirmPopupSlice';
import { LibraryChargeStatusType } from 'src/enums/library_charges_type';
import { defaultSettings } from 'src/components/settings/config-settings';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LibraryChargeApi } from 'src/redux/library/charges-management/charges-get-api';

import AssignChargesForm from './AssignChargesForm';

dayjs.extend(customParseFormat);
dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('next/image', () => ({
  default: function DecorativeImage({ alt }: { alt: string }) {
    return <span role="img" aria-label={alt} />;
  },
}));

// Keep real Formik/schema/Redux/RTK/query/auth/payload/numeric input/submit wiring.
// Only the picker popup presentation is replaced, exactly as in civil-submit.
vi.mock('@mui/x-date-pickers', async () => {
  const { default: actualDayjs } = await import('dayjs');
  return {
    DatePicker: function ControlledCalendarInput({
      label,
      value,
      onChange,
      disabled,
      readOnly,
    }: {
      label: string;
      value?: Dayjs | null;
      disabled?: boolean;
      readOnly?: boolean;
      onChange(value: Dayjs | null, context: { validationError: null }): void;
    }) {
      const id = React.useId();
      return (
        <label htmlFor={id}>
          {label}
          <input
            id={id}
            aria-label={label}
            disabled={disabled}
            readOnly={readOnly}
            value={value?.isValid() ? value.format('YYYY-MM-DD') : ''}
            onChange={(event) =>
              onChange(event.target.value ? actualDayjs(event.target.value) : null, {
                validationError: null,
              })
            }
          />
        </label>
      );
    },
  };
});

const root = 'http://library.test/api';
const yearId = '268cd088-b405-4325-8749-365e6778ab33';
const otherYearId = '3cc0d054-5ce6-4310-94ba-4cd36c6f42c8';
const memberId = '5c68d95f-73ba-4207-a337-71e6396ffec7';
const categoryId = 'b2469347-174e-4d65-af7e-c08d3bc39021';
const chargeId = '6b3dd3b8-4590-4471-b927-71c874d31bda';
const loanId = 'a5431f16-8f43-45f2-a93b-fb74b9edb176';
const copyId = '37f3cf8c-a39d-4cdf-b6b7-4f4fbcbba493';
const opaqueVersion = ' exact original assessment version +/=: ';
const theme = createTheme(defaultSettings);
const member = {
  id: memberId,
  memberName: 'Maya José',
  memberIdentifier: 'STAFF-84',
  role: 1,
  hasActiveLibraryMembership: true,
  canAssignDirect: false,
  requiresLoanSource: true,
};
const loan = {
  loanId,
  canonicalMemberId: memberId,
  copyId,
  bookId: 'b8862124-1033-499f-9bbd-70f098b19c0f',
  role: 1,
  accessionNumber: 'ACC-0042',
  title: 'Stories from the school library',
  loanAcademicYearId: otherYearId,
  status: 1,
  schoolIssueDate: '2026-11-17',
  schoolDueDate: '2026-11-24',
  issueDateProvenance: 1,
  dueDateProvenance: 1,
};
const assessment = {
  id: chargeId,
  memberId,
  memberName: member.memberName,
  role: 1,
  chargeCategoryId: categoryId,
  chargeType: 'Reviewed damage',
  bookIssueId: loanId,
  bookTitle: loan.title,
  accessionNo: loan.accessionNumber,
  amount: 100.75,
  academicYearId: yearId,
  academicYearProvenance: 3,
  schoolChargeDate: '2026-11-17',
  schoolDueDate: '2026-11-24',
  chargeDateProvenance: 1,
  dueDateProvenance: 1,
  chargeDate: null,
  dueDate: null,
  sourceVersion: opaqueVersion,
  paymentStatus: 0,
  financeSourceLinkId: null,
  remarks: 'Saved reviewed assessment.',
};
const page = (items: unknown[]) => ({
  items,
  totalCount: items.length,
  currentPage: 1,
  pageSize: 20,
  totalPages: 1,
});
beforeEach(clearCachedAuthSession);

function editorStore(action: 'Add' | 'Update', currentYearId = yearId) {
  return configureStore({
    reducer: {
      globalState: () => ({
        currentYear: { id: currentYearId, name: 'Explicit selected school context' },
        currentBoard: {},
        currentMedium: {},
      }),
      confirmPopup: confirmReducer,
      auth: () => ({
        permissions: ['Library.Charges.View', `Library.Charges.${action}`].map((name) => ({
          name,
          isGranted: true,
        })),
      }),
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
}

function denyUnrelatedLookups(calls: string[], denyCreateLookups = false) {
  const denied = ({ request }: { request: Request }) => {
    calls.push(new URL(request.url).pathname);
    return HttpResponse.json(
      { errorCode: 'FORBIDDEN', detail: 'The charge editor has no unrelated read grant.' },
      { status: 403 }
    );
  };
  mswServer.use(
    http.get(`${root}/library/charge-categories`, denied),
    http.get(`${root}/library/members`, denied),
    http.get(`${root}/library/members/:id`, denied),
    http.get(`${root}/library/books/*`, denied),
    http.get(`${root}/library/circulation/*`, denied),
    http.get(`${root}/library/charges/${chargeId}`, denied)
  );
  if (denyCreateLookups)
    mswServer.use(
      ...['categories', 'members', 'member', 'loans'].map((operation) =>
        http.get(`${root}/library/charges/editor/${operation}`, denied)
      )
    );
}

it('creates a source-bound assessment using only its owning lookup grants and the explicitly selected server loan', async () => {
  const unrelated: string[] = [];
  const seen: string[] = [];
  let submitted: Record<string, unknown> | undefined;
  denyUnrelatedLookups(unrelated);
  mswServer.use(
    http.get(`${root}/library/charges/editor/categories`, ({ request }) => {
      expect(new URL(request.url).searchParams.get('academicYearId')).toBe(yearId);
      seen.push('categories');
      return HttpResponse.json(
        page([
          {
            id: categoryId,
            academicYearId: yearId,
            name: 'Reviewed damage',
            amount: 100.75,
            isFixed: false,
          },
        ])
      );
    }),
    http.get(`${root}/library/charges/editor/members`, () => HttpResponse.json(page([member]))),
    http.get(`${root}/library/charges/editor/member`, ({ request }) => {
      const query = new URL(request.url).searchParams;
      expect(query.get('academicYearId')).toBe(yearId);
      expect(query.get('identifier')).toBe(member.memberIdentifier);
      seen.push('member');
      return HttpResponse.json(member);
    }),
    http.get(`${root}/library/charges/editor/loans`, ({ request }) => {
      const query = new URL(request.url).searchParams;
      expect(query.get('academicYearId')).toBe(yearId);
      expect(query.get('memberId')).toBe(memberId);
      seen.push('loans');
      return HttpResponse.json(page([loan]));
    }),
    http.post(`${root}/library/charges`, async ({ request }) => {
      submitted = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({ id: chargeId, message: 'Assessment created.' }, { status: 201 });
    })
  );
  const store = editorStore('Add');
  const onClose = vi.fn();
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AssignChargesForm open onClose={onClose} />
      </ThemeProvider>
    </Provider>
  );
  const user = userEvent.setup();

  await waitFor(() => expect(seen).toContain('categories'));
  const memberInput = screen.queryByRole('textbox', { name: /^Member ID/i });
  if (memberInput) {
    fireEvent.change(memberInput, { target: { value: member.memberIdentifier } });
    await waitFor(() => expect(seen).toContain('member'), { timeout: 4000 });
  } else {
    await user.click(screen.getByRole('combobox', { name: /^Member/i }));
    await user.click(await screen.findByRole('option', { name: /Maya José/ }));
  }
  await screen.findAllByText(member.memberName);
  await waitFor(() => expect(seen).toContain('loans'));
  await user.click(screen.getByRole('combobox', { name: /Loan source/i }));
  await user.click(
    await screen.findByRole('option', { name: /ACC-0042|Stories from the school library/ })
  );
  await user.click(screen.getByRole('combobox', { name: /Charge category/i }));
  await user.click(await screen.findByRole('option', { name: 'Reviewed damage' }));
  fireEvent.change(screen.getByRole('textbox', { name: /^Amount/i }), {
    target: { value: '100.75' },
  });
  fireEvent.change(screen.getByLabelText(/Assessment date|Charge date/i), {
    target: { value: '2026-11-17' },
  });
  fireEvent.change(screen.getByLabelText(/Due date/i), { target: { value: '2026-11-30' } });
  fireEvent.change(screen.getByRole('textbox', { name: /Reason/i }), {
    target: { value: 'Reviewed actual loan-linked damage.' },
  });
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(submitted).toBeDefined());

  expect(submitted).toEqual({
    memberId,
    bookIssueId: loanId,
    chargeCategoryId: categoryId,
    amount: 100.75,
    academicYearId: yearId,
    schoolChargeDate: '2026-11-17',
    schoolDueDate: '2026-11-30',
    remarks: 'Reviewed actual loan-linked damage.',
  });
  expect(submitted?.bookIssueId).not.toBe(loan.accessionNumber);
  expect(unrelated).toEqual([]);
  await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
});

it('amends an existing assessment from its fresh owned context while keeping source facts read-only', async () => {
  const unrelated: string[] = [];
  const seen: string[] = [];
  let submitted: Record<string, unknown> | undefined;
  denyUnrelatedLookups(unrelated, true);
  mswServer.use(
    http.get(`${root}/library/charges/${chargeId}/editor`, () => {
      seen.push('context');
      return HttpResponse.json({
        assessment,
        canAmend: true,
        requiresContextReview: false,
        amendmentBlockedReason: null,
      });
    }),
    http.put(`${root}/library/charges/${chargeId}`, async ({ request }) => {
      submitted = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({ id: chargeId, message: 'Assessment amended.' });
    })
  );
  // The saved billing year differs from the current global selector. A stale list
  // row is deliberately not authority for the opened editor's actual version.
  const savedRow = {
    id: chargeId,
    memberId,
    memberName: member.memberName,
    role: 'Staff',
    academicYearId: yearId,
    chargeCategory: categoryId,
    chargeCategoryId: categoryId,
    chargeType: 'Reviewed damage',
    fineAmount: 100.75,
    reason: assessment.remarks,
    status: LibraryChargeStatusType.Pending,
    bookIssueId: loanId,
    bookTitle: loan.title,
    bookNumber: loan.accessionNumber,
    accessionNo: loan.accessionNumber,
    sourceVersion: 'stale-list-version',
    schoolChargeDate: assessment.schoolChargeDate,
    schoolDueDate: assessment.schoolDueDate,
    chargeDateProvenance: 1,
    dueDateProvenance: 1,
  };
  const store = editorStore('Update', otherYearId);
  const onClose = vi.fn();
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AssignChargesForm open onClose={onClose} editData={savedRow} />
      </ThemeProvider>
    </Provider>
  );
  await waitFor(() => expect(seen).toContain('context'));
  await screen.findAllByText(member.memberName);
  await screen.findAllByText(loan.title);
  await screen.findAllByText('Reviewed damage');
  [
    screen.queryByRole('textbox', { name: /^Member ID/i }),
    screen.queryByRole('textbox', { name: /^Accession/i }),
    screen.queryByRole('combobox', { name: /Loan source/i }),
    screen.queryByRole('combobox', { name: /Charge category/i }),
  ].forEach((control) => {
    if (control)
      expect(
        control.hasAttribute('disabled') ||
          control.getAttribute('aria-disabled') === 'true' ||
          control.hasAttribute('readonly')
      ).toBe(true);
  });
  const originalDate = screen.getByLabelText(/Assessment date|Charge date/i);
  expect(originalDate).toHaveValue('2026-11-17');
  expect(originalDate.hasAttribute('disabled') || originalDate.hasAttribute('readonly')).toBe(true);
  fireEvent.change(screen.getByRole('textbox', { name: /^Amount/i }), {
    target: { value: '110.75' },
  });
  fireEvent.change(screen.getByLabelText(/Due date/i), { target: { value: '2026-12-01' } });
  fireEvent.change(screen.getByRole('textbox', { name: /Reason/i }), {
    target: { value: 'Reviewed the current saved source before amendment.' },
  });
  await userEvent.setup().click(screen.getByRole('button', { name: /^(Update|Submit)$/ }));
  await waitFor(() => expect(submitted).toBeDefined());

  expect(submitted).toEqual({
    amount: 110.75,
    schoolDueDate: '2026-12-01',
    expectedSourceVersion: opaqueVersion,
    remarks: 'Reviewed the current saved source before amendment.',
  });
  expect(unrelated).toEqual([]);
  await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
});

function mountCacheRegressionEditor(
  store: ReturnType<typeof editorStore>,
  onClose: React.ComponentProps<typeof AssignChargesForm>['onClose']
) {
  const staleRow = {
    id: chargeId,
    memberId,
    memberName: member.memberName,
    role: 'Staff',
    academicYearId: yearId,
    chargeCategory: categoryId,
    chargeCategoryId: categoryId,
    chargeType: assessment.chargeType,
    fineAmount: 5,
    reason: 'Stale list row; never authority for an opened editor.',
    status: LibraryChargeStatusType.Pending,
    bookIssueId: loanId,
    bookTitle: loan.title,
    bookNumber: loan.accessionNumber,
    accessionNo: loan.accessionNumber,
    sourceVersion: 'stale-table-version',
    schoolChargeDate: assessment.schoolChargeDate,
    schoolDueDate: assessment.schoolDueDate,
    chargeDateProvenance: 1,
    dueDateProvenance: 1,
  };
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AssignChargesForm open onClose={onClose} editData={staleRow} />
      </ThemeProvider>
    </Provider>
  );
}

it('opens a warm-cached assessment against the completed fresh context before submitting its version', async () => {
  const unrelated: string[] = [];
  const oldVersion = 'warm-cache:OLD +/=: opaque';
  const newVersion = 'fresh-open:NEW +/=: opaque';
  const oldContext = {
    assessment: {
      ...assessment,
      currency: 'INR',
      amount: 90.75,
      sourceVersion: oldVersion,
      remarks: 'Previously cached server assessment.',
    },
    canAmend: true,
    requiresContextReview: false,
    amendmentBlockedReason: null,
  };
  const newContext = {
    assessment: {
      ...assessment,
      currency: 'INR',
      amount: 95.25,
      sourceVersion: newVersion,
      remarks: 'Current server assessment returned for this open.',
    },
    canAmend: true,
    requiresContextReview: false,
    amendmentBlockedReason: null,
  };
  let contextReads = 0;
  let submitted: Record<string, unknown> | undefined;
  denyUnrelatedLookups(unrelated, true);
  mswServer.use(
    http.get(`${root}/library/charges/${chargeId}/editor`, async () => {
      contextReads += 1;
      if (contextReads === 1) return HttpResponse.json(oldContext);
      await delay(100);
      return HttpResponse.json(newContext);
    }),
    http.put(`${root}/library/charges/${chargeId}`, async ({ request }) => {
      submitted = (await request.json()) as Record<string, unknown>;
      if (submitted.expectedSourceVersion !== newVersion)
        return HttpResponse.json(
          {
            errorCode: 'Library:Finance:010102',
            detail: 'The assessment changed. Reload it before applying an amendment.',
          },
          { status: 409 }
        );
      return HttpResponse.json({
        id: chargeId,
        message: 'Assessment amended against its current version.',
      });
    })
  );
  const store = editorStore('Update', otherYearId);
  const args = { chargeId };
  const endpoint = LibraryChargeApi.endpoints.getLibraryChargeEditorContext;
  // Real RTK fulfilment creates the warm cache. No query state, hook result,
  // reducer, form snapshot, payload adapter or request dispatch is mocked.
  await store.dispatch(endpoint.initiate(args, { subscribe: false })).unwrap();
  expect(endpoint.select(args)(store.getState()).status).toBe('fulfilled');
  expect(endpoint.select(args)(store.getState()).data?.assessment.sourceVersion).toBe(oldVersion);
  expect(contextReads).toBe(1);
  const onClose = vi.fn();
  mountCacheRegressionEditor(store, onClose);

  // Prove the forced mount GET really reached the server and Redux now holds
  // NEW before inspecting the submitted token. A slow request is not this failure.
  await waitFor(() => {
    const current = endpoint.select(args)(store.getState());
    expect(contextReads).toBeGreaterThanOrEqual(2);
    expect(current.status).toBe('fulfilled');
    expect(current.data?.assessment.sourceVersion).toBe(newVersion);
  });
  const amount = await screen.findByRole('textbox', { name: /^Amount/i });
  fireEvent.change(amount, { target: { value: '110.75' } });
  fireEvent.change(screen.getByRole('textbox', { name: /Reason/i }), {
    target: { value: 'Reviewed the fresh server context before amending.' },
  });
  await userEvent.setup().click(screen.getByRole('button', { name: /^(Submit|Update)$/ }));
  await waitFor(() => expect(submitted).toBeDefined());

  expect(submitted?.expectedSourceVersion).toBe(newVersion);
  expect(submitted).toEqual({
    amount: 110.75,
    schoolDueDate: assessment.schoolDueDate,
    expectedSourceVersion: newVersion,
    remarks: 'Reviewed the fresh server context before amending.',
  });
  expect(submitted?.expectedSourceVersion).not.toBe(oldVersion);
  expect(submitted?.expectedSourceVersion).not.toBe('stale-table-version');
  expect(unrelated).toEqual([]);
  await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
});

it('retains an edited draft and its opened version across a background context refresh and server conflict', async () => {
  const unrelated: string[] = [];
  const openedVersion = 'opened:V1 +/=: opaque';
  const changedVersion = 'background:V2 +/=: opaque';
  const conflictDetail = 'The assessment changed. Reload it before applying an amendment.';
  const originalContext = {
    assessment: {
      ...assessment,
      currency: 'INR',
      amount: 100.75,
      sourceVersion: openedVersion,
      remarks: 'Original server assessment before the operator began editing.',
    },
    canAmend: true,
    requiresContextReview: false,
    amendmentBlockedReason: null,
  };
  const changedContext = {
    assessment: {
      ...assessment,
      currency: 'INR',
      amount: 80.25,
      sourceVersion: changedVersion,
      schoolDueDate: '2026-12-15',
      remarks: 'Another operator changed the assessment.',
    },
    canAmend: true,
    requiresContextReview: false,
    amendmentBlockedReason: null,
  };
  let contextReads = 0;
  let submitted: Record<string, unknown> | undefined;
  denyUnrelatedLookups(unrelated, true);
  mswServer.use(
    http.get(`${root}/library/charges/${chargeId}/editor`, async () => {
      contextReads += 1;
      if (contextReads === 1) return HttpResponse.json(originalContext);
      await delay(100);
      return HttpResponse.json(changedContext);
    }),
    http.put(`${root}/library/charges/${chargeId}`, async ({ request }) => {
      submitted = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(
        { errorCode: 'Library:Finance:010102', detail: conflictDetail },
        { status: 409 }
      );
    })
  );
  const store = editorStore('Update', otherYearId);
  const args = { chargeId };
  const endpoint = LibraryChargeApi.endpoints.getLibraryChargeEditorContext;
  const onClose = vi.fn();
  mountCacheRegressionEditor(store, onClose);
  await screen.findAllByText(member.memberName);
  await waitFor(() => {
    const current = endpoint.select(args)(store.getState());
    expect(current.status).toBe('fulfilled');
    expect(current.data?.assessment.sourceVersion).toBe(openedVersion);
  });
  const amount = screen.getByRole('textbox', { name: /^Amount/i });
  const reason = screen.getByRole('textbox', { name: /Reason/i });
  const draftReason = 'My unsaved reviewed amendment must survive the background refresh.';
  fireEvent.change(amount, { target: { value: '110.75' } });
  fireEvent.change(reason, { target: { value: draftReason } });
  expect(amount).toHaveValue('₹ 110.75');
  expect(reason).toHaveValue(draftReason);

  // Trigger an actual new request through the real endpoint. subscribe:false
  // adds no second durable subscription; the mounted hook remains subscribed.
  await act(async () => {
    await store
      .dispatch(endpoint.initiate(args, { subscribe: false, forceRefetch: true }))
      .unwrap();
  });
  const refreshed = endpoint.select(args)(store.getState());
  expect(contextReads).toBeGreaterThanOrEqual(2);
  expect(refreshed.status).toBe('fulfilled');
  expect(refreshed.data?.assessment.sourceVersion).toBe(changedVersion);
  expect(screen.getByRole('textbox', { name: /^Amount/i })).toHaveValue('₹ 110.75');
  expect(screen.getByRole('textbox', { name: /Reason/i })).toHaveValue(draftReason);
  expect(screen.getByLabelText(/Due date/i)).toHaveValue(assessment.schoolDueDate);
  await userEvent.setup().click(screen.getByRole('button', { name: /^(Submit|Update)$/ }));
  await waitFor(() => expect(submitted).toBeDefined());

  expect(submitted).toEqual({
    amount: 110.75,
    schoolDueDate: assessment.schoolDueDate,
    expectedSourceVersion: openedVersion,
    remarks: draftReason,
  });
  expect(submitted?.expectedSourceVersion).not.toBe(changedVersion);
  await screen.findByText(conflictDetail);
  expect(screen.getByRole('textbox', { name: /^Amount/i })).toHaveValue('₹ 110.75');
  expect(screen.getByRole('textbox', { name: /Reason/i })).toHaveValue(draftReason);
  expect(onClose).not.toHaveBeenCalled();
  expect(unrelated).toEqual([]);
});
