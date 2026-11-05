import type { AdmissionFormSection } from './admission-forms-api';

export type ParentRegistrationValue = { fieldCode: string; valueJson: string | null };
export type ParentRecipientRelationship = 'father' | 'mother' | 'guardian';
export type ParentRegistrationRecipient = {
  relationship: ParentRecipientRelationship;
  relationshipLabel: string | null;
  fullName: string;
  email: string | null;
  isMainContact: boolean;
  canSend: boolean;
  canChangeEmail?: boolean;
  emailChangeBlockedReason?: string | null;
};
export type ParentRegistrationFile = {
  id: string;
  versionNumber: number;
  fileName: string;
  contentType: string;
  size: number;
  submittedAt: string;
  status: string;
  canDownload: boolean;
};
export type ParentRegistrationDocument = {
  stageInstanceId: string;
  code: string;
  name: string;
  description: string | null;
  isRequired: boolean;
  status: 'missing' | 'pendingReview' | 'accepted' | 'rejected' | 'waived';
  allowedExtensions: string[];
  maxFileSizeMb: number;
  canUpload: boolean;
  evidence: ParentRegistrationFile[];
};
export type ParentRegistrationDefinition = {
  name: string;
  description?: string | null;
  layoutType: 0 | 1;
  fieldsPerRow?: 1 | 2 | 3 | 4;
  defaultLanguage?: string;
  supportedLanguages?: string[];
  sections: (Omit<AdmissionFormSection, 'fields'> & {
    fields: (Omit<AdmissionFormSection['fields'][number], 'bindingKey' | 'bindingType'> & {
      runtimeBindingKey?: string | null;
      optionsSourceJson?: string | null;
    })[];
  })[];
};
export type PublicParentRegistrationContext = {
  schoolName: string;
  applicantName: string;
  applicationNumber: string;
  purpose: 'initial' | 'correction';
  status: string;
  expiresAt: string;
  snapshotToken: string;
  canEdit: boolean;
  canHandIn: boolean;
  notes: string | null;
  definition: ParentRegistrationDefinition;
  values: ParentRegistrationValue[];
  editableFieldCodes: string[];
  documents: ParentRegistrationDocument[];
  proposalOnly: boolean;
};
export type ParentRegistrationRequest = {
  id: string;
  purpose: 'initial' | 'correction';
  status: string;
  recipient: ParentRegistrationRecipient;
  expiresAt: string;
  lastSavedAt: string | null;
  handedInAt: string | null;
  deliveryStatus:
    'Pending' | 'Sending' | 'Sent' | 'Failed' | 'PendingApproval' | 'Unknown' | 'Cancelled';
  deliveryError: string | null;
  notes: string | null;
  fieldCodes: string[];
  documents: { stageInstanceId: string; requirementCode: string }[];
  proposedValues: ParentRegistrationValue[];
};
export type StaffParentRegistrationContext = {
  applicationId: string;
  concurrencyStamp: string;
  recipients: ParentRegistrationRecipient[];
  request: ParentRegistrationRequest | null;
  canSend: boolean;
  canRequestCorrections: boolean;
  canRequestDocumentCorrections?: boolean;
  canRevoke: boolean;
  canTakeover: boolean;
  canApply: boolean;
  canRetryDelivery: boolean;
  blockedReason: string | null;
  emailDeliveryBlockedReason?: string | null;
  availableFields: { code: string; label: string; allowedRecipientRelationships: string[] }[];
  availableDocuments: ParentRegistrationDocument[];
};
export type ParentRegistrationCommand = { concurrencyStamp: string; idempotencyKey: string };
export type ParentRegistrationSendInput = ParentRegistrationCommand & {
  recipientRelationship: ParentRecipientRelationship;
};
export type ParentRegistrationEmailInput = ParentRegistrationSendInput & {
  email: string;
  expectedEmail: string | null;
  reason?: string;
};
export type ParentRegistrationCorrectionInput = ParentRegistrationSendInput & {
  notes: string;
  fieldCodes: string[];
  documents: { stageInstanceId: string; requirementCode: string }[];
};
export type ParentRegistrationWriteInput = {
  snapshotToken: string;
  idempotencyKey: string;
};
