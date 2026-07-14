import type {
  AdmissionCrmDocumentRequirementDto,
  AdmissionCrmDocumentChecklistTemplateUpsertDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { AdmissionCrmDocumentRequirementLevel } from 'src/redux/student/admissions-crm/admissions-crm-api';

export const createDocumentRequirement = (): AdmissionCrmDocumentRequirementDto => ({
  key: '',
  documentTypeId: null,
  name: '',
  requirementLevel: AdmissionCrmDocumentRequirementLevel.Required,
  conditionalFieldKey: null,
  conditionalFieldValue: null,
  blocksAdmissionReadiness: true,
  requiresOriginal: false,
  validityDateRequired: false,
  maximumSizeMb: 5,
  acceptedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
  uploadInstructions: null,
  displayOrder: 10,
});

export const createDocumentChecklistTemplate =
  (): AdmissionCrmDocumentChecklistTemplateUpsertDto => ({
    name: '',
    isFallback: false,
    applicability: {},
    requirements: [createDocumentRequirement()],
    readinessApprovalCount: 1,
    notes: null,
  });

export const validateDocumentChecklistTemplate = (
  value: AdmissionCrmDocumentChecklistTemplateUpsertDto
) => {
  const errors: string[] = [];
  if (!value.name.trim()) errors.push('Checklist name is required.');
  if (![1, 2].includes(value.readinessApprovalCount)) {
    errors.push('Readiness approval count must be one or two.');
  }
  if (!value.requirements.length) errors.push('At least one document requirement is required.');
  const keys = new Set<string>();
  value.requirements.forEach((requirement) => {
    const key = requirement.key.trim().toLowerCase();
    if (!key || !requirement.name.trim()) errors.push('Every requirement needs a key and name.');
    if (keys.has(key)) errors.push(`Requirement key "${requirement.key}" is duplicated.`);
    keys.add(key);
    if (!requirement.acceptedExtensions.length)
      errors.push(`${requirement.name || requirement.key} needs an accepted format.`);
    if (
      requirement.requirementLevel === AdmissionCrmDocumentRequirementLevel.Conditional &&
      !requirement.conditionalFieldKey?.trim()
    ) {
      errors.push(`${requirement.name || requirement.key} needs a conditional field.`);
    }
  });
  return errors;
};

export const normalizeDocumentChecklistTemplate = (
  value: AdmissionCrmDocumentChecklistTemplateUpsertDto
): AdmissionCrmDocumentChecklistTemplateUpsertDto => ({
  ...value,
  name: value.name.trim(),
  notes: value.notes?.trim() || null,
  applicability: Object.fromEntries(
    Object.entries(value.applicability).map(([key, item]) => [key, item?.trim() || null])
  ),
  requirements: value.requirements.map((requirement, index) => ({
    ...requirement,
    key: requirement.key.trim(),
    name: requirement.name.trim(),
    conditionalFieldKey: requirement.conditionalFieldKey?.trim() || null,
    conditionalFieldValue: requirement.conditionalFieldValue?.trim() || null,
    acceptedExtensions: requirement.acceptedExtensions
      .map((item) => item.trim().replace(/^\./, '').toLowerCase())
      .filter(Boolean),
    uploadInstructions: requirement.uploadInstructions?.trim() || null,
    displayOrder: (index + 1) * 10,
  })),
});
