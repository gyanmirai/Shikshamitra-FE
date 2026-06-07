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
  calculateWeightedScore,
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
