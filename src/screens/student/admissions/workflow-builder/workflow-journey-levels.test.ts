import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { it, expect, describe } from 'vitest';

import { buildWorkflowJourneyLevels } from './workflow-journey-levels';

const stage = (id: string, displayOrder: number, isEntryStage = false): AdmissionWorkflowStage => ({
  id,
  code: id.toUpperCase(),
  name: id,
  stageType: 11,
  displayOrder,
  isRequired: true,
  allowManualSkip: false,
  isEntryStage,
  isTerminalStage: false,
});

const route = (fromStageId: string, toStageId: string): AdmissionWorkflowTransition => ({
  id: `${fromStageId}-${toStageId}`,
  fromStageId,
  toStageId,
  priority: 0,
  isDefault: true,
});

describe('buildWorkflowJourneyLevels', () => {
  it('groups branches by graph depth rather than display order', () => {
    const result = buildWorkflowJourneyLevels(
      [stage('entry', 3, true), stage('approved', 0), stage('review', 2), stage('rejected', 1)],
      [route('entry', 'review'), route('review', 'approved'), route('review', 'rejected')]
    );

    expect(result.map((level) => level.stages.map((item) => item.id))).toEqual([
      ['entry'],
      ['review'],
      ['approved', 'rejected'],
    ]);
  });

  it('puts unreachable stages in a clearly separate final group', () => {
    const result = buildWorkflowJourneyLevels(
      [stage('entry', 0, true), stage('finish', 1), stage('orphan', 2)],
      [route('entry', 'finish')]
    );

    expect(result.at(-1)).toMatchObject({ depth: null, stages: [{ id: 'orphan' }] });
  });
});
