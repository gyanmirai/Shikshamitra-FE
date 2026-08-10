import type {
  AdmissionCrmDocumentRequirementDto,
  AdmissionCrmDocumentChecklistTemplateUpsertDto,
} from 'src/redux/student/admissions-crm/registration-documents-contracts';

import { AdmissionCrmDocumentRequirementLevel } from 'src/redux/student/admissions-crm/registration-documents-contracts';

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
  expiryReminderDaysBefore: null,
  maximumSizeMb: 5,
  acceptedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
  uploadInstructions: null,
  rejectionReasons: [],
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
    if (requirement.maximumSizeMb < 0.1 || requirement.maximumSizeMb > 25) {
      errors.push(`${requirement.name || requirement.key} must allow between 0.1 and 25 MB.`);
    }
    if ((requirement.uploadInstructions?.trim().length || 0) > 500) {
      errors.push(
        `${requirement.name || requirement.key} upload instructions exceed 500 characters.`
      );
    }
    if (
      requirement.expiryReminderDaysBefore != null &&
      (!requirement.validityDateRequired ||
        requirement.expiryReminderDaysBefore < 1 ||
        requirement.expiryReminderDaysBefore > 365)
    ) {
      errors.push(
        `${requirement.name || requirement.key} expiry reminder needs a validity date and 1 to 365 days.`
      );
    }
    const rejectionReasons = requirement.rejectionReasons || [];
    if (
      rejectionReasons.length > 8 ||
      rejectionReasons.some((reason) => reason.trim().length > 160)
    ) {
      errors.push(
        `${requirement.name || requirement.key} supports up to 8 rejection reasons of 160 characters each.`
      );
    }
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
      .filter((item, itemIndex, items) => Boolean(item) && items.indexOf(item) === itemIndex),
    uploadInstructions: requirement.uploadInstructions?.trim() || null,
    expiryReminderDaysBefore: requirement.validityDateRequired
      ? requirement.expiryReminderDaysBefore
      : null,
    rejectionReasons: (requirement.rejectionReasons || [])
      .map((item) => item.trim())
      .filter(
        (item, itemIndex, items) =>
          Boolean(item) &&
          items.findIndex((candidate) => candidate.toLowerCase() === item.toLowerCase()) ===
            itemIndex
      ),
    displayOrder: (index + 1) * 10,
  })),
});
