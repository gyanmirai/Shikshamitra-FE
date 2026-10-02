import { vi, it, expect, describe, beforeEach } from 'vitest';
import { act, render, renderHook } from '@testing-library/react';

import { getInitialValues } from '../workflow-config';
import { useGuidedSeatingAllocation } from './use-guided-seating-allocation';

const mocks = vi.hoisted(() => ({
  warning: vi.fn(),
  validate: vi.fn(),
  save: vi.fn(),
  preview: vi.fn(),
  apply: vi.fn(),
  manual: vi.fn(),
}));

vi.mock('src/components/toast', () => ({ shikshaMitraToast: { warning: mocks.warning } }));
vi.mock('src/redux/academicAPI/ExaminationApi/ScheduleExamApi/guided-seat-allocationApi', () => {
  const mutation = (request: (payload: unknown) => unknown) => [
    (payload: unknown) => ({ unwrap: () => request(payload) }),
    { isLoading: false },
  ];
  return {
    useSaveGuidedSeatingDraftMutation: () => mutation(mocks.save),
    usePreviewGuidedSeatAllocationMutation: () => mutation(mocks.preview),
    useApplyGuidedSeatAllocationMutation: () => mutation(mocks.apply),
    useValidateGuidedSeatingPlanMutation: () => mutation(mocks.validate),
  };
});
vi.mock('src/redux/academicAPI/ExaminationApi/ScheduleExamApi/seat-allocationApi', () => ({
  useSaveSeatingPlanBulkMutation: () => [
    (payload: unknown) => ({ unwrap: () => mocks.manual(payload) }),
    { isLoading: false },
  ],
}));

describe('seating validation warning notifications', () => {
  beforeEach(() => vi.resetAllMocks());

  it('shows all warning details once per validation action, not on rerender or reset', async () => {
    const validation = {
      isValid: true,
      blockers: [],
      warnings: [
        { code: 'LOW_USAGE', roomName: 'B005', message: 'Room B005 utilization is below 40%.' },
        {
          code: 'LOW_USAGE',
          roomName: 'B101',
          message: 'Room B101 utilization is below 40%.',
          suggestedActionLabel: 'Use fewer rooms',
        },
      ],
    };
    mocks.validate.mockResolvedValue(validation);
    const { result, rerender } = renderHook(() => useGuidedSeatingAllocation('exam-1', vi.fn()));
    await act(() => result.current.runValidation('plan-1'));
    expect(mocks.validate).toHaveBeenCalledWith({ examId: 'exam-1', seatingPlanId: 'plan-1' });
    expect(result.current.validation).toEqual(validation);
    expect(mocks.warning).toHaveBeenCalledOnce();
    const toast = render(mocks.warning.mock.calls[0][0].message);
    expect(toast.container).toHaveTextContent('Review 2 warnings before publishing.');
    expect(toast.container).toHaveTextContent('Room B005 utilization is below 40%.');
    expect(toast.container).toHaveTextContent('Room B101 utilization is below 40%.');
    expect(toast.container).toHaveTextContent('Suggested action: Use fewer rooms.');
    rerender();
    act(() => result.current.resetPreview());
    expect(result.current.validation).toBeUndefined();
    expect(mocks.warning).toHaveBeenCalledOnce();
  });

  it('does not show warning notifications for warning-free or failed validation requests', async () => {
    mocks.validate.mockResolvedValueOnce({ isValid: true, blockers: [], warnings: [] });
    const { result } = renderHook(() => useGuidedSeatingAllocation('exam-1', vi.fn()));
    await act(() => result.current.runValidation('plan-1'));
    expect(mocks.warning).not.toHaveBeenCalled();
    act(() => result.current.resetPreview());
    mocks.validate.mockRejectedValueOnce(new Error('Validation unavailable'));
    await act(async () => {
      await expect(result.current.runValidation('plan-1')).rejects.toThrow(
        'Validation unavailable'
      );
    });
    expect(result.current.validation).toBeUndefined();
    expect(mocks.warning).not.toHaveBeenCalled();
  });

  it('preserves draft and allocation versions and invalidates examination readiness', async () => {
    const clearReadiness = vi.fn();
    mocks.save.mockResolvedValue({ version: 'draft-v1' });
    mocks.apply.mockResolvedValue({ version: 'applied-v2' });
    mocks.manual.mockResolvedValue({ version: 'manual-v3' });
    const { result } = renderHook(() => useGuidedSeatingAllocation('exam-1', clearReadiness));
    const values = getInitialValues();
    await act(() => result.current.saveRooms('plan-1', values, 'original-v0'));
    expect(result.current.version).toBe('draft-v1');
    act(() =>
      result.current.setManualPreview({
        assignments: [{ studentId: 'student-1', roomId: 'room-1', seatNumber: 1 }],
        unallocatedStudentIds: [],
        totalStudents: 1,
        roomsUsed: 1,
        emptySeats: 35,
        utilizationPercent: 3,
      })
    );
    await act(() => result.current.applyPreview('plan-1', values, 'draft-v1'));
    expect(result.current.version).toBe('applied-v2');
    expect(mocks.apply.mock.calls[0][0].body.version).toBe('draft-v1');
    await act(() => result.current.applyManualPreview('plan-1', values, ['room-1'], 'applied-v2'));
    expect(result.current.version).toBe('manual-v3');
    expect(clearReadiness).toHaveBeenCalledTimes(3);
    act(() => result.current.resetVersion());
    expect(result.current.version).toBeUndefined();
  });
});
