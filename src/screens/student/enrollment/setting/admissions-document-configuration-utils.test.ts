import { it, expect, describe } from 'vitest';
import { AdmissionCrmDocumentRequirementLevel } from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  createDocumentChecklistTemplate,
  validateDocumentChecklistTemplate,
  normalizeDocumentChecklistTemplate,
} from './admissions-document-configuration-utils';

describe('admissions document checklist configuration', () => {
  it('creates the supported upload defaults', () => {
    const value = createDocumentChecklistTemplate();
    expect(value.requirements[0].acceptedExtensions).toContain('pdf');
    expect(value.requirements[0].blocksAdmissionReadiness).toBe(true);
    expect(value.requirements[0].rejectionReasons).toEqual([]);
    expect(value.readinessApprovalCount).toBe(1);
  });

  it('allows one or two readiness approvers only', () => {
    const value = createDocumentChecklistTemplate();
    value.name = 'Primary checklist';
    value.requirements[0].key = 'birth';
    value.requirements[0].name = 'Birth certificate';
    value.readinessApprovalCount = 3;
    expect(validateDocumentChecklistTemplate(value)[0]).toContain('one or two');
  });

  it('requires conditions for conditional documents', () => {
    const value = createDocumentChecklistTemplate();
    value.name = 'Primary checklist';
    value.requirements[0].key = 'caste-certificate';
    value.requirements[0].name = 'Caste certificate';
    value.requirements[0].requirementLevel = AdmissionCrmDocumentRequirementLevel.Conditional;
    expect(validateDocumentChecklistTemplate(value)[0]).toContain('conditional field');
  });

  it('normalizes extensions and ordering', () => {
    const value = createDocumentChecklistTemplate();
    value.name = ' Primary ';
    value.requirements[0].key = ' birth ';
    value.requirements[0].name = ' Birth certificate ';
    value.requirements[0].acceptedExtensions = ['.PDF', ' jpg ', 'pdf'];
    value.requirements[0].uploadInstructions = ' Upload both sides in one PDF. ';
    value.requirements[0].rejectionReasons = [
      'Document is unreadable',
      ' document is unreadable ',
      'Details do not match the form',
    ];
    const normalized = normalizeDocumentChecklistTemplate(value);
    expect(normalized.name).toBe('Primary');
    expect(normalized.requirements[0].acceptedExtensions).toEqual(['pdf', 'jpg']);
    expect(normalized.requirements[0].uploadInstructions).toBe(
      'Upload both sides in one PDF.'
    );
    expect(normalized.requirements[0].rejectionReasons).toEqual([
      'Document is unreadable',
      'Details do not match the form',
    ]);
    expect(normalized.requirements[0].displayOrder).toBe(10);
  });

  it('requires expiry reminders to use a validity date', () => {
    const value = createDocumentChecklistTemplate();
    value.name = 'Primary checklist';
    value.requirements[0].key = 'income-certificate';
    value.requirements[0].name = 'Income certificate';
    value.requirements[0].expiryReminderDaysBefore = 30;
    expect(validateDocumentChecklistTemplate(value)[0]).toContain('validity date');

    value.requirements[0].validityDateRequired = true;
    expect(validateDocumentChecklistTemplate(value)).toEqual([]);
  });

  it('limits family instructions and rejection shortcuts', () => {
    const value = createDocumentChecklistTemplate();
    value.name = 'Primary checklist';
    value.requirements[0].key = 'aadhaar';
    value.requirements[0].name = 'Aadhaar';
    value.requirements[0].uploadInstructions = 'x'.repeat(501);
    expect(validateDocumentChecklistTemplate(value)[0]).toContain('500 characters');

    value.requirements[0].uploadInstructions = null;
    value.requirements[0].rejectionReasons = Array.from(
      { length: 9 },
      (_, index) => `Reason ${index + 1}`
    );
    expect(validateDocumentChecklistTemplate(value)[0]).toContain('up to 8');
  });
});
