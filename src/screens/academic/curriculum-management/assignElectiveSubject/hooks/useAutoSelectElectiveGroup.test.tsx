import { useState } from 'react';
import { it, expect, describe } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import useAutoSelectElectiveGroup from './useAutoSelectElectiveGroup';

type Props = {
  classId: string;
  divisionId: string;
  groups: { id: string; name: string }[];
  isLoading: boolean;
};

const useSelection = ({ classId, divisionId, groups, isLoading }: Props) => {
  const [selectedGroupId, setSelectedGroupId] = useState('');
  useAutoSelectElectiveGroup({
    classId,
    divisionId,
    groups,
    selectedGroupId,
    isLoading,
    onSelect: setSelectedGroupId,
  });
  return { selectedGroupId, setSelectedGroupId };
};

describe('useAutoSelectElectiveGroup', () => {
  it('selects the class group only after the class and division options finish loading', () => {
    const group = { id: 'elven', name: 'Elven Grp One' };
    const { result, rerender } = renderHook(useSelection, {
      initialProps: { classId: 'class-8', divisionId: '', groups: [group], isLoading: true },
    });

    expect(result.current.selectedGroupId).toBe('');
    rerender({ classId: 'class-8', divisionId: 'a', groups: [group], isLoading: true });
    expect(result.current.selectedGroupId).toBe('');
    rerender({ classId: 'class-8', divisionId: 'a', groups: [group], isLoading: false });
    expect(result.current.selectedGroupId).toBe('elven');
  });

  it('keeps a manual group choice and switches when the selected group is unavailable', () => {
    const groups = [
      { id: 'first', name: 'Group One' },
      { id: 'second', name: 'Group Two' },
    ];
    const { result, rerender } = renderHook(useSelection, {
      initialProps: { classId: 'class-8', divisionId: 'a', groups, isLoading: false },
    });

    expect(result.current.selectedGroupId).toBe('first');
    act(() => result.current.setSelectedGroupId('second'));
    rerender({ classId: 'class-8', divisionId: 'a', groups: [...groups], isLoading: false });
    expect(result.current.selectedGroupId).toBe('second');

    rerender({
      classId: 'class-9',
      divisionId: 'a',
      groups: [{ id: 'third', name: 'Group Three' }],
      isLoading: false,
    });
    expect(result.current.selectedGroupId).toBe('third');

    rerender({ classId: 'class-9', divisionId: 'a', groups: [], isLoading: false });
    expect(result.current.selectedGroupId).toBe('');
  });
});
