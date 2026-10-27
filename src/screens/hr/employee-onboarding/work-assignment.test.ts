import { it, expect, describe } from 'vitest';

import { workAssignmentText, emptyWorkAssignment, isWorkAssignmentValid } from './work-assignment';
import { createEmployeeApplicationInitialValues } from '../../public/employee-application/validation';

describe('work assignment', () => {
  it('supports no setup and school-wide work without academic IDs', () => {
    expect(isWorkAssignmentValid(emptyWorkAssignment(), [], false)).toBe(true);
    expect(isWorkAssignmentValid({ mode: 'schoolWide', organizationIds: [] }, [], false)).toBe(
      true
    );
    expect(
      isWorkAssignmentValid({ mode: 'schoolWide', organizationIds: ['stage'] }, ['stage'], true)
    ).toBe(false);
  });
  it('requires loaded, unique, available organizations and a year for specific work', () => {
    const specific = {
      mode: 'specificOrganizations' as const,
      academicYearId: 'year',
      organizationIds: ['a', 'b'],
    };
    expect(isWorkAssignmentValid(specific, ['a', 'b'], true)).toBe(true);
    expect(isWorkAssignmentValid(specific, ['a', 'b'], false)).toBe(false);
    expect(isWorkAssignmentValid(specific, ['a'], true)).toBe(false);
    expect(isWorkAssignmentValid({ ...specific, organizationIds: ['a', 'a'] }, ['a'], true)).toBe(
      false
    );
    expect(isWorkAssignmentValid({ ...specific, academicYearId: null }, ['a', 'b'], true)).toBe(
      false
    );
  });
  it('preserves unclassified legacy text and never infers organization or functional department', () => {
    expect(workAssignmentText({ departmentAppliedFor: 'CBSE' })).toBe('Legacy department: CBSE');
    expect(workAssignmentText({ departmentAppliedFor: '' })).toBe('Not recorded');
    expect(
      createEmployeeApplicationInitialValues({ departmentAppliedFor: 'CBSE' }).personalInfo
        .department
    ).toBe('');
  });
  it('formats assignment labels and year independently of legacy text', () => {
    expect(
      workAssignmentText({
        departmentAppliedFor: 'CBSE',
        workAssignment: {
          mode: 'specificOrganizations',
          academicYearId: 'year',
          academicYearName: '2026-27',
          organizationIds: ['a', 'b'],
          organizationLabels: ['CBSE - English - Primary', 'GSEB - Gujarati - Secondary'],
        },
      })
    ).toBe(
      'CBSE - English - Primary; GSEB - Gujarati - Secondary (2026-27); Legacy department: CBSE'
    );
    expect(
      workAssignmentText({ workAssignment: { mode: 'schoolWide', organizationIds: [] } })
    ).toContain('School-wide');
  });
});
