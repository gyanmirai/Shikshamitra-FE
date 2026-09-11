import { it, expect, describe } from 'vitest';

import {
  DEFAULT_ASSESSMENT_POLICY,
  readAdmissionAssessmentPolicy,
  writeAdmissionAssessmentPolicy,
  getAssessmentConfigurationError,
} from './admission-assessment-policy';

import type { AdmissionAssessmentPolicy } from './admission-assessment-policy';

const configuration = (overrides: Partial<AdmissionAssessmentPolicy> = {}) =>
  JSON.stringify({ assessment: { ...DEFAULT_ASSESSMENT_POLICY, ...overrides } });

describe('managed admission assessment configuration', () => {
  it.each([undefined, '{}', '{"formDefinitionId":"published-form-1"}'])(
    'keeps legacy stages without an explicit assessment policy unchanged: %s',
    (json) => {
      expect(readAdmissionAssessmentPolicy(json)).toBeNull();
      expect(getAssessmentConfigurationError(json)).toBeUndefined();
    }
  );

  it('retains an explicit opt-out without applying managed score or attempt gates', () => {
    const json = configuration({ enabled: false, totalMarks: 0, passingMarks: -1, maxAttempts: 0 });
    expect(readAdmissionAssessmentPolicy(json)?.enabled).toBe(false);
    expect(getAssessmentConfigurationError(json)).toBeUndefined();
  });

  it('round-trips edited settings without losing form bindings or unknown policy keys', () => {
    const original = JSON.stringify({
      formDefinitionId: 'published-form-1',
      integration: { source: 'school-import', revision: 9 },
      assessment: { ...DEFAULT_ASSESSMENT_POLICY, extension: { rubric: 'v3' } },
    });
    const updated = writeAdmissionAssessmentPolicy(original, {
      ...DEFAULT_ASSESSMENT_POLICY,
      schedulingEnabled: true,
      totalMarks: 80,
      passingMarks: 36,
    });
    expect(JSON.parse(updated)).toEqual({
      formDefinitionId: 'published-form-1',
      integration: { source: 'school-import', revision: 9 },
      assessment: {
        ...DEFAULT_ASSESSMENT_POLICY,
        schedulingEnabled: true,
        totalMarks: 80,
        passingMarks: 36,
        extension: { rubric: 'v3' },
      },
    });
    expect(getAssessmentConfigurationError(updated)).toBeUndefined();
  });

  it.each(['{broken', 'null', '[]', '"text"'])(
    'rejects unreadable configuration instead of erasing it: %s',
    (json) => {
      expect(getAssessmentConfigurationError(json)).toBeTruthy();
      expect(() => writeAdmissionAssessmentPolicy(json, DEFAULT_ASSESSMENT_POLICY)).toThrow();
    }
  );

  it.each([
    { ...DEFAULT_ASSESSMENT_POLICY, version: 2 },
    { enabled: true, version: 1 },
    { ...DEFAULT_ASSESSMENT_POLICY, totalMarks: '100' },
    { ...DEFAULT_ASSESSMENT_POLICY, reviewRequired: 'false' },
  ])('rejects unsupported or incomplete policies', (assessment) => {
    const json = JSON.stringify({ assessment });
    expect(readAdmissionAssessmentPolicy(json)).toBeNull();
    expect(getAssessmentConfigurationError(json)).toMatch(/unsupported|incomplete/i);
    expect(() => writeAdmissionAssessmentPolicy(json, DEFAULT_ASSESSMENT_POLICY)).toThrow();
  });

  it.each([
    { totalMarks: 0 },
    { totalMarks: -1 },
    { totalMarks: 10001 },
    { passingMarks: -0.01 },
    { passingMarks: 100.01 },
    { maxAttempts: 0 },
    { maxAttempts: 1.5 },
    { maxAttempts: 11 },
  ])('rejects marks and attempt limits outside their valid range: %j', (override) => {
    expect(getAssessmentConfigurationError(configuration(override))).toBeTruthy();
  });

  it.each([
    { totalMarks: 0.5, passingMarks: 0 },
    { totalMarks: 10000, passingMarks: 10000, maxAttempts: 10 },
    { scoringEnabled: false, totalMarks: 0, passingMarks: -1 },
  ])('accepts valid boundaries and non-scored assessments: %j', (override) => {
    expect(getAssessmentConfigurationError(configuration(override))).toBeUndefined();
  });
});
