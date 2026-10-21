import { it, expect, describe } from 'vitest';

import {
  assessmentProfileTotal,
  DEFAULT_ASSESSMENT_POLICY,
  readAdmissionAssessmentPolicy,
  writeAdmissionAssessmentPolicy,
  getAssessmentConfigurationError,
} from './admission-assessment-policy';

import type {
  AdmissionAssessmentPolicy,
  AdmissionAssessmentClassProfile,
} from './admission-assessment-policy';

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

const profile = (
  overrides: Partial<AdmissionAssessmentClassProfile> = {}
): AdmissionAssessmentClassProfile => ({
  id: 'profile-1',
  name: 'Class 5',
  boardId: 'board-1',
  mediumId: 'medium-1',
  standardIds: ['class-5'],
  passRule: 'both',
  passingMarks: 40,
  subjects: [
    {
      code: 'subject-english',
      subjectId: 'english',
      name: 'English',
      totalMarks: 30,
      passingMarks: 12,
    },
    {
      code: 'subject-maths',
      subjectId: 'maths',
      name: 'Mathematics',
      totalMarks: 50,
      passingMarks: 20,
    },
    { code: 'subject-custom', name: 'Entrance reasoning', totalMarks: 20, passingMarks: 8 },
  ],
  ...overrides,
});
const subjectConfiguration = (
  profiles = [profile()],
  changes: Partial<AdmissionAssessmentPolicy> = {}
) => configuration({ version: 2, scoringMode: 'subjects', classProfiles: profiles, ...changes });

describe('subject-wise class assessment profiles', () => {
  it('reads v2 and preserves class groups, stable subject codes and sibling settings through edits', () => {
    const original = JSON.stringify({
      extension: { saved: true },
      assessment: {
        ...DEFAULT_ASSESSMENT_POLICY,
        version: 2,
        scoringMode: 'subjects',
        classProfiles: [profile()],
        integration: 'retained',
      },
    });
    const policy = readAdmissionAssessmentPolicy(original)!;
    expect(policy.classProfiles?.[0].subjects[2].subjectId).toBeUndefined();
    const updated = writeAdmissionAssessmentPolicy(original, { ...policy, maxAttempts: 2 });
    expect(JSON.parse(updated)).toMatchObject({
      extension: { saved: true },
      assessment: {
        version: 2,
        scoringMode: 'subjects',
        maxAttempts: 2,
        integration: 'retained',
        classProfiles: [profile()],
      },
    });
    expect(getAssessmentConfigurationError(updated)).toBeUndefined();
  });

  it('keeps old scalar policies unchanged and supports v2 scalar or manual operation', () => {
    expect(readAdmissionAssessmentPolicy(configuration())).toEqual(DEFAULT_ASSESSMENT_POLICY);
    expect(
      getAssessmentConfigurationError(
        configuration({ version: 2, scoringMode: 'total', classProfiles: [] })
      )
    ).toBeUndefined();
    expect(
      getAssessmentConfigurationError(
        configuration({
          version: 2,
          scoringMode: 'total',
          scoringEnabled: false,
          classProfiles: [],
        })
      )
    ).toBeUndefined();
    expect(
      getAssessmentConfigurationError(subjectConfiguration([], { scoringEnabled: false }))
    ).toMatch(/marks-based/);
  });

  it.each([
    { version: 3 },
    { version: 2, scoringMode: 'subjects' },
    { version: 2, scoringMode: 'unknown', classProfiles: [] },
    { version: 2, scoringMode: 'subjects', classProfiles: [null] },
    { version: 2, scoringMode: 'subjects', classProfiles: [{ ...profile(), subjects: [null] }] },
    {
      version: 2,
      scoringMode: 'subjects',
      classProfiles: [{ ...profile(), subjects: [{ ...profile().subjects[0], totalMarks: '30' }] }],
    },
  ])(
    'rejects unreadable/future v2 structures without replacing saved configuration: %j',
    (changes) => {
      const json = JSON.stringify({ assessment: { ...DEFAULT_ASSESSMENT_POLICY, ...changes } });
      expect(readAdmissionAssessmentPolicy(json)).toBeNull();
      expect(() => writeAdmissionAssessmentPolicy(json, DEFAULT_ASSESSMENT_POLICY)).toThrow();
    }
  );

  it('requires profiles and prevents duplicate profile IDs and overlapping classes', () => {
    expect(getAssessmentConfigurationError(subjectConfiguration([]))).toMatch(/Add a class/);
    expect(
      getAssessmentConfigurationError(
        subjectConfiguration([profile(), profile({ id: 'PROFILE-1', standardIds: ['class-6'] })])
      )
    ).toMatch(/unique identity/);
    expect(
      getAssessmentConfigurationError(
        subjectConfiguration([profile(), profile({ id: 'profile-2' })])
      )
    ).toMatch(/only one/);
    expect(
      getAssessmentConfigurationError(
        subjectConfiguration([profile({ standardIds: ['class-5', 'class-5'] })])
      )
    ).toMatch(/only one/);
    expect(
      getAssessmentConfigurationError(
        subjectConfiguration([profile({ standardIds: ['class-5', 'class-6'] })])
      )
    ).toBeUndefined();
  });

  it.each([
    { boardId: '' },
    { mediumId: '' },
    { standardIds: [] },
    { standardIds: [''] },
    { name: ' ' },
    { subjects: [] },
    { passRule: 'invalid' as AdmissionAssessmentClassProfile['passRule'] },
    { subjects: [{ ...profile().subjects[0], totalMarks: 0 }] },
    { subjects: [{ ...profile().subjects[0], totalMarks: 10001 }] },
    { passingMarks: 101 },
    { subjects: [{ ...profile().subjects[0], passingMarks: null }] },
    { subjects: [{ ...profile().subjects[0], passingMarks: -1 }] },
    { subjects: [{ ...profile().subjects[0], passingMarks: 31 }] },
    { subjects: [profile().subjects[0], { ...profile().subjects[0], code: 'other-code' }] },
    { subjects: [profile().subjects[0], { ...profile().subjects[1], name: ' english ' }] },
  ])('rejects incomplete scopes, duplicate subjects and invalid thresholds: %j', (changes) => {
    expect(getAssessmentConfigurationError(subjectConfiguration([profile(changes)]))).toBeTruthy();
  });

  it.each(['overall', 'everySubject', 'both'] as const)(
    'accepts the %s pass rule with its required thresholds',
    (passRule) => {
      const current = profile({ passRule });
      if (passRule === 'overall')
        current.subjects = current.subjects.map((subject) => ({ ...subject, passingMarks: null }));
      expect(getAssessmentConfigurationError(subjectConfiguration([current]))).toBeUndefined();
    }
  );

  it('sums decimal marks accurately without truncating accepted precision or modifying payload values', () => {
    const current = profile({
      passingMarks: 0.3,
      passRule: 'overall',
      subjects: [
        { code: 'one', name: 'One', totalMarks: 0.1 },
        { code: 'two', name: 'Two', totalMarks: 0.2 },
      ],
    });
    expect(assessmentProfileTotal(current)).toBe(0.3);
    current.subjects[0].totalMarks = 0.0000000001;
    expect(assessmentProfileTotal(current)).toBe(0.2000000001);
    current.passingMarks = 0;
    expect(getAssessmentConfigurationError(subjectConfiguration([current]))).toBeUndefined();
    expect(
      JSON.parse(subjectConfiguration([current])).assessment.classProfiles[0].subjects[0].totalMarks
    ).toBe(0.0000000001);
  });
});
