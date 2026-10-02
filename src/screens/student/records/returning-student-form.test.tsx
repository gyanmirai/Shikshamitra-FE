import { vi, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import ReturningStudentForm from './returning-student-form';

const mocks = vi.hoisted(() => ({
  preview: vi.fn(),
  submit: vi.fn(),
  push: vi.fn(),
  mode: 'automatic' as 'manual' | 'automatic' | 'both',
  entryMode: 1 as 0 | 1 | 2,
  grants: ['Students.Admissions.Applications.View', 'Students.Admissions.Inquiries.View'],
  previewData: {} as any,
}));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('react-redux', () => ({
  useSelector: (select: any) =>
    select({
      globalState: { currentYear: { id: 'year-1' } },
      auth: { permissions: mocks.grants.map((name) => ({ name, isGranted: true })) },
    }),
}));
vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));
vi.mock('src/hooks/use-unsaved-navigation', () => ({
  useUnsavedNavigation: () => ({ confirmation: null }),
}));
vi.mock('src/components/toast', () => ({ shikshaMitraToast: { success: vi.fn() } }));
vi.mock('src/components/form-section-card', () => ({
  FormSectionCard: ({ children }: any) => <section>{children}</section>,
}));
vi.mock('src/components/custom-select', () => ({
  default: ({ label, value, options, onChange, disabled }: any) => (
    <select
      aria-label={label}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="" />
      {options.map((option: any) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  ),
}));
vi.mock('./records-student-picker', () => ({
  default: ({ onSelect }: any) => (
    <button
      type="button"
      onClick={() =>
        onSelect({
          studentId: 'student-1',
          firstName: 'Riya',
          lastName: 'Shah',
          academicYearId: 'year-1',
        })
      }
    >
      Select Riya
    </button>
  ),
}));
vi.mock('src/redux/student/records/student-record-transitions-api', () => ({
  useGetStudentRecordTransitionOptionsQuery: () => ({
    currentData: {
      academicYears: [{ id: 'year-1', name: '2026–27' }],
      standards: [{ id: 'class-1', name: 'Class 6' }],
      divisions: [{ id: 'division-1', name: 'A', parentId: 'class-1' }],
      offerings: [
        {
          id: 'offering-1',
          name: 'Admission 2026',
          entryMode: mocks.entryMode,
          inquiryIntake: {
            allowedSources: [1, 8, 11],
            requireSourceDetailFor: [11],
            requireGuardianEmail: false,
            requireApplicantDateOfBirth: false,
            boundValues: [],
            serverBoundFieldCodes: [],
          },
        },
      ],
      resumeApplications: [{ id: 'application-1', name: 'APP-1' }],
      returnPolicy: {
        allowedRoutes: ['ReuseProfile', 'FreshApplication', 'ResumeStage'],
        defaultRoute: 'ReuseProfile',
      },
      freshApplicationRequiresRegistration: false,
      rollAssignmentMode: mocks.mode,
    },
    isFetching: false,
    isError: false,
  }),
  usePreviewReturningStudentRecordMutation: () => [mocks.preview, { isLoading: false }],
  useReturnStudentRecordMutation: () => [mocks.submit, { isLoading: false }],
}));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.mode = 'automatic';
  mocks.entryMode = 1;
  mocks.grants = ['Students.Admissions.Applications.View', 'Students.Admissions.Inquiries.View'];
  mocks.previewData = {
    studentId: 'student-1',
    outcome: 'Return',
    ready: true,
    issues: [],
    rollAssignmentMode: 'automatic',
    proposedRollNumber: 31,
    studentConcurrencyStamp: 'student-stamp',
    enrollmentConcurrencyStamp: 'enrollment-stamp',
  };
  mocks.preview.mockImplementation(() => ({ unwrap: () => Promise.resolve(mocks.previewData) }));
  mocks.submit.mockReturnValue({
    unwrap: () =>
      Promise.resolve({
        studentId: 'student-1',
        route: 'ReuseProfile',
        status: 'Submitted',
        transitionId: 'return-1',
      }),
  });
});
async function prepare(route = 'ReuseProfile') {
  render(<ReturningStudentForm />);
  fireEvent.click(screen.getByRole('button', { name: 'Select Riya' }));
  fireEvent.change(screen.getByLabelText('Return route'), { target: { value: route } });
  if (route === 'ReuseProfile') {
    fireEvent.change(screen.getByLabelText('Class'), { target: { value: 'class-1' } });
    fireEvent.change(screen.getByLabelText('Division'), { target: { value: 'division-1' } });
  }
  fireEvent.change(screen.getByLabelText('Reason for return'), {
    target: { value: 'Reviewed same-year return requested by guardian' },
  });
  await waitFor(() => expect(screen.getByLabelText('Return route')).toHaveValue(route));
}
it('allows reviewed same-year reuse and requires the accepted preview number and stamps', async () => {
  await prepare();
  expect(screen.getByLabelText('Target academic year')).toHaveValue('year-1');
  expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeDisabled();
  expect(screen.getByLabelText('Proposed roll number')).toHaveAttribute('readonly');
  fireEvent.click(screen.getByRole('button', { name: 'Preview return' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Start selected return route' }));
  await waitFor(() => expect(mocks.submit).toHaveBeenCalledOnce());
  expect(mocks.submit.mock.calls[0][0]).toMatchObject({
    targetAcademicYearId: 'year-1',
    rollAssignmentMode: 'automatic',
    rollNumber: 31,
    studentConcurrencyStamp: 'student-stamp',
    enrollmentConcurrencyStamp: 'enrollment-stamp',
  });
  expect(mocks.submit.mock.calls[0][0]).not.toHaveProperty('schoolRollMode');
});
it('requires an explicit manual or automatic return choice when both are allowed', async () => {
  mocks.mode = 'both';
  await prepare();
  expect(screen.getByLabelText('Roll number assignment')).toHaveValue('');
  fireEvent.click(screen.getByRole('button', { name: 'Preview return' }));
  expect(await screen.findByText(/Review the student, target placement/)).toBeVisible();
  expect(mocks.preview).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText('Roll number assignment'), {
    target: { value: 'automatic' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Preview return' }));
  await waitFor(() => expect(mocks.preview).toHaveBeenCalledOnce());
});
it('invalidates the preview after changing the return details', async () => {
  await prepare();
  fireEvent.click(screen.getByRole('button', { name: 'Preview return' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeEnabled()
  );
  fireEvent.change(screen.getByLabelText('Reason for return'), {
    target: { value: 'Revised guardian return request' },
  });
  expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeDisabled();
  expect(
    screen.getByText('The return details changed. Preview again before submitting.')
  ).toBeVisible();
});
it('discards a changed proposal and retains the target placement', async () => {
  mocks.submit.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Changed proposal'), {
          data: { error: { code: 'Students:Records:RollProposalChanged' } },
        })
      ),
  });
  await prepare();
  fireEvent.click(screen.getByRole('button', { name: 'Preview return' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Start selected return route' }));
  expect(await screen.findByText(/The return could not be started/)).toBeVisible();
  expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeDisabled();
  expect(screen.getByLabelText('Division')).toHaveValue('division-1');
});
it('starts the real fresh admission handoff without a reuse-profile preview', async () => {
  mocks.submit.mockReturnValue({
    unwrap: () =>
      Promise.resolve({
        admissionApplicationId: 'application-2',
        route: 'FreshApplication',
        status: 'ApplicationStarted',
      }),
  });
  await prepare('FreshApplication');
  fireEvent.change(screen.getByLabelText('Admission offering'), {
    target: { value: 'offering-1' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Start selected return route' }));
  await waitFor(() => expect(mocks.submit).toHaveBeenCalledOnce());
  expect(mocks.preview).not.toHaveBeenCalled();
  expect(mocks.submit.mock.calls[0][0]).toMatchObject({
    route: 'FreshApplication',
    admissionOfferingId: 'offering-1',
    entryPath: 1,
    rollAssignmentMode: undefined,
    rollNumber: undefined,
    studentConcurrencyStamp: undefined,
  });
  expect(mocks.push.mock.calls[0][0]).toContain('application-2');
});

it('requires an explicit entry path for an offering that permits both', async () => {
  mocks.entryMode = 2;
  await prepare('FreshApplication');
  fireEvent.change(screen.getByLabelText('Admission offering'), {
    target: { value: 'offering-1' },
  });
  expect(screen.getByLabelText('Admission entry path')).toHaveValue('');
  expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeDisabled();
  fireEvent.change(screen.getByLabelText('Admission entry path'), { target: { value: '0' } });
  fireEvent.change(screen.getByLabelText('Inquiry source'), { target: { value: '8' } });
  fireEvent.click(screen.getByRole('button', { name: 'Start selected return route' }));
  await waitFor(() => expect(mocks.submit).toHaveBeenCalledOnce());
  expect(mocks.submit.mock.calls[0][0]).toMatchObject({ entryPath: 0 });
  expect(mocks.push.mock.calls[0][0]).toContain('view=history');
});

it('opens the created inquiry through the configured Inquiry entry', async () => {
  mocks.entryMode = 0;
  mocks.submit.mockReturnValue({
    unwrap: () =>
      Promise.resolve({
        admissionInquiryId: 'inquiry-2',
        status: 'AwaitingAdmission',
        route: 'FreshApplication',
      }),
  });
  await prepare('FreshApplication');
  fireEvent.change(screen.getByLabelText('Admission offering'), {
    target: { value: 'offering-1' },
  });
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeEnabled()
  );
  fireEvent.change(screen.getByLabelText('Inquiry source'), { target: { value: '1' } });
  fireEvent.click(screen.getByRole('button', { name: 'Start selected return route' }));
  await waitFor(() => expect(mocks.submit).toHaveBeenCalledOnce());
  expect(mocks.submit.mock.calls[0][0]).toMatchObject({
    entryPath: 0,
    inquiry: { source: 1, formValues: [] },
  });
  expect(mocks.push.mock.calls[0][0]).toContain('inquiryId=inquiry-2');
});

it('retains Records navigation when the staff member cannot view Admissions', async () => {
  mocks.grants = [];
  mocks.submit.mockReturnValue({
    unwrap: () =>
      Promise.resolve({
        admissionApplicationId: 'application-2',
        status: 'AwaitingAdmission',
        route: 'FreshApplication',
      }),
  });
  await prepare('FreshApplication');
  fireEvent.change(screen.getByLabelText('Admission offering'), {
    target: { value: 'offering-1' },
  });
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Start selected return route' }));
  await waitFor(() => expect(mocks.push).toHaveBeenCalledOnce());
  expect(mocks.push.mock.calls[0][0]).toContain('view=history');
});

it('clears the offering and entry choice when the year changes', async () => {
  await prepare('FreshApplication');
  fireEvent.change(screen.getByLabelText('Admission offering'), {
    target: { value: 'offering-1' },
  });
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeEnabled()
  );
  fireEvent.change(screen.getByLabelText('Target academic year'), { target: { value: '' } });
  expect(screen.getByLabelText('Return route')).toHaveValue('');
  expect(screen.queryByLabelText('Admission offering')).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeDisabled();
});

it('requires a positive manual roll number and submits the entered value', async () => {
  mocks.mode = 'manual';
  mocks.previewData = {
    ...mocks.previewData,
    rollAssignmentMode: 'manual',
    proposedRollNumber: 19,
  };
  await prepare();
  fireEvent.change(screen.getByLabelText(/Target roll number/), { target: { value: '0' } });
  fireEvent.click(screen.getByRole('button', { name: 'Preview return' }));
  expect(await screen.findByText('Enter a positive roll number.')).toBeVisible();
  expect(mocks.preview).not.toHaveBeenCalled();
  fireEvent.change(screen.getByLabelText(/Target roll number/), { target: { value: '19' } });
  fireEvent.click(screen.getByRole('button', { name: 'Preview return' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Start selected return route' })).toBeEnabled()
  );
  fireEvent.click(screen.getByRole('button', { name: 'Start selected return route' }));
  await waitFor(() => expect(mocks.submit).toHaveBeenCalledOnce());
  expect(mocks.submit.mock.calls[0][0]).toMatchObject({
    rollAssignmentMode: 'manual',
    rollNumber: 19,
  });
});
