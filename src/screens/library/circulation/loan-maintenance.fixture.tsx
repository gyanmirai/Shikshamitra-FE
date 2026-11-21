import type { Dayjs } from 'dayjs';
import type { LibraryLoan } from 'src/redux/library/circulation-types';

import dayjs from 'dayjs';
import { useId } from 'react';
// This mounted test fixture is imported only by the adjacent maintenance tests.
import { vi, beforeEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { mswServer } from 'src/test/mswServer';
// eslint-disable-next-line import/no-extraneous-dependencies
import userEvent from '@testing-library/user-event';
import { clearCachedAuthSession } from 'src/redux/session-cache';
import { render, screen, fireEvent } from '@testing-library/react';

import { CirculationDialogs } from './CirculationDialogs';
import { useCirculationDialog } from './useCirculationDialog';
import { reservationWrapper } from '../BookList/Components/BookView/reservation-test-fixture';
import {
  renewalPreview,
  maintenanceLoan,
  maintenanceTarget,
} from './loan-maintenance-data.fixture';

vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://library.test';
});
vi.mock('next-auth/react', () => ({ getSession: async () => null, signOut: vi.fn() }));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/library/issued-books',
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('@mui/x-date-pickers', async (original) => ({
  ...(await original<typeof import('@mui/x-date-pickers')>()),
  DatePicker: ({
    label,
    value,
    onChange,
    disabled,
    slotProps,
  }: {
    label: string;
    value: Dayjs | null;
    onChange: (value: Dayjs | null) => void;
    disabled?: boolean;
    slotProps?: {
      textField?: { name?: string; required?: boolean; onBlur?: () => void; helperText?: string };
    };
  }) => {
    const id = useId();
    return (
      <div>
        <label htmlFor={id}>{label}</label>
        <input
          id={id}
          type="date"
          name={slotProps?.textField?.name}
          required={slotProps?.textField?.required}
          value={value?.format('YYYY-MM-DD') || ''}
          disabled={disabled}
          onBlur={slotProps?.textField?.onBlur}
          onChange={(event) => onChange(event.target.value ? dayjs(event.target.value) : null)}
        />
        {slotProps?.textField?.helperText && <span>{slotProps.textField.helperText}</span>}
      </div>
    );
  },
}));

beforeEach(() => {
  clearCachedAuthSession();
  localStorage.clear();
});
export const base = 'http://library.test/api/library/circulation/loans';
export function serveMaintenance(loan: LibraryLoan = maintenanceLoan) {
  const requests: { method: string; path: string; body?: Record<string, unknown> }[] = [];
  mswServer.use(
    http.get(`${base}/${maintenanceTarget.loanId}`, ({ request }) => {
      requests.push({ method: 'GET', path: new URL(request.url).pathname });
      return HttpResponse.json(loan);
    }),
    http.post(`${base}/${maintenanceTarget.loanId}/renewal-preview`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      requests.push({ method: 'PREVIEW', path: new URL(request.url).pathname, body });
      return HttpResponse.json(renewalPreview(body));
    }),
    http.all('http://library.test/api/library/circulation/lookups/return', () =>
      HttpResponse.json({ detail: 'Return authority is deliberately absent.' }, { status: 403 })
    )
  );
  return requests;
}
function Workspace({ kind }: { kind: 'renew' | 'reviewDates' }) {
  const state = useCirculationDialog();
  return (
    <>
      <button type="button" onClick={() => state.open(kind, 'SCHOOL/42', maintenanceTarget)}>
        Open maintenance
      </button>
      <CirculationDialogs
        dialog={state.dialog}
        busy={state.busy}
        onBusyChange={state.setBusy}
        onClose={state.onClose}
        onReload={state.reload}
      />
      {state.confirmation}
    </>
  );
}
export async function mountMaintenance(
  kind: 'renew' | 'reviewDates',
  actions = [kind === 'renew' ? 'Library.IssueReturn.Renew' : 'Library.IssueReturn.ReviewDates'],
  prepare?: (store: ReturnType<typeof reservationWrapper>['store']) => Promise<unknown>
) {
  const fixture = reservationWrapper(['Library.IssueReturn.View', ...actions]);
  await prepare?.(fixture.store);
  const view = render(<Workspace kind={kind} />, fixture);
  await userEvent.click(screen.getByRole('button', { name: 'Open maintenance' }));
  return { ...fixture, ...view };
}
export function enterSchoolDate(label: string, value: string) {
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
  fireEvent.blur(screen.getByLabelText(label));
}
export async function fillManualRenewal() {
  await screen.findByLabelText('School renewal date');
  await userEvent.click(screen.getByRole('combobox', { name: /Renewal academic year/ }));
  await userEvent.click(screen.getByRole('option', { name: '2027–2028' }));
  enterSchoolDate('School renewal date', '2026-11-18');
  enterSchoolDate('New due date', '2026-12-05');
}
