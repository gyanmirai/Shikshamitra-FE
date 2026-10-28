import { renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useAdmissionOfferingsScreen } from './use-admission-offerings-screen';

const mocks = vi.hoisted(() => ({
  cycleId: '',
  update: vi.fn(),
  queryFilters: {} as Record<string, unknown>,
  getOfferings: vi.fn<(...args: unknown[]) => Record<string, unknown>>(() => ({})),
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('react-redux', () => ({ useSelector: () => undefined }));
vi.mock('src/redux/class/classApi', () => ({ useGetClassByMediumQuery: () => ({}) }));
vi.mock('src/redux/academicOrganizationOptions/academicOrganizationOptionsApi', () => ({
  useGetAcademicOrganizationOptionsQuery: () => ({}),
}));
vi.mock('./use-bulk-admission-offering-activation', () => ({
  useBulkAdmissionOfferingActivation: () => ({}),
}));
vi.mock('./use-admission-offering-filters', () => ({
  useAdmissionOfferingFilters: () => ({
    update: mocks.update,
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
      ...mocks.queryFilters,
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
  beforeEach(() => {
    mocks.queryFilters = {};
  });
  it('keeps compulsory Board and Medium out of removable table filters', () => {
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.tableFilters).toEqual([]);
  });
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

  it('never exposes previous-scope rows for bulk activation or table display', () => {
    mocks.getOfferings.mockReturnValueOnce({
      data: { items: [{ id: 'old-scope' }] },
      isFetching: true,
    });
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.rows).toEqual([]);
  });

  it('retains current-scope rows while a refresh is running or fails', () => {
    const items = [{ id: 'current-scope' }];
    mocks.getOfferings.mockReturnValueOnce({
      data: { items },
      currentData: { items, totalCount: 1 },
      isFetching: true,
    });
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.rows).toEqual(items);
  });
  it('sends count criteria to the owning URL state and keeps explicit zero status and academic scope', () => {
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    hook.result.current.applyTableFilters([
      ...hook.result.current.tableFilters,
      { column: 'configurationStatus', type: 'equals', value: 0, valueType: 'enum' },
      { column: 'applicationCount', type: 'greaterThan', value: '10', valueType: 'number' },
    ]);
    expect(mocks.update).toHaveBeenLastCalledWith(
      expect.objectContaining({
        boardId: 'board',
        mediumId: 'medium',
        configurationStatus: '0',
        columnFilters: JSON.stringify([
          { column: 'applicationCount', type: 'greaterThan', value: 10, valueType: 'number' },
        ]),
      })
    );
  });
  it('passes date/count criteria and false/zero statuses before backend count and paging', () => {
    const columnFilters = JSON.stringify([
      {
        column: 'applicationCount',
        type: 'between',
        value: { min: 0, max: 12 },
        valueType: 'number',
      },
    ]);
    mocks.queryFilters = {
      columnFilters,
      isActive: 'false',
      availabilityStatus: '0',
      configurationStatus: '0',
      page: 2,
      rowsPerPage: 25,
    };
    renderHook(() => useAdmissionOfferingsScreen());
    expect(mocks.getOfferings).toHaveBeenLastCalledWith(
      expect.objectContaining({
        boardId: 'board',
        mediumId: 'medium',
        columnFilters,
        isActive: false,
        availabilityStatus: 0,
        configurationStatus: 0,
        skipCount: 50,
        maxResultCount: 25,
      }),
      { skip: false }
    );
  });
});
