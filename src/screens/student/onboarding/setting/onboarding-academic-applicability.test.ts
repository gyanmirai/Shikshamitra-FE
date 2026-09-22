import type { Board } from 'src/types/school';

import { it, expect, describe } from 'vitest';

import {
  academicTargetsOverlap,
  getAcademicApplicabilityScore,
  createAllAcademicApplicability,
} from '../onboarding-settings-model';
import {
  getAcademicApplicabilitySummary,
  getSingleAcademicPathValidationError,
  normalizeSingleAcademicApplicability,
  buildOnboardingAcademicStructureOptions,
} from './onboarding-academic-applicability';

const academicBoards = [
  {
    id: 'board-gseb',
    name: 'GSEB',
    educationMediums: [
      {
        id: 'medium-gujarati',
        name: 'Gujarati',
        educationMediumStages: [
          {
            id: 'stage-secondary',
            name: 'Secondary',
            standards: [
              {
                id: 'standard-9',
                name: 'Standard 9',
                divisions: [{ id: 'division-a', name: 'A' }],
              },
            ],
          },
        ],
      },
    ],
  },
] as Board[];

describe('Student Onboarding academic applicability', () => {
  it('builds fully qualified Board, Medium, School Level, Class, and Division labels', () => {
    const options = buildOnboardingAcademicStructureOptions(academicBoards);

    expect(options.mediums[0].label).toBe('GSEB / Gujarati');
    expect(options.stages[0].label).toBe('GSEB / Gujarati / Secondary');
    expect(options.standards[0].label).toBe('GSEB / Gujarati / Secondary / Standard 9');
    expect(options.divisions[0].label).toBe('GSEB / Gujarati / Secondary / Standard 9 / A');
  });

  it('summarizes a selected academic path without inferring Medium or School Level from Board', () => {
    expect(
      getAcademicApplicabilitySummary(
        {
          ...createAllAcademicApplicability(),
          boardMode: 'selected',
          boardIds: ['board-gseb'],
          mediumMode: 'selected',
          academicMediumIds: ['medium-gujarati'],
          stageMode: 'selected',
          academicMediumStageIds: ['stage-secondary'],
          classMode: 'selected',
          standardIds: ['standard-9'],
          divisionMode: 'selected',
          divisionIds: ['division-a'],
        },
        academicBoards
      )
    ).toBe('GSEB / Gujarati / Secondary / Standard 9 / A');
  });

  it('normalizes older multi-value settings to one cascading academic path', () => {
    const normalized = normalizeSingleAcademicApplicability(
      {
        ...createAllAcademicApplicability(),
        boardMode: 'selected',
        boardIds: ['board-gseb', 'board-other'],
        mediumMode: 'selected',
        academicMediumIds: ['medium-gujarati', 'medium-other'],
        stageMode: 'selected',
        academicMediumStageIds: ['stage-secondary', 'stage-other'],
        classMode: 'selected',
        standardIds: ['standard-9', 'standard-other'],
        divisionMode: 'selected',
        divisionIds: ['division-a', 'division-other'],
        includeFutureStructures: true,
      },
      academicBoards
    );

    expect(normalized.boardIds).toEqual(['board-gseb']);
    expect(normalized.academicMediumIds).toEqual(['medium-gujarati']);
    expect(normalized.academicMediumStageIds).toEqual(['stage-secondary']);
    expect(normalized.standardIds).toEqual(['standard-9']);
    expect(normalized.divisionIds).toEqual(['division-a']);
    expect(normalized.boardMode).toBe('selected');
    expect(normalized.mediumMode).toBe('selected');
    expect(normalized.stageMode).toBe('selected');
    expect(normalized.classMode).toBe('selected');
    expect(normalized.divisionMode).toBe('selected');
    expect(normalized.includeFutureStructures).toBe(false);
  });

  it('converts legacy All fallbacks into an incomplete path that requires explicit selections', () => {
    const normalized = normalizeSingleAcademicApplicability(
      createAllAcademicApplicability(),
      academicBoards
    );

    expect(normalized).toMatchObject({
      boardMode: 'selected',
      boardIds: [],
      mediumMode: 'selected',
      academicMediumIds: [],
      stageMode: 'selected',
      academicMediumStageIds: [],
      classMode: 'selected',
      standardIds: [],
      divisionMode: 'selected',
      divisionIds: [],
    });
    expect(getSingleAcademicPathValidationError(normalized)).toBe('Select one Board.');
  });

  it('distinguishes a broad fallback from an equally specific conflicting override', () => {
    const fallback = createAllAcademicApplicability();
    const gseb = {
      ...createAllAcademicApplicability(),
      boardMode: 'selected' as const,
      boardIds: ['board-gseb'],
    };
    const sameGseb = { ...gseb };

    expect(academicTargetsOverlap(fallback, gseb)).toBe(true);
    expect(getAcademicApplicabilityScore(fallback)).not.toBe(getAcademicApplicabilityScore(gseb));
    expect(academicTargetsOverlap(gseb, sameGseb)).toBe(true);
    expect(getAcademicApplicabilityScore(gseb)).toBe(getAcademicApplicabilityScore(sameGseb));
  });
});
