import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowStageTypeMetadata,
} from 'src/redux/student/admissions/admission-workflows-api';

import { it, expect, describe } from 'vitest';
import { normalizeAdmissionWorkflowStageType } from 'src/redux/student/admissions/admission-workflows-api';

import { getRegistrationFormTemplate } from './form-dialog/registration-form-template';
import {
  createStage,
  duplicateStage,
  parseSimpleCondition,
  getTransitionStepLabel,
  serializeSimpleCondition,
  orderTransitionsByJourney,
  normalizeAdmissionWorkflowStages,
} from './workflow-builder-utils';

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
  it('generates unique internal codes after deletion without changing surviving stages', () => {
    const metadata = {
      type: 2,
      displayName: 'Assessment',
      description: 'Record assessment results',
    } as AdmissionWorkflowStageTypeMetadata;
    const existing = [stage('stage_1', 0), stage('stage_3', 1), stage('stage_4', 2)];
    const next = createStage(metadata, existing.length, false, existing);
    expect(next.code).toBe('STAGE_5');
    expect(next.displayOrder).toBe(3);
    expect(existing.map((item) => item.code)).toEqual(['STAGE_1', 'STAGE_3', 'STAGE_4']);
    expect(createStage(metadata, 0, true).code).toBe('STAGE_1');
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

  it('keeps generated duplicate codes within the internal contract even for a maximum-length saved code', () => {
    const source = { ...stage('long-code', 0), code: 'A'.repeat(64) };
    const first = duplicateStage([source], source.id);
    const second = duplicateStage(first, source.id);
    expect(first[1].code).toBe(`${'A'.repeat(59)}_COPY`);
    expect(second[1].code).toBe(`${'A'.repeat(57)}_COPY_2`);
    expect(second.every((item) => item.code.length <= 64)).toBe(true);
    expect(source.code).toHaveLength(64);
  });

  it('upgrades only legacy Form stages before saving or validating a workflow', () => {
    const legacyForm = {
      ...stage('form', 0),
      stageType: 1 as const,
      configurationJson: '{"formDefinitionId":"form-1","custom":{"kept":true}}',
    };
    const custom = { ...stage('custom', 1), configurationJson: '{"custom":true}' };
    const result = normalizeAdmissionWorkflowStages([legacyForm, custom]);

    expect(JSON.parse(result[0].configurationJson ?? '')).toMatchObject({
      formDefinitionId: 'form-1',
      custom: { kept: true },
      form: { version: 1, enabled: true },
    });
    expect(result[1]).toBe(custom);
  });

  it('normalizes numeric and named stage types from the API', () => {
    expect(normalizeAdmissionWorkflowStageType(10)).toBe(10);
    expect(normalizeAdmissionWorkflowStageType('Enrollment')).toBe(10);
    expect(normalizeAdmissionWorkflowStageType('document-verification')).toBe(5);
  });

  it('orders transitions by the visible admission journey', () => {
    const stages = [stage('one', 0), stage('two', 1), stage('three', 2)];
    const transitions = [
      { id: 'later', fromStageId: 'two', toStageId: 'three', priority: 0, isDefault: true },
      { id: 'first', fromStageId: 'one', toStageId: 'two', priority: 0, isDefault: true },
    ];

    expect(orderTransitionsByJourney(transitions, stages).map((item) => item.id)).toEqual([
      'first',
      'later',
    ]);
    expect(getTransitionStepLabel(transitions[1], stages)).toBe('Step 1 → 2');
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
