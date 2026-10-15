import type {
  AssessmentScope,
  AssessmentBookingPreview,
} from 'src/redux/student/admissions/admission-assessment-types';

import dayjs from 'dayjs';
import { vi, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor } from '@testing-library/react';

import { AssessmentSessionSetupDrawer } from './assessment-session-setup-drawer';

vi.mock('src/components/iconify', () => ({ Iconify: () => null }));
vi.mock('src/components/custom-stepper', async () => {
  const { useFormik } = await import('formik');
  return {
    CustomStepperWithFormik: ({
      initialValues,
      validationSchema,
      activeStep,
      renderItem,
      handleNext,
      handleBack,
      onCancel,
      saveAndNextButtonProps,
    }: any) => {
      const formik = useFormik({ initialValues, validationSchema, onSubmit: () => {} });
      return (
        <>
          <div>{renderItem({ formik })}</div>
          <button
            type="button"
            disabled={saveAndNextButtonProps.disabled}
            onClick={activeStep ? handleBack : onCancel}
          >
            {activeStep ? 'Back' : 'Cancel'}
          </button>
          <button
            type="button"
            disabled={saveAndNextButtonProps.disabled}
            onClick={async () => {
              const errors = await formik.validateForm();
              if (!Object.keys(errors).length)
                await handleNext(activeStep === 1, formik.values, formik, () => {});
            }}
          >
            {activeStep ? 'Submit' : 'Preview booking'}
          </button>
        </>
      );
    },
  };
});
vi.mock('./assessment-session-setup-fields', () => ({
  AssessmentSessionSetupFields: ({ formik }: any) => (
    <>
      <p>Draft name: {formik.values.name}</p>
      <button
        type="button"
        onClick={() =>
          formik.setValues({
            ...formik.values,
            name: 'Entrance exam',
            offeringIds: ['offering'],
            stageIds: { offering: 'stage' },
            roomId: 'room',
            capacity: 30,
            startsAt: dayjs().add(3, 'day'),
            endsAt: dayjs().add(3, 'day').add(1, 'hour'),
          })
        }
      >
        Fill session details
      </button>
    </>
  ),
}));
vi.mock('./assessment-session-booking-preview', () => ({
  AssessmentSessionBookingPreview: ({
    selected,
    onChange,
    preview,
    error,
    onRetry,
    onSearch,
    onPage,
  }: any) => (
    <>
      <p>{selected.length} selected</p>
      <p>{preview.items.length} preview rows</p>
      {error && (
        <div role="alert">
          {error}
          <button type="button" onClick={onRetry}>
            Retry preview
          </button>
        </div>
      )}
      <button type="button" onClick={() => onChange([preview.items[0]])}>
        Select one applicant
      </button>
      <button type="button" onClick={() => onChange([])}>
        Clear booking selection
      </button>
      <button type="button" onClick={() => onSearch('Riya')}>
        Search Riya
      </button>
      <button type="button" onClick={() => onPage(2, 50)}>
        Go to page 3
      </button>
    </>
  ),
}));

const scopes: AssessmentScope[] = [
  {
    admissionOfferingId: 'offering',
    workflowStageDefinitionId: 'stage',
    offeringName: 'Class1',
    stageName: 'Exam',
    workflowDefinitionId: 'workflow',
    workflowVersion: 2,
    schedulingEnabled: true,
  },
];
const candidates = Array.from({ length: 30 }, (_, index) => ({
  applicationId: `app${index}`,
  stageInstanceId: `stage${index}`,
  applicationNumber: `ADM${index}`,
  applicantName: `Applicant${index}`,
  admissionOfferingId: 'offering',
  workflowStageDefinitionId: 'stage',
  concurrencyStamp: `stamp${index}`,
}));
const preview: AssessmentBookingPreview = {
  items: candidates.slice(0, 25),
  proposedBookings: candidates,
  totalCount: 42,
  eligibleCount: 42,
  availableCount: 30,
  remainingCount: 12,
  requiresRoomApproval: false,
  roomName: 'R1',
  buildingName: 'Main',
  floorName: 'First',
  previewFingerprint: 'fresh',
  slots: [],
  warnings: [],
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

it('one-click preview selects 30 proposed applicants despite a 25-row page', async () => {
  const options = props();
  render(<AssessmentSessionSetupDrawer {...options} />);
  await userEvent.click(screen.getByText('Fill session details'));
  await userEvent.click(screen.getByRole('button', { name: 'Preview booking' }));
  expect(await screen.findByText('30 selected')).toBeInTheDocument();
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(options.onSubmit).toHaveBeenCalled());
  expect(options.onSubmit.mock.calls[0][2]).toHaveLength(30);
  expect(options.onSubmit.mock.calls[0][1]).toBe('fresh');
  expect(options.onClose).toHaveBeenCalledOnce();
});
it('keeps the applicant selection and fingerprint after a failed confirm for a safe retry', async () => {
  const options = props();
  options.onSubmit.mockRejectedValueOnce({ data: { detail: 'Room availability changed' } });
  render(<AssessmentSessionSetupDrawer {...options} />);
  await userEvent.click(screen.getByText('Fill session details'));
  await userEvent.click(screen.getByRole('button', { name: 'Preview booking' }));
  await screen.findByText('30 selected');
  await userEvent.click(screen.getByRole('button', { name: 'Select one applicant' }));
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  expect(await screen.findByText('Room availability changed')).toBeInTheDocument();
  expect(screen.getByText('1 selected')).toBeInTheDocument();
  expect(options.onClose).not.toHaveBeenCalled();
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(options.onSubmit).toHaveBeenCalledTimes(2));
  expect(options.onSubmit.mock.calls[1]).toEqual(options.onSubmit.mock.calls[0]);
});
it('blocks preview when resources fail and exposes retry without discarding the form', async () => {
  const options = props();
  const retry = vi.fn();
  render(
    <AssessmentSessionSetupDrawer
      {...options}
      resourcesError="Institute rooms could not be loaded"
      onRetryResources={retry}
    />
  );
  expect(screen.getByRole('button', { name: 'Preview booking' })).toBeDisabled();
  await userEvent.click(screen.getByRole('button', { name: 'Retry' }));
  expect(retry).toHaveBeenCalledOnce();
  expect(options.onPreview).not.toHaveBeenCalled();
});

it.each([
  { action: 'Search Riya', query: { skipCount: 0, maxResultCount: 25, search: 'Riya' } },
  { action: 'Go to page 3', query: { skipCount: 100, maxResultCount: 50, search: undefined } },
])(
  'retries the failed $action query while masking old rows and retaining chosen applicants',
  async ({ action, query }) => {
    const options = props();
    const initialPreview =
      action === 'Go to page 3'
        ? { ...preview, totalCount: 142, eligibleCount: 142, remainingCount: 112 }
        : preview;
    options.onPreview
      .mockResolvedValueOnce(initialPreview)
      .mockRejectedValueOnce({ data: { detail: 'Candidate lookup unavailable' } })
      .mockResolvedValueOnce(initialPreview);
    render(<AssessmentSessionSetupDrawer {...options} />);
    await userEvent.click(screen.getByText('Fill session details'));
    await userEvent.click(screen.getByRole('button', { name: 'Preview booking' }));
    await screen.findByText('30 selected');
    await userEvent.click(screen.getByRole('button', { name: action }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Candidate lookup unavailable');
    expect(screen.getByText('0 preview rows')).toBeInTheDocument();
    expect(screen.getByText('30 selected')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
    expect(options.onPreview.mock.calls[1][1]).toEqual(query);
    await userEvent.click(screen.getByRole('button', { name: 'Retry preview' }));
    await waitFor(() => expect(screen.queryByRole('alert')).not.toBeInTheDocument());
    expect(options.onPreview.mock.calls[2][1]).toEqual(query);
    expect(screen.getByText('25 preview rows')).toBeInTheDocument();
    expect(screen.getByText('30 selected')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
    await waitFor(() => expect(options.onSubmit).toHaveBeenCalledOnce());
    expect(options.onSubmit.mock.calls[0][1]).toBe('fresh');
    expect(options.onSubmit.mock.calls[0][2]).toHaveLength(30);
  }
);

it('requires at least one applicant in existing-session booking mode', async () => {
  const options = props();
  const session = {
    id: 'session',
    admissionOfferingId: 'offering',
    workflowStageDefinitionId: 'stage',
    name: 'Existing exam',
    startsAt: dayjs().add(3, 'day').toISOString(),
    endsAt: dayjs().add(3, 'day').add(1, 'hour').toISOString(),
    location: 'Main / First / R1',
    capacity: 30,
    bookedCount: 0,
    isCancelled: false,
    concurrencyStamp: 'session-version',
    roomId: 'room',
    sessionType: 'exam' as const,
  };
  render(<AssessmentSessionSetupDrawer {...options} session={session} mode="book" />);
  await userEvent.click(screen.getByRole('button', { name: 'Preview booking' }));
  await screen.findByText('30 selected');
  await userEvent.click(screen.getByRole('button', { name: 'Clear booking selection' }));
  expect(screen.getByText('0 selected')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(options.onSubmit).not.toHaveBeenCalled();
});

it('still creates a new session without applicants selected', async () => {
  const options = props();
  render(<AssessmentSessionSetupDrawer {...options} />);
  await userEvent.click(screen.getByText('Fill session details'));
  await userEvent.click(screen.getByRole('button', { name: 'Preview booking' }));
  await screen.findByText('30 selected');
  await userEvent.click(screen.getByRole('button', { name: 'Clear booking selection' }));
  expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled();
  await userEvent.click(screen.getByRole('button', { name: 'Submit' }));
  await waitFor(() => expect(options.onSubmit).toHaveBeenCalledOnce());
  expect(options.onSubmit.mock.calls[0][2]).toEqual([]);
});

it('preserves drafts and selection while live permission loss blocks preview and submit', async () => {
  const options = props();
  const view = render(<AssessmentSessionSetupDrawer {...options} />);
  await userEvent.click(screen.getByText('Fill session details'));
  view.rerender(<AssessmentSessionSetupDrawer {...options} readOnly />);
  expect(screen.getByText('Draft name: Entrance exam')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Preview booking' })).toBeDisabled();
  expect(screen.getByText(/Changes require the action permission/)).toBeInTheDocument();
  expect(options.onPreview).not.toHaveBeenCalled();
  view.rerender(<AssessmentSessionSetupDrawer {...options} readOnly={false} />);
  await userEvent.click(screen.getByRole('button', { name: 'Preview booking' }));
  await screen.findByText('30 selected');
  expect(options.onPreview.mock.calls[0][0].name).toBe('Entrance exam');
  view.rerender(<AssessmentSessionSetupDrawer {...options} readOnly />);
  expect(screen.getByText('30 selected')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Submit' })).toBeDisabled();
  expect(options.onSubmit).not.toHaveBeenCalled();
});
