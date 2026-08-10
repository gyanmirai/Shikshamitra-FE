import type { GrantedPermission } from 'src/utils/permissions';

import { hasGrantedPermission } from 'src/utils/permissions';

const admissionCrmPermissionRoot = 'Students.Enrollment.AdmissionsCrm';

export const admissionCrmActionPermissions = {
  scheduleExam: `${admissionCrmPermissionRoot}.ScheduleExam`,
  overrideExamCapacity: `${admissionCrmPermissionRoot}.OverrideExamCapacity`,
  manageOffers: `${admissionCrmPermissionRoot}.ManageOffers`,
  approveOffers: `${admissionCrmPermissionRoot}.ApproveOffers`,
  manageWaitlist: `${admissionCrmPermissionRoot}.ManageWaitlist`,
  makeAdmissionDecision: `${admissionCrmPermissionRoot}.MakeAdmissionDecision`,
  overrideSeatCapacity: `${admissionCrmPermissionRoot}.OverrideSeatCapacity`,
  cancelAdmission: `${admissionCrmPermissionRoot}.CancelAdmission`,
  issueQuotations: `${admissionCrmPermissionRoot}.IssueQuotations`,
  recordFinanceStatus: `${admissionCrmPermissionRoot}.RecordFinanceStatus`,
  requestConcession: `${admissionCrmPermissionRoot}.RequestConcession`,
  approveConcession: `${admissionCrmPermissionRoot}.ApproveConcession`,
  overridePaymentGates: `${admissionCrmPermissionRoot}.OverridePaymentGates`,
  issueRegistrationForm: `${admissionCrmPermissionRoot}.IssueRegistrationForm`,
  verifyRegistration: `${admissionCrmPermissionRoot}.VerifyRegistration`,
  manageRegistrationLinks: `${admissionCrmPermissionRoot}.ManageRegistrationLinks`,
  waiveRegistrationFee: `${admissionCrmPermissionRoot}.WaiveRegistrationFee`,
  changeExamResult: `${admissionCrmPermissionRoot}.ChangeExamResult`,
  bulkOperations: `${admissionCrmPermissionRoot}.BulkOperations`,
  overrideExamResult: `${admissionCrmPermissionRoot}.OverrideExamResult`,
  overrideEligibility: `${admissionCrmPermissionRoot}.OverrideEligibility`,
  manageRegistrationTemplates: `${admissionCrmPermissionRoot}.ManageRegistrationTemplates`,
  publishRegistrationTemplates: `${admissionCrmPermissionRoot}.PublishRegistrationTemplates`,
  manageFormNumberSeries: `${admissionCrmPermissionRoot}.ManageFormNumberSeries`,
  manageDocumentConfiguration: `${admissionCrmPermissionRoot}.ManageDocumentConfiguration`,
  reviewDocuments: `${admissionCrmPermissionRoot}.ReviewDocuments`,
  waiveDocuments: `${admissionCrmPermissionRoot}.WaiveDocuments`,
  confirmOriginalSeen: `${admissionCrmPermissionRoot}.ConfirmOriginalSeen`,
  confirmAdmissionReadiness: `${admissionCrmPermissionRoot}.ConfirmAdmissionReadiness`,
  manageGovernmentReadiness: `${admissionCrmPermissionRoot}.ManageGovernmentReadiness`,
  previewActivation: `${admissionCrmPermissionRoot}.PreviewActivation`,
  requestActivation: `${admissionCrmPermissionRoot}.RequestActivation`,
  approveActivation: `${admissionCrmPermissionRoot}.ApproveActivation`,
  executeActivation: `${admissionCrmPermissionRoot}.ExecuteActivation`,
  repairActivation: `${admissionCrmPermissionRoot}.RepairActivation`,
  assignManualIdentifier: `${admissionCrmPermissionRoot}.AssignManualIdentifier`,
  manageServiceHandoffs: `${admissionCrmPermissionRoot}.ManageServiceHandoffs`,
  viewStructuredReviews: `${admissionCrmPermissionRoot}.ViewStructuredReviews`,
  manageReviewConfiguration: `${admissionCrmPermissionRoot}.ManageReviewConfiguration`,
  assignReviewers: `${admissionCrmPermissionRoot}.AssignReviewers`,
  submitReviews: `${admissionCrmPermissionRoot}.SubmitReviews`,
  viewConfidentialReviews: `${admissionCrmPermissionRoot}.ViewConfidentialReviews`,
} as const;

export const resolveAdmissionCrmRegistrationSettingsPermissions = (
  permissions: GrantedPermission[] | undefined
) => ({
  canManageRegistrationTemplates: hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.manageRegistrationTemplates
  ),
  canPublishRegistrationTemplates: hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.publishRegistrationTemplates
  ),
  canManageFormNumberSeries: hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.manageFormNumberSeries
  ),
});

export const resolveAdmissionCrmExamActionPermissions = (
  permissions: GrantedPermission[] | undefined
) => {
  const canChangeExamResult = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.changeExamResult
  );
  const canBulkOperate = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.bulkOperations
  );
  const canOverrideExamResult = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.overrideExamResult
  );
  const canOverrideEligibility = hasGrantedPermission(
    permissions,
    admissionCrmActionPermissions.overrideEligibility
  );
  const canBulkChangeExamResult = canBulkOperate && canChangeExamResult;

  return {
    canChangeExamResult,
    canBulkOperate,
    canOverrideExamResult,
    canOverrideEligibility,
    canBulkChangeExamResult,
    canBulkChangeExamAttendance: canBulkChangeExamResult,
    canImportExamResults: canBulkChangeExamResult,
    canCorrectExamResult: canChangeExamResult && canOverrideExamResult,
  };
};
