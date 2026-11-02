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
