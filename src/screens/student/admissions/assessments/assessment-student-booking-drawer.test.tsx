import dayjs from 'dayjs';
import { vi, it, expect, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { defaultSettings } from 'src/components/settings/config-settings';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { act, render, screen, waitFor, fireEvent, renderHook } from '@testing-library/react';
import {
  sessionResponse,
  assessmentResponse,
} from 'src/redux/student/admissions/assessment-test-fixture';

import { useAssessmentStudentBooking } from './use-assessment-student-booking';
import { AssessmentStudentBookingDrawer } from './assessment-student-booking-drawer';

const api = vi.hoisted(() => ({
  preview: vi.fn(),
  confirm: vi.fn(),
  get: vi.fn(),
  session: {} as any,
  resources: {} as any,
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: vi.fn(), dismiss: vi.fn() },
}));
vi.mock('src/redux/student/admissions/admission-assessment-planning-api', () => ({
  useGetAssessmentSessionWorkbenchQuery: () => ({
    currentData: { items: [api.session], totalCount: 1 },
  }),
  useGetAssessmentSessionResourcesQuery: () => ({ currentData: api.resources }),
  useLazyGetAssessmentSessionByIdQuery: () => [(id: string) => ({ unwrap: () => api.get(id) })],
  usePreviewAssessmentSessionMutation: () => [
    (body: unknown) => ({ unwrap: () => api.preview(body) }),
  ],
  useConfirmAssessmentSessionMutation: () => [
    (body: unknown) => ({ unwrap: () => api.confirm(body) }),
  ],
  useLazyGetAssessmentInterviewersQuery: () => [() => ({ unwrap: async () => [] })],
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
  api.get.mockResolvedValue(api.session);
  api.preview.mockResolvedValue(preview);
  api.confirm.mockResolvedValue({ session: api.session, bookedCount: 2 });
  api.resources = {
    rooms: [
      {
        id: 'room',
        roomName: 'A001',
        buildingId: 'building',
        buildingName: 'Main',
        floorId: 'floor',
        floorName: 'Ground',
        capacity: 24,
      },
    ],
    interviewers: [],
  };
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
          canCreate
          onClose={vi.fn()}
          onBooked={onBooked}
          {...overrides}
        />
      </LocalizationProvider>
    </ThemeProvider>
  );

it('can create for the remaining class after remove, Back, discard and reopen', async () => {
  const rows = [
    students[0],
    {
      ...students[1],
      admissionOfferingId: 'offering-2',
      workflowStageDefinitionId: 'definition-2',
    },
  ];
  const { result } = renderHook(() =>
    useAssessmentStudentBooking({
      rows,
      scopes: [
        scope,
        { ...scope, admissionOfferingId: 'offering-2', workflowStageDefinitionId: 'definition-2' },
      ],
      academicYearId: 'year',
      canBook: true,
      canCreate: true,
      onClose: vi.fn(),
      onBooked,
    })
  );
  act(() => result.current.setPage(2));
  act(() => result.current.remove('stage-Nikhil'));
  expect(result.current.page).toBe(0);
  act(() => result.current.beginCreate());
  act(() => result.current.navigate('back'));
  act(() => result.current.discardChanges());
  act(() => result.current.beginCreate());
  await act(async () => {
    await result.current.form.setValues({
      ...result.current.form.values,
      name: 'Remaining class exam',
      roomId: 'room',
      startsAt: dayjs('2999-10-30T04:30:00Z'),
      endsAt: dayjs('2999-10-30T05:30:00Z'),
      capacity: 24,
    });
  });
  await act(async () => {
    await result.current.form.submitForm();
  });
  expect(api.preview).toHaveBeenCalledOnce();
  expect(api.confirm.mock.calls[0][0].session.scopes).toEqual([
    { admissionOfferingId: 'offering-1', workflowStageDefinitionId: 'definition-1' },
  ]);
});

it('carries both students into the drawer and confirms them without a second selection step', async () => {
  show();
  expect(screen.getByText('Sweta')).toBeVisible();
  expect(screen.getByText('Nikhil')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Book 2 Students' })).toBeDisabled();
  await userEvent.click(screen.getByRole('radio', { name: 'Class 10 Entrance Exam' }));
  await waitFor(() =>
    expect(screen.getByRole('button', { name: 'Book 2 Students' })).toBeEnabled()
  );
  await userEvent.click(screen.getByRole('button', { name: 'Book 2 Students' }));
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
  expect(screen.getByRole('button', { name: 'Book 2 Students' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Remove Nikhil' }));
  await userEvent.click(screen.getByRole('button', { name: 'Book 1 Student' }));
  await waitFor(() => expect(api.confirm).toHaveBeenCalledOnce());
  expect(api.confirm.mock.calls[0][0].bookings.map((item: any) => item.applicationId)).toEqual([
    'Sweta',
  ]);
});

it('opens Create & Book inside the same drawer with the selected class and Institute room field', async () => {
  show();
  await userEvent.click(screen.getByRole('button', { name: 'Create Session' }));
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(screen.getByText('Create & Book')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Create & Book 2 Students' })).toBeVisible();
  expect(screen.getByText('Class 10', { selector: 'span' })).toBeInTheDocument();
  expect(screen.getByLabelText(/Institute room/)).toBeInTheDocument();
});

it.each(['Book 2 Students', 'Retry'])(
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
      expect(screen.getByRole('button', { name: 'Book 2 Students' })).toBeEnabled()
    );
    fireEvent.click(screen.getByRole('button', { name: 'Book 2 Students' }));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Close student booking' })).toBeDisabled()
    );
    reject(new Error('Response lost'));
    await waitFor(() =>
      expect(screen.getByRole('button', { name: 'Book 2 Students' })).toBeEnabled()
    );
    expect(screen.getByRole('button', { name: 'Remove Sweta' })).toBeDisabled();
    await userEvent.click(screen.getByRole('button', { name: retryAction }));
    await waitFor(() => expect(api.confirm.mock.calls[1][0]).toEqual(api.confirm.mock.calls[0][0]));
  }
);
