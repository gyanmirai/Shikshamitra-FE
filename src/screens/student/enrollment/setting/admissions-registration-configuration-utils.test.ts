import { it, expect, describe } from 'vitest';
import { AdmissionCrmFormFieldType } from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  createRegistrationTemplate,
  validateRegistrationTemplate,
  normalizeRegistrationTemplate,
  createBlankRegistrationTemplate,
  validateRegistrationTemplateStep,
  normalizeRegistrationFieldForType,
  findRegistrationTemplateValidationIssue,
  normalizeRegistrationTemplateSystemFields,
} from './admissions-registration-configuration-utils';

describe('admissions registration configuration', () => {
  it('creates a structured starter template', () => {
    const template = createRegistrationTemplate();
    expect(template.name).toBe('Standard School Registration');
    expect(template.sections).toHaveLength(4);
    expect(template.sections.flatMap((section) => section.fields)).toHaveLength(16);
    expect(validateRegistrationTemplate(template)).toEqual([]);
    expect(template.allowPartialSave).toBe(true);
  });

  it('validates the current guided-editor step before advancing', () => {
    const template = createBlankRegistrationTemplate();
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

  it('canonicalizes case-insensitive backend system fields for editor selects', () => {
    const template = createRegistrationTemplate();
    const studentFields = template.sections[0].fields;
    const contactFields = template.sections[1].fields;
    studentFields[0].systemField = 'FirstName';
    studentFields[3].systemField = ' DateOfBirth ';
    contactFields[0].systemField = 'ParentGuardianName';
    contactFields[1].systemField = 'PRIMARYCONTACTNO';

    const normalized = normalizeRegistrationTemplateSystemFields(template);

    expect(normalized.sections[0].fields[0].systemField).toBe('firstName');
    expect(normalized.sections[0].fields[3].systemField).toBe('dateOfBirth');
    expect(normalized.sections[1].fields[0].systemField).toBe('parentGuardianName');
    expect(normalized.sections[1].fields[1].systemField).toBe('primaryContactNo');
    expect(template.sections[0].fields[0].systemField).toBe('FirstName');
  });

  it('resets incompatible field options and validation settings when type changes', () => {
    const field = createRegistrationTemplate().sections[0].fields[0];
    const normalized = normalizeRegistrationFieldForType(
      {
        ...field,
        fieldType: AdmissionCrmFormFieldType.Select,
        options: ['A', 'B'],
        minimumValue: 1,
        maximumValue: 10,
      },
      AdmissionCrmFormFieldType.Number
    );

    expect(normalized.fieldType).toBe(AdmissionCrmFormFieldType.Number);
    expect(normalized.options).toEqual([]);
    expect(normalized.minimumValue).toBe(1);
    expect(normalized.maximumValue).toBe(10);
    expect(normalized.minimumLength).toBeNull();
    expect(normalized.maximumLength).toBeNull();
  });

  it('validates invalid field keys, option mismatches, and system mapping type mismatches', () => {
    const template = createRegistrationTemplate();
    const field = template.sections[0].fields[0];
    field.key = '1 invalid';
    field.fieldType = AdmissionCrmFormFieldType.Email;
    field.systemField = 'dateOfBirth';
    field.options = ['unused'];

    const errors = validateRegistrationTemplate(template);
    expect(errors.some((error) => error.includes('must start with a letter'))).toBe(true);
    expect(errors.some((error) => error.includes('does not use options'))).toBe(true);
    expect(errors.some((error) => error.includes('type does not match'))).toBe(true);
  });

  it('preserves localized registration text and validates translated option alignment', () => {
    const template = createRegistrationTemplate();
    const section = template.sections[0];
    section.localizedTitles = { GU: 'વિદ્યાર્થીની વિગતો' };
    const field = section.fields[0];
    field.localizedLabels = { Gu: 'પ્રથમ નામ' };
    field.fieldType = AdmissionCrmFormFieldType.Select;
    field.systemField = null;
    field.options = ['New', 'Returning'];
    field.localizedOptions = { GU: ['નવું'] };

    expect(validateRegistrationTemplateStep(template, 2)).toContain(
      'Field "First name" needs 2 GU options.'
    );

    field.localizedOptions.GU = ['નવું', 'પાછું ફરતું'];
    const normalized = normalizeRegistrationTemplate(template);
    expect(normalized.sections[0].localizedTitles?.gu).toBe('વિદ્યાર્થીની વિગતો');
    expect(normalized.sections[0].fields[0].localizedLabels?.gu).toBe('પ્રથમ નામ');
    expect(normalized.sections[0].fields[0].localizedOptions?.gu).toEqual(['નવું', 'પાછું ફરતું']);
  });
});
