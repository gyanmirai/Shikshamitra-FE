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

  it('offers only configured CBSE and GSEB boards', () => {
    const boards = [...academicBoards, { id: 'board-icse', name: 'ICSE', educationMediums: [] }] as Board[];
    expect(buildOnboardingAcademicStructureOptions(boards).boards.map(board => board.name)).toEqual(['GSEB']);
  });

  it('only offers secondary levels and preserves multiple selected standards', () => {
    const boards = structuredClone(academicBoards);
    boards[0].educationMediums[0].educationMediumStages.push({
      id: 'stage-higher', name: 'Higher Secondary', standards: [
        { id: 'standard-11', name: 'Class 11', divisions: [] },
        { id: 'standard-12', name: 'Class 12', divisions: [] },
      ],
    } as any);
    boards[0].educationMediums[0].educationMediumStages.push({
      id: 'stage-primary', name: 'Primary', standards: [{ id: 'standard-1', name: 'Class 1', divisions: [] }],
    } as any);
    const options = buildOnboardingAcademicStructureOptions(boards);
    expect(options.stages.map(s => s.label)).toEqual(['Secondary', 'Higher Secondary']);
    expect(options.standards.map(s => s.id)).not.toContain('standard-1');
    const value = normalizeSingleAcademicApplicability({
      ...createAllAcademicApplicability(), boardMode: 'selected', boardIds: ['board-gseb'],
      mediumMode: 'selected', academicMediumIds: ['medium-gujarati'],
      stageMode: 'selected', academicMediumStageIds: ['stage-secondary', 'stage-higher'],
      classMode: 'selected', standardIds: ['standard-9', 'standard-11', 'standard-12'],
    }, boards);
    expect(value.academicMediumStageIds).toHaveLength(2);
    expect(value.standardIds).toHaveLength(3);
    expect(getSingleAcademicPathValidationError(value)).toBeNull();
  });
  it('uses concise dependent labels and qualified divisions', () => {
    const options = buildOnboardingAcademicStructureOptions(academicBoards);

    expect(options.mediums[0].label).toBe('Gujarati');
    expect(options.stages[0].label).toBe('Secondary');
    expect(options.standards[0].label).toBe('Standard 9');
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
      divisionMode: 'all',
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
