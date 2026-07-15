import { AdmissionCrmOperationsQueueType } from 'src/redux/student/admissions-crm/admissions-crm-api';

export const registrationQueues = [
  AdmissionCrmOperationsQueueType.RegistrationInvitationPending,
  AdmissionCrmOperationsQueueType.ExpiringRegistrationLink,
  AdmissionCrmOperationsQueueType.IncompleteRegistration,
  AdmissionCrmOperationsQueueType.RejectedDocument,
  AdmissionCrmOperationsQueueType.DocumentVerificationBacklog,
  AdmissionCrmOperationsQueueType.AdmissionReady,
];

export const offerQueues = [
  AdmissionCrmOperationsQueueType.FinalApproval,
  AdmissionCrmOperationsQueueType.PolicyException,
  AdmissionCrmOperationsQueueType.PaymentCondition,
  AdmissionCrmOperationsQueueType.RouteEligibilityReview,
  AdmissionCrmOperationsQueueType.GovernmentAllotmentReconciliation,
  AdmissionCrmOperationsQueueType.RouteAppealReview,
];

export const activationQueues = [
  AdmissionCrmOperationsQueueType.ActivationRepair,
  AdmissionCrmOperationsQueueType.CancellationReview,
  AdmissionCrmOperationsQueueType.ServiceHandoffException,
];

export const operationsQueues = [
  AdmissionCrmOperationsQueueType.HouseholdResolution,
  AdmissionCrmOperationsQueueType.IdentityConflict,
  AdmissionCrmOperationsQueueType.TransferEvidencePending,
  AdmissionCrmOperationsQueueType.ReturningIdentityMatch,
];
