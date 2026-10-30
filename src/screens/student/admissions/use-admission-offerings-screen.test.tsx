import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';

import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { bulkOfferingInitialValues } from './bulk-admission-offering-model';
import { useAdmissionOfferingsScreen } from './use-admission-offerings-screen';

const mocks = vi.hoisted(() => ({
  cycleId: '',
  update: vi.fn(),
  closeBulk: vi.fn(),
  getCycle: vi.fn<(...args: unknown[]) => Record<string, unknown>>(() => ({})),
  queryFilters: {} as Record<string, unknown>,
  getOfferings: vi.fn<(...args: unknown[]) => Record<string, unknown>>(() => ({})),
  cycles: [] as AdmissionCycle[],
  defaultLookup: {} as Record<string, unknown>,
  yearId: undefined as string | undefined,
}));
vi.mock('next/navigation', () => ({ useSearchParams: () => new URLSearchParams() }));
vi.mock('react-redux', () => ({
  useSelector: (selector: (state: unknown) => unknown) =>
    selector({ globalState: { currentYear: { id: mocks.yearId } }, auth: {} }),
}));
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
  useAdmissionOfferingActions: () => ({
    permissions: { activate: true },
    closeBulk: mocks.closeBulk,
  }),
}));
vi.mock('src/redux/student/admissions/admission-cycles-api', () => ({
  useGetAdmissionCycleQuery: (...args: unknown[]) => mocks.getCycle(...args),
  useGetAdmissionCyclesQuery: (input: { status?: number }) =>
    input.status === 1 ? mocks.defaultLookup : { data: { items: mocks.cycles } },
}));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useGetAdmissionOfferingsQuery: (...args: unknown[]) => mocks.getOfferings(...args),
}));

describe('Offering cycle context', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.cycleId = '';
    mocks.yearId = undefined;
    mocks.getCycle.mockReturnValue({});
    mocks.queryFilters = {};
    mocks.cycles = [
      { id: 'archived', status: 3 },
      { id: 'newest-draft', status: 0 },
      { id: 'open-cycle-1', status: 1, windowStatus: 1 },
      { id: 'open-cycle-2', status: 1, windowStatus: 1 },
      { id: 'open-cycle-3', status: 1, windowStatus: 1 },
    ] as AdmissionCycle[];
    mocks.defaultLookup = { data: { items: [] }, currentData: { items: [] }, isSuccess: true };
  });
  it('reveals the successfully created scope instead of keeping another cycle and hiding filters', () => {
    mocks.cycleId = 'newest-draft';
    mocks.queryFilters = {
      boardId: 'old-board',
      mediumId: 'old-medium',
      search: 'old search',
      isActive: 'true',
      availabilityStatus: '2',
      configurationStatus: '1',
      stageId: 'old-stage',
      columnFilters: '[{"column":"name","type":"contains","value":"old"}]',
      page: 3,
    };
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    const created = {
      ...bulkOfferingInitialValues,
      admissionCycle: { id: 'open-cycle-2' } as AdmissionCycle,
      boardId: 'created-board',
      mediumId: 'created-medium',
      campusId: null,
      standardIds: ['class-1', 'class-2'],
    };
    hook.result.current.showCreatedOfferings(created);
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({
        admissionCycleId: 'open-cycle-2',
        boardId: 'created-board',
        mediumId: 'created-medium',
        campusId: '',
        standardId: 'class-1,class-2',
        stageId: '',
        isActive: '',
        availabilityStatus: '',
        configurationStatus: '',
        search: '',
        columnFilters: '',
        page: 0,
      })
    );
    expect(mocks.closeBulk).toHaveBeenCalledOnce();
  });

  it('hydrates an explicitly selected cycle outside the first page instead of querying the default cycle', () => {
    mocks.cycleId = 'older-published';
    mocks.getCycle.mockReturnValue({
      currentData: { id: 'older-published', status: 1 },
    });
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.cycle?.id).toBe('older-published');
    expect(hook.result.current.cycles.some((cycle) => cycle.id === 'older-published')).toBe(true);
    expect(mocks.getOfferings).toHaveBeenLastCalledWith(
      expect.objectContaining({ admissionCycleId: 'older-published' }),
      { skip: false }
    );
  });

  it('does not show another cycle while the explicit cycle is loading or unavailable', () => {
    mocks.cycleId = 'older-published';
    mocks.getCycle.mockReturnValue({ isFetching: true });
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.cycle).toBeNull();
    expect(mocks.getOfferings).toHaveBeenLastCalledWith(expect.anything(), { skip: true });
  });
  it('retains the drawer-selected cycle while an older cycle hydrates so the drawer stays mounted', () => {
    mocks.cycleId = 'open-cycle-1';
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    const selected = {
      id: 'older-selected',
      name: 'Older open cycle',
      status: 1,
      windowStatus: 1,
    } as AdmissionCycle;
    act(() => hook.result.current.selectCycle(selected));
    mocks.cycleId = selected.id;
    mocks.getCycle.mockReturnValue({ isFetching: true });
    hook.rerender();
    expect(hook.result.current.cycle).toEqual(selected);
    expect(hook.result.current.cyclesQuery.isFetching).toBe(true);
    expect(mocks.getOfferings).toHaveBeenLastCalledWith(
      expect.objectContaining({ admissionCycleId: selected.id }),
      { skip: false }
    );
    mocks.getCycle.mockReturnValue({ currentData: { ...selected, name: 'Refreshed cycle' } });
    hook.rerender();
    expect(hook.result.current.cycle?.name).toBe('Refreshed cycle');
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

  it('prefers a published open cycle over newer QA drafts and pins the selection in URL state', () => {
    mocks.cycleId = '';
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.cycle?.id).toBe('open-cycle-1');
    expect(mocks.update).toHaveBeenCalledWith(
      expect.objectContaining({ admissionCycleId: 'open-cycle-1' })
    );
    expect(hook.result.current.cycles.some((cycle) => cycle.id === 'archived')).toBe(false);
  });

  it('finds a published open default beyond the first page of newer drafts', () => {
    mocks.cycles = [{ id: 'newest-closed', status: 2 }] as AdmissionCycle[];
    const preferred = { id: 'older-open', status: 1, windowStatus: 1 } as AdmissionCycle;
    mocks.defaultLookup = {
      data: { items: [preferred] },
      currentData: { items: [preferred] },
      isSuccess: true,
    };
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.cycle?.id).toBe('older-open');
    expect(mocks.getOfferings).toHaveBeenLastCalledWith(
      expect.objectContaining({ admissionCycleId: 'older-open' }),
      { skip: false }
    );
  });

  it('does not flash an unrelated closed cycle while the published default is loading or fails', () => {
    mocks.cycles = [{ id: 'newest-closed', status: 2 }] as AdmissionCycle[];
    mocks.defaultLookup = { isFetching: true };
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.cycle).toBeNull();
    expect(mocks.getOfferings).toHaveBeenLastCalledWith(expect.anything(), { skip: true });
    mocks.defaultLookup = { isError: true };
    hook.rerender();
    expect(hook.result.current.cycle).toBeNull();
    expect(hook.result.current.cyclesQuery.isError).toBe(true);
  });

  it('retains access to draft and closed cycles when there is no published open default', () => {
    mocks.cycles = [
      { id: 'latest-closed', status: 2 },
      { id: 'draft', status: 0 },
    ] as AdmissionCycle[];
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.cycle?.id).toBe('latest-closed');
  });
  it('prefers the header academic year when multiple years have published open cycles', () => {
    mocks.yearId = 'current-year';
    mocks.cycles = [
      { id: 'other-year-newer', academicYearId: 'other-year', status: 1, windowStatus: 1 },
      { id: 'current-closed', academicYearId: 'current-year', status: 2, windowStatus: 1 },
      { id: 'current-open', academicYearId: 'current-year', status: 1, windowStatus: 1 },
    ] as AdmissionCycle[];
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.cycle?.id).toBe('current-open');
  });
  it('does not replace an explicitly selected draft with a published default', () => {
    mocks.cycleId = 'newest-draft';
    const hook = renderHook(() => useAdmissionOfferingsScreen());
    expect(hook.result.current.cycle?.id).toBe('newest-draft');
    expect(mocks.update).not.toHaveBeenCalled();
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
