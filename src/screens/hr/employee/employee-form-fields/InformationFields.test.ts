import { it, expect, describe } from 'vitest';

import {
  shouldDisableEmployeeEmailField,
  EMPLOYEE_CREATION_POLICY_SUMMARY_LABEL,
  EMPLOYEE_CREATION_POLICY_SECTION_TITLE,
} from './InformationFields';

describe('InformationFields email editing', () => {
  it('keeps email editable while creating a staff member', () => {
    expect(shouldDisableEmployeeEmailField(true, null)).toBe(false);
  });

  it('disables email while updating an existing staff', () => {
    expect(shouldDisableEmployeeEmailField(true, { id: 'employee-1' })).toBe(true);
  });

  it('disables email when the contact section is not editable', () => {
    expect(shouldDisableEmployeeEmailField(false, null)).toBe(true);
  });
});

describe('InformationFields staff creation policy overview', () => {
  it('uses system-policy wording instead of the old leave-only assignment label', () => {
    expect(EMPLOYEE_CREATION_POLICY_SECTION_TITLE).toBe('Assigned System Policies');
    expect(EMPLOYEE_CREATION_POLICY_SECTION_TITLE).not.toBe('Leave Policy Assignment');
    expect(EMPLOYEE_CREATION_POLICY_SUMMARY_LABEL).toBe('Default assignment');
    expect(EMPLOYEE_CREATION_POLICY_SUMMARY_LABEL).not.toBe('Staff creation policy assignment');
  });
});
