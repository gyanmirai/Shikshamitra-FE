import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { getAdmissionFormStepGroups } from './form-step-groups';

const section = (
  id: string,
  stepId?: string,
  stepDisplayOrder?: number
): CreateUpdateAdmissionForm['sections'][number] => ({
  id,
  code: `SECTION_${id}`,
  name: `Section ${id}`,
  displayOrder: Number(id),
  stepId,
  stepCode: stepId ? `STEP_${stepId}` : undefined,
  stepName: stepId ? `Step ${stepId}` : undefined,
  stepDisplayOrder,
  fields: [],
});

describe('admission form step grouping', () => {
  it('groups multiple sections under the same step', () => {
    const groups = getAdmissionFormStepGroups([
      section('1', 'A', 1),
      section('2', 'A', 1),
      section('3', 'B', 0),
    ]);

    expect(groups.map((group) => group.id)).toEqual(['B', 'A']);
    expect(groups[1].sections.map(({ section: item }) => item.id)).toEqual(['1', '2']);
  });

  it('keeps legacy sections as one section per step', () => {
    const groups = getAdmissionFormStepGroups([section('1'), section('2')]);

    expect(groups).toHaveLength(2);
    expect(groups[0].name).toBe('Section 1');
  });
});
