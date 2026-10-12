import { vi, it, expect, describe } from 'vitest';
import { renderHook } from '@testing-library/react';

import { useAdmissionOfferingsScreen } from './use-admission-offerings-screen';

const mocks = vi.hoisted(() => ({
  cycleId: '',
  getOfferings: vi.fn<(...args: unknown[]) => Record<string, unknown>>(() => ({})),
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('react-redux', () => ({ useSelector: () => undefined }));
vi.mock('./use-bulk-admission-offering-activation', () => ({
  useBulkAdmissionOfferingActivation: () => ({}),
}));
vi.mock('./use-admission-offering-filters', () => ({
  useAdmissionOfferingFilters: () => ({
    filters: {
      admissionCycleId: mocks.cycleId,
      boardId: 'board',
      mediumId: 'medium',
      standardId: '',
      isActive: '',
      availabilityStatus: '',
      configurationStatus: '',
      page: 0,
      rowsPerPage: 10,
    },
  }),
}));
vi.mock('./use-admission-offering-actions', () => ({
  useAdmissionOfferingActions: () => ({ permissions: { activate: true } }),
}));
vi.mock('src/redux/student/admissions/admission-cycles-api', () => ({
  useGetAdmissionCyclesQuery: () => ({
    data: {
      items: [
        { id: 'archived', status: 3 },
        { id: 'newest-draft', status: 0 },
        { id: 'open-cycle-1', status: 1, isAcceptingApplications: true },
        { id: 'open-cycle-2', status: 1, isAcceptingApplications: true },
        { id: 'open-cycle-3', status: 1, isAcceptingApplications: true },
      ],
    },
  }),
}));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useGetAdmissionOfferingsQuery: (...args: unknown[]) => mocks.getOfferings(...args),
}));

describe('Offering cycle context', () => {
  it('uses exactly the selected cycle when three published open cycles exist', () => {
    mocks.cycleId = 'open-cycle-2';
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.cycle?.id).toBe('open-cycle-2');
    expect(mocks.getOfferings).toHaveBeenLastCalledWith(
      expect.objectContaining({ admissionCycleId: 'open-cycle-2' }),
      expect.anything()
    );
  });

  it('falls back to first non-archived API result without prioritizing published/open cycles', () => {
    mocks.cycleId = '';
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.cycle?.id).toBe('newest-draft');
    expect(hook.result.current.cycles.some((cycle) => cycle.id === 'archived')).toBe(false);
  });
});
