import { it, expect, describe } from 'vitest';

import { studentOnboardingPreviewData } from './student-onboarding-preview-data';
import { getReadinessSummary, applyReadinessAccessRules } from './student-onboarding-model';
import {
  defaultOnboardingSettings,
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

describe('Student Setup applied onboarding settings', () => {
  it('removes optional document, identifier, and account checks from readiness', () => {
    const configuredStudent = applyReadinessAccessRules(studentOnboardingPreviewData[0], {
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
        ...studentOnboardingPreviewData[0],
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
      applyReadinessAccessRules(studentOnboardingPreviewData[0], freshRules).readinessItems.find(
        (check) => check.key === 'documents'
      )?.status
    ).toBe('not-required');
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
      findRollNumberConfiguration(
        configurations,
        'Grade 6',
        undefined,
        'board-cbse',
        'grade-6'
      ).id
    ).toBe('cbse-grade-6-rule');
    expect(
      findRollNumberConfiguration(
        configurations,
        'Grade 7',
        undefined,
        'board-cbse',
        'grade-7'
      ).id
    ).toBe('cbse-rule');
    expect(
      findRollNumberConfiguration(
        configurations,
        'Grade 6',
        undefined,
        'board-gseb',
        'grade-6'
      ).id
    ).toBe('grade-6-rule');
    expect(
      findRollNumberConfiguration(
        configurations,
        'Grade 7',
        undefined,
        'board-gseb',
        'grade-7'
      ).id
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
      findDivisionChangeConfiguration(
        divisionConfigurations,
        'Grade 6',
        undefined,
        'board-cbse',
        'grade-6'
      ).id
    ).toBe('cbse-division-rule');
    expect(
      findDivisionChangeConfiguration(
        divisionConfigurations,
        'Grade 6',
        undefined,
        'board-gseb',
        'grade-6'
      ).id
    ).toBe(defaultDivisionChangeConfiguration.id);
    expect(isGrConfigurationApplicable(cbseGrSeries, 'fresh-admission', undefined, 'board-cbse')).toBe(
      true
    );
    expect(isGrConfigurationApplicable(cbseGrSeries, 'fresh-admission', undefined, 'board-gseb')).toBe(
      false
    );
  });
});
