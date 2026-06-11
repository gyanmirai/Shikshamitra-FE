import { it, expect, describe } from 'vitest';

import { applyEmployeeCreateResponseToFormValues } from './employee-form-state';

describe('employee form state', () => {
  it('stores employee id and linked user id from the create response', () => {
    const values = applyEmployeeCreateResponseToFormValues(
      { firstName: 'Asha', employeeId: '', userId: null },
      { id: 'employee-1', userId: 'user-1' }
    );

    expect(values).toMatchObject({
      firstName: 'Asha',
      employeeId: 'employee-1',
      userId: 'user-1',
    });
  });

  it('preserves existing form values while applying the create identity', () => {
    const values = applyEmployeeCreateResponseToFormValues(
      { firstName: 'Asha', lastName: 'Patel', employeeId: '', userId: null },
      { id: 'employee-2', userId: 'user-2' }
    );

    expect(values.firstName).toBe('Asha');
    expect(values.lastName).toBe('Patel');
    expect(values.employeeId).toBe('employee-2');
    expect(values.userId).toBe('user-2');
  });

  it('does not invent a user id when the create response does not include one', () => {
    const values = applyEmployeeCreateResponseToFormValues(
      { employeeId: '', userId: null },
      { id: 'employee-3' }
    );

    expect(values.employeeId).toBe('employee-3');
    expect(values.userId).toBeNull();
  });
});
