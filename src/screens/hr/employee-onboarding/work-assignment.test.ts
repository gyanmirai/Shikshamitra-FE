import { it, expect, describe } from 'vitest';

import { createEmployeeApplicationInitialValues } from '../../public/employee-application/validation';
import {
  workAssignmentText,
  emptyWorkAssignment,
  isWorkAssignmentValid,
  workAssignmentRequest,
  workAssignmentSelectionError,
} from './work-assignment';

describe('work assignment', () => {
  it('matches the server maximum and distinguishes missing, duplicate and unavailable identities', () => {
    const ids = Array.from({ length: 101 }, (_, i) => `stage-${i}`);
    const draft = {
      mode: 'specificOrganizations' as const,
      academicYearId: 'year',
      organizationIds: ids,
    };
    expect(isWorkAssignmentValid(draft, ids, true)).toBe(false);
    expect(workAssignmentSelectionError(draft, ids)).toBe('Select no more than 100 organizations.');
    expect(isWorkAssignmentValid({ ...draft, organizationIds: ids.slice(0, 100) }, ids, true)).toBe(
      true
    );
    expect(workAssignmentSelectionError({ ...draft, organizationIds: [] }, ids)).toBe(
      'Select at least one organization.'
    );
    expect(
      workAssignmentSelectionError({ ...draft, organizationIds: ['a', 'a'] }, ['a'])
    ).toContain('duplicate');
    expect(workAssignmentSelectionError({ ...draft, organizationIds: ['gone'] }, ids)).toContain(
      'unavailable'
    );
  });
  it('submits stable identity only and never treats display snapshots as authoritative', () => {
    const draft = {
      mode: 'specificOrganizations' as const,
      academicYearId: 'year',
      academicYearName: 'Old display name',
      organizationIds: ['b', 'a'],
      organizationLabels: ['Old label B', 'Old label A'],
    };
    expect(workAssignmentRequest(draft)).toEqual({
      mode: 'specificOrganizations',
      academicYearId: 'year',
      organizationIds: ['b', 'a'],
    });
    const request = workAssignmentRequest(draft);
    request.organizationIds.pop();
    expect(draft.organizationIds).toEqual(['b', 'a']);
  });
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
