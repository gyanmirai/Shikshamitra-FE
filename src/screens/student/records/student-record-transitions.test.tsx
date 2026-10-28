import { vi, it, expect, describe, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import StudentRecordTransitions from './student-record-transitions';

// Icon assets come from an external provider; these tests exercise the real UI controls.
vi.mock('@iconify/react', () => ({
  Icon: () => <svg aria-hidden="true" />,
  disableCache: vi.fn(),
}));

const mocks = vi.hoisted(() => ({
  permissions: [] as any[],
  row: {} as any,
  decide: vi.fn(),
  params: new URLSearchParams(),
  push: vi.fn(),
  exitProps: undefined as any,
}));
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mocks.push }),
  usePathname: () => '/student/records/transitions',
  useSearchParams: () => mocks.params,
}));
vi.mock('react-redux', () => ({
  useSelector: (select: any) => select({ auth: { permissions: mocks.permissions } }),
}));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock('src/components/custom-breadcrumbs', () => ({
  CustomBreadcrumbs: ({ heading }: any) => <h1>{heading}</h1>,
}));
vi.mock('src/components/custom-tabs', () => ({
  CustomTabs: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/customDialog', () => ({
  default: ({ open, title, children }: any) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: any) => <div>{children}</div>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options }: any) => (
    <select aria-label={label} value={value} onChange={() => undefined}>
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('src/components/customizabaleTable', () => ({
  default: ({ data, columns }: any) => (
    <div>
      {data.map((row: any) => (
        <div key={row.id}>{columns.at(-1).render(null, row)}</div>
      ))}
    </div>
  ),
}));
vi.mock('./transition-batch-form', () => ({ default: () => null }));
vi.mock('./returning-student-form', () => ({ default: () => null }));
vi.mock('./school-exit-drawer', () => ({
  default: (props: any) => {
    mocks.exitProps = props;
    return <div role="dialog" aria-label="School Exit">Exit clearance review</div>;
  },
}));
vi.mock('src/redux/student/records/student-record-transitions-api', () => ({
  useGetStudentRecordTransitionsQuery: () => ({
    currentData: { items: [mocks.row], totalCount: 1 },
  }),
  useGetStudentRecordRenewalsQuery: () => ({ currentData: { items: [], totalCount: 0 } }),
  useDecideStudentRecordTransitionMutation: () => [mocks.decide, { isLoading: false }],
  useCorrectStudentRecordTransitionMutation: () => [vi.fn(), { isLoading: false }],
  useUpdateStudentRecordRenewalMutation: () => [vi.fn(), { isLoading: false }],
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.params = new URLSearchParams();
  mocks.permissions = [
    'Students.Records.Transitions.Add',
    'Students.Records.Transitions.Delete',
  ].map((name) => ({ name, isGranted: true }));
  mocks.row = {
    id: 'transition-1',
    studentId: 'student-1',
    studentName: 'Riya Shah',
    status: 'Submitted',
    outcome: 'Hold',
    academicYearId: 'year-1',
    reason: 'School withdrawal',
    effectiveDate: '2026-09-30',
    history: [],
    concurrencyStamp: 'stamp-1',
    canApprove: false,
    canCancel: false,
    canApply: false,
    canCorrect: false,
  };
  mocks.decide.mockImplementation(() => ({ unwrap: () => Promise.resolve(mocks.row) }));
});
describe('Transition command permissions', () => {
  it('opens pending exits in the contextual clearance drawer and retains history access', () => {
    mocks.row.outcome = 'Withdraw';
    render(<StudentRecordTransitions />);
    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByRole('dialog', { name: 'School Exit' })).toBeVisible();
    expect(mocks.exitProps).toMatchObject({
      studentId: 'student-1', academicYearId: 'year-1', transition: mocks.row,
    });
    expect(screen.getByRole('button', { name: 'History & actions' })).toBeVisible();
  });
  it.each([
    { grant: 'Add', canCancel: true, canApprove: true },
    { grant: 'Delete', canCancel: false, canApprove: false },
    { grant: 'View', canCancel: false, canApprove: false },
  ])(
    'requires Add/Update for cancellation and approval with $grant access',
    ({ grant, canCancel, canApprove }) => {
      mocks.permissions = [{ name: `Students.Records.Transitions.${grant}`, isGranted: true }];
      mocks.row.canCancel = true;
      mocks.row.canApprove = true;
      render(<StudentRecordTransitions />);
      fireEvent.click(screen.getByRole('button', { name: 'Review' }));
      expect(Boolean(screen.queryByRole('button', { name: 'Cancel transition' }))).toBe(canCancel);
      expect(Boolean(screen.queryByRole('button', { name: 'Approve stage' }))).toBe(canApprove);
    }
  );
  it('does not advertise approval or application when the server denies the current actor', () => {
    render(<StudentRecordTransitions />);
    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.queryByRole('button', { name: 'Approve stage' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Apply or retry transition' })
    ).not.toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Awaiting Renewal' })).toBeInTheDocument();
  });
  it('sends the displayed concurrency stamp and keeps the reason on a stale decision', async () => {
    mocks.row.canApprove = true;
    mocks.decide.mockImplementation(() => ({
      unwrap: () => Promise.reject(new Error('Conflict')),
    }));
    render(<StudentRecordTransitions />);
    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    fireEvent.click(screen.getByRole('button', { name: 'Approve stage' }));
    fireEvent.change(screen.getByLabelText('Reason or review remarks'), {
      target: { value: 'Reviewed all exit evidence' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Approve transition' }));
    await waitFor(() =>
      expect(mocks.decide).toHaveBeenCalledWith({
        id: 'transition-1',
        command: 'approve',
        concurrencyStamp: 'stamp-1',
        remarks: 'Reviewed all exit evidence',
      })
    );
    expect(await screen.findByText('Your reason has been kept', { exact: false })).toBeVisible();
    expect(screen.getByLabelText('Reason or review remarks')).toHaveValue(
      'Reviewed all exit evidence'
    );
  });
  it('requires exact application permission even when the row is eligible', () => {
    mocks.row.canApply = true;
    mocks.permissions = [];
    render(<StudentRecordTransitions />);
    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(
      screen.queryByRole('button', { name: 'Apply or retry transition' })
    ).not.toBeInTheDocument();
  });
  it('shows the Admissions hold and links only to records the staff member can view', () => {
    mocks.row = {
      ...mocks.row,
      outcome: 'Return',
      status: 'AwaitingAdmission',
      admissionInquiryId: 'inquiry-1',
      admissionApplicationId: 'application-1',
    };
    mocks.permissions.push({ name: 'Students.Admissions.Inquiries.View', isGranted: true });
    render(<StudentRecordTransitions />);
    fireEvent.click(screen.getByRole('button', { name: 'Review' }));
    expect(screen.getByRole('option', { name: 'Awaiting Admission' })).toBeInTheDocument();
    expect(screen.getByText(/Finish Admissions and Onboarding/)).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open admission inquiry' })).toHaveAttribute(
      'href',
      expect.stringContaining('inquiryId=inquiry-1')
    );
    expect(
      screen.queryByRole('link', { name: 'Open admission application' })
    ).not.toBeInTheDocument();
  });
});
