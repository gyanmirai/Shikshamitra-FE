import { it, expect } from 'vitest';

import { hasInquiryCondition } from './workflow-inquiry-retirement';
import { getTransitionConditionEditorState, workflowTransitionSchema } from './workflow-transition-form';

it.each([
  { field: 'inquiry.management.outcome', operator: 'Equals', value: 'Qualified' },
  { operator: 'ALL', conditions: [
    { field: 'application.category', operator: 'Equals', value: 'General' },
    { operator: 'ANY', conditions: [{ field: 'inquiry.student.previousSchool', operator: 'IsNotEmpty' }] },
  ] },
])('preserves historical inquiry conditions without exposing authoring controls', (condition) => {
  const json = JSON.stringify(condition);
  expect(hasInquiryCondition(json)).toBe(true);
  expect(getTransitionConditionEditorState(json)).toMatchObject({ preserveCondition: true, conditionField: '' });
});

it('rejects a manually typed inquiry route field while allowing application fields', async () => {
  const values = { fromStageId: 'a', toStageId: 'b', priority: 0, hasCondition: true,
    preserveCondition: false, conditionField: 'inquiry.source', conditionOperator: 'Equals', conditionValue: 'Website' };
  await expect(workflowTransitionSchema.validate(values)).rejects.toThrow(/Inquiry rules are no longer available/);
  await expect(workflowTransitionSchema.validate({ ...values, conditionField: 'application.category' })).resolves.toBeDefined();
});

it('does not treat an inquiry word in an application answer as an inquiry field', () => {
  const json = JSON.stringify({ field: 'application.notes', operator: 'Contains', value: 'inquiry.source' });
  expect(hasInquiryCondition(json)).toBe(false);
  expect(getTransitionConditionEditorState(json).preserveCondition).toBe(false);
});
