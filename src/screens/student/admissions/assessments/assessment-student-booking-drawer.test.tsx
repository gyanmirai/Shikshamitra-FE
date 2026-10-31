import { vi, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { defaultSettings } from 'src/components/settings/config-settings';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  sessionResponse,
  assessmentResponse,
} from 'src/redux/student/admissions/assessment-test-fixture';

import { AssessmentStudentBookingDrawer } from './assessment-student-booking-drawer';

const api = vi.hoisted(() => ({
  preview: vi.fn(),
  confirm: vi.fn(),
  get: vi.fn(),
  workbench: vi.fn(),
  session: {} as any,
  sessions: [] as any[],
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() },
}));
vi.mock('src/redux/student/admissions/admission-assessment-planning-api', () => ({
  useGetAssessmentSessionWorkbenchQuery: (input: unknown) => {
    api.workbench(input);
    return { currentData: { items: api.sessions, totalCount: api.sessions.length } };
  },
  useLazyGetAssessmentSessionByIdQuery: () => [(id: string) => ({ unwrap: () => api.get(id) })],
  usePreviewAssessmentSessionMutation: () => [
    (body: unknown) => ({ unwrap: () => api.preview(body) }),
  ],
  useConfirmAssessmentSessionMutation: () => [
    (body: unknown) => ({ unwrap: () => api.confirm(body) }),
  ],
}));
const students = ['Sweta', 'Nikhil'].map((name) => ({
  applicationId: name,
  stageInstanceId: `stage-${name}`,
  applicantId: name,
  applicationNumber: `APP-${name}`,
  applicantName: name,
  className: 'Class 10',
  stageName: 'Entrance exam',
  applicationStatus: 0,
  stageStatus: 1,
  isActive: true,
  queue: 'toBook' as const,
  admissionOfferingId: 'offering-1',
  workflowStageDefinitionId: 'definition-1',
  assessment: {
    ...assessmentResponse,
    policy: { ...assessmentResponse.policy!, schedulingEnabled: true },
  },
}));
const candidates = students.map((row) => ({
  ...row,
  concurrencyStamp: `fresh-${row.applicationId}`,
}));
const preview = {
  items: candidates,
  proposedBookings: candidates,
  totalCount: 2,
  eligibleCount: 2,
  availableCount: 24,
  remainingCount: 0,
  requiresRoomApproval: false,
  warnings: [],
  slots: [],
  previewFingerprint: 'fresh-preview',
  roomName: 'A001',
  buildingName: 'Main',
  floorName: 'Ground',
};
const scope = {
  admissionOfferingId: 'offering-1',
  workflowStageDefinitionId: 'definition-1',
  offeringName: 'Class 10',
  className: 'Class 10',
  stageName: 'Entrance exam',
  workflowDefinitionId: 'workflow',
  workflowVersion: 1,
  schedulingEnabled: true,
};
const onBooked = vi.fn();
beforeEach(() => {
  vi.clearAllMocks();
  api.session = {
    ...sessionResponse,
    name: 'Class 10 Entrance Exam',
    sessionType: 'exam',
    roomId: 'room',
    startsAt: '2999-10-30T04:30:00Z',
    endsAt: '2999-10-30T05:30:00Z',
  };
  api.sessions = [api.session];
  api.get.mockResolvedValue(api.session);
  api.preview.mockResolvedValue(preview);
  api.confirm.mockResolvedValue({ session: api.session, bookedCount: 2 });
});
const show = (overrides = {}) =>
  render(
    <ThemeProvider theme={createTheme(defaultSettings)}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <AssessmentStudentBookingDrawer
          rows={students}
          scopes={[scope]}
          academicYearId="year"
          canBook
          onClose={vi.fn()}
          onBooked={onBooked}
          {...overrides}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );

it('offers only pre-created sessions and carries the selected students', () => {
  show({ canCreate: true });
  expect(screen.getByText('Book Session')).toBeVisible();
  expect(screen.getByText('Sweta')).toBeVisible();
  expect(screen.getByText('Nikhil')).toBeVisible();
  expect(screen.queryByRole('button', { name: 'Create Session' })).not.toBeInTheDocument();
  expect(screen.queryByText('Create & Book')).not.toBeInTheDocument();
});

it('loads sessions across the academic year so unsupported choices can be explained', () => {
  show();
  expect(api.workbench).toHaveBeenCalledWith({
    academicYearId: 'year',
    includeCancelled: false,
    skipCount: 0,
    maxResultCount: 25,
    search: undefined,
  });
});

it('keeps incompatible future sessions visible with a disabled choice and reason', () => {
  api.sessions = [
    api.session,
    {
      ...api.session,
      id: 'other-session',
      name: 'Class 2 Interview',
      admissionOfferingId: 'offering-2',
      workflowStageDefinitionId: 'definition-2',
      scopes: [{ admissionOfferingId: 'offering-2', workflowStageDefinitionId: 'definition-2' }],
    },
  ];
  show();
  expect(screen.getByRole('radio', { name: 'Class 2 Interview' })).toBeDisabled();
  expect(screen.getByText('Class 10 not supported.')).toBeVisible();
  expect(screen.getByRole('radio', { name: 'Class 10 Entrance Exam' })).toBeEnabled();
});

it('carries both students into the drawer and confirms them without a second selection step', async () => {
  show();
  expect(screen.getByText('Sweta')).toBeVisible();
  expect(screen.getByText('Nikhil')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Book 2 students' })).toBeDisabled();
  await userEvent.click(screen.getByRole('radio', { name: 'Class 10 Entrance Exam' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Book 2 students' })).toBeEnabled()
  );
  await userEvent.click(screen.getByRole('button', { name: 'Book 2 students' }));
  await waitFor(() => expect(onBooked).toHaveBeenCalledOnce());
  expect(api.preview.mock.calls[0][0].stageInstanceIds).toEqual(['stage-Sweta', 'stage-Nikhil']);
  expect(api.confirm.mock.calls[0][0].bookings.map((item: any) => item.applicationId)).toEqual([
    'Sweta',
    'Nikhil',
  ]);
});

it('shows an unavailable student and never silently submits only the eligible subset', async () => {
  api.preview.mockResolvedValue({
    ...preview,
    items: [candidates[0]],
    proposedBookings: [candidates[0]],
  });
  show();
  await userEvent.click(screen.getByRole('radio', { name: 'Class 10 Entrance Exam' }));
  expect(await screen.findByText(/No longer eligible/)).toBeVisible();
  expect(screen.getByText('Nikhil')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Book 2 students' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Remove Nikhil' }));
  await userEvent.click(screen.getByRole('button', { name: 'Book 1 student' }));
  await waitFor(() => expect(api.confirm).toHaveBeenCalledOnce());
  expect(api.confirm.mock.calls[0][0].bookings.map((item: any) => item.applicationId)).toEqual([
    'Sweta',
  ]);
});

it.each(['Book 2 students', 'Retry'])(
  'locks dismiss and duplicate submit then replays through %s',
  async (retryAction) => {
    let reject!: (error: Error) => void;
    api.confirm.mockImplementationOnce(
      () =>
        new Promise((_, fail) => {
          reject = fail;
        })
    );
    show();
    await userEvent.click(screen.getByRole('radio', { name: 'Class 10 Entrance Exam' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Book 2 students' })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Book 2 students' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Close student booking' })).toBeDisabled()
    );
    reject(new Error('Response lost'));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Book 2 students' })).toBeEnabled()
    );
    expect(screen.getByRole('button', { name: 'Remove Sweta' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: retryAction }));
    await waitFor(() => expect(api.confirm.mock.calls[1][0]).toEqual(api.confirm.mock.calls[0][0]));
  }
);

it('explains an existing booking and opens its details without previewing or confirming a duplicate', async () => {
  const onViewBooking = vi.fn();
  const booked = {
    ...students[0],
    assessment: {
      ...students[0].assessment,
      canBook: false,
      attempts: [
        {
          id: 'attempt',
          attemptNumber: 1,
          sessionId: 'session-1',
          sessionName: 'Class 10 Entrance Exam',
          status: 'pending',
          outcome: 'pending',
          attendance: 'pending',
          concurrencyStamp: 'attempt-stamp',
          createdAt: '2026-10-30T08:00:00Z',
        },
      ],
    },
  };
  show({ rows: [booked], onViewBooking });
  expect(screen.getByText('Already booked in Class 10 Entrance Exam.')).toBeVisible();
  expect(screen.getByText('Already booked')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Book 1 student' })).toBeDisabled();
  expect(screen.queryByRole('radio')).not.toBeInTheDocument();
  expect(api.get).not.toHaveBeenCalled();
  expect(api.preview).not.toHaveBeenCalled();
  expect(api.confirm).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'View booking for Sweta' }));
  expect(onViewBooking).toHaveBeenCalledExactlyOnceWith(booked);
});

it('requires explicit removal of an already booked student before booking the eligible student', async () => {
  const booked = {
    ...students[1],
    assessment: {
      ...students[1].assessment,
      canBook: false,
      attempts: [
        {
          id: 'attempt',
          attemptNumber: 1,
          sessionId: 'session-1',
          sessionName: 'Earlier exam',
          status: 'pending',
          outcome: 'pending',
          attendance: 'pending',
          concurrencyStamp: 'stamp',
          createdAt: '2026-10-30T08:00:00Z',
        },
      ],
    },
  };
  show({ rows: [students[0], booked] });
  expect(screen.getByRole('radio', { name: 'Class 10 Entrance Exam' })).toBeDisabled();
  expect(api.preview).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Remove Nikhil' }));
  await userEvent.click(screen.getByRole('radio', { name: 'Class 10 Entrance Exam' }));
  await waitFor(() => expect(screen.getByRole('button', { name: 'Book 1 student' })).toBeEnabled());
  await userEvent.click(screen.getByRole('button', { name: 'Book 1 student' }));
  await waitFor(() => expect(api.confirm).toHaveBeenCalledOnce());
  expect(api.confirm.mock.calls[0][0].bookings.map((item: any) => item.applicationId)).toEqual([
    'Sweta',
  ]);
});
