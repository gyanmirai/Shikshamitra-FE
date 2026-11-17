import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { vi, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useInquiryHandoff } from './use-inquiry-handoff';

const mocks = vi.hoisted(() => ({ start: vi.fn(), push: vi.fn(), error: vi.fn(), canMove: true }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: {
        permissions: [{ name: 'Students.Admissions.Applications.Add', isGranted: mocks.canMove }],
      },
    }),
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useStartAdmissionApplicationMutation: () => [mocks.start, { isLoading: false }],
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: vi.fn(),
    error: mocks.error,
  },
}));

const inquiry = {
  id: 'inquiry-1',
  inquiryNumber: 'INQ-2026-000006',
  applicantName: 'Ritika Sinha',
  status: 2,
  applicantId: 'applicant-1',
  admissionOfferingId: 'offering-1',
} as AdmissionInquiry;
beforeEach(() => {
  vi.clearAllMocks();
  mocks.canMove = true;
});

it.each([false, undefined])(
  'opens a pre-decision handoff directly in the Pipeline drawer (decision=%s)',
  async (hasReachedDecision) => {
    mocks.start.mockReturnValue({
      unwrap: () => Promise.resolve({ id: 'application-1', hasReachedDecision }),
    });
    const { result } = renderHook(useInquiryHandoff);
    await act(async () => {
      await result.current.move(inquiry);
    });
    expect(mocks.start).toHaveBeenCalledWith({
      applicantId: 'applicant-1',
      offeringId: 'offering-1',
      inquiryId: 'inquiry-1',
    });
    expect(mocks.push).toHaveBeenCalledExactlyOnceWith(
      '/student/admissions/pipeline?application=application-1'
    );
  }
);

const archivedForm = {
  code: 'InquiryFormNotPublished',
  message: "Inquiry Form 'DM 8th INQ FORM' is archived. Restore it in Admission forms.",
  formDefinitionId: 'form-1',
  formName: 'DM 8th INQ FORM',
};

it.each([
  { data: { ConfigurationErrors: [archivedForm] } },
  { error: { data: { configurationErrors: [archivedForm] } } },
  {
    data: {
      ConfigurationErrors: [
        {
          Code: archivedForm.code,
          Message: archivedForm.message,
          FormDefinitionId: archivedForm.formDefinitionId,
          FormName: archivedForm.formName,
        },
      ],
    },
  },
])('retains an archived inquiry form blocker for the recovery dialog: %j', async (data) => {
  mocks.start.mockReturnValue({
    unwrap: () => Promise.reject(Object.assign(new Error('Rejected'), { status: 400, data })),
  });
  const { result } = renderHook(useInquiryHandoff);
  await act(async () => {
    await result.current.move(inquiry);
  });
  expect(result.current.issue).toEqual({
    inquiry,
    formName: 'DM 8th INQ FORM',
    formDefinitionId: 'form-1',
  });
  expect(result.current.moving).toBe(false);
  expect(mocks.error).not.toHaveBeenCalled();
  expect(mocks.push).not.toHaveBeenCalled();
  expect(inquiry.status).toBe(2);
});

it('handles older archived-form responses without inventing a restore target', async () => {
  mocks.start.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Rejected'), {
          status: 400,
          data: {
            errorCode: 'Admissions.OfferingFormNotPublished',
            detail: archivedForm.message,
          },
        })
      ),
  });
  const { result } = renderHook(useInquiryHandoff);
  await act(async () => {
    await result.current.move(inquiry);
  });
  expect(result.current.issue?.formName).toBe('DM 8th INQ FORM');
  expect(result.current.issue?.formDefinitionId).toBeUndefined();
  expect(mocks.error).not.toHaveBeenCalled();
});

it.each([
  { ...archivedForm, message: "Inquiry Form 'DM 8th INQ FORM' is still a draft." },
  {
    ...archivedForm,
    code: 'ApplicationFormNotPublished',
    message: "Registration Form 'Registration' is archived.",
  },
])('preserves existing error feedback for other configuration failures: %j', async (error) => {
  mocks.start.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Rejected'), {
          status: 400,
          data: {
            detail: error.message,
            data: { ConfigurationErrors: [error] },
          },
        })
      ),
  });
  const { result } = renderHook(useInquiryHandoff);
  await act(async () => {
    await result.current.move(inquiry);
  });
  expect(result.current.issue).toBeNull();
  expect(mocks.error).toHaveBeenCalledOnce();
});

it('dismisses the recovery state and permits a normal user-initiated retry', async () => {
  mocks.start.mockReturnValue({
    unwrap: () =>
      Promise.reject(
        Object.assign(new Error('Rejected'), {
          data: {
            data: { ConfigurationErrors: [archivedForm] },
          },
        })
      ),
  });
  const { result } = renderHook(useInquiryHandoff);
  await act(async () => {
    await result.current.move(inquiry);
  });
  act(() => result.current.dismissIssue());
  expect(result.current.issue).toBeNull();
  expect(mocks.start).toHaveBeenCalledOnce();
  mocks.start.mockReturnValue({ unwrap: () => Promise.resolve({ id: 'application-1' }) });
  await act(async () => {
    await result.current.move(inquiry);
  });
  expect(result.current.issue).toBeNull();
  expect(mocks.start).toHaveBeenCalledTimes(2);
  expect(mocks.push).toHaveBeenCalledExactlyOnceWith(
    '/student/admissions/pipeline?application=application-1'
  );
});

it('keeps a server-confirmed decision case in the Applications workspace', async () => {
  mocks.start.mockReturnValue({
    unwrap: () => Promise.resolve({ id: 'application-1', hasReachedDecision: true }),
  });
  const { result } = renderHook(useInquiryHandoff);
  await act(async () => {
    await result.current.move(inquiry);
  });
  expect(mocks.push).toHaveBeenCalledExactlyOnceWith(
    '/student/admissions/applications/application-1?returnTo=%2Fstudent%2Fadmissions%2Fapplications'
  );
});

it('does not start or navigate when the existing move permission is denied', async () => {
  mocks.canMove = false;
  const { result } = renderHook(useInquiryHandoff);
  await act(async () => {
    await result.current.move(inquiry);
  });
  expect(mocks.start).not.toHaveBeenCalled();
  expect(mocks.push).not.toHaveBeenCalled();
});

it.each([
  { status: 1 },
  { isTransferred: true },
  { applicationId: 'existing-application' },
  { isDuplicate: true },
  { admissionOfferingId: undefined },
  { applicantId: undefined },
])('keeps a blocked inquiry from starting or navigating: %j', async (values) => {
  const { result } = renderHook(useInquiryHandoff);
  await act(async () => {
    await result.current.move({ ...inquiry, ...values } as AdmissionInquiry);
  });
  expect(mocks.start).not.toHaveBeenCalled();
  expect(mocks.push).not.toHaveBeenCalled();
});

it('tracks the initiating row immediately and prevents duplicate handoffs', async () => {
  let resolve!: (value: unknown) => void;
  const response = new Promise((done) => {
    resolve = done;
  });
  mocks.start.mockReturnValue({ unwrap: () => response });
  const { result } = renderHook(useInquiryHandoff);
  let moving!: Promise<void>;
  act(() => {
    moving = result.current.move(inquiry);
    result.current.move(inquiry);
  });
  expect(result.current.moving).toBe(true);
  expect(result.current.movingInquiryId).toBe('inquiry-1');
  expect(mocks.start).toHaveBeenCalledOnce();
  await act(async () => {
    resolve({ id: 'application-1', hasReachedDecision: false });
    await moving;
  });
  expect(mocks.push).toHaveBeenCalledOnce();
  expect(result.current.moving).toBe(false);
});

it('clears loading after failure and allows retry without losing the inquiry', async () => {
  mocks.start.mockReturnValue({ unwrap: () => Promise.reject(new Error('failed')) });
  const { result } = renderHook(useInquiryHandoff);
  await act(async () => {
    await result.current.move(inquiry);
  });
  expect(result.current.moving).toBe(false);
  expect(mocks.error).toHaveBeenCalledOnce();
  expect(mocks.push).not.toHaveBeenCalled();
  await act(async () => {
    await result.current.move(inquiry);
  });
  expect(mocks.start).toHaveBeenCalledTimes(2);
});

it.each([
  {
    errorCode: 'Admissions.Offering.Inactive',
    detail: 'One or more business rules were violated.',
  },
  {
    error: {
      code: 'Admissions.Offering.Inactive',
      message: 'One or more business rules were violated.',
    },
  },
])(
  'explains an inactive offering rejection without navigating or losing the inquiry',
  async (data) => {
    const error = Object.assign(new Error('Offering start rejected'), { status: 400, data });
    mocks.start.mockReturnValue({ unwrap: () => Promise.reject(error) });
    const { result } = renderHook(useInquiryHandoff);
    await act(async () => {
      await result.current.move(inquiry);
    });
    expect(mocks.error).toHaveBeenCalledWith({
      message:
        'This admission offering is inactive. Ask an admission administrator to activate it before starting a new inquiry or registration.',
    });
    expect(result.current.moving).toBe(false);
    expect(mocks.push).not.toHaveBeenCalled();
    expect(inquiry.status).toBe(2);
    expect(inquiry.admissionOfferingId).toBe('offering-1');
  }
);
