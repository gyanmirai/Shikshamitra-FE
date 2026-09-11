import type { CreateUpdateAdmissionForm } from 'src/redux/student/admissions/admission-forms-api';

import { parseFieldConfiguration } from './form-field-presets';
import { getAdmissionFormStepGroups } from './form-step-groups';
import { isJsonObject, parseOptions, extractRuleFields } from './form-builder-issue-utils';

type Issue = { message: string; fieldId?: string };

export function getBuilderIssues(form: CreateUpdateAdmissionForm): Issue[] {
  const issues: Issue[] = [];
  const steps = getAdmissionFormStepGroups(form.sections);
  if (!form.sections.length) issues.push({ message: 'Add at least one section.' });
  if (form.layoutType === 1 && steps.length < 2)
    issues.push({ message: 'Step-by-step forms should have at least two steps.' });
  if (form.layoutType === 1) {
    const stepCodes = new Set<string>();
    steps.forEach((step) => {
      const code = step.code.trim().toUpperCase();
      if (!step.name.trim())
        issues.push({ message: `Step ${step.displayOrder + 1} needs a name.` });
      if (!code) issues.push({ message: `${step.name || 'Step'} needs a code.` });
      else if (!/^[A-Z][A-Z0-9_-]*$/.test(code))
        issues.push({ message: `${step.name || step.code} has an invalid code.` });
      else if (stepCodes.has(code)) issues.push({ message: `Duplicate step code: ${step.code}.` });
      stepCodes.add(code);
    });
  }
  const sectionCodes = new Set<string>();
  const fieldCodes = new Set<string>();
  const fields = form.sections.flatMap((section) => section.fields);
  form.sections.forEach((section) => {
    if (!section.fields.length)
      issues.push({
        message: `${section.name || section.code || 'Section'} has no fields. Add at least one field before publishing.`,
      });
    if (!section.code.trim())
      issues.push({ message: `${section.name || 'Section'} needs a code.` });
    const sectionCode = section.code.trim().toUpperCase();
    if (section.code.trim() && !/^[A-Z][A-Z0-9_-]*$/.test(sectionCode))
      issues.push({ message: `${section.name || section.code} has an invalid code.` });
    if (sectionCodes.has(sectionCode))
      issues.push({ message: `Duplicate section code: ${section.code}.` });
    sectionCodes.add(sectionCode);
    section.fields.forEach((field) => {
      const code = field.code.trim().toUpperCase();
      if (!field.code.trim())
        issues.push({ message: `${field.label || 'Field'} needs a code.`, fieldId: field.id });
      if (field.code.trim() && !/^[A-Z][A-Z0-9_-]*$/.test(code))
        issues.push({
          message: `${field.label || field.code} has an invalid code.`,
          fieldId: field.id,
        });
      if (fieldCodes.has(code))
        issues.push({ message: `Duplicate field code: ${field.code}.`, fieldId: field.id });
      fieldCodes.add(code);
      if (!field.label.trim())
        issues.push({ message: `${field.code || 'Field'} needs a label.`, fieldId: field.id });
      if (field.fieldType !== 12 && field.bindingType === 1 && !field.bindingKey?.trim())
        issues.push({
          message: `${field.label || field.code} needs a custom binding key.`,
          fieldId: field.id,
        });
      if (
        (field.fieldType === 6 || field.fieldType === 7 || field.fieldType === 8) &&
        !parseOptions(field.optionsJson)
      )
        issues.push({
          message: `${field.label || field.code} requires valid options.`,
          fieldId: field.id,
        });
      [
        ['validation', field.validationJson],
        ['visibility rule', field.visibilityRuleJson],
        ['required rule', field.requiredRuleJson],
      ].forEach(([label, json]) => {
        if (json && !isJsonObject(json))
          issues.push({
            message: `${field.label || field.code} has invalid ${label} JSON.`,
            fieldId: field.id,
          });
      });
    });
  });
  const knownCodes = new Set(fields.map((field) => field.code.toUpperCase()));
  form.sections.forEach((section) =>
    extractRuleFields(section.visibilityRuleJson)
      .filter((reference) => !knownCodes.has(reference.toUpperCase()))
      .forEach((reference) =>
        issues.push({
          message: `${section.name || section.code} references missing field ${reference}.`,
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
          })
        )
    );
  fields.forEach((field) =>
    [...extractRuleFields(field.visibilityRuleJson), ...extractRuleFields(field.requiredRuleJson)]
      .filter((reference) => !knownCodes.has(reference.toUpperCase()))
      .forEach((reference) =>
        issues.push({
          message: `${field.label || field.code} references missing field ${reference}.`,
          fieldId: field.id,
        })
      )
  );
  fields.forEach((field) => {
    const configuration = parseFieldConfiguration(field.validationJson);
    if (configuration.format === 'state' && !configuration.countryField)
      issues.push({ message: `${field.label} needs a Country field.`, fieldId: field.id });
    if (
      configuration.format === 'city' &&
      (!configuration.countryField || !configuration.stateField)
    )
      issues.push({ message: `${field.label} needs Country and State fields.`, fieldId: field.id });
    [configuration.countryField, configuration.stateField]
      .filter((reference): reference is string => Boolean(reference))
      .filter((reference) => !knownCodes.has(reference.toUpperCase()))
      .forEach((reference) =>
        issues.push({
          message: `${field.label} references missing field ${reference}.`,
          fieldId: field.id,
        })
      );
  });
  return issues;
}
