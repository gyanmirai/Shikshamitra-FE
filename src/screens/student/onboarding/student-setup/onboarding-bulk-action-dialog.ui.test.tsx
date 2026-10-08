import { it, vi, expect, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

import OnboardingBulkActionDialog from './onboarding-bulk-action-dialog';
import { studentOnboardingTestData } from './student-onboarding-test-fixtures';

const apiMocks = vi.hoisted(() => ({
  activate: vi.fn(),
  refresh: vi.fn(),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span />,
}));

vi.mock('src/components/customDialog', () => ({
  default: ({
    open,
    title,
    children,
  }: {
    open: boolean;
    title: string;
    children: React.ReactNode;
  }) =>
    open ? (
      <div role="dialog" aria-label={title}>
        {children}
      </div>
    ) : null,
  DialogScrollContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock('src/redux/student/onboarding/student-onboarding-api', () => ({
  useActivateStudentOnboardingMutation: () => [apiMocks.activate],
  useRefreshStudentOnboardingReadinessMutation: () => [apiMocks.refresh],
}));

const students = studentOnboardingTestData.slice(0, 2).map((student, index) => ({
  ...student,
  id: `case-${index + 1}`,
  applicationNumber: `APP-2026-00000${index + 1}`,
  studentName: `Student ${index + 1}`,
  concurrencyStamp: `stamp-${index + 1}`,
}));
const readyStudent = {
  ...students[0],
  source: 'onboarding-case' as const,
  backendStatus: 2 as const,
};
const blockedStudent = {
  ...students[1],
  source: 'onboarding-case' as const,
  backendStatus: 3 as const,
  primaryBlocker: 'Required documents need verification.',
};

afterEach(() => {
  apiMocks.activate.mockReset();
  apiMocks.refresh.mockReset();
  vi.unstubAllGlobals();
});

it('shows the selected students and the specific refresh action', () => {
  render(
    <OnboardingBulkActionDialog
      action="review-readiness"
      students={students.slice(0, 1)}
      onClose={vi.fn()}
    />
  );

  expect(screen.getByRole('dialog', { name: 'Refresh Selected Students' })).toBeInTheDocument();
  expect(screen.getByText('APP-2026-000001')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Refresh 1 student' })).toBeEnabled();
  expect(screen.getByRole('button', { name: 'Cancel' })).toBeEnabled();
});

it('shows individual results and retries only the student who failed', async () => {
  let secondAttempt = false;
  apiMocks.refresh.mockImplementation(({ id }: { id: string }) => ({
    unwrap: () =>
      id === 'case-2' && !secondAttempt
        ? Promise.reject(new Error('Conflict'))
        : Promise.resolve({}),
  }));

  render(
    <OnboardingBulkActionDialog action="review-readiness" students={students} onClose={vi.fn()} />
  );
  fireEvent.click(screen.getByRole('button', { name: 'Refresh 2 students' }));

  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Retry 1 student' })).toBeEnabled()
  );
  expect(screen.getByText('1 of 2 students refreshed. 1 student needs attention.')).toBeVisible();
  expect(screen.getByText('APP-2026-000001')).toBeVisible();
  expect(screen.getByText('APP-2026-000002')).toBeVisible();
  expect(screen.getByText('Needs attention')).toBeVisible();
  expect(apiMocks.refresh).toHaveBeenCalledTimes(2);

  secondAttempt = true;
  fireEvent.click(screen.getByRole('button', { name: 'Retry 1 student' }));
  await waitFor(() => expect(screen.getByText('2 of 2 students refreshed.')).toBeVisible());
  expect(screen.queryByRole('button', { name: 'Refresh 2 students' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  expect(apiMocks.refresh).toHaveBeenCalledTimes(3);
  expect(apiMocks.refresh.mock.calls[2][0]).toEqual({ id: 'case-2', concurrencyStamp: 'stamp-2' });
});

it('explains activation and blocks students who are not ready', () => {
  render(
    <OnboardingBulkActionDialog action="activate" students={[blockedStudent]} onClose={vi.fn()} />
  );

  expect(screen.getByRole('dialog', { name: 'Activate Selected Students' })).toBeInTheDocument();
  expect(screen.getByText(/Activation commits placement and identifiers/)).toBeVisible();
  expect(
    screen.getByText(
      'No selected students are ready to activate. Review their status in the list below.'
    )
  ).toBeVisible();
  expect(screen.getByText('Required documents need verification.')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  expect(screen.queryByRole('button', { name: /Activate/ })).not.toBeInTheDocument();
  expect(apiMocks.activate).not.toHaveBeenCalled();
});

it('activates only ready students from a mixed selection', async () => {
  vi.stubGlobal('crypto', { randomUUID: () => 'activation-request-1' });
  apiMocks.activate.mockReturnValue({ unwrap: () => Promise.resolve({}) });
  render(
    <OnboardingBulkActionDialog
      action="activate"
      students={[readyStudent, blockedStudent]}
      onClose={vi.fn()}
    />
  );

  expect(
    screen.getByText('1 of 2 selected students are not ready and will be skipped.')
  ).toBeVisible();
  expect(screen.getByText('APP-2026-000001')).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Activate 1 student' }));

  await waitFor(() => expect(screen.getByText('1 of 1 ready student activated.')).toBeVisible());
  expect(screen.queryByRole('button', { name: 'Activate 1 student' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Close' })).toBeEnabled();
  expect(apiMocks.activate).toHaveBeenCalledOnce();
  expect(apiMocks.activate).toHaveBeenCalledWith({
    id: 'case-1',
    concurrencyStamp: 'stamp-1',
    idempotencyKey: 'activation-request-1',
  });
});
