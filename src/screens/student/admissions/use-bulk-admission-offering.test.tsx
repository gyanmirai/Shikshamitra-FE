import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type { BulkAdmissionOfferingResult } from 'src/redux/student/admissions/admission-offerings-api';

import { act, renderHook } from '@testing-library/react';
import { vi, it, expect, describe, beforeEach } from 'vitest';

import { useBulkAdmissionOffering } from './use-bulk-admission-offering';
import { bulkOfferingInitialValues } from './bulk-admission-offering-model';

const mocks = vi.hoisted(() => ({
  bulkCreate: vi.fn(),
  loadStandards: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
}));
vi.mock('src/redux/student/admissions/admission-offerings-api', () => ({
  useBulkCreateAdmissionOfferingsMutation: () => [mocks.bulkCreate, { isLoading: false }],
}));
vi.mock('src/redux/class/classApi', () => ({
  useLazyGetClassByMediumQuery: () => [mocks.loadStandards, { isFetching: false }],
}));
vi.mock('src/redux/academicOrganizationOptions/academicOrganizationOptionsApi', () => ({
  useGetAcademicOrganizationOptionsQuery: () => ({ data: { items: [] }, isSuccess: true }),
}));
vi.mock('./use-admission-definition-options', () => ({
  useAdmissionDefinitionOptions: () => ({}),
}));
vi.mock('src/components/toast', () => ({
  shikshaMitraToast: {
    warning: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
    success: mocks.success,
    error: mocks.error,
  },
}));

const cycle = { id: 'page-cycle-1', academicYearId: 'year-1' } as AdmissionCycle;
const selectedCycle = {
  ...cycle,
  id: 'selected-cycle-2',
  status: 1,
  windowStatus: 1,
} as AdmissionCycle;
const values = {
  ...bulkOfferingInitialValues,
  admissionCycle: selectedCycle,
  boardId: 'board-1',
  mediumId: 'medium-1',
  standardIds: ['class-1'],
  isActive: true,
};
const result: BulkAdmissionOfferingResult = {
  isPreview: true,
  canCommit: true,
  createdCount: 0,
  items: [
    {
      standardId: 'class-1',
      code: 'ADM-CLASS-1',
      isValid: true,
      canSaveInactive: true,
      canActivate: false,
      errors: [],
    },
  ],
};

describe('Bulk offering preview and creation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.loadStandards.mockReturnValue({
      unwrap: () => Promise.resolve([{ id: 'class-1', name: 'Class 1' }]),
    });
    mocks.bulkCreate.mockReturnValue({ unwrap: () => Promise.resolve(result) });
  });
  it('does not submit without a selected open cycle or for a different academic year', async () => {
    const hook = renderHook(() => useBulkAdmissionOffering(cycle, true, vi.fn()));
    await act(async () => {
      await Promise.all(
        [
          null,
          { ...selectedCycle, status: 0 as const },
          { ...selectedCycle, windowStatus: 2 as const },
          { ...selectedCycle, academicYearId: 'other-year' },
        ].flatMap((admissionCycle) => [
          hook.result.current.previewOfferings({ ...values, admissionCycle }),
          hook.result.current.createOfferings({ ...values, admissionCycle }),
        ])
      );
    });
    expect(mocks.bulkCreate).not.toHaveBeenCalled();
    expect(mocks.loadStandards).not.toHaveBeenCalled();
  });

  it('pins preview and commit to the selected cycle and always creates inactive', async () => {
    const onComplete = vi.fn();
    const hook = renderHook(() => useBulkAdmissionOffering(cycle, true, onComplete));
    await act(async () => {
      await hook.result.current.previewOfferings(values);
    });
    expect(hook.result.current.canSaveInactive).toBe(true);
    expect(mocks.bulkCreate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        admissionCycleId: selectedCycle.id,
        body: expect.objectContaining({ previewOnly: true, isActive: false }),
      })
    );
    mocks.bulkCreate.mockReturnValue({
      unwrap: () => Promise.resolve({ ...result, isPreview: false, createdCount: 1 }),
    });
    await act(async () => {
      await hook.result.current.createOfferings(values);
    });
    expect(mocks.bulkCreate).toHaveBeenLastCalledWith(
      expect.objectContaining({
        admissionCycleId: selectedCycle.id,
        body: expect.objectContaining({ previewOnly: false, isActive: false }),
      })
    );
    expect(onComplete).toHaveBeenCalledOnce();
    expect(mocks.success).toHaveBeenCalledWith({ message: '1 offering created' });
  });

  it('retains updated preview and does not close or show success when the server refuses commit', async () => {
    const refused = {
      ...result,
      isPreview: false,
      canCommit: false,
      items: [
        {
          ...result.items[0],
          canSaveInactive: false,
          errors: [{ code: 'Duplicate', message: 'Offering already exists.' }],
        },
      ],
    };
    mocks.bulkCreate.mockReturnValue({ unwrap: () => Promise.resolve(refused) });
    const onComplete = vi.fn();
    const hook = renderHook(() => useBulkAdmissionOffering(cycle, true, onComplete));
    await act(async () => {
      expect(await hook.result.current.createOfferings(values)).toBeNull();
    });
    expect(hook.result.current.preview).toEqual(refused);
    expect(hook.result.current.canSaveInactive).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
    expect(mocks.error).toHaveBeenCalledWith({
      message: expect.stringContaining('No offerings were created'),
    });
  });

  it('honors whole-batch rejection even when row flags allow saving', async () => {
    mocks.bulkCreate.mockReturnValue({
      unwrap: () => Promise.resolve({ ...result, canCommit: false }),
    });
    const hook = renderHook(() => useBulkAdmissionOffering(cycle, true, vi.fn()));
    await act(async () => {
      await hook.result.current.previewOfferings(values);
    });
    expect(hook.result.current.canSaveInactive).toBe(false);
  });

  it('keeps the previous preview and restores retry after a failed create request', async () => {
    const onComplete = vi.fn();
    const hook = renderHook(() => useBulkAdmissionOffering(cycle, true, onComplete));
    await act(async () => {
      await hook.result.current.previewOfferings(values);
    });
    mocks.bulkCreate.mockReturnValue({ unwrap: () => Promise.reject(new Error('Unavailable')) });
    await act(async () => {
      await hook.result.current.createOfferings(values);
    });
    expect(hook.result.current.preview).toEqual(result);
    expect(hook.result.current.canSaveInactive).toBe(true);
    expect(onComplete).not.toHaveBeenCalled();
    expect(mocks.success).not.toHaveBeenCalled();
  });
});
