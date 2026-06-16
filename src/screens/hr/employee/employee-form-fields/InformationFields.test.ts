import { it, expect, describe } from 'vitest';

import { shouldDisableEmployeeEmailField } from './InformationFields';

describe('InformationFields email editing', () => {
  it('keeps email editable while creating an employee', () => {
    expect(shouldDisableEmployeeEmailField(true, null)).toBe(false);
  });

  it('disables email while updating an existing employee', () => {
    expect(shouldDisableEmployeeEmailField(true, { id: 'employee-1' })).toBe(true);
  });

  it('disables email when the contact section is not editable', () => {
    expect(shouldDisableEmployeeEmailField(false, null)).toBe(true);
  });
});
