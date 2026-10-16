import type { AdmissionInquiry } from 'src/redux/student/admissions/admission-inquiries-api';

import { vi, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useInquiryHandoff } from './use-inquiry-handoff';

const mocks = vi.hoisted(() => ({ start: vi.fn(), push: vi.fn(), error: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ push: mocks.push }) }));
vi.mock('react-redux', () => ({
  useSelector: (select: (state: unknown) => unknown) =>
    select({
      auth: {
        permissions: [{ name: 'Students.Admissions.Applications.Add', isGranted: true }],
      },
    }),
}));
vi.mock('src/redux/student/admissions/admission-applications-api', () => ({
  useStartAdmissionApplicationMutation: () => [mocks.start, { isLoading: false }],
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: { success: vi.fn(), error: mocks.error },
}));

const inquiry = {
  id: 'inquiry-1',
  status: 2,
  applicantId: 'applicant-1',
  admissionOfferingId: 'offering-1',
} as AdmissionInquiry;
beforeEach(() => {
  vi.clearAllMocks();
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
