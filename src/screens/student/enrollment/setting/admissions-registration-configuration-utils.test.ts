import { it, expect, describe } from 'vitest';

import {
  createRegistrationTemplate,
  validateRegistrationTemplate,
  normalizeRegistrationTemplate,
  validateRegistrationTemplateStep,
  findRegistrationTemplateValidationIssue,
} from './admissions-registration-configuration-utils';

describe('admissions registration configuration', () => {
  it('creates a structured starter template', () => {
    const template = createRegistrationTemplate();
    expect(template.sections).toHaveLength(1);
    expect(template.sections[0].fields).toHaveLength(1);
    expect(template.allowPartialSave).toBe(true);
  });

  it('validates the current guided-editor step before advancing', () => {
    const template = createRegistrationTemplate();
    expect(validateRegistrationTemplateStep(template, 0)).toContain('Template name is required.');
    expect(findRegistrationTemplateValidationIssue(template)?.step).toBe(0);

    template.name = 'Primary registration';
    expect(validateRegistrationTemplateStep(template, 0)).toEqual([]);
    expect(findRegistrationTemplateValidationIssue(template)?.step).toBe(1);
  });

  it('rejects duplicate field keys and broken conditions', () => {
    const template = createRegistrationTemplate();
    template.name = 'Primary registration';
    template.sections[0].key = 'student';
    template.sections[0].title = 'Student';
    template.sections[0].fields[0].key = 'firstName';
    template.sections[0].fields[0].label = 'First name';
    template.sections[0].fields.push({
      ...template.sections[0].fields[0],
      label: 'Duplicate',
      visibleWhenFieldKey: 'missing',
    });
    const errors = validateRegistrationTemplate(template);
    expect(errors.some((error) => error.includes('duplicated'))).toBe(true);
    expect(errors.some((error) => error.includes('does not exist'))).toBe(true);
  });

  it('normalizes scope, ordering, and disabled fees', () => {
    const template = createRegistrationTemplate();
    template.name = ' Primary ';
    template.feeRequired = false;
    template.feeAmount = 250;
    template.applicability.campus = ' Main ';
    template.sections[0].key = ' student ';
    template.sections[0].title = ' Student ';
    template.sections[0].fields[0].key = ' firstName ';
    template.sections[0].fields[0].label = ' First name ';
    const normalized = normalizeRegistrationTemplate(template);
    expect(normalized.name).toBe('Primary');
    expect(normalized.feeAmount).toBe(0);
    expect(normalized.applicability.campus).toBe('Main');
    expect(normalized.sections[0].displayOrder).toBe(10);
    expect(normalized.sections[0].fields[0].key).toBe('firstName');
  });
});
