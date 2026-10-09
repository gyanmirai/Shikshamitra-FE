import type { AdmissionWorkflowStage } from 'src/redux/student/admissions/admission-workflows-api';

import { it, expect, describe } from 'vitest';
import { DEFAULT_FORM_STAGE_POLICY } from 'src/redux/student/admissions/admission-form-stage-policy';
import { DEFAULT_ASSESSMENT_POLICY } from 'src/redux/student/admissions/admission-assessment-policy';
import { getDocumentConfigurationError } from 'src/redux/student/admissions/admission-document-policy-validation';
import {
  DEFAULT_DOCUMENT_POLICY,
  createDocumentRequirement,
} from 'src/redux/student/admissions/admission-document-policy';

import { ADMISSION_WORKFLOW_TEMPLATES, getAdmissionWorkflowTemplate } from '../workflow-template';
import {
  isApplicationStageType,
  normalizeStageConfiguration,
} from './workflow-stage-configuration';

const stage = (
  stageType: AdmissionWorkflowStage['stageType'],
  configuration: object = {}
): AdmissionWorkflowStage => ({
  id: 'stage',
  code: 'STAGE',
  name: 'Stage',
  stageType,
  displayOrder: 0,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage: false,
  isTerminalStage: false,
  configurationJson: JSON.stringify(configuration),
});
const configuration = (value: AdmissionWorkflowStage) =>
  JSON.parse(value.configurationJson ?? '{}');

describe('five-stage configuration boundaries', () => {
  it('offers only the five application stage types in every starter template', () => {
    expect([0, 3, 6, 8, 9, 10, 11].filter(isApplicationStageType)).toEqual([]);
    expect([1, 2, 4, 5, 7].every(isApplicationStageType)).toBe(true);
    ADMISSION_WORKFLOW_TEMPLATES.forEach((template) => {
      const journey = getAdmissionWorkflowTemplate(template.id, 'published-form');
      expect(journey.stages.every((item) => isApplicationStageType(item.stageType))).toBe(true);
      expect(journey.stages.filter((item) => item.isEntryStage)).toHaveLength(1);
      expect(journey.stages.at(-1)).toMatchObject({ stageType: 7, isTerminalStage: true });
      expect(journey.transitions).toHaveLength(journey.stages.length - 1);
    });
  });
  it('prevents ordinary manual skip for optional managed stages while preserving other stage behavior', () => {
    [1, 2, 4, 5].forEach((type) => {
      expect(
        normalizeStageConfiguration({
          ...stage(type as AdmissionWorkflowStage['stageType']),
          isRequired: false,
          allowManualSkip: true,
        }).allowManualSkip
      ).toBe(false);
    });
    const decision = { ...stage(7), isRequired: false, allowManualSkip: true };
    expect(normalizeStageConfiguration(decision)).toBe(decision);
  });
  it('retains form resubmission and verification contracts while always allowing save and resume', () => {
    const result = configuration(
      normalizeStageConfiguration(
        stage(1, {
          formDefinitionId: 'form',
          form: {
            ...DEFAULT_FORM_STAGE_POLICY,
            enabled: false,
            allowSaveAndResume: false,
            maxSubmissionAttempts: 7,
            requireSectionVerification: true,
            autoAdvanceOnSubmit: false,
            verificationSectionCodes: ['CONTACT'],
          },
          extension: 'keep',
        })
      )
    );
    expect(result).toMatchObject({
      extension: 'keep',
      form: {
        enabled: true,
        allowSaveAndResume: true,
        maxSubmissionAttempts: 7,
        autoAdvanceOnSubmit: true,
        verificationSectionCodes: ['CONTACT'],
      },
    });
  });
  it('keeps assessment scoring and scheduling while removing the second-review gate', () => {
    const result = configuration(
      normalizeStageConfiguration(
        stage(2, {
          assessment: {
            ...DEFAULT_ASSESSMENT_POLICY,
            enabled: false,
            reviewRequired: true,
            schedulingEnabled: true,
            maxAttempts: 4,
          },
          extension: 'keep',
        })
      )
    );
    expect(result).toMatchObject({
      extension: 'keep',
      assessment: { enabled: true, reviewRequired: false, schedulingEnabled: true, maxAttempts: 4 },
    });
  });
  it('preserves document categories and class mappings while clearing early collection, waivers and independent review', () => {
    const requirement = {
      ...createDocumentRequirement('BIRTH', 'Birth certificate'),
      documentTypeId: 'category',
      standardIds: ['class'],
    };
    const result = configuration(
      normalizeStageConfiguration(
        stage(5, {
          documentVerification: {
            ...DEFAULT_DOCUMENT_POLICY,
            allowWaivers: true,
            requireIndependentReview: true,
            collectionFormStageCode: 'FORM',
            requirements: [requirement],
          },
        })
      )
    );
    expect(result.documentVerification).toMatchObject({
      enabled: true,
      allowWaivers: false,
      requireIndependentReview: false,
      collectionFormStageCode: null,
      requirements: [requirement],
    });
  });
  it('removes the legacy Payment collection configuration without changing sibling settings', () => {
    expect(
      configuration(
        normalizeStageConfiguration(
          stage(4, { payment: { requiredAmount: 500 }, extension: 'keep' })
        )
      )
    ).toEqual({ extension: 'keep' });
  });
  it('preserves unsupported saved policies for actionable validation', () => {
    const unsupported = stage(2, { assessment: { ...DEFAULT_ASSESSMENT_POLICY, version: 9 } });
    expect(normalizeStageConfiguration(unsupported)).toBe(unsupported);
  });
  it('allows multiple unnamed server references but rejects duplicate persisted document codes', () => {
    const json = (requirements: ReturnType<typeof createDocumentRequirement>[]) =>
      JSON.stringify({ documentVerification: { ...DEFAULT_DOCUMENT_POLICY, requirements } });
    expect(
      getDocumentConfigurationError(
        json([createDocumentRequirement('', 'First'), createDocumentRequirement('', 'Second')])
      )
    ).toBeUndefined();
    expect(
      getDocumentConfigurationError(
        json([
          createDocumentRequirement('DUPLICATE', 'First'),
          createDocumentRequirement('DUPLICATE', 'Second'),
        ])
      )
    ).toBe('Each document must have a unique code.');
  });
});
