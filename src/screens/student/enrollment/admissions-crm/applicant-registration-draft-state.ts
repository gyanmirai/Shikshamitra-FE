export type ApplicantRegistrationDraftState = {
  issueFormOpen: boolean;
  registrationTemplateId: string;
  seriesId: string;
  checklistTemplateId: string;
  reason: string;
  correctionFields: string;
  newExpiry: string;
  initialNewExpiry: string;
  reissueDays: number;
  initialReissueDays: number;
  paymentReference: string;
  overrideReadiness: boolean;
  documentReasonByKey: Readonly<Record<string, string>>;
  documentFileByKey: Readonly<Record<string, unknown>>;
  documentValidUntilByKey: Readonly<Record<string, string>>;
};

const hasText = (value: string) => value.trim().length > 0;

const hasTextEntry = (values: Readonly<Record<string, string>>) =>
  Object.values(values).some(hasText);

export const hasApplicantRegistrationDraft = ({
  issueFormOpen,
  registrationTemplateId,
  seriesId,
  checklistTemplateId,
  reason,
  correctionFields,
  newExpiry,
  initialNewExpiry,
  reissueDays,
  initialReissueDays,
  paymentReference,
  overrideReadiness,
  documentReasonByKey,
  documentFileByKey,
  documentValidUntilByKey,
}: ApplicantRegistrationDraftState) =>
  issueFormOpen ||
  hasText(registrationTemplateId) ||
  hasText(seriesId) ||
  hasText(checklistTemplateId) ||
  hasText(reason) ||
  hasText(correctionFields) ||
  newExpiry !== initialNewExpiry ||
  reissueDays !== initialReissueDays ||
  hasText(paymentReference) ||
  overrideReadiness ||
  hasTextEntry(documentReasonByKey) ||
  Object.values(documentFileByKey).some(Boolean) ||
  hasTextEntry(documentValidUntilByKey);
