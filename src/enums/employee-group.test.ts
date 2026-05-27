import { it, expect, describe } from 'vitest';

import { EmployeeGroupTypeFilter } from './employee-group';

describe('EmployeeGroupTypeFilter', () => {
  it('uses the employee list backend teaching contract', () => {
    expect(EmployeeGroupTypeFilter).toEqual([
      { label: 'Teaching', value: true },
      { label: 'Non Teaching', value: false },
    ]);
  });
});
