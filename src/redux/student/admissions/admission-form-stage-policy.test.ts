import { it, expect, describe } from 'vitest';

import {
  DEFAULT_FORM_STAGE_POLICY,
  readAdmissionFormStagePolicy,
  writeAdmissionFormStagePolicy,
  writeAdmissionFormDefinitionId,
  ensureAdmissionFormStageConfiguration,
  getAdmissionFormStageConfigurationError,
} from './admission-form-stage-policy';

import type { AdmissionForm } from './admission-forms-api';

const form = {
  id: '4f3dcb27-9c94-4907-8a71-0839efed22c8',
  name: 'Application',
  code: 'APP',
  version: 1,
  status: 1,
  layoutType: 1,
  sectionCount: 2,
  sections: [
    { id: 'section-1', code: 'STUDENT', name: 'Student', displayOrder: 0, fields: [] },
    { id: 'section-2', code: 'GUARDIAN', name: 'Guardian', displayOrder: 1, fields: [] },
  ],
} as AdmissionForm;

describe('managed Form stage policy', () => {
  it('upgrades a legacy Basic configuration to an explicit disabled policy', () => {
    const legacy = JSON.stringify({ formDefinitionId: form.id });
    const upgraded = ensureAdmissionFormStageConfiguration(legacy);

    expect(readAdmissionFormStagePolicy(legacy)).toBeNull();
    expect(getAdmissionFormStageConfigurationError(legacy, [form])).toBeUndefined();
    expect(JSON.parse(upgraded ?? '')).toEqual({
      formDefinitionId: form.id,
      form: { ...DEFAULT_FORM_STAGE_POLICY, enabled: true },
    });
  });

  it('preserves unrelated settings when selecting a form and editing its policy', () => {
    const selected = writeAdmissionFormDefinitionId(
      JSON.stringify({ custom: { kept: true } }),
      form.id
    );
    expect(JSON.parse(selected)).toEqual({
      custom: { kept: true },
      formDefinitionId: form.id,
      form: { ...DEFAULT_FORM_STAGE_POLICY, enabled: true },
    });
    const managed = writeAdmissionFormStagePolicy(selected, DEFAULT_FORM_STAGE_POLICY);
    expect(JSON.parse(managed)).toMatchObject({
      formDefinitionId: form.id,
      custom: { kept: true },
      form: DEFAULT_FORM_STAGE_POLICY,
    });
  });

  it('clears verification sections from the previous published form version', () => {
    const previous = JSON.stringify({
      custom: { kept: true },
      formDefinitionId: form.id,
      form: {
        ...DEFAULT_FORM_STAGE_POLICY,
        requireSectionVerification: true,
        verificationSectionCodes: ['STUDENT'],
      },
    });
    const nextFormId = 'different-published-form';

    expect(JSON.parse(writeAdmissionFormDefinitionId(previous, nextFormId))).toMatchObject({
      custom: { kept: true },
      formDefinitionId: nextFormId,
      form: { requireSectionVerification: true, verificationSectionCodes: [] },
    });
    expect(
      JSON.parse(writeAdmissionFormDefinitionId(previous, form.id)).form.verificationSectionCodes
    ).toEqual(['STUDENT']);
  });

  it('supports ownership, deadlines, corrections, and selected verification sections', () => {
    const policy = {
      ...DEFAULT_FORM_STAGE_POLICY,
      responsibility: 'shared' as const,
      dueInDays: 14,
      requireSectionVerification: true,
      autoAdvanceOnSubmit: false,
      verificationSectionCodes: ['STUDENT', 'GUARDIAN'],
    };
    const json = JSON.stringify({ formDefinitionId: form.id, form: policy });
    expect(readAdmissionFormStagePolicy(json)).toEqual(policy);
    expect(getAdmissionFormStageConfigurationError(json, [form])).toBeUndefined();
  });

  it('rejects policies that cannot complete safely', () => {
    const noVerifier = JSON.stringify({
      formDefinitionId: form.id,
      form: { ...DEFAULT_FORM_STAGE_POLICY, requireSectionVerification: true },
    });
    const noResubmission = JSON.stringify({
      formDefinitionId: form.id,
      form: { ...DEFAULT_FORM_STAGE_POLICY, maxSubmissionAttempts: 1 },
    });
    expect(getAdmissionFormStageConfigurationError(noVerifier, [form])).toContain('one section');
    expect(getAdmissionFormStageConfigurationError(noResubmission, [form])).toContain(
      'two attempts'
    );
  });

  it('rejects a verification section from another form version', () => {
    const json = JSON.stringify({
      formDefinitionId: form.id,
      form: {
        ...DEFAULT_FORM_STAGE_POLICY,
        requireSectionVerification: true,
        verificationSectionCodes: ['OLD_SECTION'],
      },
    });
    expect(getAdmissionFormStageConfigurationError(json, [form])).toContain('not part');
  });
});
