import type { ReactNode } from 'react';

import React from 'react';
import dayjs from 'dayjs';
import { it, vi, expect, describe, afterEach, beforeEach } from 'vitest';
import { render, screen, cleanup, waitFor, fireEvent } from '@testing-library/react';

import AddLeaveRequest from './leave-requst';

const mocks = vi.hoisted(() => ({
  create: vi.fn(),
  preview: {} as any,
  stalePreview: undefined as any,
  fetching: false,
  previewError: undefined as any,
  balance: {} as any,
}));

vi.mock('next-auth/react', () => ({
  useSession: () => ({ data: { profile: { role: 'teacher' } } }),
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: {
        currentYear: { id: 'year-1', startDate: '2026-01-01', endDate: '2026-12-31' },
      },
      auth: { employee: { id: 'employee-1' } },
    }),
}));
vi.mock('src/redux/year/yearApi', () => ({ useGetYearQuery: () => ({ data: { items: [] } }) }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: () => [mocks.create, { isLoading: false }],
}));
vi.mock('src/redux/hr/employeeApi', () => ({ useLazyGetEmployeeQuery: vi.fn() }));
vi.mock('src/redux/hr/hr-policy-api', () => ({
  useGetPolicyAssignmentPreviewQuery: () => ({
    currentData: mocks.preview,
    data: mocks.stalePreview ?? mocks.preview,
    isFetching: mocks.fetching,
    error: mocks.previewError,
    refetch: vi.fn(),
  }),
}));
vi.mock('src/redux/hr/leaveApi', () => ({
  useGetSelfLeaveBalanceQuery: () => ({ data: mocks.balance, isFetching: false }),
  useGetMyLeaveBalanceQuery: () => ({ data: mocks.balance, isFetching: false }),
  useCreateLeaveRequestMutation: vi.fn(),
  useCreateMyLeaveRequestMutation: vi.fn(),
  useRejectLeaveRequestMutation: vi.fn(),
  useApproveLeaveRequestMutation: vi.fn(),
}));
vi.mock('src/utils/icons', () => ({ GlobalIcons: {} }));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-upload', () => ({ default: () => null }));
vi.mock('src/hooks/use-formik-error-focus', () => ({ useFormikErrorFocus: vi.fn() }));
vi.mock('src/components/paginated-search-select', () => ({ PaginatedSearchSelect: () => null }));
vi.mock('src/screens/hr/recovery/hr-setup-controls', () => ({
  HrSetupLink: () => null,
  HrSetupRefresh: () => null,
}));
vi.mock('src/theme/core/palette', () => ({
  info: {},
  error: {},
  primary: {},
  success: {},
  warning: {},
  secondary: {},
}));
vi.mock('src/components/shaking-text-field', () => ({
  default: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('src/components/customDialog', () => ({
  DialogScrollContent: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('src/components/back-popup-check/BackPopUpCheck', () => ({
  BackPopUpChecked: ({ children }: { children: ReactNode }) => children,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, onChange, options, disabled, helperText }: any) => (
    <label htmlFor={label.replace(/\W/g, '')}>
      {label}
      <select
        id={label.replace(/\W/g, '')}
        aria-label={label}
        value={value}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Choose</option>
        {options.map((option: any) => (
          <option key={option.id} value={option.id}>
            {option.name}
          </option>
        ))}
      </select>
      <span>{helperText}</span>
    </label>
  ),
}));
vi.mock('@mui/x-date-pickers', () => ({
  DatePicker: ({ label, value, onChange, minDate, slotProps }: any) => (
    <label htmlFor={label.replace(/\W/g, '')}>
      {label}
      <input
        id={label.replace(/\W/g, '')}
        aria-label={label}
        value={value?.format('YYYY-MM-DD') || ''}
        data-min-date={minDate?.format('YYYY-MM-DD') || ''}
        onChange={(event) => onChange(event.target.value ? dayjs(event.target.value) : null)}
      />
      {slotProps?.textField?.helperText}
    </label>
  ),
}));
vi.mock('@mui/lab', () => ({
  LoadingButton: ({ children, disabled, type, onClick }: any) => (
    <button type={type === 'submit' ? 'submit' : 'button'} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  ),
}));
vi.mock('@mui/material', () => {
  const Container = ({ children }: any) => <div>{children}</div>;
  return {
    Box: ({ children, onSubmit }: any) => <form onSubmit={onSubmit}>{children}</form>,
    Grid: Container,
    Stack: Container,
    Typography: Container,
    DialogActions: Container,
    Chip: () => null,
    Alert: Container,
    Backdrop: () => null,
    CircularProgress: () => null,
    Button: ({ children, onClick, disabled }: any) => (
      <button type="button" disabled={disabled} onClick={onClick}>
        {children}
      </button>
    ),
    Switch: ({ checked, onChange }: any) => (
      <input aria-label="Half day" type="checkbox" checked={checked} onChange={onChange} />
    ),
    FormControlLabel: ({ control }: any) => control,
    TextField: ({ label, value, name, onChange, helperText }: any) => (
      <label htmlFor={label.replace(/\W/g, '')}>
        {label}
        <input
          id={label.replace(/\W/g, '')}
          aria-label={label}
          name={name}
          value={value}
          onChange={onChange}
        />
        {helperText}
      </label>
    ),
  };
});

function setNoticeDays(paid: number, unpaid = paid) {
  mocks.preview = {
    leavePolicy: {
      id: 'policy-1',
      allowedPaidTypes: ['Paid', 'Unpaid'],
      rules: [
        { paidType: 'Paid', minNoticeDays: paid },
        { paidType: 'Unpaid', minNoticeDays: unpaid },
      ],
    },
  };
}

async function fillRequest(start: string, end = start, paidType = 'Paid') {
  fireEvent.change(screen.getByLabelText('Paid Type *'), { target: { value: paidType } });
  fireEvent.change(screen.getByLabelText('Start Date *'), { target: { value: start } });
  fireEvent.change(screen.getByLabelText('End Date *'), { target: { value: end } });
  fireEvent.change(screen.getByLabelText('Reason for leave *'), {
    target: { value: 'Family appointment' },
  });
  await waitFor(() => expect(screen.getByLabelText('End Date *')).toHaveValue(end));
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-11-08T10:00:00'));
  mocks.create.mockReset().mockResolvedValue({ data: { id: 'leave-1' } });
  mocks.fetching = false;
  mocks.previewError = undefined;
  mocks.stalePreview = undefined;
  mocks.balance = { items: [{ paidType: 'Paid', remainingDays: 2 }] };
  setNoticeDays(0);
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('Leave request policy-aware validation', () => {
  it.each([
    [0, '2026-11-08'],
    [1, '2026-11-09'],
    [5, '2026-11-13'],
  ])('submits at the configured %i-day notice boundary', async (noticeDays, date) => {
    setNoticeDays(Number(noticeDays));
    render(<AddLeaveRequest mode="self" />);
    await fillRequest(String(date));
    expect(screen.getByLabelText('Start Date *')).toHaveAttribute('data-min-date', String(date));
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
    expect(mocks.create.mock.calls[0][0].body.get('startDate')).toBe(date);
  });

  it('blocks too-short notice and updates the date gate when the selected paid type changes', async () => {
    setNoticeDays(5, 1);
    render(<AddLeaveRequest mode="self" />);
    await fillRequest('2026-11-09');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    fireEvent.submit(screen.getByRole('button', { name: 'Submit' }).closest('form')!);
    expect(mocks.create).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('Paid Type *'), { target: { value: 'Unpaid' } });
    expect(screen.getByLabelText('Start Date *')).toHaveAttribute('data-min-date', '2026-11-09');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
  });

  it('does not reuse a previous date policy while current preview is loading', async () => {
    render(<AddLeaveRequest mode="self" />);
    await fillRequest('2026-11-09');
    setNoticeDays(8);
    mocks.stalePreview = mocks.preview;
    mocks.preview = undefined;
    mocks.fetching = true;
    cleanup();
    render(<AddLeaveRequest mode="self" />);
    expect(screen.getByLabelText('Start Date *')).toHaveAttribute('data-min-date', '2026-11-08');
    expect(screen.getByLabelText('Paid Type *')).toBeDisabled();
    expect(mocks.create).not.toHaveBeenCalled();
  });

  it('submits Friday-to-Monday despite the three-day estimate exceeding a two-day balance', async () => {
    render(<AddLeaveRequest mode="self" />);
    await fillRequest('2026-11-13', '2026-11-16');
    expect(screen.getByText(/Estimated requested days: 3/)).toBeInTheDocument();
    expect(screen.getByText(/effective policy and staff work calendar/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(mocks.create).toHaveBeenCalledTimes(1));
    expect(mocks.create.mock.calls[0][0].body.get('endDate')).toBe('2026-11-16');
  });

  it('keeps the server insufficient-balance error and the draft for correction', async () => {
    mocks.create.mockResolvedValue({
      error: {
        data: {
          errorCode: 'HR:Leave:020017',
          detail: 'The server found insufficient balance.',
        },
      },
    });
    const close = vi.fn();
    render(<AddLeaveRequest mode="self" handleClose={close} />);
    await fillRequest('2026-11-13', '2026-11-16');
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() =>
      expect(screen.getByText('The server found insufficient balance.')).toBeInTheDocument()
    );
    expect(close).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Start Date *')).toHaveValue('2026-11-13');
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  });
});
