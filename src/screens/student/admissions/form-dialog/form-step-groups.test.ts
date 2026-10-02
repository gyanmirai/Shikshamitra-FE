import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { it, expect, describe } from 'vitest';

import { nextStepNumber, getAdmissionFormStepGroups } from './form-step-groups';

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

  it('keeps a cleared step name empty across all its sections while editing', () => {
    const sections = [section('1', 'A', 0), section('2', 'A', 0)].map((item) => ({
      ...item,
      stepName: '',
    }));

    const [group] = getAdmissionFormStepGroups(sections);

    expect(group.name).toBe('');
    expect(group.id).toBe('A');
    expect(group.sections).toHaveLength(2);
  });

  it('uses the section name only when legacy step metadata has no name', () => {
    const groups = getAdmissionFormStepGroups([
      { ...section('1', 'A', 0), stepName: null },
      { ...section('2', 'B', 1), stepName: undefined },
    ]);

    expect(groups.map(({ name }) => name)).toEqual(['Section 1', 'Section 2']);
  });

  it('preserves replacement text and spaces during step-name editing', () => {
    ['P', 'Parent ', 'Parent details', ' Parent details '].forEach((stepName) => {
      const [group] = getAdmissionFormStepGroups([{ ...section('1', 'A', 0), stepName }]);

      expect(group.name).toBe(stepName);
    });
  });

  it('chooses an unused step code after a step is removed', () => {
    const sections = [section('1', 'A', 0), section('3', 'C', 2)];
    sections[0].stepCode = 'STEP_1';
    sections[1].stepCode = 'STEP_3';

    expect(nextStepNumber(sections)).toBe(4);
    sections[1].stepCode = 'STEP_2';
    expect(nextStepNumber(sections)).toBe(3);
  });
});
