import type {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  AdmissionCrmFormFieldDto,
  AdmissionCrmApplicantChecklistItemDto,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import type {
  AdmissionCrmJourneyRuleDto,
  AdmissionCrmMeritRankingMode,
  AdmissionCrmChannelSettingDto,
  AdmissionCrmLeadScoringRulesDto,
  AdmissionCrmLeadRoutingSettingsDto,
} from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import type {
  AdmissionCrmMessageChannel,
  AdmissionCrmExamReadinessField,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

export type AdmissionCrmTemplateForm = {
  templateName: string;
  description: string;
  channel: AdmissionInquiryChannel;
  isPublic: boolean;
  isActive: boolean;
  consentText: string;
  privacyNoticeUrl: string;
  fields: AdmissionCrmFormFieldDto[];
  localizations: Record<
    'gu' | 'hi',
    { templateName: string; description: string; consentText: string }
  >;
};

export type AdmissionCrmMessageTemplateForm = {
  templateName: string;
  channel: AdmissionCrmMessageChannel;
  purpose: string;
  subject: string;
  body: string;
  variables: string;
};

export type AdmissionCrmCommunicationProviderForm = {
  isEnabled: boolean;
  providerName: string;
  senderId: string;
  settingsJson: string;
  webhookUrl: string;
};

export type AdmissionCrmCycleForm = {
  cycleName: string;
  isActive: boolean;
  registrationFormRequiredBeforeExam: boolean;
  entranceExamRequired: boolean;
  staleAfterDays: number;
  archiveAfterDays: number;
  defaultLeadSlaHours: number;
  slaPolicy: {
    timeZoneId: string;
    workingDays: number[];
    workingDayStartHour: number;
    workingDayEndHour: number;
    holidays: string[];
    escalationAfterHours: number;
    escalationOwnerUserId?: string | null;
  };
  activationCancellationWindowDays: number;
  defaultExamPassingPercentage: number;
  meritRankingMode: AdmissionCrmMeritRankingMode;
  examReadinessFields: AdmissionCrmExamReadinessField;
  leadScoringRules: AdmissionCrmLeadScoringRulesDto;
  leadRoutingSettings: AdmissionCrmLeadRoutingSettingsDto;
  journeyRules: AdmissionCrmJourneyRuleDto[];
  applicantChecklist: AdmissionCrmApplicantChecklistItemDto[];
  channelSettings: AdmissionCrmChannelSettingDto[];
  journeyLocked: boolean;
  journeyLockedAt?: string | null;
  journeyLockedByUserId?: string | null;
  journeyLockReason?: string | null;
  notes: string;
};

export type AdmissionCrmPipelineStageForm = {
  stageKey: string;
  baseSystemStage: AdmissionInquiryStage;
  stageName: string;
  displayOrder: number;
  isEnabled: boolean;
  colorHex: string;
  slaTargetHours: string;
  ownerResponsibility: string;
  allowedNextStages: AdmissionInquiryStage[];
};
