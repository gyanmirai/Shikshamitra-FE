import { it, expect, describe } from 'vitest';

import { buildAdmissionPrintDocument, type AdmissionPrintDefinition } from './form-print-model';

const question = (code: string, changes: Record<string, unknown> = {}) => ({
  id: code,
  sectionId: 'main',
  code,
  label: code,
  fieldType: 0,
  bindingType: 1,
  required: false,
  readOnly: false,
  displayOrder: 0,
  ...changes,
});
const section = (
  id: string,
  fields = [question('NAME')],
  changes: Record<string, unknown> = {}
) => ({
  id,
  code: id,
  name: id,
  displayOrder: 0,
  fields,
  ...changes,
});
const definition = (sections: AdmissionPrintDefinition['sections']): AdmissionPrintDefinition => ({
  name: 'Registration',
  sections,
  fieldsPerRow: 2,
});
const fields = (model: ReturnType<typeof buildAdmissionPrintDocument>) =>
  model.steps.flatMap((step) =>
    step.sections.flatMap((part) => part.entries.flatMap((entry) => entry.fields))
  );

describe('Registration print document', () => {
  it('keeps legacy Simple, preserves selected paper style and clears registration numbers on blank copies', () => {
    const input = {
      definition: definition([section('main')]),
      values: {},
      registrationNumber: 'REG-2026-17',
    };
    expect(buildAdmissionPrintDocument({ ...input, mode: 'blank' }).settings.template).toBe(
      'simple'
    );
    expect(buildAdmissionPrintDocument({ ...input, mode: 'blank' }).registrationNumber).toBe('');
    const filled = buildAdmissionPrintDocument({
      ...input,
      mode: 'filled',
      settings: { template: 'boxed-grid', layout: 'spacious' },
    });
    expect(filled.registrationNumber).toBe('REG-2026-17');
    expect(filled.settings).toMatchObject({ template: 'boxed-grid', layout: 'spacious' });
  });

  it('uses field bindings and configured formats for writing boxes rather than editable labels', () => {
    const model = buildAdmissionPrintDocument({
      definition: definition([
        section('main', [
          question('FIRST', {
            bindingType: 0,
            bindingKey: 'Applicant.FirstName',
            label: 'Preferred label',
          }),
          question('CUSTOM', { label: 'First name' }),
          question('PHONE', { validationJson: '{"format":"phone"}' }),
          question('DATE', { fieldType: 5 }),
          question('EMAIL', { fieldType: 3 }),
        ]),
      ]),
      values: {},
      mode: 'blank',
    });
    expect(fields(model).map((field) => field.writingFormat)).toEqual([
      'characters',
      'line',
      'phone',
      'date',
      'line',
    ]);
    expect(fields(model)[0].bindingKey).toBe('Applicant.FirstName');
  });
  it('retains static instructions and translated string choices on blank paper without saved answers', () => {
    const model = buildAdmissionPrintDocument({
      definition: definition([
        section('main', [
          question('INFO', { label: 'Complete this form in ink.', fieldType: 12 }),
          question('CHOICE', {
            fieldType: 6,
            optionsJson: '["one","two"]',
            translations: { gu: { choices: { one: 'એક', two: 'બે' } } },
          }),
        ]),
      ]),
      values: { INFO: '"Secret"', CHOICE: '"one"' },
      language: 'gu',
      mode: 'blank',
    });
    expect(fields(model)[0]).toMatchObject({
      label: 'Complete this form in ink.',
      value: '',
      kind: 'static',
    });
    expect(fields(model)[1].options).toEqual([
      { value: 'one', label: 'એક' },
      { value: 'two', label: 'બે' },
    ]);
    expect(JSON.stringify(model)).not.toContain('Secret');
  });
  it('prints Inquiry first and removes duplicate system/custom identities without mutating definitions', () => {
    const source = section(
      'source',
      [question('INQUIRY_NAME', { bindingType: 0, bindingKey: 'Applicant.Name' })],
      { displayOrder: 9 }
    );
    const registration = section('registration', [
      question('COPY_NAME', { bindingType: 0, bindingKey: 'Applicant.Name' }),
      question('CUSTOM', { fieldIdentity: 'custom:one' }),
      question('DUPLICATE_CUSTOM', { fieldIdentity: 'custom:one' }),
    ]);
    const model = buildAdmissionPrintDocument({
      definition: definition([registration]),
      inquiryContextSections: [source],
      inquiryContextValues: { INQUIRY_NAME: '"Aanya"' },
      values: { COPY_NAME: '"Stale"', CUSTOM: '"Current"' },
      mode: 'filled',
    });
    expect(fields(model).map((field) => [field.code, field.value])).toEqual([
      ['INQUIRY_NAME', 'Aanya'],
      ['CUSTOM', 'Current'],
    ]);
    expect(registration.fields).toHaveLength(3);
    expect(source.fields[0].readOnly).toBe(false);
  });

  it('blank forms retain conditional questions and choices while clearing every default, answer and photo', () => {
    const form = definition([
      section('main', [
        question('NAME', { defaultValue: 'Secret default' }),
        question('CHOICE', {
          fieldType: 6,
          optionsJson: '[{"value":"a","label":"Option A"}]',
          visibilityRuleJson: '{"field":"NAME","operator":"equals","value":"Secret"}',
        }),
        question('PHOTO', { validationJson: '{"format":"photo"}' }),
      ]),
    ]);
    const model = buildAdmissionPrintDocument({
      definition: form,
      values: { NAME: '"Secret answer"', PHOTO: '"data:image/png;base64,secret"' },
      mode: 'blank',
    });
    expect(fields(model).map((field) => field.value)).toEqual(['', '', '']);
    expect(fields(model)[1]).toMatchObject({
      conditional: true,
      options: [{ value: 'a', label: 'Option A' }],
    });
    expect(fields(model)[2].imageUrl).toBeUndefined();
    expect(JSON.stringify(model)).not.toContain('Secret');
    expect(JSON.stringify(model)).not.toContain('base64');
  });

  it('filled forms discard hidden steps, sections and fields including stale repeatable row answers', () => {
    const model = buildAdmissionPrintDocument({
      definition: definition([
        section('main', [
          question('SHOW'),
          question('HIDDEN', {
            visibilityRuleJson: '{"field":"SHOW","operator":"equals","value":"yes"}',
          }),
        ]),
        section('hidden-section', [question('SECRET_SECTION')], {
          visibilityRuleJson: '{"field":"SHOW","operator":"equals","value":"yes"}',
        }),
        section('hidden-step', [question('SECRET_STEP')], {
          stepVisibilityRuleJson: '{"field":"SHOW","operator":"equals","value":"yes"}',
        }),
        section(
          'rows',
          [
            question('ROW_SHOW'),
            question('ROW_SECRET', {
              visibilityRuleJson: '{"field":"ROW_SHOW","operator":"equals","value":"yes"}',
            }),
          ],
          { isRepeatable: true }
        ),
      ]),
      values: {
        SHOW: '"no"',
        HIDDEN: '"Stale"',
        SECRET_SECTION: '"Stale section"',
        SECRET_STEP: '"Stale step"',
        ROW_SHOW: JSON.stringify('["no","yes"]'),
        ROW_SECRET: JSON.stringify('["Stale row","Visible row"]'),
      },
      mode: 'filled',
    });
    expect(fields(model).map((field) => field.value)).toEqual(['no', 'no', 'yes', 'Visible row']);
    expect(JSON.stringify(model)).not.toContain('Stale');
  });

  it('localizes labels, choice values and repeatable headings and scopes by actual grouped step', () => {
    const model = buildAdmissionPrintDocument({
      definition: definition([
        section(
          'rows',
          [
            question('ROW', {
              fieldType: 6,
              optionsJson: '[{"value":"one","label":"One"}]',
              translations: { gu: { label: 'પસંદગી', choices: { one: 'એક' } } },
            }),
          ],
          {
            isRepeatable: true,
            minEntries: 2,
            entryLabel: 'Child',
            translations: { gu: { label: 'બાળકો', helpText: 'બાળક' } },
            stepId: 'family',
            stepCode: 'FAMILY',
            stepName: 'Family',
          }
        ),
        section('other', [question('EXCLUDED')], { stepId: 'other-step' }),
      ]),
      values: { ROW: JSON.stringify('["one","one"]') },
      mode: 'filled',
      language: 'gu',
      stepKey: 'family',
    });
    expect(model.steps).toHaveLength(1);
    expect(model.steps[0].sections[0]).toMatchObject({
      title: 'બાળકો',
      entries: [{ label: 'બાળક 1' }, { label: 'બાળક 2' }],
    });
    expect(fields(model).map((field) => [field.label, field.value])).toEqual([
      ['પસંદગી', 'એક'],
      ['પસંદગી', 'એક'],
    ]);
  });

  it('formats selected dynamic choices, dates, locations and attachments as readable values', () => {
    const model = buildAdmissionPrintDocument({
      definition: definition([
        section('main', [
          question('CLASS', { fieldType: 6, optionsJson: '{"source":"Standards"}' }),
          question('DATE', { fieldType: 5 }),
          question('QUOTED_DATE', { fieldType: 5 }),
          question('CITY', { validationJson: '{"format":"city"}' }),
          question('ADDRESS', { fieldType: 11 }),
          question('FILE', { fieldType: 10 }),
          question('MULTI', {
            fieldType: 7,
            optionsJson: '[{"value":"a","label":"Alpha"},{"value":"b","label":"Beta"}]',
          }),
        ]),
      ]),
      values: {
        CLASS: '"class-id"',
        DATE: '"2026-11-17"',
        QUOTED_DATE: JSON.stringify('"2026-11-18"'),
        CITY: JSON.stringify('{"name":"Surat","latitude":"secret-coordinate"}'),
        ADDRESS: JSON.stringify('{"addressLine1":"Road 1","city":"Surat","postalCode":"395001"}'),
        FILE: JSON.stringify({ fileName: 'certificate.pdf', id: 'private-id' }),
        MULTI: JSON.stringify('["a","b"]'),
      },
      choiceLabels: { CLASS: { 'class-id': 'Class 4' } },
      mode: 'filled',
    });
    expect(fields(model).map((field) => field.value)).toEqual([
      'Class 4',
      '17/11/2026',
      '18/11/2026',
      'Surat',
      'Road 1, Surat, 395001',
      'certificate.pdf',
      'Alpha, Beta',
    ]);
    expect(JSON.stringify(model)).not.toContain('private-id');
    expect(JSON.stringify(model)).not.toContain('secret-coordinate');
  });
});
