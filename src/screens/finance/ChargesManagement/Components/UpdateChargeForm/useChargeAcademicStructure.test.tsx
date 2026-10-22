import { it, vi, expect, describe } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useChargeAcademicStructure } from './useChargeAcademicStructure';

const state = vi.hoisted(() => ({ params: {} as any, result: {} as any }));
vi.mock('src/redux/class/classApi', () => ({ useGetClassByMediumQuery: vi.fn() }));
vi.mock('src/redux/customQueryAndMutation', () => ({
  default: (params: any) => {
    state.params = params;
    return state.result;
  },
}));

describe('charge academic reference scope', () => {
  it('keeps selected-class divisions during student and same-medium reference refreshes', () => {
    const divisions = [
      { id: 'a', name: 'A' },
      { id: 'b', name: 'B' },
    ];
    const classes = [{ id: 'eight', name: 'Class 8', divisions }];
    state.result = { currentData: classes, isFetching: false };
    const view = renderHook(({ selected }) => useChargeAcademicStructure('english', selected), {
      initialProps: { selected: ['eight'] },
    });
    expect(view.result.current.divisions).toBe(divisions);
    // Student audience completion causes parent renders with the same academic scope.
    view.rerender({ selected: ['eight'] });
    expect(view.result.current.divisions).toBe(divisions);
    state.result = { currentData: classes, isFetching: true };
    view.rerender({ selected: ['eight'] });
    expect(view.result.current.divisions).toBe(divisions);
    expect(state.params).toMatchObject({
      type: 'query',
      params: 'english',
      options: { refetchOnMountOrArgChange: false },
    });
    view.rerender({ selected: ['eight', 'nine'] });
    expect(view.result.current.divisions).toEqual([]);
  });

  it('does not show divisions from the previous medium during a scope change', () => {
    state.result = {
      currentData: undefined,
      data: [{ id: 'eight', divisions: [{ id: 'old' }] }],
      isFetching: true,
    };
    const view = renderHook(() => useChargeAcademicStructure('marathi', ['eight']));
    expect(view.result.current.divisions).toEqual([]);
    expect(view.result.current.isFetching).toBe(true);
  });
});
