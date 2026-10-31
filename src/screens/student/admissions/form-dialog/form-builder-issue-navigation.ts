import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { getSectionStepId } from './form-step-groups';
import { parseFieldConfiguration } from './form-field-presets';

type SectionTarget = { sectionId: string; stepId: string; settingPath?: string };
export type BuilderIssueTarget =
  | (SectionTarget & {
      kind: 'field';
      fieldId: string;
      owner: 'registration' | 'inquiry';
      sourceFormDefinitionId?: string;
      fieldIdentity?: string;
      settingEditable?: boolean;
    })
  | (SectionTarget & { kind: 'section' | 'step' })
  | { kind: 'form'; settingPath?: string };

export function getBuilderIssueActionLabel(target: BuilderIssueTarget) {
  if (target.kind === 'field' && target.owner === 'inquiry') return 'Review Inquiry question';
  if (hasHiddenQuestionSetting(target)) return 'Review question';
  if (target.kind === 'section' && !target.settingPath?.endsWith('.name')) return 'Review section';
  if (target.kind === 'step' && !target.settingPath?.endsWith('.stepName')) return 'Review step';
  return 'Fix error';
}

export function getBuilderIssueRecoveryGuidance(target: BuilderIssueTarget): string | undefined {
  if (target.kind === 'field' && target.owner === 'inquiry')
    return 'This question is defined in Inquiry. Review the source Inquiry form; its question definitions cannot be edited here.';
  if (hasHiddenQuestionSetting(target))
    return 'This question has saved settings that cannot be edited here. Add a replacement question, or restore a valid form version. Keep the current question until its replacement is ready.';
  if (
    (target.kind === 'section' || target.kind === 'step') &&
    target.settingPath &&
    !target.settingPath.endsWith('.name') &&
    !target.settingPath.endsWith('.stepName')
  )
    return `This ${target.kind} has saved settings that cannot be edited here. Recreate the affected ${target.kind}, or restore a valid form version. Keep its questions until the replacement is ready.`;
  return undefined;
}

function hasHiddenQuestionSetting(target: BuilderIssueTarget) {
  return (
    target.kind === 'field' &&
    (/\.(code|bindingKey|requiredRuleJson)$/.test(target.settingPath ?? '') ||
      (target.settingPath?.endsWith('.validationJson') && target.settingEditable !== true))
  );
}

/** Resolve by stable IDs, never editable labels or remapped source question codes. */
export function getBuilderIssueTarget(
  form: CreateUpdateAdmissionForm,
  location: { sectionId?: string; fieldId?: string; stepId?: string; settingPath?: string } = {}
): BuilderIssueTarget {
  const section = form.sections.find((item) =>
    location.sectionId
      ? item.id === location.sectionId
      : location.fieldId
        ? item.fields.some((field) => field.id === location.fieldId)
        : location.stepId
          ? getSectionStepId(item) === location.stepId
          : false
  );
  if (!section) return { kind: 'form', settingPath: location.settingPath };
  const context = {
    sectionId: section.id,
    stepId: getSectionStepId(section),
    settingPath: location.settingPath,
  };
  const field = section.fields.find((item) => item.id === location.fieldId);
  if (field) {
    const source = field.inheritedFrom;
    const configuration = parseFieldConfiguration(field.validationJson);
    return {
      ...context,
      kind: 'field',
      fieldId: field.id,
      owner: source ? 'inquiry' : 'registration',
      ...(location.settingPath?.endsWith('.validationJson')
        ? { settingEditable: configuration.format === 'state' || configuration.format === 'city' }
        : {}),
      ...(source
        ? {
            sourceFormDefinitionId: source.inquiryFormDefinitionId,
            fieldIdentity: source.fieldIdentity,
          }
        : {}),
    };
  }
  return { ...context, kind: location.stepId ? 'step' : 'section' };
}

export function getFormikBuilderIssueTarget(
  form: CreateUpdateAdmissionForm,
  path: string
): BuilderIssueTarget {
  const indices = path.match(/^sections\[(\d+)\](?:\.fields\[(\d+)\])?(?:\.(\w+))?/);
  const section = indices ? form.sections[Number(indices[1])] : undefined;
  const field = indices?.[2] !== undefined ? section?.fields[Number(indices[2])] : undefined;
  return getBuilderIssueTarget(form, {
    sectionId: section?.id,
    fieldId: field?.id,
    stepId: section && indices?.[3]?.startsWith('step') ? getSectionStepId(section) : undefined,
    settingPath: path,
  });
}
