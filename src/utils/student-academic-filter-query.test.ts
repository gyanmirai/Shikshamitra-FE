import { it, expect } from 'vitest';

import { readAcademicFilterIds, academicClassFilterInput, academicMultipleFilterValue, studentAcademicFilterParams } from './student-academic-filter-query';

it('keeps legacy single-class links compatible and sends multiple classes as a collection', () => {
  expect(academicClassFilterInput('class-1')).toEqual({ standardId: 'class-1' });
  expect(academicClassFilterInput('class-1,class-2,class-1')).toEqual({ standardIds: ['class-1', 'class-2'] });
  expect(readAcademicFilterIds('__all__')).toEqual([]);
  expect(academicClassFilterInput('')).toEqual({ standardId: undefined });
});

it('switches between all classes and specific selections without mixing them', () => {
  expect(academicMultipleFilterValue('', ['__all__', 'class-1'])).toBe('class-1');
  expect(academicMultipleFilterValue('class-1', ['class-1', '__all__'])).toBe('');
  expect(academicMultipleFilterValue('class-1', ['class-1', 'class-2'])).toBe('class-1,class-2');
});

it('serializes repeated GUID collection keys and preserves ordinary filters', () => {
  const params = studentAcademicFilterParams({ boardId: 'board-1', standardIds: ['class-1', 'class-2'], divisionIds: ['division-1', 'division-2'], skipCount: 25, isActive: false, search: undefined });
  expect(params.getAll('standardIds')).toEqual(['class-1', 'class-2']);
  expect(params.getAll('divisionIds')).toEqual(['division-1', 'division-2']);
  expect(params.get('boardId')).toBe('board-1');
  expect(params.get('skipCount')).toBe('25');
  expect(params.get('isActive')).toBe('false');
  expect(params.has('search')).toBe(false);
});
