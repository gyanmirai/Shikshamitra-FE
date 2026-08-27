import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { it, expect, describe } from 'vitest';
import { normalizeAdmissionWorkflowStageType } from 'src/redux/student/admissions/admission-workflows-api';

import {
  reorderStages,
  duplicateStage,
  parseSimpleCondition,
  serializeSimpleCondition,
} from './workflow-builder-utils';
import { getRegistrationFormTemplate } from './form-dialog/registration-form-template';

const stage = (id: string, displayOrder: number): AdmissionWorkflowStage => ({
  id,
  code: id.toUpperCase(),
  name: id,
  stageType: 11,
  displayOrder,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: displayOrder === 0,
  isTerminalStage: displayOrder === 2,
});

describe('workflow builder utilities', () => {
  it('reorders stages without changing explicit entry and terminal meaning', () => {
    const result = reorderStages(
      [stage('one', 0), stage('two', 1), stage('three', 2)],
      'three',
      'one'
    );

    expect(result.map((item) => item.id)).toEqual(['three', 'one', 'two']);
    expect(result.map((item) => item.displayOrder)).toEqual([0, 1, 2]);
    expect(result.find((item) => item.id === 'one')?.isEntryStage).toBe(true);
    expect(result.find((item) => item.id === 'three')?.isTerminalStage).toBe(true);
  });

  it('serializes a controlled condition without executable expressions', () => {
    const serialized = serializeSimpleCondition({
      field: 'application.score',
      operator: 'GreaterThanOrEqual',
      value: '60',
    });

    expect(JSON.parse(serialized ?? '')).toEqual({
      field: 'application.score',
      operator: 'GreaterThanOrEqual',
      value: '60',
    });
    expect(parseSimpleCondition(serialized)).toEqual({
      field: 'application.score',
      operator: 'GreaterThanOrEqual',
      value: '60',
    });
  });

  it('omits values for unary conditions and rejects invalid JSON', () => {
    expect(
      JSON.parse(serializeSimpleCondition({ field: 'application.note', operator: 'IsEmpty' }) ?? '')
    ).toEqual({
      field: 'application.note',
      operator: 'IsEmpty',
    });
    expect(parseSimpleCondition('{not-json')).toBeNull();
  });

  it('duplicates stage configuration without copying graph semantics', () => {
    const source = { ...stage('one', 0), configurationJson: '{"formDefinitionId":"form-1"}' };
    const result = duplicateStage([source, stage('one_copy', 1)], source.id);
    const copy = result[1];

    expect(copy.id).not.toBe(source.id);
    expect(copy.code).toBe('ONE_COPY_2');
    expect(copy.configurationJson).toBe(source.configurationJson);
    expect(copy.isEntryStage).toBe(false);
    expect(copy.isTerminalStage).toBe(false);
    expect(result.map((item) => item.displayOrder)).toEqual([0, 1, 2]);
  });

  it('normalizes numeric and named stage types from the API', () => {
    expect(normalizeAdmissionWorkflowStageType(10)).toBe(10);
    expect(normalizeAdmissionWorkflowStageType('Enrollment')).toBe(10);
    expect(normalizeAdmissionWorkflowStageType('document-verification')).toBe(5);
  });

  it('keeps the built-in registration template publishable with supported fields', () => {
    const template = getRegistrationFormTemplate();
    const fields = template.sections.flatMap((section) => section.fields);

    expect(fields.find((field) => field.code === 'APPLICANT_GENDER')?.fieldType).toBe(6);
    expect(fields.some((field) => field.fieldType === 10)).toBe(false);
    expect(fields.find((field) => field.code === 'APPLICANT_GENDER')?.bindingKey).toBe(
      'Applicant.Gender'
    );
  });
});
