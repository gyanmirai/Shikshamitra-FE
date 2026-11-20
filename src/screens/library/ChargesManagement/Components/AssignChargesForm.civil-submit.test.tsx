import type { Dayjs } from 'dayjs';

import React from 'react';
import dayjs from 'dayjs';
import { Provider } from 'react-redux';
import { api } from 'src/redux/service';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
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
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import AssignChargesForm from 'src/screens/library/ChargesManagement/Components/AssignChargesForm';

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

// Replace only the heavy picker presentation/keyboard boundary with a controlled
// calendar input. Formik, the real schema, initial values, Redux selector,
// payload adapter, RTK mutation and actual form submit handler are NOT mocked.
// Browser/picker popup and disabled-day behavior remain a separate browser gate.
vi.mock('@mui/x-date-pickers', async () => {
  const { default: actualDayjs } = await import('dayjs');
  return {
    DatePicker: function ControlledCalendarInput({
      label,
      value,
      onChange,
    }: {
      label: string;
      value?: Dayjs | null;
      onChange: (value: Dayjs | null, context: { validationError: null }) => void;
    }) {
      const controlId = React.useId();
      return (
        <label htmlFor={controlId}>
          {label}
          <input
            id={controlId}
            aria-label={label}
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

const selectedYear = {
  id: '268cd088-b405-4325-8749-365e6778ab33',
  name: 'An explicit selected context, never parsed into dates',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
};
const memberId = '5c68d95f-73ba-4207-a337-71e6396ffec7';
const categoryId = 'b2469347-174e-4d65-af7e-c08d3bc39021';
const assessmentId = '6b3dd3b8-4590-4471-b927-71c874d31bda';
const root = 'http://library.test/api';
const theme = createTheme(defaultSettings);

beforeEach(() => clearCachedAuthSession());

it('submits the selected Redux year and explicit school dates through the real assignment form', async () => {
  const lookups: string[] = [];
  let body: Record<string, unknown> | undefined;
  mswServer.use(
    http.get(`${root}/library/charges/editor/categories`, () =>
      HttpResponse.json({
        items: [
          {
            id: categoryId,
            academicYearId: selectedYear.id,
            name: 'Reviewed damage',
            amount: 100.75,
            isFixed: false,
          },
        ],
        totalCount: 1,
        currentPage: 1,
        pageSize: 100,
        totalPages: 1,
      })
    ),
    http.get(`${root}/library/charges/editor/members`, () => {
      lookups.push('member');
      return HttpResponse.json({
        items: [
          {
            id: memberId,
            memberName: 'Maya José',
            memberIdentifier: 'STAFF-84',
            role: 1,
            hasActiveLibraryMembership: true,
            canAssignDirect: true,
            requiresLoanSource: false,
          },
        ],
        totalCount: 1,
        currentPage: 1,
        pageSize: 20,
        totalPages: 1,
      });
    }),
    http.get(`${root}/library/charges/editor/loans`, () => {
      lookups.push('loan');
      return HttpResponse.json({
        items: [
          {
            loanId: 'a5431f16-8f43-45f2-a93b-fb74b9edb176',
            canonicalMemberId: memberId,
            copyId: '37f3cf8c-a39d-4cdf-b6b7-4f4fbcbba493',
            role: 1,
            accessionNumber: 'ACC-0001',
            title: 'Stories from the school library',
            loanAcademicYearId: selectedYear.id,
            status: 0,
            schoolIssueDate: '2026-11-17',
            schoolDueDate: '2026-11-24',
            issueDateProvenance: 1,
            dueDateProvenance: 1,
          },
        ],
        totalCount: 1,
        currentPage: 1,
        pageSize: 20,
        totalPages: 1,
      });
    }),
    http.post(`${root}/library/charges`, async ({ request }) => {
      body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({
        id: assessmentId,
        message: 'Library charge created successfully.',
      });
    })
  );
  const store = configureStore({
    reducer: {
      globalState: () => ({ currentYear: selectedYear, currentBoard: {}, currentMedium: {} }),
      confirmPopup: confirmReducer,
      auth: () => ({
        permissions: ['Library.Charges.View', 'Library.Charges.Add', 'Library.Charges.Update'].map(
          (name) => ({ name, isGranted: true })
        ),
      }),
      [api.reducerPath]: api.reducer,
    },
    middleware: (defaults) => defaults({ serializableCheck: false }).concat(api.middleware),
  });
  const onClose = vi.fn();
  render(
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AssignChargesForm open onClose={onClose} />
      </ThemeProvider>
    </Provider>
  );
  const user = userEvent.setup();

  await user.click(screen.getByRole('combobox', { name: /^Member/i }));
  await user.click(await screen.findByRole('option', { name: /Maya José/ }));
  await waitFor(() => expect(lookups).toContain('member'), { timeout: 4000 });
  await screen.findAllByText('Maya José');
  await waitFor(() => expect(lookups).toContain('loan'), { timeout: 4000 });
  await user.click(screen.getByRole('combobox', { name: /Loan source/i }));
  await user.click(await screen.findByRole('option', { name: /Stories from the school library/ }));
  await user.click(screen.getByRole('combobox', { name: /Charge Category/i }));
  await user.click(await screen.findByRole('option', { name: 'Reviewed damage' }));
  fireEvent.change(screen.getByRole('textbox', { name: /^Amount/i }), {
    target: { value: '100.75' },
  });
  fireEvent.change(screen.getByRole('textbox', { name: /Reason of Charge/i }), {
    target: { value: 'Reviewed damage to the book cover.' },
  });
  // Missing this actual control is the current genuine missing-feature candidate;
  // all unrelated member/book/category/reason prerequisites above are populated.
  const assessmentDate = screen.getByLabelText(/Assessment Date|Charge Date/i);
  expect(assessmentDate).toHaveValue('');
  fireEvent.change(assessmentDate, { target: { value: '2026-11-17' } });
  fireEvent.change(screen.getByLabelText(/Due Date/i), {
    target: { value: '2026-11-24' },
  });
  // Keep the real NumericFormatCustom boundary: its whole-rupee default must
  // not silently display101 for the explicitly entered100.75 assessment.
  expect(screen.getByRole('textbox', { name: /^Amount/i })).toHaveValue('₹ 100.75');
  await user.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(body).toBeDefined());

  expect(body).toMatchObject({
    memberId,
    bookIssueId: 'a5431f16-8f43-45f2-a93b-fb74b9edb176',
    chargeCategoryId: categoryId,
    academicYearId: selectedYear.id,
    amount: 100.75,
    schoolChargeDate: '2026-11-17',
    schoolDueDate: '2026-11-24',
    remarks: 'Reviewed damage to the book cover.',
  });
  expect(body).not.toHaveProperty('chargeDate');
  expect(body).not.toHaveProperty('dueDate');
  expect(body).not.toHaveProperty('paidDate');
  expect(body).not.toHaveProperty('paymentStatus');
  expect(dayjs.isDayjs(body?.schoolChargeDate)).toBe(false);
  await waitFor(() => expect(onClose).toHaveBeenCalledWith(null, true));
});
