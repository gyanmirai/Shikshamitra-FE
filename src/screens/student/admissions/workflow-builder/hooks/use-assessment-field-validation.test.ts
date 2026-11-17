import { it, expect } from 'vitest';
import { act, renderHook } from '@testing-library/react';

import { useAssessmentFieldValidation } from './use-assessment-field-validation';

it('retains field identity through reorder, temporary hiding and removal without touching a new row', () => {
  const { result, rerender } = renderHook(
    ({ attempt, keys }) => useAssessmentFieldValidation(attempt, keys),
    { initialProps: { attempt: 0, keys: ['first:name', 'second:name'] } }
  );
  act(() => result.current.onBlur('first:name'));
  expect(result.current.showError('first:name')).toBe(true);
  expect(result.current.showError('second:name')).toBe(false);
  rerender({ attempt: 0, keys: ['second:name', 'first:name'] });
  expect(result.current.showError('first:name')).toBe(true);
  expect(result.current.showError('second:name')).toBe(false);
  rerender({ attempt: 1, keys: ['second:name'] });
  expect(result.current.showError('second:name')).toBe(true);
  rerender({ attempt: 1, keys: ['second:name', 'third:name'] });
  expect(result.current.showError('third:name')).toBe(false);
  rerender({ attempt: 1, keys: [] });
  rerender({ attempt: 1, keys: ['second:name', 'third:name'] });
  expect(result.current.showError('second:name')).toBe(true);
  expect(result.current.showError('third:name')).toBe(false);
  rerender({ attempt: 2, keys: ['second:name', 'third:name'] });
  expect(result.current.showError('third:name')).toBe(true);
  rerender({ attempt: 0, keys: ['second:name', 'third:name'] });
  expect(result.current.showError('second:name')).toBe(false);
  expect(result.current.showError('third:name')).toBe(false);
});
