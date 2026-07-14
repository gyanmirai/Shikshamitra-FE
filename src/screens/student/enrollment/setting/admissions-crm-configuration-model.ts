import type {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  AdmissionCrmFormFieldDto,
  AdmissionCrmJourneyRuleDto,
  AdmissionCrmMessageChannel,
  AdmissionCrmMeritRankingMode,
  AdmissionCrmChannelSettingDto,
  AdmissionCrmExamReadinessField,
  AdmissionCrmLeadScoringRulesDto,
  AdmissionCrmLeadRoutingSettingsDto,
  AdmissionCrmApplicantChecklistItemDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

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
  notes: string;
};

export type AdmissionCrmPipelineStageForm = {
  stageName: string;
  displayOrder: number;
  isEnabled: boolean;
  colorHex: string;
  slaTargetHours: string;
  ownerResponsibility: string;
  allowedNextStages: AdmissionInquiryStage[];
};
