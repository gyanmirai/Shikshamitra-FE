import { it, expect, describe } from 'vitest';

import {
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
});
