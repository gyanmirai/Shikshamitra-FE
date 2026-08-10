import { it, expect, describe } from 'vitest';
import {
  AdmissionInquiryChannel,
  AdmissionCrmFormFieldType,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import type { AdmissionCrmFormTemplateDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import {
  isInquiryFormPreviewFieldVisible,
  buildDuplicateInquiryFormTemplate,
  resolveInquiryFormPreviewTemplate,
} from './inquiry-form-template-utils';

const makeTemplate = (): AdmissionCrmFormTemplateDto => ({
  id: 'template-1',
  academicYearId: 'year-1',
  templateName: 'Campus Inquiry',
  description: 'Tell us about the student.',
  channel: AdmissionInquiryChannel.SchoolWebsiteForm,
  isPublic: true,
  isActive: true,
  consentText: 'The school may contact me.',
  privacyNoticeUrl: 'https://school.example/privacy',
  localizations: {
    gu: {
      templateName: 'પ્રવેશ પૂછપરછ',
      description: 'વિદ્યાર્થી વિશે જણાવો.',
      consentText: 'શાળા મારો સંપર્ક કરી શકે છે.',
    },
  },
  fields: [
    {
      key: 'campus',
      label: 'Campus',
      fieldType: AdmissionCrmFormFieldType.Select,
      required: true,
      displayOrder: 10,
      options: ['North', 'South'],
      localizedLabels: { gu: 'કેમ્પસ' },
      localizedOptions: { gu: ['ઉત્તર', 'દક્ષિણ'] },
    },
    {
      key: 'transportStop',
      label: 'Transport stop',
      fieldType: AdmissionCrmFormFieldType.Text,
      required: false,
      displayOrder: 20,
      helperText: 'Enter the nearest stop.',
      visibleWhenFieldKey: 'campus',
      visibleWhenValue: 'North',
      localizedLabels: { gu: 'પરિવહન સ્ટોપ' },
      localizedHelperTexts: { gu: 'નજીકનું સ્ટોપ દાખલ કરો.' },
    },
  ],
});

describe('inquiry form template utilities', () => {
  it('creates a unique inactive deep copy without mutating the source template', () => {
    const source = makeTemplate();
    const duplicate = buildDuplicateInquiryFormTemplate(source, [
      'Campus Inquiry',
      'Campus Inquiry Copy',
    ]);

    expect(duplicate.templateName).toBe('Campus Inquiry Copy 2');
    expect(duplicate.isActive).toBe(false);
    expect(duplicate.isPublic).toBe(true);
    expect(duplicate.fields).toEqual(source.fields);
    expect(duplicate.localizations).toEqual(source.localizations);
    expect(duplicate.fields).not.toBe(source.fields);
    expect(duplicate.fields[0].options).not.toBe(source.fields[0].options);
    expect(duplicate.fields[0].localizedOptions).not.toBe(source.fields[0].localizedOptions);
    expect(duplicate.localizations).not.toBe(source.localizations);

    duplicate.fields[0].options?.push('West');
    duplicate.fields[0].localizedOptions?.gu.push('પશ્ચિમ');
    if (duplicate.localizations?.gu) {
      duplicate.localizations.gu.templateName = 'Changed';
    }

    expect(source.fields[0].options).toEqual(['North', 'South']);
    expect(source.fields[0].localizedOptions?.gu).toEqual(['ઉત્તર', 'દક્ષિણ']);
    expect(source.localizations?.gu.templateName).toBe('પ્રવેશ પૂછપરછ');
  });

  it('resolves localized parent copy while preserving raw option values for field rules', () => {
    const { template, usesEnglishFallback } = resolveInquiryFormPreviewTemplate(
      makeTemplate(),
      'gu'
    );

    expect(usesEnglishFallback).toBe(false);
    expect(template.templateName).toBe('પ્રવેશ પૂછપરછ');
    expect(template.fields[0].label).toBe('કેમ્પસ');
    expect(template.fields[0].options).toEqual(['North', 'South']);
    expect(template.fields[0].optionLabels).toEqual(['ઉત્તર', 'દક્ષિણ']);
    expect(template.fields[1].helperText).toBe('નજીકનું સ્ટોપ દાખલ કરો.');
  });

  it('flags English fallback and evaluates conditional visibility case-insensitively', () => {
    const source = makeTemplate();
    delete source.fields[1].localizedHelperTexts;

    const preview = resolveInquiryFormPreviewTemplate(source, 'gu');
    const conditionalField = preview.template.fields[1];

    expect(preview.usesEnglishFallback).toBe(true);
    expect(conditionalField.helperText).toBe('Enter the nearest stop.');
    expect(isInquiryFormPreviewFieldVisible(conditionalField, { campus: 'north' })).toBe(true);
    expect(isInquiryFormPreviewFieldVisible(conditionalField, { campus: 'South' })).toBe(false);
  });
});
