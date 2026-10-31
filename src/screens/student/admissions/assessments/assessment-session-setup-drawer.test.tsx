import type {
  AssessmentScope,
  AssessmentBookingPreview,
} from 'src/redux/student/admissions/admission-assessment-types';

import dayjs from 'dayjs';
import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme } from 'src/theme/create-theme';
import { defaultSettings } from 'src/components/settings';
import { act, screen, waitFor, render as renderComponent } from '@testing-library/react';

import { AssessmentSessionSetupDrawer } from './assessment-session-setup-drawer';

const render = (ui: React.ReactElement) =>
  renderComponent(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider theme={createTheme(defaultSettings)}>{children}</ThemeProvider>
    ),
  });

vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { error: vi.fn(), warning: vi.fn(), info: vi.fn(), dismiss: vi.fn() },
}));
vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('./assessment-session-setup-fields', () => ({
  AssessmentSessionSetupFields: ({ formik, disabled }: any) => (
    <>
      <label htmlFor="session-test-name">
        Session name
        <input id="session-test-name" {...formik.getFieldProps('name')} disabled={disabled} />
      </label>
      <button
        type="button"
        disabled={disabled}
        onClick={() =>
          formik.setValues({
            ...formik.values,
            name: 'Entrance exam',
            offeringIds: ['offering'],
            stageIds: { offering: 'stage' },
            roomId: 'room',
            capacity: 30,
            startsAt: dayjs('2035-01-15T03:00:00Z'),
            endsAt: dayjs('2035-01-15T04:00:00Z'),
          })
        }
      >
        Fill session details
      </button>
    </>
  ),
}));
const scopes: AssessmentScope[] = [
  {
    admissionOfferingId: 'offering',
    workflowStageDefinitionId: 'stage',
    offeringName: 'Class 1',
    stageName: 'Exam',
    workflowDefinitionId: 'workflow',
    workflowVersion: 2,
    schedulingEnabled: true,
  },
];
const candidate = {
  applicationId: 'app',
  stageInstanceId: 'app-stage',
  applicationNumber: 'ADM1',
  applicantName: 'Applicant',
  admissionOfferingId: 'offering',
  workflowStageDefinitionId: 'stage',
  concurrencyStamp: 'app-stamp',
};
const preview: AssessmentBookingPreview = {
  items: [candidate],
  proposedBookings: [candidate],
  totalCount: 1,
  eligibleCount: 1,
  availableCount: 30,
  remainingCount: 0,
  requiresRoomApproval: false,
  roomName: 'R1',
  buildingName: 'Main',
  floorName: 'First',
  previewFingerprint: 'fresh',
  slots: [],
  warnings: [],
};
const session = {
  id: 'session',
  admissionOfferingId: 'offering',
  workflowStageDefinitionId: 'stage',
  name: 'Existing exam',
  startsAt: '2035-01-15T03:00:00.000Z',
  endsAt: '2035-01-15T04:00:00.000Z',
  location: 'Main / First / R1',
  capacity: 30,
  bookedCount: 0,
  isCancelled: false,
  concurrencyStamp: 'session-version',
  roomId: 'room',
  sessionType: 'exam' as const,
};
const props = () => ({
  open: true,
  scopes,
  rooms: [
    {
      id: 'room',
      roomName: 'R1',
      buildingId: 'b',
      buildingName: 'Main',
      floorId: 'f',
      floorName: 'First',
      capacity: 30,
    },
  ],
  interviewers: [],
  onClose: vi.fn(),
  onPreview: vi.fn().mockResolvedValue(preview),
  onSubmit: vi.fn().mockResolvedValue(undefined),
});
async function fillAndSubmit() {
  await userEvent.click(screen.getByRole('button', { name: 'Fill session details' }));
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
}
it('submits one session with zero bookings even when preview proposes applicants', async () => {
  const options = props();
  render(<AssessmentSessionSetupDrawer {...options} />);
  expect(screen.queryByRole('button', { name: 'Preview booking' })).not.toBeInTheDocument();
  await fillAndSubmit();
  await waitFor(() => expect(options.onSubmit).toHaveBeenCalledOnce());
  expect(options.onPreview).toHaveBeenCalledWith(
    expect.objectContaining({
      name: 'Entrance exam',
      scopes: [{ admissionOfferingId: 'offering', workflowStageDefinitionId: 'stage' }],
      startsAt: '2035-01-15T03:00:00.000Z',
      roomId: 'room',
      capacity: 30,
    }),
    { skipCount: 0, maxResultCount: 1 }
  );
  expect(options.onSubmit).toHaveBeenCalledWith(options.onPreview.mock.calls[0][0], 'fresh', []);
  expect(options.onClose).toHaveBeenCalledOnce();
  expect(screen.queryByText('Applicant')).not.toBeInTheDocument();
});
it('does not preview or create invalid session details', async () => {
  const options = props();
  render(<AssessmentSessionSetupDrawer {...options} />);
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(options.onPreview).not.toHaveBeenCalled();
  expect(options.onSubmit).not.toHaveBeenCalled();
  expect(options.onClose).not.toHaveBeenCalled();
});
it.each([500, 408, 'FETCH_ERROR'])(
  'locks inputs and replays exact confirmation after uncertain status %s',
  async (status) => {
    const options = props();
    options.onSubmit.mockRejectedValueOnce({
      status,
      data: { detail: 'Response was not received' },
    });
    render(<AssessmentSessionSetupDrawer {...options} />);
    await fillAndSubmit();
    expect(await screen.findByText('Response was not received')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Session name' })).toBeDisabled();
    expect(options.onClose).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(options.onSubmit).toHaveBeenCalledTimes(2));
    expect(options.onPreview).toHaveBeenCalledOnce();
    expect(options.onSubmit.mock.calls[1]).toEqual(options.onSubmit.mock.calls[0]);
    expect(options.onClose).toHaveBeenCalledOnce();
  }
);
it('allows correcting rejected input and gets a fresh fingerprint after a definitive conflict', async () => {
  const options = props();
  options.onSubmit.mockRejectedValueOnce({
    status: 409,
    data: { detail: 'Room availability changed' },
  });
  options.onPreview
    .mockResolvedValueOnce(preview)
    .mockResolvedValueOnce({ ...preview, previewFingerprint: 'refreshed' });
  render(<AssessmentSessionSetupDrawer {...options} />);
  await fillAndSubmit();
  await screen.findByText('Room availability changed');
  const name = screen.getByRole('textbox', { name: 'Session name' });
  expect(name).toBeEnabled();
  await userEvent.clear(name);
  await userEvent.type(name, 'Revised exam');
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(options.onSubmit).toHaveBeenCalledTimes(2));
  expect(options.onPreview).toHaveBeenCalledTimes(2);
  expect(options.onSubmit).toHaveBeenLastCalledWith(
    expect.objectContaining({ name: 'Revised exam' }),
    'refreshed',
    []
  );
});
it('retains the form on preview failure and checks availability again on Submit', async () => {
  const options = props();
  options.onPreview.mockRejectedValueOnce({ data: { detail: 'Institute room is occupied' } });
  render(<AssessmentSessionSetupDrawer {...options} />);
  await fillAndSubmit();
  await screen.findByText('Institute room is occupied');
  expect(screen.getByRole('textbox', { name: 'Session name' })).toHaveValue('Entrance exam');
  expect(screen.getByRole('textbox', { name: 'Session name' })).toBeEnabled();
  expect(options.onSubmit).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(options.onSubmit).toHaveBeenCalledOnce());
  expect(options.onPreview).toHaveBeenCalledTimes(2);
});
it('saves existing arrangements and version without previewing or booking students', async () => {
  const options = props();
  const onSave = vi.fn().mockResolvedValue(undefined);
  render(
    <AssessmentSessionSetupDrawer {...options} session={session} mode="edit" onSave={onSave} />
  );
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Existing exam', concurrencyStamp: 'session-version' })
    )
  );
  expect(options.onPreview).not.toHaveBeenCalled();
  expect(options.onSubmit).not.toHaveBeenCalled();
  expect(options.onClose).toHaveBeenCalledOnce();
});
it('preserves the draft while resources and live permissions block Submit', async () => {
  const options = props();
  const view = render(<AssessmentSessionSetupDrawer {...options} />);
  await userEvent.click(screen.getByRole('button', { name: 'Fill session details' }));
  view.rerender(<AssessmentSessionSetupDrawer {...options} resourcesError="Rooms unavailable" />);
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  view.rerender(<AssessmentSessionSetupDrawer {...options} readOnly />);
  expect(screen.getByRole('textbox', { name: 'Session name' })).toHaveValue('Entrance exam');
  expect(screen.getByRole('textbox', { name: 'Session name' })).toBeDisabled();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(options.onPreview).not.toHaveBeenCalled();
  expect(options.onSubmit).not.toHaveBeenCalled();
});
it('requires discard confirmation before closing an edited session', async () => {
  const options = props();
  render(<AssessmentSessionSetupDrawer {...options} />);
  await userEvent.click(screen.getByRole('button', { name: 'Fill session details' }));
  await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(options.onClose).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Discard changes' }));
  expect(options.onClose).toHaveBeenCalledOnce();
});
it('does not confirm when permission is revoked while availability is loading', async () => {
  const options = props();
  let finish!: (value: AssessmentBookingPreview) => void;
  options.onPreview.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      })
  );
  const view = render(<AssessmentSessionSetupDrawer {...options} />);
  await fillAndSubmit();
  await waitFor(() => expect(options.onPreview).toHaveBeenCalledOnce());
  view.rerender(<AssessmentSessionSetupDrawer {...options} readOnly />);
  await act(async () => {
    finish(preview);
  });
  expect(options.onSubmit).not.toHaveBeenCalled();
  expect(options.onClose).not.toHaveBeenCalled();
  expect(screen.getByRole('textbox', { name: 'Session name' })).toHaveValue('Entrance exam');
});
