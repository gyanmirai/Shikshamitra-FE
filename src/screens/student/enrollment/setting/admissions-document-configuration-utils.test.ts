import { describe, expect, it } from 'vitest';

import { AdmissionCrmDocumentRequirementLevel } from 'src/redux/student/admissions-crm/admissions-crm-api';

import {
  createDocumentChecklistTemplate,
  normalizeDocumentChecklistTemplate,
  validateDocumentChecklistTemplate,
} from './admissions-document-configuration-utils';

describe('admissions document checklist configuration', () => {
  it('creates the supported upload defaults', () => {
    const value = createDocumentChecklistTemplate();
    expect(value.requirements[0].acceptedExtensions).toContain('pdf');
    expect(value.requirements[0].blocksAdmissionReadiness).toBe(true);
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
    value.requirements[0].acceptedExtensions = ['.PDF', ' jpg '];
    const normalized = normalizeDocumentChecklistTemplate(value);
    expect(normalized.name).toBe('Primary');
    expect(normalized.requirements[0].acceptedExtensions).toEqual(['pdf', 'jpg']);
    expect(normalized.requirements[0].displayOrder).toBe(10);
  });
});
