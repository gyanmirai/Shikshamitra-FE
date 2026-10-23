import type { FormikProps } from 'formik';
import type { AdmissionApplicationStage } from 'src/redux/student/admissions/admission-applications-api';

import dayjs from 'dayjs';
import { it, vi, expect, beforeEach } from 'vitest';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { renderWithProviders } from 'src/test/test-utils';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { defaultSettings } from 'src/components/settings/config-settings';
import {
  sessionResponse,
  assessmentResponse,
} from 'src/redux/student/admissions/assessment-test-fixture';

import { AssessmentPipelineBookingDrawer } from './assessment-pipeline-booking-drawer';

import type { SessionSetupValues } from './assessment-session-setup-model';

const mocks = vi.hoisted(() => ({
  permissions: { view: true, book: true, manageSessions: true },
  sessions: vi.fn(),
  scopes: vi.fn(),
  resources: vi.fn(),
  run: vi.fn(),
  preview: vi.fn(),
  confirm: vi.fn(),
}));
vi.mock('./use-assessment-permissions', () => ({
  useAssessmentPermissions: () => mocks.permissions,
}));
vi.mock('./use-assessment-actions', () => ({ useAssessmentActions: () => mocks.run }));
vi.mock('src/components/iconify', () => ({ Iconify: () => <span /> }));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
  },
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useGetAdmissionApplicationQuery: () => ({
    currentData: {
      applicantName: 'QA Student',
      standardName: 'Class 1',
      applicationNumber: 'APP-1',
    },
  }),
}));
vi.mock('src/redux/student/admissions/admission-assessment-sessions-api', () => ({
  useGetAssessmentSessionsQuery: mocks.sessions,
  useGetAssessmentScopesQuery: mocks.scopes,
}));
vi.mock('src/redux/student/admissions/admission-assessment-planning-api', () => ({
  useGetAssessmentSessionResourcesQuery: mocks.resources,
  useGetAssessmentSessionSlotsQuery: () => ({
    currentData: [],
    isLoading: false,
    isError: false,
    isFetching: false,
  }),
  useLazyGetAssessmentInterviewersQuery: () => [vi.fn()],
  usePreviewAssessmentSessionMutation: () => [mocks.preview],
  useConfirmAssessmentSessionMutation: () => [mocks.confirm],
}));
vi.mock('./assessment-session-setup-fields', () => ({
  AssessmentSessionSetupFields: ({
    formik,
    pipeline,
  }: {
    formik: FormikProps<SessionSetupValues>;
    pipeline: boolean;
  }) => (
    <div data-testid="shared-slot-fields" data-pipeline={String(pipeline)}>
      <input aria-label="Session name" {...formik.getFieldProps('name')} />
      <button
        type="button"
        onClick={() =>
          formik.setValues({
            ...formik.values,
            roomId: 'room',
            capacity: 30,
            startsAt: dayjs('2999-01-01T10:00:00'),
            endsAt: dayjs('2999-01-01T11:00:00'),
          })
        }
      >
        Fill slot details
      </button>
    </div>
  ),
}));

const stage = {
  id: 'stage-1',
  definitionStageId: 'definition-1',
  name: 'Entrance assessment',
  status: 1,
} as AdmissionApplicationStage;
const scope = {
  admissionOfferingId: 'offering-1',
  workflowStageDefinitionId: 'definition-1',
  className: 'Class 1',
  stageName: 'Entrance assessment',
  schedulingEnabled: true,
};
const candidate = {
  applicationId: 'application-1',
  stageInstanceId: 'stage-1',
  concurrencyStamp: 'fresh-stamp',
};
const content = (onClose: () => void, canBook = true) => (
  <ThemeProvider theme={createTheme(defaultSettings)}>
    <AssessmentPipelineBookingDrawer
      assessment={{
        ...assessmentResponse,
        canBook,
        policy: { ...assessmentResponse.policy!, schedulingEnabled: true },
      }}
      admissionOfferingId="offering-1"
      stage={stage}
      disabled={false}
      onClose={onClose}
    />
  </ThemeProvider>
);
const draw = (onClose = vi.fn()) => renderWithProviders(content(onClose));
beforeEach(() => {
  vi.clearAllMocks();
  mocks.permissions.book = true;
  mocks.permissions.manageSessions = true;
  mocks.sessions.mockReturnValue({
    currentData: [],
    isFetching: false,
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  mocks.scopes.mockReturnValue({
    currentData: [scope],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  mocks.resources.mockReturnValue({
    currentData: {
      rooms: [
        { id: 'room', roomName: 'A102', buildingName: 'Main', floorName: 'First', capacity: 30 },
      ],
      interviewers: [],
    },
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
  mocks.run.mockResolvedValue(undefined);
  mocks.preview.mockImplementation(() => ({
    unwrap: () =>
      Promise.resolve({
        items: [candidate],
        proposedBookings: [],
        availableCount: 30,
        requiresRoomApproval: false,
        previewFingerprint: 'fresh-preview',
      }),
  }));
  mocks.confirm.mockImplementation(() => ({
    unwrap: () => Promise.resolve({ session: sessionResponse, bookedCount: 1 }),
  }));
});

it('shows an inline empty state and opens shared slot fields in the same small-button drawer', () => {
  draw();
  expect(screen.getByRole('dialog', { name: 'Book Assessment Slot' })).toBeInTheDocument();
  expect(screen.getByText('No slots available')).toBeVisible();
  expect(screen.getByRole('button', { name: 'Book Slot' })).toBeDisabled();
  const add = screen.getByRole('button', { name: 'Add Slot' });
  expect(add).toHaveClass('MuiButton-sizeSmall');
  fireEvent.click(add);
  expect(screen.getAllByRole('dialog')).toHaveLength(1);
  expect(screen.getByRole('dialog', { name: 'Add Assessment Slot' })).toBeVisible();
  expect(screen.getByTestId('shared-slot-fields')).toHaveAttribute('data-pipeline', 'true');
  expect(screen.getByRole('button', { name: 'Create & Book' })).toHaveClass('MuiButton-sizeSmall');
});

it('books an existing selected session without creating a new slot', async () => {
  const onClose = vi.fn();
  mocks.sessions.mockReturnValue({
    currentData: [{ ...sessionResponse, startsAt: '2999-01-01T10:00:00Z' }],
    isFetching: false,
    isError: false,
  });
  draw(onClose);
  fireEvent.mouseDown(screen.getByRole('combobox', { name: 'Assessment session' }));
  fireEvent.click(await screen.findByRole('option', { name: /Entrance exam/ }));
  fireEvent.click(screen.getByRole('button', { name: 'Book Slot' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(mocks.run).toHaveBeenCalledWith(
    'book',
    expect.objectContaining({ sessionId: 'session-1' })
  );
  expect(mocks.confirm).not.toHaveBeenCalled();
});

it('creates and books exactly the current applicant after validation', async () => {
  const onClose = vi.fn();
  draw(onClose);
  fireEvent.click(screen.getByRole('button', { name: 'Add Slot' }));
  fireEvent.click(screen.getByRole('button', { name: 'Create & Book' }));
  await waitFor(() => expect(mocks.preview).not.toHaveBeenCalled());
  fireEvent.click(screen.getByRole('button', { name: 'Fill slot details' }));
  fireEvent.click(screen.getByRole('button', { name: 'Create & Book' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(mocks.preview).toHaveBeenCalledWith(
    expect.objectContaining({
      search: 'APP-1',
      session: expect.objectContaining({
        scopes: [{ admissionOfferingId: 'offering-1', workflowStageDefinitionId: 'definition-1' }],
      }),
    })
  );
  expect(mocks.confirm).toHaveBeenCalledWith(expect.objectContaining({ bookings: [candidate] }));
  expect(mocks.run).not.toHaveBeenCalled();
});

it('shows a room conflict without confirming and keeps the slot form available for correction', async () => {
  const onClose = vi.fn();
  const reason = "Room is reserved for 'Entrance exam' (Exam) from 14:15 to 15:05.";
  mocks.preview.mockImplementationOnce(() => ({
    unwrap: vi.fn().mockRejectedValue({
      status: 400,
      data: {
        errorCode: 'Admissions:Assessment:InvalidState',
        detail: 'This assessment action is not available in the current state.',
        data: { Reason: reason },
      },
    }),
  }));
  draw(onClose);
  fireEvent.click(screen.getByRole('button', { name: 'Add Slot' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fill slot details' }));
  const name = screen.getByRole('textbox', { name: 'Session name' });
  const originalName = (name as HTMLInputElement).value;
  fireEvent.click(screen.getByRole('button', { name: 'Create & Book' }));

  expect(await screen.findByText(reason, { exact: false })).toBeVisible();
  expect(name).toHaveValue(originalName);
  expect(onClose).not.toHaveBeenCalled();
  expect(mocks.confirm).not.toHaveBeenCalled();
  expect(screen.getByRole('button', { name: 'Create & Book' })).toBeEnabled();
});

it('preserves the form and replays the same atomic command after a lost confirmation response', async () => {
  const onClose = vi.fn();
  mocks.confirm.mockImplementationOnce(() => ({
    unwrap: () => Promise.reject(new Error('Response lost')),
  }));
  const view = draw(onClose);
  fireEvent.click(screen.getByRole('button', { name: 'Add Slot' }));
  fireEvent.click(screen.getByRole('button', { name: 'Fill slot details' }));
  fireEvent.click(screen.getByRole('button', { name: 'Create & Book' }));
  await screen.findByText(/Response lost|could not|failed|unable/i);
  expect(onClose).not.toHaveBeenCalled();
  const sent = mocks.confirm.mock.calls[0][0];
  view.rerender(content(onClose, false));
  expect(screen.getByRole('button', { name: 'Create & Book' })).toBeEnabled();
  fireEvent.click(screen.getByRole('button', { name: 'Create & Book' }));
  await waitFor(() => expect(onClose).toHaveBeenCalledOnce());
  expect(mocks.confirm).toHaveBeenLastCalledWith(sent);
  expect(mocks.preview).toHaveBeenCalledOnce();
});

it('guards unsaved slot changes and returns to booking without leaving Pipeline', async () => {
  const onClose = vi.fn();
  draw(onClose);
  fireEvent.click(screen.getByRole('button', { name: 'Add Slot' }));
  fireEvent.change(screen.getByRole('textbox', { name: 'Session name' }), {
    target: { value: 'My slot' },
  });
  fireEvent.click(screen.getByRole('button', { name: 'Back to booking' }));
  expect(screen.getByRole('dialog', { name: 'Discard Changes?' })).toBeVisible();
  fireEvent.click(screen.getByRole('button', { name: 'Discard' }));
  expect(await screen.findByRole('dialog', { name: 'Book Assessment Slot' })).toBeInTheDocument();
  expect(onClose).not.toHaveBeenCalled();
});

it('does not offer Add Slot without session-management permission', () => {
  mocks.permissions.manageSessions = false;
  draw();
  expect(screen.queryByRole('button', { name: 'Add Slot' })).not.toBeInTheDocument();
  expect(screen.getByText('No slots available')).toBeVisible();
});
