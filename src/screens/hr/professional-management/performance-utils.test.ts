import { it, expect, describe } from 'vitest';

import {
  performanceWorkspaceTabs,
  performanceWorkspaceSubmodules,
} from './components/performance-workspace-config';
import {
  boardTypeLabels,
  sqaaDomainLabels,
  getSectionWeightTotal,
  isTemplatePublishable,
  formatPerformanceScore,
  calculateWeightedScore,
  filterPerformanceReviews,
  getPerformanceErrorMessage,
  hasDuplicatePerformanceCycle,
  getUniquePerformanceTemplates,
  getLatestActivePerformanceCycle,
  getMissingRequiredEvidenceCriteria,
  getPerformanceWorkspaceCapabilities,
} from './performance-utils';

describe('performance-utils', () => {
  it('validates publishable template weights', () => {
    const sections = [
      { id: 's1', name: 'Academic', weight: 60, displayOrder: 1, criteria: [{ id: 'c1' }] as any },
      { id: 's2', name: 'Conduct', weight: 40, displayOrder: 2, criteria: [{ id: 'c2' }] as any },
    ];

    expect(getSectionWeightTotal(sections as any)).toBe(100);
    expect(isTemplatePublishable(sections as any)).toBe(true);
  });

  it('blocks publishing when any section has no criteria', () => {
    const sections = [{ id: 's1', name: 'Academic', weight: 100, displayOrder: 1, criteria: [] }];

    expect(isTemplatePublishable(sections as any)).toBe(false);
  });

  it('blocks publishing when section weights do not total exactly 100', () => {
    const sections = [
      { id: 's1', name: 'Academic', weight: 99.99, displayOrder: 1, criteria: [{ id: 'c1' }] },
    ];

    expect(getSectionWeightTotal(sections as any)).toBe(99.99);
    expect(isTemplatePublishable(sections as any)).toBe(false);
  });

  it('provides Indian board and SQAAF labels', () => {
    expect(boardTypeLabels[1]).toBe('CBSE');
    expect(boardTypeLabels[2]).toBe('GSEB');
    expect(sqaaDomainLabels[0]).toContain('Curriculum');
    expect(sqaaDomainLabels[6]).toContain('School Processes');
  });

  it('formats pending and invalid performance scores without showing NaN', () => {
    expect(formatPerformanceScore(null)).toBe('-');
    expect(formatPerformanceScore(undefined)).toBe('-');
    expect(formatPerformanceScore(Number.NaN)).toBe('-');
    expect(formatPerformanceScore('not-a-number')).toBe('-');
    expect(formatPerformanceScore(87.5)).toBe('87.50%');
  });

  it('extracts readable performance mutation errors', () => {
    expect(
      getPerformanceErrorMessage(
        { data: { error: { code: 'HR:ProfessionalManagement:060007' } } },
        'Could not submit'
      )
    ).toBe('Add evidence for each required criterion before submitting.');
    expect(
      getPerformanceErrorMessage(
        { data: { error: { message: 'The cycle is already finalized.' } } },
        'Could not submit'
      )
    ).toBe('The cycle is already finalized.');
  });

  it('scopes workspace actions by mode', () => {
    expect(getPerformanceWorkspaceCapabilities('self')).toMatchObject({
      stageType: 0,
      canAddEvidence: true,
      canSubmitStage: true,
      canFinalizeOutcome: false,
    });
    expect(getPerformanceWorkspaceCapabilities('review')).toMatchObject({
      stageType: 1,
      allowStageSelection: true,
      canAddFeedback: true,
      canAddObservation: false,
    });
    expect(getPerformanceWorkspaceCapabilities('observation')).toMatchObject({
      canAddObservation: true,
      canAddEvidence: false,
      canSubmitStage: false,
      canFinalizeOutcome: false,
    });
    expect(getPerformanceWorkspaceCapabilities('outcome')).toMatchObject({
      canAddDevelopmentPlan: true,
      canFinalizeOutcome: true,
      canAddObservation: false,
      canSubmitStage: false,
    });
  });

  it('deduplicates matching templates and prefers published presets', () => {
    const templates = [
      { id: 'draft', name: 'CBSE Teacher Appraisal', boardType: 1, staffCategory: 0, status: 0 },
      {
        id: 'published',
        name: ' cbse teacher appraisal ',
        boardType: 1,
        staffCategory: 0,
        status: 1,
      },
      { id: 'admin', name: 'CBSE Teacher Appraisal', boardType: 1, staffCategory: 4, status: 1 },
    ];

    expect(getUniquePerformanceTemplates(templates as any).map((template) => template.id)).toEqual([
      'published',
      'admin',
    ]);
  });

  it('blocks duplicate active setup cycles for the same name and period only', () => {
    const cycles = [
      {
        id: 'active',
        name: 'CBSE Annual Appraisal',
        periodStart: '2026-06-14T00:00:00.000Z',
        periodEnd: '2027-06-14T00:00:00.000Z',
        status: 2,
      },
      {
        id: 'archived',
        name: 'CBSE Annual Appraisal',
        periodStart: '2026-06-14T00:00:00.000Z',
        periodEnd: '2027-06-14T00:00:00.000Z',
        status: 5,
      },
    ];

    expect(
      hasDuplicatePerformanceCycle({
        cycles: cycles as any,
        name: ' cbse annual appraisal ',
        periodStart: '2026-06-14',
        periodEnd: '2027-06-14',
      })
    ).toBe(true);
    expect(
      hasDuplicatePerformanceCycle({
        cycles: cycles as any,
        name: 'CBSE Midyear Appraisal',
        periodStart: '2026-06-14',
        periodEnd: '2027-06-14',
      })
    ).toBe(false);
  });

  it('defaults review filters to the latest active cycle and preserves all-cycle access', () => {
    const cycles = [
      { id: 'older', periodStart: '2025-06-14', status: 2 },
      { id: 'latest', periodStart: '2026-06-14', status: 2 },
      { id: 'archived', periodStart: '2027-06-14', status: 5 },
    ];
    const reviews = [
      { id: 'r1', cycleId: 'older', status: 2 },
      { id: 'r2', cycleId: 'latest', status: 2 },
      { id: 'r3', cycleId: 'latest', status: 3 },
    ];

    expect(getLatestActivePerformanceCycle(cycles as any)?.id).toBe('latest');
    expect(
      filterPerformanceReviews({ reviews: reviews as any, cycleId: 'latest', status: '2' }).map(
        (review) => review.id
      )
    ).toEqual(['r2']);
    expect(
      filterPerformanceReviews({ reviews: reviews as any, cycleId: 'all', status: 'all' }).map(
        (review) => review.id
      )
    ).toEqual(['r1', 'r2', 'r3']);
  });

  it('uses a deterministic latest active cycle when periods match', () => {
    const cycles = [
      { id: 'first-e2e', name: 'CBSE E2E PM Cycle 100', periodStart: '2026-06-14', status: 2 },
      { id: 'second-e2e', name: 'CBSE E2E PM Cycle 200', periodStart: '2026-06-14', status: 2 },
    ];

    expect(getLatestActivePerformanceCycle(cycles as any)?.id).toBe('second-e2e');
  });

  it('defines the performance management submodule route order', () => {
    expect(
      performanceWorkspaceSubmodules.map((submodule) => [submodule.value, submodule.path])
    ).toEqual([
      ['overview', '/hr/professional-management/overview'],
      ['reviews', '/hr/professional-management/reviews'],
      ['cycles-templates', '/hr/professional-management/cycles'],
      ['outcomes', '/hr/professional-management/outcomes'],
      ['reports', '/hr/professional-management/reports'],
      ['settings', '/hr/professional-management/settings'],
      ['setup-readiness', '/hr/professional-management/settings/setup'],
    ]);
    expect(
      performanceWorkspaceSubmodules.every((submodule) => submodule.icon && submodule.label)
    ).toBe(true);
  });

  it('defines the grouped professional management workspace navigation', () => {
    expect(performanceWorkspaceTabs.map((tab) => tab.value)).toEqual([
      'reviews',
      'cycles-templates',
      'outcomes',
      'reports',
      'settings',
    ]);
    expect(performanceWorkspaceTabs.map((tab) => tab.path)).not.toContain(
      '/hr/professional-management/setup'
    );
    expect(performanceWorkspaceTabs.every((tab) => tab.icon && tab.label)).toBe(true);
  });

  it('excludes not applicable criteria and normalizes remaining score', () => {
    const sections = [{ id: 's1', name: 'Academic', weight: 100, displayOrder: 1, criteria: [] }];
    const criteria = [
      {
        id: 'c1',
        sectionId: 's1',
        name: 'Delivery',
        weight: 50,
        evidenceRequired: false,
        displayOrder: 1,
      },
      {
        id: 'c2',
        sectionId: 's1',
        name: 'Results',
        weight: 50,
        evidenceRequired: false,
        displayOrder: 2,
      },
    ];
    const responses = [
      { criterionId: 'c1', rating: 5, isNotApplicable: false },
      { criterionId: 'c2', rating: null, isNotApplicable: true },
    ];

    expect(calculateWeightedScore({ sections, criteria, responses, ratingScaleMax: 5 })).toBe(100);
  });

  it('finds only submitted required criteria that still need evidence', () => {
    const criteria = [
      {
        id: 'required-missing',
        sectionId: 's1',
        name: 'Lesson planning',
        weight: 50,
        evidenceRequired: true,
        displayOrder: 1,
      },
      {
        id: 'required-covered',
        sectionId: 's1',
        name: 'Assessment evidence',
        weight: 50,
        evidenceRequired: true,
        displayOrder: 2,
      },
      {
        id: 'optional',
        sectionId: 's1',
        name: 'Professional conduct',
        weight: 50,
        evidenceRequired: false,
        displayOrder: 3,
      },
      {
        id: 'not-applicable',
        sectionId: 's1',
        name: 'Optional assignment',
        weight: 50,
        evidenceRequired: true,
        displayOrder: 4,
      },
    ];
    const responses = [
      { criterionId: 'required-missing', rating: 4, isNotApplicable: false },
      { criterionId: 'required-covered', rating: 4, isNotApplicable: false },
      { criterionId: 'optional', rating: 4, isNotApplicable: false },
      { criterionId: 'not-applicable', rating: null, isNotApplicable: true },
    ];

    expect(
      getMissingRequiredEvidenceCriteria({
        criteria,
        responses,
        evidence: [
          {
            id: 'evidence-1',
            reviewAssignmentId: 'review-1',
            criterionId: 'required-covered',
            title: 'Assessment file',
          },
        ],
      }).map((criterion) => criterion.id)
    ).toEqual(['required-missing']);
  });

  it('calculates weighted score across multiple SQAAF sections', () => {
    const sections = [
      { id: 's1', name: 'Teaching', weight: 60, displayOrder: 1, criteria: [] },
      { id: 's2', name: 'Professional Growth', weight: 40, displayOrder: 2, criteria: [] },
    ];
    const criteria = [
      {
        id: 'c1',
        sectionId: 's1',
        name: 'Lesson planning',
        weight: 50,
        evidenceRequired: true,
        displayOrder: 1,
      },
      {
        id: 'c2',
        sectionId: 's1',
        name: 'Classroom delivery',
        weight: 50,
        evidenceRequired: false,
        displayOrder: 2,
      },
      {
        id: 'c3',
        sectionId: 's2',
        name: 'Training completion',
        weight: 100,
        evidenceRequired: true,
        displayOrder: 1,
      },
    ];
    const responses = [
      { criterionId: 'c1', rating: 5, isNotApplicable: false },
      { criterionId: 'c2', rating: 3, isNotApplicable: false },
      { criterionId: 'c3', rating: 4, isNotApplicable: false },
    ];

    expect(calculateWeightedScore({ sections, criteria, responses, ratingScaleMax: 5 })).toBe(80);
  });

  it('returns zero when there are no ratable responses', () => {
    expect(
      calculateWeightedScore({
        sections: [{ id: 's1', name: 'Teaching', weight: 100, displayOrder: 1, criteria: [] }],
        criteria: [
          {
            id: 'c1',
            sectionId: 's1',
            name: 'Lesson planning',
            weight: 100,
            evidenceRequired: false,
            displayOrder: 1,
          },
        ],
        responses: [{ criterionId: 'c1', rating: null, isNotApplicable: true }],
      })
    ).toBe(0);
  });
});
