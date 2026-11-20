import { it, expect } from 'vitest';

import { workflowArchiveErrorMessage } from './workflow-archive-error';

it('reads the active count from an ABP error envelope', () => {
  expect(workflowArchiveErrorMessage({ data: { error: { code: 'Admissions.WorkflowInUse', message: 'One or more business rules were violated.', data: { ActiveOfferingCount: 13 } } } })).toContain('13 active admission offerings');
});

it('provides actionable guidance without inventing a count for an older server', () => {
  expect(workflowArchiveErrorMessage({ data: { errorCode: 'Admissions.WorkflowInUse', detail: 'One or more business rules were violated.' } })).toBe('This workflow cannot be archived because active admission offerings use it. Deactivate them or replace their workflow before archiving.');
});
