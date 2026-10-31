import type {
  CreateUpdateAdmissionForm,
  AdmissionFormSystemFieldMetadata,
} from 'src/redux/student/admissions/admission-forms-api';

import { FIELD_TYPES } from './form-dialog-model';
import { parseFieldConfiguration } from './form-field-presets';
import { getAdmissionFormStepGroups } from './form-step-groups';
import { getInquiryFormConfigurationIssues } from '../admission-inquiry-field-bindings';
import { isJsonObject, parseOptions, extractRuleFields } from './form-builder-issue-utils';
import {
  getBuilderIssueTarget,
  type BuilderIssueTarget,
  getFormikBuilderIssueTarget,
} from './form-builder-issue-navigation';
import {
  isClassInterestQuestion,
  duplicateClassInterestMessage,
  classInterestConfigurationValid,
  classInterestConfigurationMessage,
} from '../admission-class-question';

export type BuilderIssue = { message: string; fieldId?: string; target?: BuilderIssueTarget };
type StudentFieldCatalogue = {
  fields?: AdmissionFormSystemFieldMetadata[];
  isLoading?: boolean;
  isError?: boolean;
};

export function getBuilderIssues(
  form: CreateUpdateAdmissionForm,
  catalogue: StudentFieldCatalogue = {}
): BuilderIssue[] {
  const issues: BuilderIssue[] = getInquiryFormConfigurationIssues(form).map((message) => ({
    message,
  }));
  const steps = getAdmissionFormStepGroups(form.sections);
  const inheritedOnly = Boolean(
    form.purpose === 1 && form.inheritance?.enabled && form.inheritance.sources.length
  );
  if (!form.sections.length && !inheritedOnly)
    issues.push({ message: 'Add at least one section.' });
  if (form.layoutType === 1 && steps.length < 2 && !inheritedOnly)
    issues.push({ message: 'Step-by-step forms should have at least two steps.' });
  if (form.layoutType === 1) {
    const stepCodes = new Set<string>();
    steps.forEach((step) => {
      const stepPath = `sections[${step.sections[0].sectionIndex}]`;
      const target = getFormikBuilderIssueTarget(form, `${stepPath}.stepCode`);
      const code = step.code.trim().toUpperCase();
      if (!step.name.trim())
        issues.push({
          message: `Step ${step.displayOrder + 1} needs a name.`,
          target: getFormikBuilderIssueTarget(form, `${stepPath}.stepName`),
        });
      if (!code) issues.push({ message: `${step.name || 'Step'} needs a code.`, target });
      else if (!/^[A-Z][A-Z0-9_-]*$/.test(code))
        issues.push({ message: `${step.name || step.code} has an invalid code.`, target });
      else if (stepCodes.has(code))
        issues.push({ message: `Duplicate step code: ${step.code}.`, target });
      stepCodes.add(code);
    });
  }
  const sectionCodes = new Set<string>();
  const fieldCodes = new Set<string>();
  const fields = form.sections.flatMap((section) => section.fields);
  fields.filter(isClassInterestQuestion).forEach((field, index) => {
    const message =
      index > 0
        ? duplicateClassInterestMessage
        : !classInterestConfigurationValid(field)
          ? classInterestConfigurationMessage
          : undefined;
    if (message)
      issues.push({
        message,
        fieldId: field.id,
        target: getBuilderIssueTarget(form, {
          fieldId: field.id,
          settingPath: index > 0 ? 'label' : 'optionsJson',
        }),
      });
  });
  const targetForField = (fieldId: string, property: string) => {
    const sectionIndex = form.sections.findIndex((section) =>
      section.fields.some((field) => field.id === fieldId)
    );
    const fieldIndex = form.sections[sectionIndex]?.fields.findIndex(
      (field) => field.id === fieldId
    );
    return getFormikBuilderIssueTarget(
      form,
      `sections[${sectionIndex}].fields[${fieldIndex}].${property}`
    );
  };
  const linkedFields = fields.filter((field) => field.bindingType === 0 && field.fieldType !== 12);
  const writableFullName = linkedFields.find(
    (field) => !field.readOnly && field.bindingKey?.trim().toLowerCase() === 'applicant.name'
  );
  if (
    form.purpose === 1 &&
    writableFullName &&
    linkedFields.some((field) =>
      ['applicant.firstname', 'applicant.middlename', 'applicant.lastname'].includes(
        field.bindingKey?.trim().toLowerCase() ?? ''
      )
    )
  )
    issues.push({
      message:
        'Use either a writable full student name or separate student name fields before publishing.',
      fieldId: writableFullName.id,
      target: targetForField(writableFullName.id, 'bindingKey'),
    });
  const catalogueReady =
    catalogue.fields !== undefined && !catalogue.isLoading && !catalogue.isError;
  if (linkedFields.length && !catalogueReady)
    issues.push({
      message: catalogue.isError
        ? 'Student field connections could not be checked. Reload the form and try again.'
        : 'Student field connections are still being checked.',
    });
  const boundKeys = new Set<string>();
  linkedFields.forEach((field) => {
    const key = field.bindingKey?.toLowerCase();
    if (key && boundKeys.has(key))
      issues.push({
        message: `${field.label || field.code} duplicates a linked student field.`,
        fieldId: field.id,
        target: targetForField(field.id, 'bindingKey'),
      });
    if (key) boundKeys.add(key);
    if (!catalogueReady) return;
    const metadata = catalogue.fields!.find((item) => item.key.toLowerCase() === key);
    if (!metadata)
      issues.push({
        message: `${field.label || field.code} needs a valid student field connection.`,
        fieldId: field.id,
        target: targetForField(field.id, 'bindingKey'),
      });
    else if (metadata.fieldType !== field.fieldType) {
      const expectedType =
        FIELD_TYPES.find(([, type]) => type === metadata.fieldType)?.[0] ?? 'original answer type';
      issues.push({
        message: `${field.label || field.code} is linked to ${metadata.displayName} and must use ${expectedType}. Restore its field type in Basic settings.`,
        fieldId: field.id,
        target: targetForField(field.id, 'fieldType'),
      });
    }
  });
  form.sections.forEach((section, sectionIndex) => {
    const target = getFormikBuilderIssueTarget(form, `sections[${sectionIndex}].code`);
    if (
      !section.fields.length &&
      !(form.purpose === 1 && form.inheritance?.enabled && form.inheritance.sources.length)
    )
      issues.push({
        message: `${section.name || section.code || 'Section'} has no fields. Add at least one field before publishing.`,
        target: getBuilderIssueTarget(form, { sectionId: section.id }),
      });
    if (!section.code.trim())
      issues.push({ message: `${section.name || 'Section'} needs a code.`, target });
    const sectionCode = section.code.trim().toUpperCase();
    if (section.code.trim() && !/^[A-Z][A-Z0-9_-]*$/.test(sectionCode))
      issues.push({ message: `${section.name || section.code} has an invalid code.`, target });
    if (sectionCodes.has(sectionCode))
      issues.push({ message: `Duplicate section code: ${section.code}.`, target });
    sectionCodes.add(sectionCode);
    section.fields.forEach((field, fieldIndex) => {
      const fieldPath = `sections[${sectionIndex}].fields[${fieldIndex}]`;
      const fieldTarget = (property: string) =>
        getFormikBuilderIssueTarget(form, `${fieldPath}.${property}`);
      const code = field.code.trim().toUpperCase();
      if (!field.code.trim())
        issues.push({
          message: `${field.label || 'Field'} needs a code.`,
          fieldId: field.id,
          target: fieldTarget('code'),
        });
      if (field.code.trim() && !/^[A-Z][A-Z0-9_-]*$/.test(code))
        issues.push({
          message: `${field.label || field.code} has an invalid code.`,
          fieldId: field.id,
          target: fieldTarget('code'),
        });
      if (fieldCodes.has(code))
        issues.push({
          message: `Duplicate field code: ${field.code}.`,
          fieldId: field.id,
          target: fieldTarget('code'),
        });
      fieldCodes.add(code);
      if (!field.label.trim())
        issues.push({
          message: `${field.code || 'Field'} needs a label.`,
          fieldId: field.id,
          target: fieldTarget('label'),
        });
      if (field.fieldType !== 12 && field.bindingType === 1 && !field.bindingKey?.trim())
        issues.push({
          message: `${field.label || field.code} needs a custom binding key.`,
          fieldId: field.id,
          target: fieldTarget('bindingKey'),
        });
      if (
        (field.fieldType === 6 || field.fieldType === 7 || field.fieldType === 8) &&
        !parseOptions(field.optionsJson)
      )
        issues.push({
          message: `${field.label || field.code} requires valid options.`,
          fieldId: field.id,
          target: fieldTarget('optionsJson'),
        });
      [
        ['validation', field.validationJson, 'validationJson'],
        ['visibility rule', field.visibilityRuleJson, 'visibilityRuleJson'],
        ['required rule', field.requiredRuleJson, 'requiredRuleJson'],
      ].forEach(([label, json, property]) => {
        if (json && !isJsonObject(json))
          issues.push({
            message: `${field.label || field.code} has invalid ${label} JSON.`,
            fieldId: field.id,
            target: fieldTarget(property!),
          });
      });
    });
  });
  const knownCodes = new Set(fields.map((field) => field.code.toUpperCase()));
  form.sections.forEach((section, sectionIndex) =>
    extractRuleFields(section.visibilityRuleJson)
      .filter((reference) => !knownCodes.has(reference.toUpperCase()))
      .forEach((reference) =>
        issues.push({
          message: `${section.name || section.code} references missing field ${reference}.`,
          target: getFormikBuilderIssueTarget(form, `sections[${sectionIndex}].visibilityRuleJson`),
        })
      )
  );
  if (form.layoutType === 1)
    steps.forEach((step) =>
      extractRuleFields(step.visibilityRuleJson)
        .filter((reference) => !knownCodes.has(reference.toUpperCase()))
        .forEach((reference) =>
          issues.push({
            message: `${step.name || step.code} references missing field ${reference}.`,
            target: getFormikBuilderIssueTarget(
              form,
              `sections[${step.sections[0].sectionIndex}].stepVisibilityRuleJson`
            ),
          })
        )
    );
  fields.forEach((field) =>
    [
      ...extractRuleFields(field.visibilityRuleJson).map((reference) => ({
        reference,
        property: 'visibilityRuleJson',
      })),
      ...extractRuleFields(field.requiredRuleJson).map((reference) => ({
        reference,
        property: 'requiredRuleJson',
      })),
    ]
      .filter(({ reference }) => !knownCodes.has(reference.toUpperCase()))
      .forEach(({ reference, property }) =>
        issues.push({
          message: `${field.label || field.code} references missing field ${reference}.`,
          fieldId: field.id,
          target: targetForField(field.id, property),
        })
      )
  );
  fields.forEach((field) => {
    const configuration = parseFieldConfiguration(field.validationJson);
    if (configuration.format === 'state' && !configuration.countryField)
      issues.push({
        message: `${field.label} needs a Country field.`,
        fieldId: field.id,
        target: targetForField(field.id, 'validationJson'),
      });
    if (
      configuration.format === 'city' &&
      (!configuration.countryField || !configuration.stateField)
    )
      issues.push({
        message: `${field.label} needs Country and State fields.`,
        fieldId: field.id,
        target: targetForField(field.id, 'validationJson'),
      });
    [configuration.countryField, configuration.stateField]
      .filter((reference): reference is string => Boolean(reference))
      .filter((reference) => !knownCodes.has(reference.toUpperCase()))
      .forEach((reference) =>
        issues.push({
          message: `${field.label} references missing field ${reference}.`,
          fieldId: field.id,
          target: targetForField(field.id, 'validationJson'),
        })
      );
  });
  return issues.map((issue) => ({
    ...issue,
    target: issue.target ?? getBuilderIssueTarget(form, { fieldId: issue.fieldId }),
  }));
}
