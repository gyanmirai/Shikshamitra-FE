import { it, expect, describe } from 'vitest';

import { studentOnboardingTestData } from './student-onboarding-test-fixtures';
import { getReadinessSummary, applyReadinessAccessRules } from './student-onboarding-model';
import {
  defaultOnboardingSettings as automaticOnboardingSettings,
  defaultOnboardingProfiles,
  isStudentApprovalRequired,
  getEffectiveReadinessRules,
  findRollNumberConfiguration,
  isGrConfigurationApplicable,
  defaultReadinessAccessRules,
  defaultGrNumberConfiguration,
  defaultRollNumberConfiguration,
  findDivisionChangeConfiguration,
  defaultDivisionChangeConfiguration,
} from '../onboarding-settings-model';

// Historical profile configurations remain readable without generating them for new schools.
const defaultOnboardingSettings = {
  ...automaticOnboardingSettings,
  onboardingProfiles: defaultOnboardingProfiles,
};

it('applies published numbering without a readiness profile and still enforces academic coverage', () => {
  const configuration = {
    ...defaultGrNumberConfiguration,
    status: 'published' as const,
    isActive: true,
    applicableProfileIds: [],
    boardMode: 'selected' as const,
    boardIds: ['cbse'],
  };
  expect(isGrConfigurationApplicable(configuration, undefined, '2026-10-12', { boardId: 'cbse' })).toBe(true);
  expect(isGrConfigurationApplicable(configuration, undefined, '2026-10-12', { boardId: 'gseb' })).toBe(false);
  expect(isGrConfigurationApplicable({ ...configuration, applicableProfileIds: ['retired-profile'] }, undefined, '2026-10-12', { boardId: 'cbse' })).toBe(true);
  expect(isGrConfigurationApplicable({ ...configuration, status: 'draft' }, undefined, '2026-10-12', { boardId: 'cbse' })).toBe(false);
});

describe('Student Setup applied onboarding settings', () => {
  it('removes optional document, identifier, and account checks from readiness', () => {
    const configuredStudent = applyReadinessAccessRules(studentOnboardingTestData[0], {
      ...defaultReadinessAccessRules,
      requireDocuments: false,
      requireIdentifiers: false,
      studentAccount: false,
      guardianAccount: false,
    });

    expect(configuredStudent.documentsRequired).toBe(0);
    expect(configuredStudent.studentAccountStatus).toBe('not-required');
    expect(configuredStudent.guardianAccountStatus).toBe('not-required');
    expect(
      configuredStudent.readinessItems
        .filter((item) => ['identifier', 'documents', 'accounts'].includes(item.key))
        .every((item) => item.status === 'not-required' && !item.blocking)
    ).toBe(true);
    expect(getReadinessSummary(configuredStudent)).toMatchObject({
      requiredCount: 2,
      passedCount: 2,
      blockingCount: 0,
      progress: 100,
    });
  });

  it('keeps unavailable connected-mode facts explicit when their checks are required', () => {
    const configuredStudent = applyReadinessAccessRules(
      {
        ...studentOnboardingTestData[0],
        readinessItems: [
          {
            key: 'documents',
            label: 'Documents',
            detail: 'Backend contract required.',
            status: 'not-connected',
            blocking: true,
            owner: 'Enrollment Documents',
          },
        ],
      },
      defaultReadinessAccessRules
    );

    expect(configuredStudent.readinessItems[0].status).toBe('not-connected');
    expect(getReadinessSummary(configuredStudent).blockingCount).toBe(1);
  });

  it('resolves independent readiness rules by admission route', () => {
    const settings = {
      ...defaultOnboardingSettings,
      onboardingProfiles: defaultOnboardingSettings.onboardingProfiles.map((profile) =>
        profile.id === 'fresh-admission'
          ? {
              ...profile,
              rules: {
                ...profile.rules,
                requireDocuments: false,
                checks: profile.rules.checks.map((check) =>
                  check.key === 'documents' ? { ...check, required: false } : check
                ),
              },
            }
          : profile
      ),
    };
    const freshRules = getEffectiveReadinessRules(settings, 'Fresh admission');
    const transferRules = getEffectiveReadinessRules(settings, 'Transfer student');

    expect(freshRules.requireDocuments).toBe(false);
    expect(transferRules.requireDocuments).toBe(true);
    expect(
      applyReadinessAccessRules(studentOnboardingTestData[0], freshRules).readinessItems.find(
        (check) => check.key === 'documents'
      )?.status
    ).toBe('not-required');
  });

  it('resolves the most specific readiness profile by academic path', () => {
    const baseFreshProfile = defaultOnboardingSettings.onboardingProfiles.find(
      (profile) => profile.id === 'fresh-admission'
    )!;
    const settings = {
      ...defaultOnboardingSettings,
      onboardingProfiles: [
        ...defaultOnboardingSettings.onboardingProfiles,
        {
          ...baseFreshProfile,
          id: 'fresh-gseb-english-secondary',
          applicability: {
            ...baseFreshProfile.applicability,
            boardMode: 'selected' as const,
            boardIds: ['board-gseb'],
            mediumMode: 'selected' as const,
            academicMediumIds: ['medium-english'],
            stageMode: 'selected' as const,
            academicMediumStageIds: ['stage-secondary'],
          },
          rules: {
            ...baseFreshProfile.rules,
            requireDocuments: false,
          },
        },
      ],
    };

    expect(
      getEffectiveReadinessRules(settings, 'Fresh admission', {
        boardId: 'board-gseb',
        academicMediumId: 'medium-english',
        academicMediumStageId: 'stage-secondary',
      }).requireDocuments
    ).toBe(false);
    expect(
      getEffectiveReadinessRules(settings, 'Fresh admission', {
        boardId: 'board-gseb',
        academicMediumId: 'medium-gujarati',
        academicMediumStageId: 'stage-secondary',
      }).requireDocuments
    ).toBe(true);
  });

  it('requires approval only when the selected profile policy matches the student', () => {
    const midYearRules = getEffectiveReadinessRules(
      defaultOnboardingSettings,
      'Mid-year admission'
    );
    const returningRules = getEffectiveReadinessRules(
      defaultOnboardingSettings,
      'Returning student'
    );

    expect(isStudentApprovalRequired(midYearRules, 'Mid-year admission')).toBe(true);
    expect(isStudentApprovalRequired(returningRules, 'Returning student')).toBe(false);
  });

  it('resolves a school-defined admission route regardless of casing', () => {
    const source = defaultOnboardingSettings.onboardingProfiles[0];
    const settings = {
      ...defaultOnboardingSettings,
      onboardingProfiles: [...defaultOnboardingSettings.onboardingProfiles, {
        ...source,
        id: 'scholarship-intake',
        admissionRoutes: ['Scholarship intake'],
        rules: { ...source.rules, requireDocuments: false },
      }],
    };

    expect(getEffectiveReadinessRules(settings, 'SCHOLARSHIP INTAKE').requireDocuments).toBe(false);
  });

  it('resolves Roll rules from exact Class to Board override to All Boards fallback', () => {
    const configurations = [
      defaultRollNumberConfiguration,
      {
        ...defaultRollNumberConfiguration,
        id: 'cbse-rule',
        boardMode: 'selected' as const,
        boardIds: ['board-cbse'],
        startingNumber: 100,
      },
      {
        ...defaultRollNumberConfiguration,
        id: 'grade-6-rule',
        classId: 'grade-6',
        className: 'Grade 6',
        startingNumber: 200,
      },
      {
        ...defaultRollNumberConfiguration,
        id: 'cbse-grade-6-rule',
        boardMode: 'selected' as const,
        boardIds: ['board-cbse'],
        classId: 'grade-6',
        className: 'Grade 6',
        startingNumber: 300,
      },
    ];

    expect(
      findRollNumberConfiguration(configurations, { boardId: 'board-cbse', standardId: 'grade-6' })
        .id
    ).toBe('cbse-grade-6-rule');
    expect(
      findRollNumberConfiguration(configurations, { boardId: 'board-cbse', standardId: 'grade-7' })
        .id
    ).toBe('cbse-rule');
    expect(
      findRollNumberConfiguration(configurations, { boardId: 'board-gseb', standardId: 'grade-6' })
        .id
    ).toBe('grade-6-rule');
    expect(
      findRollNumberConfiguration(configurations, { boardId: 'board-gseb', standardId: 'grade-7' })
        .id
    ).toBe(defaultRollNumberConfiguration.id);
  });

  it('resolves Division placement and GR series by Board applicability', () => {
    const divisionConfigurations = [
      defaultDivisionChangeConfiguration,
      {
        ...defaultDivisionChangeConfiguration,
        id: 'cbse-division-rule',
        boardMode: 'selected' as const,
        boardIds: ['board-cbse'],
        automaticStrategy: 'sequential' as const,
      },
    ];
    const cbseGrSeries = {
      ...defaultGrNumberConfiguration,
      id: 'cbse-gr-series',
      boardMode: 'selected' as const,
      boardIds: ['board-cbse'],
    };

    expect(
      findDivisionChangeConfiguration(divisionConfigurations, {
        boardId: 'board-cbse',
        standardId: 'grade-6',
      }).id
    ).toBe('cbse-division-rule');
    expect(
      findDivisionChangeConfiguration(divisionConfigurations, {
        boardId: 'board-gseb',
        standardId: 'grade-6',
      }).id
    ).toBe(defaultDivisionChangeConfiguration.id);
    expect(
      isGrConfigurationApplicable(cbseGrSeries, 'fresh-admission', undefined, {
        boardId: 'board-cbse',
      })
    ).toBe(true);
    expect(
      isGrConfigurationApplicable(cbseGrSeries, 'fresh-admission', undefined, {
        boardId: 'board-gseb',
      })
    ).toBe(false);
    expect(
      isGrConfigurationApplicable(cbseGrSeries, undefined, undefined, {
        boardId: 'board-cbse',
      })
    ).toBe(true);
  });

  it('resolves Board, Medium, School Level, Class, and Division specificity independently', () => {
    const configurations = [
      defaultRollNumberConfiguration,
      {
        ...defaultRollNumberConfiguration,
        id: 'gseb-english-secondary',
        boardMode: 'selected' as const,
        boardIds: ['board-gseb'],
        mediumMode: 'selected' as const,
        academicMediumIds: ['medium-english'],
        stageMode: 'selected' as const,
        academicMediumStageIds: ['stage-secondary'],
        classMode: 'selected' as const,
        standardIds: ['standard-9'],
        divisionMode: 'selected' as const,
        divisionIds: ['division-a'],
        startingNumber: 501,
      },
    ];

    expect(
      findRollNumberConfiguration(configurations, {
        boardId: 'board-gseb',
        academicMediumId: 'medium-english',
        academicMediumStageId: 'stage-secondary',
        standardId: 'standard-9',
        divisionId: 'division-a',
      }).id
    ).toBe('gseb-english-secondary');
    expect(
      findRollNumberConfiguration(configurations, {
        boardId: 'board-gseb',
        academicMediumId: 'medium-gujarati',
        academicMediumStageId: 'stage-secondary',
        standardId: 'standard-9',
        divisionId: 'division-a',
      }).id
    ).toBe(defaultRollNumberConfiguration.id);
  });
});
