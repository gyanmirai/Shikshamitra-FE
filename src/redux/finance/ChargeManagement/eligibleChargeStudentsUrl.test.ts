import { describe, expect, it } from 'vitest';

import { buildEligibleChargeStudentsUrl } from './eligibleChargeStudentsUrl';

describe('eligible charge student query', () => {
  it('uses repeated class and division keys and preserves charged=false', () => {
    const url = buildEligibleChargeStudentsUrl({
      academicYearId: 'year',
      boardId: 'board',
      educationMediumId: 'medium',
      classIds: ['class-1', 'class-2'],
      divisionIds: ['division-1', 'division-2'],
      chargeCategoryId: 'category',
      gender: 1,
      rollNoFrom: 10,
      rollNoTo: 20,
      charged: false,
      divisionFilterId: 'division-1',
      page: 2,
      pageSize: 25,
    });
    const params = new URL(url, 'http://localhost').searchParams;
    expect(params.getAll('classIds')).toEqual(['class-1', 'class-2']);
    expect(params.getAll('divisionIds')).toEqual(['division-1', 'division-2']);
    expect(params.get('charged')).toBe('false');
    expect(params.get('gender')).toBe('1');
    expect(params.get('page')).toBe('2');
    expect(params.get('pageSize')).toBe('25');
    expect(params.get('chargeCategoryId')).toBe('category');
    expect(params.get('divisionFilterId')).toBe('division-1');
  });
});
