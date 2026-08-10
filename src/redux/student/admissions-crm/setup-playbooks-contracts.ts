import type { FetchArgs } from '@reduxjs/toolkit/query';

import {
  AdmissionCrmAdmissionRoundDto,
  AdmissionCrmApplicantChecklistItemDto,
  AdmissionCrmFormFieldDto,
  AdmissionCrmJourneyTrigger,
  AdmissionCrmLeadPriority,
  AdmissionCrmLeadRoutingStrategy,
  AdmissionCrmListParams,
  AdmissionCrmSettingsAccessMode,
  AdmissionCrmSlotTemplateDto,
  AdmissionInquiryChannel,
  AdmissionInquiryStage,
} from './core-leads-contracts';

import {
  AdmissionCrmExamDefinitionDto,
  AdmissionCrmExamReadinessField,
} from './communication-exams-events-contracts';

import {
  AdmissionCrmApplicationStagePolicyDto,
  AdmissionCrmCyclePolicySummaryDto,
  AdmissionCrmPlacementTiming,
  AdmissionCrmRouteType,
  AdmissionCrmSeatPlanDto,
  AdmissionCrmSlaPolicyDto,
} from './final-admission-contracts';

import { AdmissionCrmRegistrationPath } from './registration-documents-contracts';

export enum AdmissionCrmMeritRankingMode {
  MarksThenInquiryDate = 0,
  MarksThenLeadScore = 1,
  LeadScoreThenMarks = 2,
}

export enum AdmissionCrmPlaybookStatus {
  Draft = 0,
  Published = 1,
  Retired = 2,
}

export enum AdmissionCrmSlotAssignmentStrategy {
  Manual = 0,
  EarliestAvailable = 1,
  RoundRobin = 2,
  ClassMatch = 3,
  CampusMatch = 4,
  PreferredDate = 5,
  LanguageMatch = 6,
  SiblingGrouping = 7,
  BalancedCapacity = 8,
}

export enum AdmissionCrmAssessmentComponentType {
  WrittenTest = 0,
  Interview = 1,
  Interaction = 2,
  Observation = 3,
  ReadinessAssessment = 4,
}

export type AdmissionCrmCycleConfigurationDto = {
  impactPreviewFingerprint?: string;
  id: string;
  academicYearId: string;
  cycleName: string;
  isActive: boolean;
  registrationFormRequiredBeforeExam: boolean;
  entranceExamRequired: boolean;
  staleAfterDays: number;
  archiveAfterDays: number;
  defaultLeadSlaHours: number;
  slaPolicy: AdmissionCrmSlaPolicyDto;
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
  notes?: string | null;
};

export enum AdmissionCrmConfigurationReferenceKind {
  Stage = 1,
  Round = 2,
  Exam = 3,
  SeatPlan = 4,
  Route = 5,
}

export type AdmissionCrmConfigurationReferenceFamilyDto = {
  family: string;
  referenceCount: number;
  description: string;
  sampleReferenceIds: string[];
};

export type AdmissionCrmConfigurationReferenceResultDto = {
  academicYearId: string;
  kind: AdmissionCrmConfigurationReferenceKind;
  code: string;
  totalReferenceCount: number;
  families: AdmissionCrmConfigurationReferenceFamilyDto[];
};

export type AdmissionCrmConfigurationImpactPreviewDto = {
  academicYearId: string;
  affectedApplicantCount: number;
  configurationReferenceCount: number;
  changedFields: string[];
  referenceFamilies: AdmissionCrmConfigurationReferenceFamilyDto[];
  warnings: string[];
  fingerprint: string;
};

export type AdmissionCrmConfigurationCloneFamilyDto = {
  family: string;
  sourceCount: number;
  cloneableCount: number;
  targetCount: number;
  cloneBehavior: string;
};

export type AdmissionCrmConfigurationClonePreviewDto = {
  sourceAcademicYearId: string;
  targetAcademicYearId: string;
  canConfirm: boolean;
  targetApplicantActivityCount: number;
  families: AdmissionCrmConfigurationCloneFamilyDto[];
  conflicts: string[];
  warnings: string[];
  fingerprint: string;
};

export type AdmissionCrmConfigurationCloneResultDto = {
  sourceAcademicYearId: string;
  targetAcademicYearId: string;
  alreadyApplied: boolean;
  families: AdmissionCrmConfigurationCloneFamilyDto[];
  warnings: string[];
  previewFingerprint: string;
};

export type AdmissionCrmSetupReadiness = 0 | 1 | 2 | 3 | 4;

export type AdmissionCrmCycleStatus = 0 | 1 | 2 | 3 | 4 | 5;

export enum AdmissionCrmAdmissionYearSetupStatus {
  Draft = 0,
  Published = 1,
  Closed = 2,
  Superseded = 3,
}

export type AdmissionCrmAdmissionYearSetupDto = {
  id: string;
  concurrencyStamp: string;
  academicYearId: string;
  version: number;
  status: AdmissionCrmAdmissionYearSetupStatus;
  inquiryOpenDate: string;
  inquiryCloseDate: string;
  registrationCloseDate: string;
  activationTargetDate: string;
  entranceExamRequired: boolean;
  financeVerificationRequired: boolean;
  placementTiming: AdmissionCrmPlacementTiming;
  defaultOwnerUserId?: string | null;
  targetStandardIds: string[];
  routeTypes: AdmissionCrmRouteType[];
  stepOwners: Record<string, string | null>;
  publishedAt?: string | null;
  publishedByUserId?: string | null;
  closedAt?: string | null;
  closedByUserId?: string | null;
  closeReason?: string | null;
};

export type UpdateAdmissionCrmAdmissionYearSetupDto = Pick<
  AdmissionCrmAdmissionYearSetupDto,
  | 'inquiryOpenDate'
  | 'concurrencyStamp'
  | 'inquiryCloseDate'
  | 'registrationCloseDate'
  | 'activationTargetDate'
  | 'entranceExamRequired'
  | 'financeVerificationRequired'
  | 'placementTiming'
  | 'defaultOwnerUserId'
  | 'targetStandardIds'
  | 'routeTypes'
  | 'stepOwners'
>;

export type AdmissionCrmSetupItemDto = {
  key: string;
  title: string;
  status: AdmissionCrmSetupReadiness;
  accessMode: AdmissionCrmSettingsAccessMode;
  blockerCodes: string[];
  path: string;
};

export type AdmissionCrmSetupStatusDto = {
  academicYearId: string;
  cycleName: string;
  status: AdmissionCrmSetupReadiness;
  appliedPresetName?: string | null;
  appliedPresetVersion?: number | null;
  lastUpdatedAt?: string | null;
  items: AdmissionCrmSetupItemDto[];
};

export type AdmissionCrmCycleRequiredActionDto = {
  key: string;
  title: string;
  path: string;
  blockerCodes: string[];
};

export type AdmissionCrmCycleListItemDto = {
  academicYearId: string;
  cycleConfigurationId?: string | null;
  cycleName: string;
  academicYearName: string;
  academicYearStartDate: string;
  academicYearEndDate: string;
  admissionWindowStart?: string | null;
  admissionWindowEnd?: string | null;
  status: AdmissionCrmCycleStatus;
  readiness: AdmissionCrmSetupReadiness;
  applicantCount: number;
  ownerUserId?: string | null;
  ownerDisplayName?: string | null;
  lastUpdatedAt?: string | null;
  requiredActions: AdmissionCrmCycleRequiredActionDto[];
};

export type AdmissionCrmCycleSummaryDto = {
  cycle: AdmissionCrmCycleListItemDto;
  policy: AdmissionCrmCyclePolicySummaryDto;
  communications: {
    journeyRuleCount: number;
    activeMessageRuleCount: number;
    templateBackedRuleCount: number;
  };
  readiness: AdmissionCrmSetupStatusDto;
  applicationStagePolicy: AdmissionCrmApplicationStagePolicyDto;
};

export enum AdmissionCrmApplicationStageKey {
  Inquiry = 0,
  QualificationFollowUp = 1,
  ExamScheduling = 2,
  ExamResultEligibility = 3,
  RegistrationDataEntry = 4,
  DocumentsVerification = 5,
  FeeVerification = 6,
  ClassPlacement = 7,
  AdmissionConfirmation = 8,
  Activation = 9,
  Closed = 10,
}

export type AdmissionCrmLeadScoringRulesDto = {
  baseScore: number;
  bothContactChannelsScore: number;
  parentGuardianScore: number;
  desiredClassScore: number;
  campaignScore: number;
  manualBackOfficeChannelScore: number;
  quickCallEntryChannelScore: number;
  walkInReceptionChannelScore: number;
  schoolWebsiteFormChannelScore: number;
  whatsAppInquiryChannelScore: number;
  staffSharedLinkChannelScore: number;
  qrCodeScanChannelScore: number;
  campaignLinkChannelScore: number;
  examPassScore: number;
  examFailPenalty: number;
  highPerformanceScore: number;
  highPerformancePercentage: number;
  maxScore: number;
};

export type AdmissionCrmLeadRoutingRuleDto = {
  ruleName: string;
  isEnabled: boolean;
  priority: number;
  ownerUserId?: string | null;
  channel?: AdmissionInquiryChannel | null;
  inquirySourceId?: string | null;
  targetStandardId?: string | null;
  campaignContains?: string | null;
  campusBranchContains?: string | null;
  preferredLanguageContains?: string | null;
  desiredClassContains?: string | null;
};

export type AdmissionCrmLeadRoutingSettingsDto = {
  isEnabled: boolean;
  defaultOwnerUserId?: string | null;
  routingStrategy: AdmissionCrmLeadRoutingStrategy;
  ownerPoolUserIds: string[];
  rules: AdmissionCrmLeadRoutingRuleDto[];
};

export type AdmissionCrmChannelSettingDto = {
  channel: AdmissionInquiryChannel;
  isEnabled: boolean;
  defaultInquirySourceId?: string | null;
  defaultFormTemplateId?: string | null;
  defaultOwnerUserId?: string | null;
  defaultAcknowledgementTemplateId?: string | null;
  displayOrder: number;
};

export type AdmissionCrmJourneyRuleDto = {
  ruleName: string;
  isEnabled: boolean;
  priority: number;
  trigger: AdmissionCrmJourneyTrigger;
  stage?: AdmissionInquiryStage | null;
  channel?: AdmissionInquiryChannel | null;
  inquirySourceId?: string | null;
  campaignContains?: string | null;
  leadStage?: AdmissionInquiryStage | null;
  leadPriority?: AdmissionCrmLeadPriority | null;
  ownerUserId?: string | null;
  targetStandardId?: string | null;
  desiredClassContains?: string | null;
  campusBranchContains?: string | null;
  preferredLanguageContains?: string | null;
  minimumLeadScore?: number | null;
  maximumLeadScore?: number | null;
  daysSinceLastActivity?: number | null;
  daysSinceCreation?: number | null;
  createTask: boolean;
  taskTitle?: string | null;
  taskDueOffsetHours: number;
  taskNotes?: string | null;
  sendMessage: boolean;
  messageTemplateId?: string | null;
};

export type RunAdmissionCrmJourneyRulesDto = {
  trigger: AdmissionCrmJourneyTrigger;
  leadId?: string | null;
  stage?: AdmissionInquiryStage | null;
};

export type AdmissionCrmPipelineStageDto = {
  impactPreviewFingerprint?: string;
  id: string;
  academicYearId: string;
  systemStage: AdmissionInquiryStage;
  stageKey?: string;
  baseSystemStage?: AdmissionInquiryStage;
  stageName: string;
  displayOrder: number;
  isEnabled: boolean;
  isSystem: boolean;
  structureLocked?: boolean;
  colorHex?: string | null;
  slaTargetHours?: number | null;
  ownerResponsibility?: string | null;
  allowedNextStages: AdmissionInquiryStage[];
};

export type CreateAdmissionCrmPipelineStageDto = Partial<AdmissionCrmPipelineStageDto> & {
  stageKey: string;
  stageName: string;
  baseSystemStage: AdmissionInquiryStage;
};

export type AdmissionCrmPlaybookApplicabilityDto = {
  campus?: string | null;
  desiredClass?: string | null;
  board?: string | null;
  medium?: string | null;
  applicantCategory?: string | null;
  admissionRound?: string | null;
  admissionRoute?: string | null;
};

export type AdmissionCrmPlaybookStageDto = {
  code: string;
  displayName: string;
  reportingMilestone: AdmissionInquiryStage;
  order: number;
  isRequired: boolean;
  isParentVisible: boolean;
  slaHours?: number | null;
  allowedNextStageCodes: string[];
};

export type AdmissionCrmSlotAssignmentRuleDto = {
  code: string;
  name: string;
  trigger: string;
  strategy: AdmissionCrmSlotAssignmentStrategy;
  priority: number;
  slotTemplateCode?: string | null;
  isActive: boolean;
};

export type AdmissionCrmPlaybookUpsertDto = {
  name: string;
  isFallback: boolean;
  registrationPath: AdmissionCrmRegistrationPath;
  applicability: AdmissionCrmPlaybookApplicabilityDto;
  stages: AdmissionCrmPlaybookStageDto[];
  rounds: AdmissionCrmAdmissionRoundDto[];
  seatPlans: AdmissionCrmSeatPlanDto[];
  examDefinitions: AdmissionCrmExamDefinitionDto[];
  slotTemplates: AdmissionCrmSlotTemplateDto[];
  assignmentRules: AdmissionCrmSlotAssignmentRuleDto[];
  notes?: string | null;
};

export type AdmissionCrmPlaybookDto = AdmissionCrmPlaybookUpsertDto & {
  id: string;
  academicYearId: string;
  version: number;
  status: AdmissionCrmPlaybookStatus;
  publishedAt?: string | null;
  retiredAt?: string | null;
};

export type AdmissionCrmPlaybookListParams = AdmissionCrmListParams & {
  filter?: string;
  status?: AdmissionCrmPlaybookStatus;
};

export type ResolveAdmissionCrmPlaybookDto = AdmissionCrmPlaybookApplicabilityDto;

export type AdmissionCrmPlaybookResolutionDto = {
  playbook: AdmissionCrmPlaybookDto;
  specificityScore: number;
  explanation: string;
};

export type GenerateAdmissionCrmPlaybookSlotsDto = {
  slotTemplateCode: string;
  fromDate: string;
  toDate: string;
  utcOffsetMinutes: number;
};

export type RecommendAdmissionCrmPlaybookSlotDto = {
  assignmentRuleCode: string;
  preferredDate?: string | null;
};

export type AdmissionCrmFormTemplateLocalizationDto = {
  templateName: string;
  description?: string | null;
  consentText?: string | null;
};

export type AdmissionCrmFormTemplateDto = {
  id: string;
  academicYearId: string;
  templateName: string;
  description?: string | null;
  channel: AdmissionInquiryChannel;
  isPublic: boolean;
  isActive: boolean;
  consentText?: string | null;
  privacyNoticeUrl?: string | null;
  fields: AdmissionCrmFormFieldDto[];
  localizations?: Record<string, AdmissionCrmFormTemplateLocalizationDto>;
};

export type AdmissionCrmFormTemplateListParams = AdmissionCrmListParams & {
  filterText?: string;
  isActive?: boolean;
  isPublic?: boolean;
  channel?: AdmissionInquiryChannel;
};

export const buildAdmissionCrmPlaybookListRequest = ({
  academicYearId,
  ...params
}: { academicYearId: string } & AdmissionCrmPlaybookListParams): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/playbooks`,
  method: 'GET',
  params,
});

export const buildCreateAdmissionCrmPlaybookRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: AdmissionCrmPlaybookUpsertDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/configuration/playbooks`,
  method: 'POST',
  body,
});

export const buildResolveAdmissionCrmPlaybookRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: ResolveAdmissionCrmPlaybookDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/playbooks/resolve`,
  method: 'POST',
  body,
});

export const buildGenerateAdmissionCrmPlaybookSlotsRequest = ({
  playbookId,
  body,
}: {
  playbookId: string;
  body: GenerateAdmissionCrmPlaybookSlotsDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/configuration/playbooks/${playbookId}/slots/generate`,
  method: 'POST',
  body,
});

export const buildRecommendAdmissionCrmPlaybookSlotRequest = ({
  playbookId,
  body,
}: {
  playbookId: string;
  body: RecommendAdmissionCrmPlaybookSlotDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/configuration/playbooks/${playbookId}/slots/recommend`,
  method: 'POST',
  body,
});

export const buildAdmissionCrmSchoolDefaultCycleConfigurationRequest = (): FetchArgs => ({
  url: '/student-enrollment/admissions-crm/configuration/cycle-default',
  method: 'GET',
});

export const buildUpdateAdmissionCrmSchoolDefaultCycleConfigurationRequest = ({
  body,
}: {
  body: Partial<AdmissionCrmCycleConfigurationDto>;
}): FetchArgs => ({
  url: '/student-enrollment/admissions-crm/configuration/cycle-default',
  method: 'PUT',
  body,
});

export const buildAdmissionCrmJourneyRulesRunRequest = ({
  academicYearId,
  body,
}: {
  academicYearId: string;
  body: RunAdmissionCrmJourneyRulesDto;
}): FetchArgs => ({
  url: `/student-enrollment/admissions-crm/${academicYearId}/automation/journeys/run`,
  method: 'POST',
  body,
});

export enum AdmissionCrmGovernedConfigurationStatus {
  Draft = 0,
  ApprovalPending = 1,
  Published = 2,
  Retired = 3,
}

export type AdmissionCrmJourneyLockDto = {
  reason?: string | null;
};
