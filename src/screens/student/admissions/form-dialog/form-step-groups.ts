import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

type StepSection = {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
  stepId?: string | null;
  stepCode?: string | null;
  stepName?: string | null;
  stepDisplayOrder?: number | null;
  stepVisibilityRuleJson?: string | null;
};

export type AdmissionFormStepGroup<TSection extends StepSection = StepSection> = {
  id: string;
  code: string;
  name: string;
  displayOrder: number;
  visibilityRuleJson?: string | null;
  sections: { section: TSection; sectionIndex: number }[];
};

export function getSectionStepId(section: StepSection) {
  return section.stepId ?? section.id;
}

export function getAdmissionFormStepGroups(
  sections: CreateUpdateAdmissionForm['sections']
): AdmissionFormStepGroup<CreateUpdateAdmissionForm['sections'][number]>[];
export function getAdmissionFormStepGroups<TSection extends StepSection>(
  sections: TSection[]
): AdmissionFormStepGroup<TSection>[];
export function getAdmissionFormStepGroups<TSection extends StepSection>(
  sections: TSection[]
): AdmissionFormStepGroup<TSection>[] {
  const groups = new Map<string, AdmissionFormStepGroup<TSection>>();

  sections.forEach((section, sectionIndex) => {
    const id = getSectionStepId(section);
    const existing = groups.get(id);
    if (existing) {
      existing.sections.push({ section, sectionIndex });
      return;
    }

    groups.set(id, {
      id,
      code: section.stepCode || section.code,
      name: section.stepName || section.name,
      displayOrder: section.stepDisplayOrder ?? section.displayOrder,
      visibilityRuleJson: section.stepVisibilityRuleJson,
      sections: [{ section, sectionIndex }],
    });
  });

  return [...groups.values()]
    .sort((left, right) => left.displayOrder - right.displayOrder)
    .map((group) => ({
      ...group,
      sections: group.sections.sort(
        (left, right) => left.section.displayOrder - right.section.displayOrder
      ),
    }));
}

export function nextSectionNumber(sections: CreateUpdateAdmissionForm['sections']) {
  const codes = new Set(sections.map((section) => section.code.toUpperCase()));
  let number = sections.length + 1;
  while (codes.has(`SECTION_${number}`)) number += 1;
  return number;
}

export function nextStepNumber(sections: CreateUpdateAdmissionForm['sections']) {
  const steps = getAdmissionFormStepGroups(sections);
  const codes = new Set(steps.map((step) => step.code.toUpperCase()));
  let number = steps.length + 1;
  while (codes.has(`STEP_${number}`)) number += 1;
  return number;
}
