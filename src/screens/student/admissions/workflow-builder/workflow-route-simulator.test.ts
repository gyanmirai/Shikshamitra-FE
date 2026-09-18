import type {
  AdmissionWorkflowStage,
  AdmissionWorkflowTransition,
} from 'src/redux/student/admissions/admission-workflows-api';

import { it, expect, describe } from 'vitest';

import {
  simulateWorkflowRoute,
  evaluateWorkflowCondition,
  WORKFLOW_SIMULATION_SCENARIOS,
} from './workflow-route-simulator';

const stages: AdmissionWorkflowStage[] = [
  {
    id: 'review',
    code: 'REVIEW',
    name: 'Review',
    stageType: 6,
    displayOrder: 0,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage: true,
    isTerminalStage: false,
  },
  {
    id: 'approved',
    code: 'APPROVED',
    name: 'Approved',
    stageType: 7,
    displayOrder: 1,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage: false,
    isTerminalStage: true,
  },
  {
    id: 'rejected',
    code: 'REJECTED',
    name: 'Rejected',
    stageType: 7,
    displayOrder: 2,
    isRequired: true,
    allowManualSkip: false,
    isEntryStage: false,
    isTerminalStage: true,
  },
];

const transitions: AdmissionWorkflowTransition[] = [
  {
    id: 'reject-route',
    fromStageId: 'review',
    toStageId: 'rejected',
    priority: 0,
    isDefault: false,
    conditionRuleJson: JSON.stringify({
      field: 'review.decision',
      operator: 'Equals',
      value: 'reject',
    }),
  },
  {
    id: 'approve-route',
    fromStageId: 'review',
    toStageId: 'approved',
    priority: 1,
    isDefault: true,
  },
];

describe('workflow route simulator', () => {
  it('offers every release-safety scenario from the workflow specification', () => {
    expect(WORKFLOW_SIMULATION_SCENARIOS.map(({ id }) => id)).toEqual([
      'happy',
      'assessment-failed',
      'documents-missing',
      'eligibility-failed',
      'eligibility-exception',
      'payment-pending',
      'payment-waived',
      'review-correction',
      'rejected',
      'waitlisted',
      'offer-declined',
      'offer-expired',
      'seat-expired',
    ]);
  });

  it('uses the same first-matching-condition then default behavior as runtime routing', () => {
    expect(
      simulateWorkflowRoute(stages, transitions, { 'review.decision': 'reject' })
    ).toMatchObject({
      status: 'completed',
      steps: [{ stageId: 'review', transitionId: 'reject-route' }, { stageId: 'rejected' }],
    });
    expect(
      simulateWorkflowRoute(stages, transitions, { 'review.decision': 'approve' })
    ).toMatchObject({
      status: 'completed',
      steps: [{ stageId: 'review', transitionId: 'approve-route' }, { stageId: 'approved' }],
    });
  });

  it('evaluates grouped and numeric conditions', () => {
    const rule = JSON.stringify({
      operator: 'ALL',
      conditions: [
        { field: 'assessment.score', operator: 'GreaterThanOrEqual', value: '60' },
        { field: 'assessment.outcome', operator: 'In', value: ['passed', 'waived'] },
      ],
    });

    expect(
      evaluateWorkflowCondition(rule, {
        'assessment.score': '75',
        'assessment.outcome': 'passed',
      })
    ).toBe(true);
    expect(
      evaluateWorkflowCondition(rule, {
        'assessment.score': '50',
        'assessment.outcome': 'passed',
      })
    ).toBe(false);
  });
});
