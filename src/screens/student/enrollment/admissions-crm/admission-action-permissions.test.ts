import { it, expect, describe } from 'vitest';

import {
  admissionCrmActionPermissions,
  resolveAdmissionCrmExamActionPermissions,
  resolveAdmissionCrmRegistrationSettingsPermissions,
} from './admission-action-permissions';

describe('admission CRM action permissions', () => {
  it('uses the authoritative action permission names', () => {
    expect(admissionCrmActionPermissions).toEqual({
      scheduleExam: 'Students.Enrollment.AdmissionsCrm.ScheduleExam',
      overrideExamCapacity: 'Students.Enrollment.AdmissionsCrm.OverrideExamCapacity',
      manageOffers: 'Students.Enrollment.AdmissionsCrm.ManageOffers',
      approveOffers: 'Students.Enrollment.AdmissionsCrm.ApproveOffers',
      manageWaitlist: 'Students.Enrollment.AdmissionsCrm.ManageWaitlist',
      makeAdmissionDecision: 'Students.Enrollment.AdmissionsCrm.MakeAdmissionDecision',
      overrideSeatCapacity: 'Students.Enrollment.AdmissionsCrm.OverrideSeatCapacity',
      cancelAdmission: 'Students.Enrollment.AdmissionsCrm.CancelAdmission',
      issueQuotations: 'Students.Enrollment.AdmissionsCrm.IssueQuotations',
      recordFinanceStatus: 'Students.Enrollment.AdmissionsCrm.RecordFinanceStatus',
      requestConcession: 'Students.Enrollment.AdmissionsCrm.RequestConcession',
      approveConcession: 'Students.Enrollment.AdmissionsCrm.ApproveConcession',
      overridePaymentGates: 'Students.Enrollment.AdmissionsCrm.OverridePaymentGates',
      issueRegistrationForm: 'Students.Enrollment.AdmissionsCrm.IssueRegistrationForm',
      verifyRegistration: 'Students.Enrollment.AdmissionsCrm.VerifyRegistration',
      manageRegistrationLinks: 'Students.Enrollment.AdmissionsCrm.ManageRegistrationLinks',
      waiveRegistrationFee: 'Students.Enrollment.AdmissionsCrm.WaiveRegistrationFee',
      changeExamResult: 'Students.Enrollment.AdmissionsCrm.ChangeExamResult',
      bulkOperations: 'Students.Enrollment.AdmissionsCrm.BulkOperations',
      overrideExamResult: 'Students.Enrollment.AdmissionsCrm.OverrideExamResult',
      overrideEligibility: 'Students.Enrollment.AdmissionsCrm.OverrideEligibility',
      manageRegistrationTemplates: 'Students.Enrollment.AdmissionsCrm.ManageRegistrationTemplates',
      publishRegistrationTemplates:
        'Students.Enrollment.AdmissionsCrm.PublishRegistrationTemplates',
      manageFormNumberSeries: 'Students.Enrollment.AdmissionsCrm.ManageFormNumberSeries',
      manageDocumentConfiguration: 'Students.Enrollment.AdmissionsCrm.ManageDocumentConfiguration',
      reviewDocuments: 'Students.Enrollment.AdmissionsCrm.ReviewDocuments',
      waiveDocuments: 'Students.Enrollment.AdmissionsCrm.WaiveDocuments',
      confirmOriginalSeen: 'Students.Enrollment.AdmissionsCrm.ConfirmOriginalSeen',
      confirmAdmissionReadiness: 'Students.Enrollment.AdmissionsCrm.ConfirmAdmissionReadiness',
      manageGovernmentReadiness: 'Students.Enrollment.AdmissionsCrm.ManageGovernmentReadiness',
      previewActivation: 'Students.Enrollment.AdmissionsCrm.PreviewActivation',
      requestActivation: 'Students.Enrollment.AdmissionsCrm.RequestActivation',
      approveActivation: 'Students.Enrollment.AdmissionsCrm.ApproveActivation',
      executeActivation: 'Students.Enrollment.AdmissionsCrm.ExecuteActivation',
      repairActivation: 'Students.Enrollment.AdmissionsCrm.RepairActivation',
      assignManualIdentifier: 'Students.Enrollment.AdmissionsCrm.AssignManualIdentifier',
      manageServiceHandoffs: 'Students.Enrollment.AdmissionsCrm.ManageServiceHandoffs',
      viewStructuredReviews: 'Students.Enrollment.AdmissionsCrm.ViewStructuredReviews',
      manageReviewConfiguration: 'Students.Enrollment.AdmissionsCrm.ManageReviewConfiguration',
      assignReviewers: 'Students.Enrollment.AdmissionsCrm.AssignReviewers',
      submitReviews: 'Students.Enrollment.AdmissionsCrm.SubmitReviews',
      viewConfidentialReviews: 'Students.Enrollment.AdmissionsCrm.ViewConfidentialReviews',
    });
  });

  it('does not alias distinct privileged operations to one permission', () => {
    const permissions = Object.values(admissionCrmActionPermissions);
    expect(new Set(permissions).size).toBe(permissions.length);
  });

  it.each([
    {
      granted: admissionCrmActionPermissions.manageRegistrationTemplates,
      expected: {
        canManageRegistrationTemplates: true,
        canPublishRegistrationTemplates: false,
        canManageFormNumberSeries: false,
      },
    },
    {
      granted: admissionCrmActionPermissions.publishRegistrationTemplates,
      expected: {
        canManageRegistrationTemplates: false,
        canPublishRegistrationTemplates: true,
        canManageFormNumberSeries: false,
      },
    },
    {
      granted: admissionCrmActionPermissions.manageFormNumberSeries,
      expected: {
        canManageRegistrationTemplates: false,
        canPublishRegistrationTemplates: false,
        canManageFormNumberSeries: true,
      },
    },
  ])('keeps the $granted registration-settings grant isolated', ({ granted, expected }) => {
    expect(
      resolveAdmissionCrmRegistrationSettingsPermissions([{ name: granted, isGranted: true }])
    ).toEqual(expected);
  });

  it('keeps registration settings read-only without a granular mutation grant', () => {
    expect(
      resolveAdmissionCrmRegistrationSettingsPermissions([
        {
          name: 'Students.Enrollment.AdmissionsCrm.ManageConfiguration',
          isGranted: true,
        },
      ])
    ).toEqual({
      canManageRegistrationTemplates: false,
      canPublishRegistrationTemplates: false,
      canManageFormNumberSeries: false,
    });
  });

  it('keeps bulk import and result correction hidden with counselor-style grants', () => {
    expect(
      resolveAdmissionCrmExamActionPermissions([
        {
          name: admissionCrmActionPermissions.changeExamResult,
          isGranted: true,
        },
        {
          name: admissionCrmActionPermissions.bulkOperations,
          isGranted: false,
        },
        {
          name: admissionCrmActionPermissions.overrideExamResult,
          isGranted: false,
        },
      ])
    ).toMatchObject({
      canChangeExamResult: true,
      canBulkOperate: false,
      canOverrideExamResult: false,
      canBulkChangeExamResult: false,
      canBulkChangeExamAttendance: false,
      canImportExamResults: false,
      canCorrectExamResult: false,
    });
  });
});
