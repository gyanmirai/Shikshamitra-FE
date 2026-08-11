/* eslint-disable no-bitwise, no-restricted-syntax */

'use client';

import type { RootState } from 'src/redux/store';

import type { UseBooleanReturn } from 'src/hooks/use-boolean';

import type {
  AdmissionCrmFormFieldDto,
  AdmissionCrmApplicantChecklistItemDto,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import type {
  AdmissionCrmJourneyRuleDto,
  AdmissionCrmFormTemplateDto,
  AdmissionCrmPipelineStageDto,
  AdmissionCrmChannelSettingDto,
  AdmissionCrmLeadRoutingRuleDto,
  AdmissionCrmLeadScoringRulesDto,
  AdmissionCrmCycleConfigurationDto,
  AdmissionCrmLeadRoutingSettingsDto,
  AdmissionCrmConfigurationImpactPreviewDto,
} from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import type {
  AdmissionCrmMessageTemplateDto,
  AdmissionCrmCommunicationProviderDto,
  AdmissionCrmMessageTemplatePreviewDto,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import type { AdmissionCrmAdmissionYearStandardOptionDto } from 'src/redux/student/admissions-crm/operations-governance-contracts';

import { useSelector } from 'react-redux';

import { shikshaMitraToast } from 'src/components/toast';

import { useRef, useMemo, useState, useEffect } from 'react';

import { Select } from '@mui/material';

import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
  AdmissionCrmFormFieldType,
  AdmissionCrmJourneyTrigger,
  AdmissionCrmLeadRoutingStrategy,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  AdmissionCrmMessageChannel,
  AdmissionCrmExamReadinessField,
  AdmissionCrmMessageTemplateStatus,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import { AdmissionCrmMeritRankingMode } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import {
  useGetAdmissionCrmStaffQuery,
  useLockAdmissionCrmJourneyMutation,
  useUnlockAdmissionCrmJourneyMutation,
  useGetAdmissionCrmInquirySourcesQuery,
  useCreateAdmissionCrmInquirySourceMutation,
  useUpdateAdmissionCrmInquirySourceMutation,
  useSetAdmissionCrmInquirySourceStatusMutation,
} from 'src/redux/student/admissions-crm/core-leads-api';

import {
  useGetAdmissionCrmFormTemplatesQuery,
  useGetAdmissionCrmPipelineStagesQuery,
  useCreateAdmissionCrmFormTemplateMutation,
  useGetAdmissionCrmCycleConfigurationQuery,
  useUpdateAdmissionCrmFormTemplateMutation,
  useUpdateAdmissionCrmPipelineStageMutation,
  useCreateAdmissionCrmPipelineStageMutation,
  useUpdateAdmissionCrmCycleConfigurationMutation,
  useUpdateAdmissionCrmFormTemplateStatusMutation,
  usePreviewAdmissionCrmConfigurationImpactMutation,
  useGetAdmissionCrmSchoolDefaultCycleConfigurationQuery,
  useUpdateAdmissionCrmSchoolDefaultCycleConfigurationMutation,
} from 'src/redux/student/admissions-crm/setup-playbooks-api';

import {
  useGetAdmissionCrmMessageTemplatesQuery,
  useCreateAdmissionCrmMessageTemplateMutation,
  useGetAdmissionCrmCommunicationProvidersQuery,
  usePreviewAdmissionCrmMessageTemplateMutation,
  useUpdateAdmissionCrmCommunicationProviderMutation,
  useUpdateAdmissionCrmMessageTemplateStatusMutation,
} from 'src/redux/student/admissions-crm/communication-exams-events-api';

import { useGetAdmissionCrmOperationalStandardOptionsQuery } from 'src/redux/student/admissions-crm/operations-governance-api';

import { downloadInquiryFormQr } from './inquiry-form-qr';

import { buildInquirySourceSelectOptions } from './inquiry-source-utils';

import { buildDuplicateInquiryFormTemplate } from './inquiry-form-template-utils';

import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';

import { getAdmissionCrmStageLabel } from '../admissions-crm/admissions-crm-utils';

import {
  buildCrmUserSelectOptions,
  buildPublicAdmissionInquiryUrl,
  updateAdmissionCrmProviderAdapter,
  attachAdmissionCrmImpactFingerprint,
  updateAdmissionCrmProviderPayloadMode,
  buildAdmissionCrmProviderSettingsInput,
  buildDefaultPublicInquiryTemplateFields,
  getAdmissionCrmProviderKeyValueSettings,
  updateAdmissionCrmProviderCallbackSecret,
  updateAdmissionCrmProviderKeyValueSettings,
  buildAdmissionCrmProviderDeliveryCallbackUrl,
  updateAdmissionCrmProviderCallbackMappingPath,
  updateAdmissionCrmProviderResponseMessageIdPath,
} from './admissions-crm-configuration-utils';

import type { EnrollmentSettingsPanel } from '../admissions-crm/enrollment-workspace-state';

import type {
  AdmissionCrmCycleForm as CycleForm,
  AdmissionCrmTemplateForm as TemplateForm,
  AdmissionCrmPipelineStageForm as PipelineStageForm,
  AdmissionCrmMessageTemplateForm as MessageTemplateForm,
  AdmissionCrmCommunicationProviderForm as CommunicationProviderForm,
} from './admissions-crm-configuration-model';

export type AdmissionsCrmConfigurationFocusSection =
  'journey' | 'capture' | 'routing' | 'communications' | 'automation';

type AdmissionsCrmConfigurationProps = {
  academicYearId?: string;
  admissionsCrmConfigurationDialog: UseBooleanReturn;
  focusSection?: AdmissionsCrmConfigurationFocusSection;
  focusPanel?: EnrollmentSettingsPanel;
};

const nextRulePriority = (priorities: number[]) =>
  priorities.length ? Math.max(...priorities.map((value) => Number(value) || 0)) + 10 : 10;

const emptyPipelineStages: AdmissionCrmPipelineStageDto[] = [];

const emptyFormTemplates: AdmissionCrmFormTemplateDto[] = [];

const emptyCommunicationProviders: AdmissionCrmCommunicationProviderDto[] = [];

const getSettingsErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as any)?.data?.error?.message || (error as any)?.data?.message;
  return typeof message === 'string' && message.trim() ? message : fallback;
};

const createEmptyPipelineStageForm = (): PipelineStageForm => ({
  stageKey: '',
  baseSystemStage: AdmissionInquiryStage.FollowUp,
  stageName: '',
  displayOrder: 0,
  isEnabled: true,
  colorHex: '',
  slaTargetHours: '',
  ownerResponsibility: '',
  allowedNextStages: [],
});

const buildPipelineStageFormFromStage = (
  stage: AdmissionCrmPipelineStageDto
): PipelineStageForm => ({
  stageKey: stage.stageKey || stage.systemStage.toString(),
  baseSystemStage: stage.baseSystemStage ?? stage.systemStage,
  stageName: stage.stageName,
  displayOrder: stage.displayOrder,
  isEnabled: stage.isEnabled,
  colorHex: stage.colorHex || '',
  slaTargetHours: stage.slaTargetHours?.toString() || '',
  ownerResponsibility: stage.ownerResponsibility || '',
  allowedNextStages: stage.allowedNextStages || [],
});

const buildPipelineStageForms = (stages: AdmissionCrmPipelineStageDto[]) =>
  stages.reduce<Record<string, PipelineStageForm>>((acc, stage) => {
    acc[stage.id] = buildPipelineStageFormFromStage(stage);
    return acc;
  }, {});

const defaultExamReadinessFields =
  AdmissionCrmExamReadinessField.Contact |
  AdmissionCrmExamReadinessField.AdmissionIntent |
  AdmissionCrmExamReadinessField.DesiredClass;

const defaultLeadScoringRules: AdmissionCrmLeadScoringRulesDto = {
  baseScore: 20,
  bothContactChannelsScore: 10,
  parentGuardianScore: 10,
  desiredClassScore: 15,
  campaignScore: 10,
  manualBackOfficeChannelScore: 8,
  quickCallEntryChannelScore: 5,
  walkInReceptionChannelScore: 15,
  schoolWebsiteFormChannelScore: 15,
  whatsAppInquiryChannelScore: 10,
  staffSharedLinkChannelScore: 12,
  qrCodeScanChannelScore: 10,
  campaignLinkChannelScore: 12,
  examPassScore: 10,
  examFailPenalty: -10,
  highPerformanceScore: 10,
  highPerformancePercentage: 80,
  maxScore: 100,
};

const defaultLeadRoutingSettings: AdmissionCrmLeadRoutingSettingsDto = {
  isEnabled: false,
  defaultOwnerUserId: '',
  routingStrategy: AdmissionCrmLeadRoutingStrategy.FirstMatchingRule,
  ownerPoolUserIds: [],
  rules: [],
};

const defaultProviderForm: CommunicationProviderForm = {
  isEnabled: false,
  providerName: '',
  senderId: '',
  settingsJson: '',
  webhookUrl: '',
};

const buildCommunicationProviderForms = (providers: AdmissionCrmCommunicationProviderDto[]) =>
  providers.reduce<Record<number, CommunicationProviderForm>>((acc, provider) => {
    acc[provider.channel] = {
      isEnabled: provider.isEnabled,
      providerName: provider.providerName || '',
      senderId: provider.senderId || '',
      settingsJson: JSON.stringify(provider.settings || {}),
      webhookUrl: provider.webhookUrl || '',
    };
    return acc;
  }, {});

const inquiryChannelOptions = [
  AdmissionInquiryChannel.ManualBackOffice,
  AdmissionInquiryChannel.QuickCallEntry,
  AdmissionInquiryChannel.WalkInReception,
  AdmissionInquiryChannel.SchoolWebsiteForm,
  AdmissionInquiryChannel.WhatsAppInquiry,
  AdmissionInquiryChannel.StaffSharedLink,
  AdmissionInquiryChannel.QrCodeScan,
  AdmissionInquiryChannel.CampaignLink,
];

const buildDefaultChannelSettings = (): AdmissionCrmChannelSettingDto[] =>
  inquiryChannelOptions.map((channel, index) => ({
    channel,
    isEnabled: true,
    defaultInquirySourceId: null,
    defaultFormTemplateId: null,
    defaultOwnerUserId: null,
    defaultAcknowledgementTemplateId: null,
    displayOrder: (index + 1) * 10,
  }));

const mergeChannelSettings = (
  settings?: AdmissionCrmChannelSettingDto[] | null
): AdmissionCrmChannelSettingDto[] => {
  const byChannel = new Map((settings ?? []).map((setting) => [setting.channel, setting]));

  return buildDefaultChannelSettings().map((defaultSetting) => ({
    ...defaultSetting,
    ...(byChannel.get(defaultSetting.channel) ?? {}),
  }));
};

const defaultCycleForm: CycleForm = {
  cycleName: '',
  isActive: true,
  registrationFormRequiredBeforeExam: false,
  entranceExamRequired: true,
  staleAfterDays: 30,
  archiveAfterDays: 60,
  defaultLeadSlaHours: 24,
  slaPolicy: {
    timeZoneId: 'Asia/Kolkata',
    workingDays: [1, 2, 3, 4, 5, 6],
    workingDayStartHour: 8,
    workingDayEndHour: 17,
    holidays: [],
    escalationAfterHours: 24,
  },
  activationCancellationWindowDays: 7,
  defaultExamPassingPercentage: 40,
  meritRankingMode: AdmissionCrmMeritRankingMode.MarksThenInquiryDate,
  examReadinessFields: defaultExamReadinessFields,
  leadScoringRules: defaultLeadScoringRules,
  leadRoutingSettings: defaultLeadRoutingSettings,
  journeyRules: [],
  applicantChecklist: [],
  channelSettings: buildDefaultChannelSettings(),
  journeyLocked: false,
  journeyLockedAt: null,
  journeyLockedByUserId: null,
  journeyLockReason: null,
  notes: '',
};

const fieldNeedsOptions = (fieldType: AdmissionCrmFormFieldType) =>
  fieldType === AdmissionCrmFormFieldType.Select ||
  fieldType === AdmissionCrmFormFieldType.MultiSelect;

const normalizeTemplateFieldKey = (value: string, fallbackIndex: number) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return normalized || `field-${fallbackIndex + 1}`;
};

const createDefaultTemplateForm = (
  standardOptions: AdmissionCrmAdmissionYearStandardOptionDto[] = []
): TemplateForm => ({
  templateName: '',
  description: '',
  channel: AdmissionInquiryChannel.SchoolWebsiteForm,
  isPublic: true,
  isActive: true,
  consentText: 'I agree that the school may contact me about this admission inquiry.',
  privacyNoticeUrl: '',
  fields: buildDefaultPublicInquiryTemplateFields(standardOptions),
  localizations: {
    gu: { templateName: '', description: '', consentText: '' },
    hi: { templateName: '', description: '', consentText: '' },
  },
});

const buildTemplateFormFromTemplate = (template: AdmissionCrmFormTemplateDto): TemplateForm => ({
  templateName: template.templateName,
  description: template.description || '',
  channel: template.channel,
  isPublic: template.isPublic,
  isActive: template.isActive,
  consentText: template.consentText || '',
  privacyNoticeUrl: template.privacyNoticeUrl || '',
  fields: template.fields.map((field) => ({
    ...field,
    systemField: field.systemField ?? null,
    options: field.options ?? [],
    localizedLabels: field.localizedLabels ?? {},
    localizedHelperTexts: field.localizedHelperTexts ?? {},
    localizedPlaceholders: field.localizedPlaceholders ?? {},
    localizedOptions: field.localizedOptions ?? {},
  })),
  localizations: {
    gu: {
      templateName: template.localizations?.gu?.templateName || '',
      description: template.localizations?.gu?.description || '',
      consentText: template.localizations?.gu?.consentText || '',
    },
    hi: {
      templateName: template.localizations?.hi?.templateName || '',
      description: template.localizations?.hi?.description || '',
      consentText: template.localizations?.hi?.consentText || '',
    },
  },
});

const defaultMessageTemplateForm: MessageTemplateForm = {
  templateName: '',
  channel: AdmissionCrmMessageChannel.WhatsApp,
  purpose: 'Inquiry follow-up',
  subject: '',
  body: '',
  variables: 'parentName, studentName, schoolName',
};

const journeyTriggerLabel: Record<AdmissionCrmJourneyTrigger, string> = {
  [AdmissionCrmJourneyTrigger.LeadCreated]: 'Lead created',
  [AdmissionCrmJourneyTrigger.StageReached]: 'Stage reached',
  [AdmissionCrmJourneyTrigger.SlaMissed]: 'SLA missed',
  [AdmissionCrmJourneyTrigger.StaleMarked]: 'Marked stale',
  [AdmissionCrmJourneyTrigger.ExamScheduled]: 'Exam scheduled',
  [AdmissionCrmJourneyTrigger.ExamCompleted]: 'Exam completed',
  [AdmissionCrmJourneyTrigger.EligibilityDecided]: 'Eligibility decided',
  [AdmissionCrmJourneyTrigger.RegistrationIssued]: 'Registration issued',
  [AdmissionCrmJourneyTrigger.RegistrationIncomplete]: 'Registration incomplete',
  [AdmissionCrmJourneyTrigger.RegistrationExpiring]: 'Registration expiring',
  [AdmissionCrmJourneyTrigger.RegistrationSubmitted]: 'Registration submitted',
  [AdmissionCrmJourneyTrigger.RegistrationCorrectionRequested]: 'Registration correction requested',
  [AdmissionCrmJourneyTrigger.RegistrationVerified]: 'Registration verified',
  [AdmissionCrmJourneyTrigger.DocumentUploaded]: 'Document uploaded',
  [AdmissionCrmJourneyTrigger.DocumentRejected]: 'Document rejected',
  [AdmissionCrmJourneyTrigger.DocumentPending]: 'Document review pending',
  [AdmissionCrmJourneyTrigger.ExamNoShow]: 'Exam no-show',
  [AdmissionCrmJourneyTrigger.AdmissionReady]: 'Admission ready',
  [AdmissionCrmJourneyTrigger.DocumentExpiring]: 'Document expiring',
  [AdmissionCrmJourneyTrigger.FeeFollowUp]: 'Fee follow-up',
  [AdmissionCrmJourneyTrigger.OfferIssued]: 'Offer issued',
  [AdmissionCrmJourneyTrigger.OfferAccepted]: 'Offer accepted',
  [AdmissionCrmJourneyTrigger.ActivationWelcome]: 'Activation welcome',
};

const messageChannelLabel: Record<AdmissionCrmMessageChannel, string> = {
  [AdmissionCrmMessageChannel.WhatsApp]: 'WhatsApp',
  [AdmissionCrmMessageChannel.Sms]: 'SMS',
  [AdmissionCrmMessageChannel.Email]: 'Email',
};

const normalizeApplicantChecklistKey = (value: string, fallbackIndex: number) => {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return normalized || `checklist-${fallbackIndex + 1}`;
};

const buildCycleFormFromConfiguration = (
  configuration: AdmissionCrmCycleConfigurationDto
): CycleForm => ({
  cycleName: configuration.cycleName,
  isActive: configuration.isActive,
  registrationFormRequiredBeforeExam: configuration.registrationFormRequiredBeforeExam,
  entranceExamRequired: configuration.entranceExamRequired ?? true,
  staleAfterDays: configuration.staleAfterDays,
  archiveAfterDays: configuration.archiveAfterDays,
  defaultLeadSlaHours: configuration.defaultLeadSlaHours,
  slaPolicy: configuration.slaPolicy || defaultCycleForm.slaPolicy,
  activationCancellationWindowDays: configuration.activationCancellationWindowDays ?? 7,
  defaultExamPassingPercentage: configuration.defaultExamPassingPercentage,
  meritRankingMode: configuration.meritRankingMode,
  examReadinessFields: configuration.examReadinessFields ?? defaultExamReadinessFields,
  leadScoringRules: {
    ...defaultLeadScoringRules,
    ...(configuration.leadScoringRules ?? {}),
  },
  leadRoutingSettings: {
    ...defaultLeadRoutingSettings,
    ...(configuration.leadRoutingSettings ?? {}),
    routingStrategy:
      configuration.leadRoutingSettings?.routingStrategy ??
      AdmissionCrmLeadRoutingStrategy.FirstMatchingRule,
    ownerPoolUserIds: configuration.leadRoutingSettings?.ownerPoolUserIds ?? [],
    rules: configuration.leadRoutingSettings?.rules ?? [],
  },
  journeyRules: configuration.journeyRules ?? [],
  applicantChecklist: configuration.applicantChecklist ?? [],
  channelSettings: mergeChannelSettings(configuration.channelSettings),
  journeyLocked: configuration.journeyLocked ?? false,
  journeyLockedAt: configuration.journeyLockedAt ?? null,
  journeyLockedByUserId: configuration.journeyLockedByUserId ?? null,
  journeyLockReason: configuration.journeyLockReason ?? null,
  notes: configuration.notes || '',
});

export function useAdmissionsCrmConfigurationController({
  academicYearId,
  admissionsCrmConfigurationDialog,
  focusSection = 'journey',
  focusPanel,
}: AdmissionsCrmConfigurationProps) {
  const { user } = useSelector((state: RootState) => state.auth);

  const tenantId =
    user?.tenantid || user?.tenantId || user?.profile?.tenantid || user?.profile?.tenantId;

  const [cycleForm, setCycleForm] = useState<CycleForm>(defaultCycleForm);

  const [initializedCycleId, setInitializedCycleId] = useState<string | null>(null);

  const lastCycleBaselineRef = useRef<string | null>(null);

  const [stageForms, setStageForms] = useState<Record<string, PipelineStageForm>>({});

  const lastStageBaselineRef = useRef<string | null>(null);

  const [templateForm, setTemplateForm] = useState<TemplateForm>(() => createDefaultTemplateForm());

  const [campaignLinkNames, setCampaignLinkNames] = useState<Record<string, string>>({});

  const [staffLinkOwnerIds, setStaffLinkOwnerIds] = useState<Record<string, string>>({});

  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  const [duplicateInquiryFormTemplate, setDuplicateInquiryFormTemplate] =
    useState<AdmissionCrmFormTemplateDto | null>(null);

  const [inquiryFormPreviewTemplate, setInquiryFormPreviewTemplate] =
    useState<AdmissionCrmFormTemplateDto | null>(null);

  const [downloadingQrTemplateId, setDownloadingQrTemplateId] = useState<string | null>(null);

  const [pendingCycleUpdate, setPendingCycleUpdate] = useState<{
    body: Partial<AdmissionCrmCycleConfigurationDto>;
    preview: AdmissionCrmConfigurationImpactPreviewDto;
  } | null>(null);

  const [pendingStageUpdate, setPendingStageUpdate] = useState<{
    stageId: string;
    stageName: string;
    body: Partial<AdmissionCrmPipelineStageDto>;
    preview: AdmissionCrmConfigurationImpactPreviewDto;
  } | null>(null);

  const [messageDialogOpen, setMessageDialogOpen] = useState(false);

  const [messageTemplateForm, setMessageTemplateForm] = useState(defaultMessageTemplateForm);

  const [previewTemplate, setPreviewTemplate] = useState<AdmissionCrmMessageTemplateDto | null>(
    null
  );

  const [messageTemplatePreview, setMessageTemplatePreview] =
    useState<AdmissionCrmMessageTemplatePreviewDto | null>(null);

  const [messagePreviewVariablesText, setMessagePreviewVariablesText] = useState('');

  const [providerForms, setProviderForms] = useState<Record<number, CommunicationProviderForm>>({});

  const lastProviderBaselineRef = useRef<string | null>(null);

  const [staffSearch, setStaffSearch] = useState('');

  const [debouncedStaffSearch, setDebouncedStaffSearch] = useState('');

  const [customStageOpen, setCustomStageOpen] = useState(false);

  const [customStageForm, setCustomStageForm] = useState<PipelineStageForm>(() =>
    createEmptyPipelineStageForm()
  );

  const [journeyLockReason, setJourneyLockReason] = useState('');

  const [inquirySourceOpen, setInquirySourceOpen] = useState(false);

  const [editingInquirySourceId, setEditingInquirySourceId] = useState<string | null>(null);

  const [inquirySourceForm, setInquirySourceForm] = useState({
    code: '',
    displayName: '',
    description: '',
    allowedChannels: inquiryChannelOptions,
    displayOrder: 100,
    isRoutingEligible: true,
  });

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedStaffSearch(staffSearch.trim()), 300);
    return () => window.clearTimeout(timer);
  }, [staffSearch]);

  const configuredStaffIds = useMemo(
    () =>
      [
        cycleForm.leadRoutingSettings.defaultOwnerUserId,
        ...(cycleForm.leadRoutingSettings.ownerPoolUserIds ?? []),
        ...cycleForm.leadRoutingSettings.rules.map((rule) => rule.ownerUserId),
        ...cycleForm.channelSettings.map((setting) => setting.defaultOwnerUserId),
        ...cycleForm.journeyRules.map((rule) => rule.ownerUserId),
        cycleForm.slaPolicy.escalationOwnerUserId,
      ]
        .filter((id): id is string => Boolean(id))
        .filter((id, index, ids) => ids.indexOf(id) === index)
        .join(','),
    [cycleForm]
  );

  const needsCycleConfiguration =
    (focusSection === 'journey' && focusPanel === 'cycle') ||
    (focusSection === 'capture' && focusPanel === 'capture') ||
    focusSection === 'routing' ||
    focusSection === 'automation';

  const needsPipelineStages =
    (focusSection === 'journey' && focusPanel === 'pipeline') || focusSection === 'automation';

  const needsMessageTemplates =
    (focusSection === 'capture' && focusPanel === 'capture') ||
    (focusSection === 'communications' && focusPanel === 'templates');

  const needsInquirySources =
    (focusSection === 'capture' && focusPanel === 'capture') ||
    focusSection === 'routing' ||
    focusSection === 'automation';

  const needsStaff =
    (focusSection === 'journey' && focusPanel === 'cycle') ||
    (focusSection === 'capture' && focusPanel === 'capture') ||
    focusSection === 'routing' ||
    focusSection === 'automation';

  const {
    data: cycle,
    isError: isCycleError,
    isLoading: isCycleLoading,
    isFetching: isCycleFetching,
    refetch: refetchCycle,
  } = useGetAdmissionCrmCycleConfigurationQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || !needsCycleConfiguration }
  );

  const {
    data: schoolDefaultCycle,
    isError: isSchoolDefaultCycleError,
    isLoading: isSchoolDefaultCycleLoading,
    isFetching: isSchoolDefaultCycleFetching,
    refetch: refetchSchoolDefaultCycle,
  } = useGetAdmissionCrmSchoolDefaultCycleConfigurationQuery(undefined, {
    skip: focusSection !== 'journey' || focusPanel !== 'cycle',
  });

  const {
    data: stageData,
    isError: isStagesError,
    isLoading: isStagesLoading,
    isFetching: isStagesFetching,
    refetch: refetchStages,
  } = useGetAdmissionCrmPipelineStagesQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || !needsPipelineStages }
  );

  const stages = stageData ?? emptyPipelineStages;

  const {
    data: templates,
    isError: isTemplatesError,
    isLoading: isTemplatesLoading,
    isFetching: isTemplatesFetching,
    refetch: refetchTemplates,
  } = useGetAdmissionCrmFormTemplatesQuery(
    { academicYearId: academicYearId || '', maxResultCount: 100 },
    { skip: !academicYearId || focusSection !== 'capture' }
  );

  const { data: operationalStandardOptions = [] } =
    useGetAdmissionCrmOperationalStandardOptionsQuery(
      { academicYearId: academicYearId || '' },
      { skip: !academicYearId || focusSection !== 'capture' }
    );

  const {
    data: messageTemplates,
    isError: isMessageTemplatesError,
    isLoading: isMessageTemplatesLoading,
    isFetching: isMessageTemplatesFetching,
    refetch: refetchMessageTemplates,
  } = useGetAdmissionCrmMessageTemplatesQuery(
    { academicYearId: academicYearId || '', maxResultCount: 100 },
    { skip: !academicYearId || !needsMessageTemplates }
  );

  const {
    data: inquirySources,
    isError: isInquirySourcesError,
    isLoading: isInquirySourcesLoading,
    isFetching: isInquirySourcesFetching,
    refetch: refetchInquirySources,
  } = useGetAdmissionCrmInquirySourcesQuery(
    { academicYearId: academicYearId || '', includeInactive: true },
    { skip: !academicYearId || !needsInquirySources }
  );

  const {
    data: users = [],
    isError: isUsersError,
    isLoading: isUsersLoading,
    isFetching: isUsersFetching,
    refetch: refetchUsers,
  } = useGetAdmissionCrmStaffQuery(
    {
      filter: debouncedStaffSearch || undefined,
      ids: configuredStaffIds || undefined,
      maxResultCount: 25,
      academicYearId,
      ownerOnly: true,
    },
    { skip: !needsStaff }
  );

  const {
    data: communicationProviders,
    isError: isCommunicationProvidersError,
    isLoading: isCommunicationProvidersLoading,
    isFetching: isCommunicationProvidersFetching,
    refetch: refetchCommunicationProviders,
  } = useGetAdmissionCrmCommunicationProvidersQuery(
    { academicYearId: academicYearId || '' },
    {
      skip: !academicYearId || focusSection !== 'communications' || focusPanel !== 'providers',
    }
  );

  const formTemplates = templates?.items ?? emptyFormTemplates;

  const providerItems = communicationProviders?.items ?? emptyCommunicationProviders;

  const [createTemplate, { isLoading: isCreatingTemplate }] =
    useCreateAdmissionCrmFormTemplateMutation();

  const [updateTemplate, { isLoading: isUpdatingTemplate }] =
    useUpdateAdmissionCrmFormTemplateMutation();

  const [updateTemplateStatus, { isLoading: isUpdatingTemplateStatus }] =
    useUpdateAdmissionCrmFormTemplateStatusMutation();

  const [updateCycle, { isLoading: isUpdatingCycle }] =
    useUpdateAdmissionCrmCycleConfigurationMutation();

  const [previewCycleImpact, { isLoading: isPreviewingCycleImpact }] =
    usePreviewAdmissionCrmConfigurationImpactMutation();

  const [updateSchoolDefaultCycle, { isLoading: isUpdatingSchoolDefaultCycle }] =
    useUpdateAdmissionCrmSchoolDefaultCycleConfigurationMutation();

  const [updatePipelineStage, { isLoading: isUpdatingPipelineStage }] =
    useUpdateAdmissionCrmPipelineStageMutation();

  const [createPipelineStage, { isLoading: isCreatingPipelineStage }] =
    useCreateAdmissionCrmPipelineStageMutation();

  const [lockJourney, { isLoading: isLockingJourney }] = useLockAdmissionCrmJourneyMutation();

  const [unlockJourney, { isLoading: isUnlockingJourney }] = useUnlockAdmissionCrmJourneyMutation();

  const [createInquirySource, { isLoading: isCreatingInquirySource }] =
    useCreateAdmissionCrmInquirySourceMutation();

  const [updateInquirySource, { isLoading: isUpdatingInquirySource }] =
    useUpdateAdmissionCrmInquirySourceMutation();

  const [setInquirySourceStatus, { isLoading: isUpdatingInquirySourceStatus }] =
    useSetAdmissionCrmInquirySourceStatusMutation();

  const [createMessageTemplate, { isLoading: isCreatingMessageTemplate }] =
    useCreateAdmissionCrmMessageTemplateMutation();

  const [updateMessageTemplateStatus, { isLoading: isUpdatingMessageTemplateStatus }] =
    useUpdateAdmissionCrmMessageTemplateStatusMutation();

  const [previewMessageTemplate, { isLoading: isPreviewingMessageTemplate }] =
    usePreviewAdmissionCrmMessageTemplateMutation();

  const [updateCommunicationProvider, { isLoading: isUpdatingCommunicationProvider }] =
    useUpdateAdmissionCrmCommunicationProviderMutation();

  const isFetching =
    isCycleFetching ||
    isSchoolDefaultCycleFetching ||
    isStagesFetching ||
    isTemplatesFetching ||
    isMessageTemplatesFetching ||
    isInquirySourcesFetching ||
    isUsersFetching ||
    isCommunicationProvidersFetching;

  const isInitialLoading =
    isCycleLoading ||
    isSchoolDefaultCycleLoading ||
    isStagesLoading ||
    isTemplatesLoading ||
    isMessageTemplatesLoading ||
    isInquirySourcesLoading ||
    isUsersLoading ||
    isCommunicationProvidersLoading ||
    Boolean(
      academicYearId && needsCycleConfiguration && (!cycle || initializedCycleId !== academicYearId)
    );

  const hasActiveQueryError =
    (needsCycleConfiguration && isCycleError) ||
    (focusSection === 'journey' && focusPanel === 'cycle' && isSchoolDefaultCycleError) ||
    (needsPipelineStages && isStagesError) ||
    (focusSection === 'capture' && isTemplatesError) ||
    (needsMessageTemplates && isMessageTemplatesError) ||
    (needsInquirySources && isInquirySourcesError) ||
    (needsStaff && isUsersError) ||
    (focusSection === 'communications' &&
      focusPanel === 'providers' &&
      isCommunicationProvidersError);

  const retryActiveQueries = () => {
    if (needsCycleConfiguration) refetchCycle();
    if (focusSection === 'journey' && focusPanel === 'cycle') refetchSchoolDefaultCycle();
    if (needsPipelineStages) refetchStages();
    if (focusSection === 'capture') refetchTemplates();
    if (needsMessageTemplates) refetchMessageTemplates();
    if (needsInquirySources) refetchInquirySources();
    if (needsStaff) refetchUsers();
    if (focusSection === 'communications' && focusPanel === 'providers') {
      refetchCommunicationProviders();
    }
  };

  const cycleBaseline = useMemo(
    () => (cycle ? buildCycleFormFromConfiguration(cycle) : null),
    [cycle]
  );

  useEffect(() => {
    if (!cycleBaseline || !academicYearId) return;
    const baselineJson = JSON.stringify(cycleBaseline);

    setCycleForm((current) => {
      const shouldHydrate =
        initializedCycleId !== academicYearId ||
        lastCycleBaselineRef.current === null ||
        JSON.stringify(current) === lastCycleBaselineRef.current;
      return shouldHydrate ? cycleBaseline : current;
    });
    lastCycleBaselineRef.current = baselineJson;
    setInitializedCycleId(academicYearId);
  }, [academicYearId, cycleBaseline, initializedCycleId]);

  const isCycleDirty = useMemo(
    () => Boolean(cycleBaseline) && JSON.stringify(cycleForm) !== JSON.stringify(cycleBaseline),
    [cycleBaseline, cycleForm]
  );

  const stageFormsBaseline = useMemo(() => buildPipelineStageForms(stages), [stages]);

  const isPipelineDirty =
    focusPanel === 'pipeline' &&
    Object.keys(stageForms).length > 0 &&
    JSON.stringify(stageForms) !== JSON.stringify(stageFormsBaseline);

  const providerFormsBaseline = useMemo(
    () => buildCommunicationProviderForms(providerItems),
    [providerItems]
  );

  const isProviderDirty =
    focusPanel === 'providers' &&
    Object.keys(providerForms).length > 0 &&
    JSON.stringify(providerForms) !== JSON.stringify(providerFormsBaseline);

  const editingFormTemplate = editingTemplateId
    ? formTemplates.find((template) => template.id === editingTemplateId)
    : undefined;

  const templateFormBaseline = editingFormTemplate
    ? buildTemplateFormFromTemplate(editingFormTemplate)
    : createDefaultTemplateForm(operationalStandardOptions);

  const isTemplateDirty =
    admissionsCrmConfigurationDialog.value &&
    JSON.stringify(templateForm) !== JSON.stringify(templateFormBaseline);

  const isMessageTemplateDirty =
    messageDialogOpen &&
    JSON.stringify(messageTemplateForm) !== JSON.stringify(defaultMessageTemplateForm);

  useEnrollmentSettingsDirtyState({
    source: 'admissions-crm-configuration',
    dirty:
      isCycleDirty ||
      isPipelineDirty ||
      isProviderDirty ||
      isTemplateDirty ||
      isMessageTemplateDirty,
    onDiscard: () => {
      setCycleForm(cycleBaseline || defaultCycleForm);
      setStageForms(stageFormsBaseline);
      setProviderForms(providerFormsBaseline);
      setTemplateForm(createDefaultTemplateForm(operationalStandardOptions));
      setEditingTemplateId(null);
      admissionsCrmConfigurationDialog.onFalse();
      setMessageTemplateForm(defaultMessageTemplateForm);
      setMessageDialogOpen(false);
    },
  });

  useEffect(() => {
    const baselineJson = JSON.stringify(stageFormsBaseline);
    setStageForms((current) =>
      lastStageBaselineRef.current === null ||
      JSON.stringify(current) === lastStageBaselineRef.current
        ? stageFormsBaseline
        : current
    );
    lastStageBaselineRef.current = baselineJson;
  }, [stageFormsBaseline]);

  useEffect(() => {
    const baselineJson = JSON.stringify(providerFormsBaseline);
    setProviderForms((current) =>
      lastProviderBaselineRef.current === null ||
      JSON.stringify(current) === lastProviderBaselineRef.current
        ? providerFormsBaseline
        : current
    );
    lastProviderBaselineRef.current = baselineJson;
  }, [providerFormsBaseline]);

  const handleCycleChange = (
    field: keyof CycleForm,
    value: string | number | boolean | AdmissionCrmMeritRankingMode | AdmissionCrmExamReadinessField
  ) => {
    setCycleForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCycleReadinessToggle = (field: AdmissionCrmExamReadinessField) => {
    setCycleForm((prev) => ({
      ...prev,
      examReadinessFields:
        (prev.examReadinessFields & field) === field
          ? ((prev.examReadinessFields & ~field) as AdmissionCrmExamReadinessField)
          : ((prev.examReadinessFields | field) as AdmissionCrmExamReadinessField),
    }));
  };

  const handleApplicantChecklistChange = (
    index: number,
    field: keyof AdmissionCrmApplicantChecklistItemDto,
    value: string | number | boolean
  ) => {
    setCycleForm((prev) => ({
      ...prev,
      applicantChecklist: prev.applicantChecklist.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const handleAddApplicantChecklistItem = () => {
    setCycleForm((prev) => ({
      ...prev,
      applicantChecklist: [
        ...prev.applicantChecklist,
        {
          key: `checklist-${prev.applicantChecklist.length + 1}`,
          label: 'Checklist item',
          details: '',
          isRequired: true,
          displayOrder: (prev.applicantChecklist.length + 1) * 10,
        },
      ],
    }));
  };

  const handleRemoveApplicantChecklistItem = (index: number) => {
    setCycleForm((prev) => ({
      ...prev,
      applicantChecklist: prev.applicantChecklist.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleChannelSettingChange = (
    channel: AdmissionInquiryChannel,
    field: keyof AdmissionCrmChannelSettingDto,
    value: string | number | boolean | null
  ) => {
    setCycleForm((prev) => ({
      ...prev,
      channelSettings: mergeChannelSettings(prev.channelSettings).map((setting) =>
        setting.channel === channel ? { ...setting, [field]: value } : setting
      ),
    }));
  };

  const handleScoringRuleChange = (field: keyof AdmissionCrmLeadScoringRulesDto, value: number) => {
    setCycleForm((prev) => ({
      ...prev,
      leadScoringRules: {
        ...prev.leadScoringRules,
        [field]: value,
      },
    }));
  };

  const normalizeGuidText = (value?: string | null) => {
    const normalized = value?.trim();
    return normalized || null;
  };

  const normalizeGuidList = (values?: string[]) =>
    (values ?? [])
      .map((value) => normalizeGuidText(value))
      .filter((value): value is string => Boolean(value));

  const buildRoutingSettingsPayload = (): AdmissionCrmLeadRoutingSettingsDto => ({
    isEnabled: cycleForm.leadRoutingSettings.isEnabled,
    defaultOwnerUserId: normalizeGuidText(cycleForm.leadRoutingSettings.defaultOwnerUserId),
    routingStrategy: cycleForm.leadRoutingSettings.routingStrategy,
    ownerPoolUserIds: normalizeGuidList(cycleForm.leadRoutingSettings.ownerPoolUserIds),
    rules: cycleForm.leadRoutingSettings.rules
      .filter((rule) => rule.ruleName.trim())
      .map((rule) => ({
        ...rule,
        ruleName: rule.ruleName.trim(),
        ownerUserId: normalizeGuidText(rule.ownerUserId),
        inquirySourceId: normalizeGuidText(rule.inquirySourceId),
        targetStandardId: normalizeGuidText(rule.targetStandardId),
        campaignContains: rule.campaignContains?.trim() || null,
        campusBranchContains: rule.campusBranchContains?.trim() || null,
        preferredLanguageContains: rule.preferredLanguageContains?.trim() || null,
        desiredClassContains: rule.desiredClassContains?.trim() || null,
      })),
  });

  const buildJourneyRulesPayload = (): AdmissionCrmJourneyRuleDto[] =>
    cycleForm.journeyRules
      .filter((rule) => rule.ruleName.trim())
      .map((rule) => ({
        ruleName: rule.ruleName.trim(),
        isEnabled: rule.isEnabled,
        priority: rule.priority,
        trigger: rule.trigger,
        stage:
          rule.trigger === AdmissionCrmJourneyTrigger.StageReached ? (rule.stage ?? null) : null,
        channel: rule.channel ?? null,
        inquirySourceId: normalizeGuidText(rule.inquirySourceId),
        campaignContains: rule.campaignContains?.trim() || null,
        leadStage: rule.leadStage ?? null,
        leadPriority: rule.leadPriority ?? null,
        ownerUserId: normalizeGuidText(rule.ownerUserId),
        targetStandardId: normalizeGuidText(rule.targetStandardId),
        desiredClassContains: rule.desiredClassContains?.trim() || null,
        campusBranchContains: rule.campusBranchContains?.trim() || null,
        preferredLanguageContains: rule.preferredLanguageContains?.trim() || null,
        minimumLeadScore: rule.minimumLeadScore ?? null,
        maximumLeadScore: rule.maximumLeadScore ?? null,
        daysSinceLastActivity: rule.daysSinceLastActivity ?? null,
        daysSinceCreation: rule.daysSinceCreation ?? null,
        createTask: rule.createTask,
        taskTitle: rule.createTask ? rule.taskTitle?.trim() || null : null,
        taskDueOffsetHours: rule.taskDueOffsetHours,
        taskNotes: rule.createTask ? rule.taskNotes?.trim() || null : null,
        sendMessage: rule.sendMessage,
        messageTemplateId: rule.sendMessage ? normalizeGuidText(rule.messageTemplateId) : null,
      }));

  const buildApplicantChecklistPayload = (): AdmissionCrmApplicantChecklistItemDto[] =>
    cycleForm.applicantChecklist
      .filter((item) => item.key.trim() || item.label.trim() || item.details?.trim())
      .map((item, index) => ({
        key: normalizeApplicantChecklistKey(item.key || item.label, index),
        label: item.label.trim(),
        details: item.details?.trim() || null,
        isRequired: item.isRequired,
        displayOrder: Number.isFinite(item.displayOrder) ? item.displayOrder : (index + 1) * 10,
      }));

  const buildChannelSettingsPayload = (): AdmissionCrmChannelSettingDto[] =>
    mergeChannelSettings(cycleForm.channelSettings).map((setting, index) => ({
      channel: setting.channel,
      isEnabled: setting.isEnabled,
      defaultInquirySourceId: normalizeGuidText(setting.defaultInquirySourceId),
      defaultFormTemplateId: normalizeGuidText(setting.defaultFormTemplateId),
      defaultOwnerUserId: normalizeGuidText(setting.defaultOwnerUserId),
      defaultAcknowledgementTemplateId: normalizeGuidText(setting.defaultAcknowledgementTemplateId),
      displayOrder: Number.isFinite(setting.displayOrder) ? setting.displayOrder : (index + 1) * 10,
    }));

  const validateApplicantChecklist = () => {
    const items = buildApplicantChecklistPayload();

    const missingLabel = items.some((item) => !item.label);
    if (missingLabel) {
      return 'Applicant checklist items need a label.';
    }

    const duplicateKey = items.find(
      (item, index) => items.findIndex((candidate) => candidate.key === item.key) !== index
    );

    if (duplicateKey) {
      return `Applicant checklist key "${duplicateKey.key}" is duplicated.`;
    }

    return null;
  };

  const validateJourneyRules = (rules: AdmissionCrmJourneyRuleDto[]) => {
    for (const rule of rules) {
      if (!rule.createTask && !rule.sendMessage) {
        return `Journey rule "${rule.ruleName}" needs a task or message action.`;
      }

      if (
        rule.trigger === AdmissionCrmJourneyTrigger.StageReached &&
        (rule.stage === null || rule.stage === undefined)
      ) {
        return `Journey rule "${rule.ruleName}" needs a pipeline stage.`;
      }

      if (rule.createTask && !rule.taskTitle?.trim()) {
        return `Journey rule "${rule.ruleName}" needs a task title.`;
      }

      if (rule.createTask && rule.taskDueOffsetHours < 0) {
        return `Journey rule "${rule.ruleName}" needs a non-negative task due offset.`;
      }

      if (rule.sendMessage && !rule.messageTemplateId) {
        return `Journey rule "${rule.ruleName}" needs an approved message template.`;
      }

      const scoreValues = [rule.minimumLeadScore, rule.maximumLeadScore].filter(
        (value): value is number => value !== null && value !== undefined
      );
      if (scoreValues.some((value) => value < 0 || value > 100)) {
        return `Journey rule "${rule.ruleName}" score conditions must be between 0 and 100.`;
      }

      if (
        rule.minimumLeadScore !== null &&
        rule.minimumLeadScore !== undefined &&
        rule.maximumLeadScore !== null &&
        rule.maximumLeadScore !== undefined &&
        rule.minimumLeadScore > rule.maximumLeadScore
      ) {
        return `Journey rule "${rule.ruleName}" minimum score cannot exceed maximum score.`;
      }

      const ageValues = [rule.daysSinceLastActivity, rule.daysSinceCreation].filter(
        (value): value is number => value !== null && value !== undefined
      );
      if (ageValues.some((value) => value < 0 || value > 3660)) {
        return `Journey rule "${rule.ruleName}" age conditions must be between 0 and 3660 days.`;
      }
    }

    return null;
  };

  const buildCycleUpdatePayload = (journeyRules: AdmissionCrmJourneyRuleDto[]) => ({
    cycleName: cycleForm.cycleName,
    isActive: cycleForm.isActive,
    registrationFormRequiredBeforeExam: cycleForm.registrationFormRequiredBeforeExam,
    entranceExamRequired: cycleForm.entranceExamRequired,
    staleAfterDays: cycleForm.staleAfterDays,
    archiveAfterDays: cycleForm.archiveAfterDays,
    defaultLeadSlaHours: cycleForm.defaultLeadSlaHours,
    slaPolicy: cycleForm.slaPolicy,
    activationCancellationWindowDays: cycleForm.activationCancellationWindowDays,
    defaultExamPassingPercentage: cycleForm.defaultExamPassingPercentage,
    meritRankingMode: cycleForm.meritRankingMode,
    examReadinessFields: cycleForm.examReadinessFields,
    leadScoringRules: cycleForm.leadScoringRules,
    leadRoutingSettings: buildRoutingSettingsPayload(),
    journeyRules,
    applicantChecklist: buildApplicantChecklistPayload(),
    channelSettings: buildChannelSettingsPayload(),
    notes: cycleForm.notes || undefined,
  });

  const getValidatedJourneyRules = () => {
    if (!cycleForm.cycleName.trim()) {
      shikshaMitraToast.error({ message: 'Admission setup name is required.' });
      return null;
    }

    if (cycleForm.archiveAfterDays <= cycleForm.staleAfterDays) {
      shikshaMitraToast.error({ message: 'Archive threshold must be after stale threshold.' });
      return null;
    }

    const { slaPolicy } = cycleForm;
    if (!slaPolicy.timeZoneId.trim() || slaPolicy.workingDays.length === 0) {
      shikshaMitraToast.error({ message: 'SLA time zone and working days are required.' });
      return null;
    }
    if (
      slaPolicy.workingDayStartHour < 0 ||
      slaPolicy.workingDayStartHour > 23 ||
      slaPolicy.workingDayEndHour < 1 ||
      slaPolicy.workingDayEndHour > 24 ||
      slaPolicy.workingDayEndHour <= slaPolicy.workingDayStartHour
    ) {
      shikshaMitraToast.error({ message: 'Enter a valid SLA working-hour window.' });
      return null;
    }
    if (slaPolicy.escalationAfterHours < 0 || slaPolicy.escalationAfterHours > 720) {
      shikshaMitraToast.error({ message: 'SLA escalation must be between 0 and 720 hours.' });
      return null;
    }

    const checklistValidationMessage = validateApplicantChecklist();
    if (checklistValidationMessage) {
      shikshaMitraToast.error({ message: checklistValidationMessage });
      return null;
    }

    const journeyRules = buildJourneyRulesPayload();
    const journeyValidationMessage = validateJourneyRules(journeyRules);
    if (journeyValidationMessage) {
      shikshaMitraToast.error({ message: journeyValidationMessage });
      return null;
    }

    return journeyRules;
  };

  const handleSaveCycle = async () => {
    if (!academicYearId) {
      shikshaMitraToast.error({
        message: 'Select an academic year before updating admissions CRM.',
      });
      return;
    }

    const journeyRules = getValidatedJourneyRules();
    if (!journeyRules) return;

    const body = buildCycleUpdatePayload(journeyRules);
    try {
      const preview = await previewCycleImpact({
        academicYearId,
        body: { proposedCycleConfiguration: body },
      }).unwrap();
      if (
        preview.changedFields.length ||
        preview.affectedApplicantCount ||
        preview.configurationReferenceCount ||
        preview.warnings.length
      ) {
        setPendingCycleUpdate({ body, preview });
        return;
      }
      await updateCycle({
        academicYearId,
        body: attachAdmissionCrmImpactFingerprint(body, preview.fingerprint),
      }).unwrap();
      shikshaMitraToast.success({ message: 'Admission year settings updated.' });
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to update admission year settings.');
      shikshaMitraToast.error({ message });
    }
  };

  const handleConfirmCycleUpdate = async () => {
    if (!academicYearId || !pendingCycleUpdate) return;

    try {
      await updateCycle({
        academicYearId,
        body: attachAdmissionCrmImpactFingerprint(
          pendingCycleUpdate.body,
          pendingCycleUpdate.preview.fingerprint
        ),
      }).unwrap();
      setPendingCycleUpdate(null);
      shikshaMitraToast.success({
        message: 'Admission year settings updated after impact review.',
      });
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to update admission year settings.');
      shikshaMitraToast.error({ message });
    }
  };

  const handleApplySchoolDefaultCycle = () => {
    if (!schoolDefaultCycle) {
      shikshaMitraToast.error({ message: 'School defaults are still loading.' });
      return;
    }

    setCycleForm(buildCycleFormFromConfiguration(schoolDefaultCycle));
    shikshaMitraToast.success({ message: 'School defaults loaded into the cycle form.' });
  };

  const handleSaveSchoolDefaultCycle = async () => {
    const journeyRules = getValidatedJourneyRules();
    if (!journeyRules) return;

    try {
      await updateSchoolDefaultCycle({
        body: buildCycleUpdatePayload(journeyRules),
      }).unwrap();
      shikshaMitraToast.success({ message: 'School admission defaults updated.' });
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to update school admission defaults.');
      shikshaMitraToast.error({ message });
    }
  };

  const handleTemplateChange = (
    field: keyof TemplateForm,
    value: string | boolean | AdmissionInquiryChannel
  ) => {
    setTemplateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleTemplateFieldChange = (index: number, changes: Partial<AdmissionCrmFormFieldDto>) => {
    setTemplateForm((prev) => ({
      ...prev,
      fields: prev.fields.map((field, fieldIndex) =>
        fieldIndex === index ? { ...field, ...changes } : field
      ),
    }));
  };

  const handleTemplateFieldTypeChange = (index: number, fieldType: AdmissionCrmFormFieldType) => {
    handleTemplateFieldChange(index, {
      fieldType,
      options: fieldNeedsOptions(fieldType) ? (templateForm.fields[index]?.options ?? []) : [],
    });
  };

  const handleTemplateFieldOptionsChange = (index: number, value: string) => {
    handleTemplateFieldChange(index, {
      options: value
        .split(/[,\n]/)
        .map((option) => option.trim())
        .filter(Boolean),
    });
  };

  const handleAddTemplateField = () => {
    setTemplateForm((prev) => ({
      ...prev,
      fields: [
        ...prev.fields,
        {
          key: `field-${prev.fields.length + 1}`,
          label: 'New field',
          fieldType: AdmissionCrmFormFieldType.Text,
          systemField: null,
          required: false,
          displayOrder: (prev.fields.length + 1) * 10,
          options: [],
        },
      ],
    }));
  };

  const handleRemoveTemplateField = (index: number) => {
    setTemplateForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, fieldIndex) => fieldIndex !== index),
    }));
  };

  const handleStageChange = (
    stageId: string,
    field: keyof PipelineStageForm,
    value: string | number | boolean | AdmissionInquiryStage[]
  ) => {
    const currentStage = stages.find((stage) => stage.id === stageId);
    setStageForms((prev) => ({
      ...prev,
      [stageId]: {
        ...(prev[stageId] ??
          (currentStage
            ? buildPipelineStageFormFromStage(currentStage)
            : createEmptyPipelineStageForm())),
        [field]: value,
      },
    }));
  };

  const handleRoutingSettingsChange = (
    field: keyof Pick<
      AdmissionCrmLeadRoutingSettingsDto,
      'isEnabled' | 'defaultOwnerUserId' | 'routingStrategy' | 'ownerPoolUserIds'
    >,
    value: boolean | string | null | AdmissionCrmLeadRoutingStrategy | string[]
  ) => {
    setCycleForm((prev) => ({
      ...prev,
      leadRoutingSettings: {
        ...prev.leadRoutingSettings,
        [field]: value,
      },
    }));
  };

  const handleRoutingRuleChange = (
    index: number,
    field: keyof AdmissionCrmLeadRoutingRuleDto,
    value: string | number | boolean | AdmissionInquiryChannel | null
  ) => {
    setCycleForm((prev) => ({
      ...prev,
      leadRoutingSettings: {
        ...prev.leadRoutingSettings,
        rules: prev.leadRoutingSettings.rules.map((rule, ruleIndex) =>
          ruleIndex === index ? { ...rule, [field]: value } : rule
        ),
      },
    }));
  };

  const handleAddRoutingRule = () => {
    setCycleForm((prev) => ({
      ...prev,
      leadRoutingSettings: {
        ...prev.leadRoutingSettings,
        rules: [
          ...prev.leadRoutingSettings.rules,
          {
            ruleName: 'New routing rule',
            isEnabled: true,
            priority: (prev.leadRoutingSettings.rules.length + 1) * 10,
            ownerUserId: '',
            channel: null,
            inquirySourceId: '',
            targetStandardId: '',
            campaignContains: '',
            campusBranchContains: '',
            preferredLanguageContains: '',
            desiredClassContains: '',
          },
        ],
      },
    }));
  };

  const handleDuplicateRoutingRule = (index: number) => {
    setCycleForm((prev) => {
      const source = prev.leadRoutingSettings.rules[index];
      if (!source) return prev;

      return {
        ...prev,
        leadRoutingSettings: {
          ...prev.leadRoutingSettings,
          rules: [
            ...prev.leadRoutingSettings.rules,
            {
              ...source,
              ruleName: `${source.ruleName || 'Routing rule'} Copy`,
              priority: nextRulePriority(
                prev.leadRoutingSettings.rules.map((rule) => rule.priority)
              ),
            },
          ],
        },
      };
    });
  };

  const handleRemoveRoutingRule = (index: number) => {
    setCycleForm((prev) => ({
      ...prev,
      leadRoutingSettings: {
        ...prev.leadRoutingSettings,
        rules: prev.leadRoutingSettings.rules.filter((_, ruleIndex) => ruleIndex !== index),
      },
    }));
  };

  const handleJourneyRuleChange = (
    index: number,
    field: keyof AdmissionCrmJourneyRuleDto,
    value:
      | string
      | number
      | boolean
      | AdmissionCrmJourneyTrigger
      | AdmissionInquiryStage
      | AdmissionInquiryChannel
      | AdmissionCrmLeadPriority
      | null
  ) => {
    setCycleForm((prev) => ({
      ...prev,
      journeyRules: prev.journeyRules.map((rule, ruleIndex) => {
        if (ruleIndex !== index) {
          return rule;
        }

        const nextRule = { ...rule, [field]: value };
        if (field === 'trigger' && value !== AdmissionCrmJourneyTrigger.StageReached) {
          nextRule.stage = null;
        }

        return nextRule;
      }),
    }));
  };

  const handleAddJourneyRule = () => {
    setCycleForm((prev) => ({
      ...prev,
      journeyRules: [
        ...prev.journeyRules,
        {
          ruleName: 'New journey rule',
          isEnabled: true,
          priority: (prev.journeyRules.length + 1) * 10,
          trigger: AdmissionCrmJourneyTrigger.LeadCreated,
          stage: null,
          channel: null,
          inquirySourceId: null,
          campaignContains: '',
          leadStage: null,
          leadPriority: null,
          ownerUserId: null,
          targetStandardId: null,
          desiredClassContains: '',
          campusBranchContains: '',
          preferredLanguageContains: '',
          minimumLeadScore: null,
          maximumLeadScore: null,
          daysSinceLastActivity: null,
          daysSinceCreation: null,
          createTask: true,
          taskTitle: 'Follow up with parent',
          taskDueOffsetHours: 24,
          taskNotes: '',
          sendMessage: false,
          messageTemplateId: null,
        },
      ],
    }));
  };

  const handleDuplicateJourneyRule = (index: number) => {
    setCycleForm((prev) => {
      const source = prev.journeyRules[index];
      if (!source) return prev;

      return {
        ...prev,
        journeyRules: [
          ...prev.journeyRules,
          {
            ...source,
            ruleName: `${source.ruleName || 'Journey rule'} Copy`,
            priority: nextRulePriority(prev.journeyRules.map((rule) => rule.priority)),
          },
        ],
      };
    });
  };

  const handleRemoveJourneyRule = (index: number) => {
    setCycleForm((prev) => ({
      ...prev,
      journeyRules: prev.journeyRules.filter((_, ruleIndex) => ruleIndex !== index),
    }));
  };

  const handleSaveStage = async (stageId: string) => {
    const stageForm = stageForms[stageId];
    if (!stageForm?.stageName?.trim()) {
      shikshaMitraToast.error({ message: 'Stage name is required.' });
      return;
    }

    const colorHex = stageForm.colorHex.trim();
    if (colorHex && !/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorHex)) {
      shikshaMitraToast.error({ message: 'Stage color must be a hex value like #1976D2.' });
      return;
    }

    const slaTargetHours =
      stageForm.slaTargetHours.trim() === '' ? 0 : Number(stageForm.slaTargetHours);
    if (!Number.isFinite(slaTargetHours) || slaTargetHours < 0 || slaTargetHours > 720) {
      shikshaMitraToast.error({ message: 'Stage SLA must be between 0 and 720 hours.' });
      return;
    }

    const body: Partial<AdmissionCrmPipelineStageDto> = cycleForm.journeyLocked
      ? {
          stageName: stageForm.stageName,
          colorHex,
          slaTargetHours,
          ownerResponsibility: stageForm.ownerResponsibility.trim(),
        }
      : {
          stageName: stageForm.stageName,
          displayOrder: stageForm.displayOrder,
          isEnabled: stageForm.isEnabled,
          colorHex,
          slaTargetHours,
          ownerResponsibility: stageForm.ownerResponsibility.trim(),
          allowedNextStages: stageForm.allowedNextStages,
        };

    try {
      const stage = stages.find((item) => item.id === stageId);
      if (!academicYearId || !stage) {
        shikshaMitraToast.error({
          message: 'Reload the academic year and pipeline stages before updating this stage.',
        });
        return;
      }
      const preview = await previewCycleImpact({
        academicYearId,
        body: {
          pipelineStageId: stage.id,
          proposedPipelineStage: body,
        },
      }).unwrap();
      if (
        preview.affectedApplicantCount ||
        preview.configurationReferenceCount ||
        preview.warnings.length
      ) {
        setPendingStageUpdate({
          stageId,
          stageName: stage.stageName,
          body,
          preview,
        });
        return;
      }
      await updatePipelineStage({
        stageId,
        body: attachAdmissionCrmImpactFingerprint(body, preview.fingerprint),
      }).unwrap();
      shikshaMitraToast.success({ message: 'Pipeline stage updated.' });
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to update pipeline stage.');
      shikshaMitraToast.error({ message });
    }
  };

  const handleConfirmStageUpdate = async () => {
    if (!pendingStageUpdate) return;

    try {
      await updatePipelineStage({
        stageId: pendingStageUpdate.stageId,
        body: attachAdmissionCrmImpactFingerprint(
          pendingStageUpdate.body,
          pendingStageUpdate.preview.fingerprint
        ),
      }).unwrap();
      setPendingStageUpdate(null);
      shikshaMitraToast.success({ message: 'Pipeline stage updated after impact review.' });
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to update pipeline stage.');
      shikshaMitraToast.error({ message });
    }
  };

  const validateStageForm = (stageForm: PipelineStageForm) => {
    const stageKey = stageForm.stageKey.trim().toUpperCase();
    if (!stageKey) return 'Stage key is required.';
    if (!/^[A-Z0-9_-]+$/.test(stageKey)) {
      return 'Stage key can use letters, numbers, hyphen, and underscore only.';
    }
    if (!stageForm.stageName.trim()) return 'Stage name is required.';
    if (stages.some((stage) => stage.stageKey?.toUpperCase() === stageKey)) {
      return 'Stage key already exists.';
    }
    return null;
  };

  const handleCreateCustomStage = async () => {
    if (!academicYearId) return;
    const validationMessage = validateStageForm(customStageForm);
    if (validationMessage) {
      shikshaMitraToast.error({ message: validationMessage });
      return;
    }

    const slaTargetHours =
      customStageForm.slaTargetHours.trim() === '' ? 0 : Number(customStageForm.slaTargetHours);
    try {
      await createPipelineStage({
        academicYearId,
        body: {
          stageKey: customStageForm.stageKey.trim().toUpperCase(),
          baseSystemStage: customStageForm.baseSystemStage,
          systemStage: customStageForm.baseSystemStage,
          stageName: customStageForm.stageName.trim(),
          displayOrder: Number(customStageForm.displayOrder) || 0,
          isEnabled: customStageForm.isEnabled,
          colorHex: customStageForm.colorHex.trim(),
          slaTargetHours,
          ownerResponsibility: customStageForm.ownerResponsibility.trim(),
          allowedNextStages: customStageForm.allowedNextStages,
        },
      }).unwrap();
      setCustomStageOpen(false);
      setCustomStageForm(createEmptyPipelineStageForm());
      shikshaMitraToast.success({ message: 'Custom stage added.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getSettingsErrorMessage(error, 'Unable to add custom stage.'),
      });
    }
  };

  const handleToggleJourneyLock = async (lock: boolean) => {
    if (!academicYearId) return;
    if (!lock && !journeyLockReason.trim()) {
      shikshaMitraToast.error({ message: 'Enter a reason before unlocking the journey.' });
      return;
    }

    try {
      const action = lock ? lockJourney : unlockJourney;
      await action({
        academicYearId,
        body: { reason: journeyLockReason.trim() || undefined },
      }).unwrap();
      setJourneyLockReason('');
      shikshaMitraToast.success({ message: lock ? 'Journey locked.' : 'Journey unlocked.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getSettingsErrorMessage(
          error,
          lock ? 'Unable to lock journey.' : 'Unable to unlock journey.'
        ),
      });
    }
  };

  const openInquirySourceDialog = (sourceId?: string) => {
    const source = sourceId ? inquirySources?.items.find((item) => item.id === sourceId) : null;
    setEditingInquirySourceId(source?.id ?? null);
    setInquirySourceForm(
      source
        ? {
            code: source.code,
            displayName: source.displayName,
            description: source.description || '',
            allowedChannels: source.allowedChannels,
            displayOrder: source.displayOrder,
            isRoutingEligible: source.isRoutingEligible,
          }
        : {
            code: '',
            displayName: '',
            description: '',
            allowedChannels: inquiryChannelOptions,
            displayOrder: ((inquirySources?.items.length ?? 0) + 1) * 10,
            isRoutingEligible: true,
          }
    );
    setInquirySourceOpen(true);
  };

  const handleSaveInquirySource = async () => {
    if (!academicYearId) return;
    const code = inquirySourceForm.code.trim().toUpperCase();
    if (!/^[A-Z0-9_-]+$/.test(code)) {
      shikshaMitraToast.error({
        message: 'Source code can use letters, numbers, hyphen, and underscore only.',
      });
      return;
    }
    if (!inquirySourceForm.displayName.trim()) {
      shikshaMitraToast.error({ message: 'Display name is required.' });
      return;
    }
    if (!inquirySourceForm.allowedChannels.length) {
      shikshaMitraToast.error({ message: 'Select at least one allowed channel.' });
      return;
    }

    const body = {
      ...inquirySourceForm,
      code,
      displayName: inquirySourceForm.displayName.trim(),
      description: inquirySourceForm.description.trim() || null,
      displayOrder: Number(inquirySourceForm.displayOrder) || 0,
    };

    try {
      if (editingInquirySourceId) {
        await updateInquirySource({ sourceId: editingInquirySourceId, body }).unwrap();
      } else {
        await createInquirySource({ academicYearId, body }).unwrap();
      }
      setInquirySourceOpen(false);
      shikshaMitraToast.success({
        message: editingInquirySourceId ? 'Inquiry source updated.' : 'Inquiry source added.',
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: getSettingsErrorMessage(error, 'Unable to save inquiry source.'),
      });
    }
  };

  const handleCloseTemplateDialog = () => {
    admissionsCrmConfigurationDialog.onFalse();
    setEditingTemplateId(null);
    setTemplateForm(createDefaultTemplateForm());
  };

  const handleOpenEditTemplate = (template: AdmissionCrmFormTemplateDto) => {
    setEditingTemplateId(template.id);
    setTemplateForm(buildTemplateFormFromTemplate(template));
    admissionsCrmConfigurationDialog.onTrue();
  };

  const handleOpenCreateTemplate = () => {
    setEditingTemplateId(null);
    setTemplateForm(createDefaultTemplateForm(operationalStandardOptions));
    admissionsCrmConfigurationDialog.onTrue();
  };

  const handleDuplicateFormTemplate = async (template: AdmissionCrmFormTemplateDto) => {
    if (!academicYearId) {
      shikshaMitraToast.error({
        message: 'Select an academic year before duplicating an inquiry form.',
      });
      return;
    }

    const body = buildDuplicateInquiryFormTemplate(
      template,
      formTemplates.map((item) => item.templateName)
    );

    try {
      await createTemplate({ academicYearId, body }).unwrap();
      setDuplicateInquiryFormTemplate(null);
      shikshaMitraToast.success({
        message: `Inquiry form duplicated as "${body.templateName}". Review the draft before activating it.`,
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: getSettingsErrorMessage(
          error,
          'Unable to duplicate the inquiry form. Review the form and try again.'
        ),
      });
    }
  };

  const handleMessageTemplateChange = (
    field: keyof MessageTemplateForm,
    value: string | AdmissionCrmMessageChannel
  ) => {
    setMessageTemplateForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCloseMessageDialog = () => {
    setMessageDialogOpen(false);
    setMessageTemplateForm(defaultMessageTemplateForm);
  };

  const parseVariablesText = (variablesText: string) =>
    variablesText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .reduce<Record<string, string>>((acc, line) => {
        const [key, ...valueParts] = line.split('=');
        if (key?.trim()) {
          acc[key.trim()] = valueParts.join('=').trim();
        }
        return acc;
      }, {});

  const runMessageTemplatePreview = async (
    template: AdmissionCrmMessageTemplateDto,
    variablesText: string
  ) => {
    if (!academicYearId) {
      shikshaMitraToast.error({
        message: 'Select an academic year before previewing message templates.',
      });
      return;
    }

    try {
      const preview = await previewMessageTemplate({
        academicYearId,
        body: {
          templateId: template.id,
          variables: parseVariablesText(variablesText),
        },
      }).unwrap();
      setMessageTemplatePreview(preview);
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to preview message template.');
      shikshaMitraToast.error({ message });
    }
  };

  const handleOpenMessageTemplatePreview = async (template: AdmissionCrmMessageTemplateDto) => {
    setPreviewTemplate(template);
    setMessageTemplatePreview(null);
    setMessagePreviewVariablesText('');
    await runMessageTemplatePreview(template, '');
  };

  const handleCloseMessagePreview = () => {
    setPreviewTemplate(null);
    setMessageTemplatePreview(null);
    setMessagePreviewVariablesText('');
  };

  const handleRefreshMessagePreview = async () => {
    if (!previewTemplate) return;
    await runMessageTemplatePreview(previewTemplate, messagePreviewVariablesText);
  };

  const handleCopyPreviewText = async (value?: string | null) => {
    if (!value) {
      shikshaMitraToast.error({ message: 'Nothing to copy.' });
      return;
    }

    try {
      await navigator.clipboard.writeText(value);
      shikshaMitraToast.success({ message: 'Preview copied.' });
    } catch {
      shikshaMitraToast.error({ message: 'Unable to copy preview.' });
    }
  };

  const handleCopyPublicFormLink = async (template: AdmissionCrmFormTemplateDto) => {
    const link = buildPublicAdmissionInquiryUrl({
      origin: typeof window === 'undefined' ? null : window.location.origin,
      tenantId,
      templateId: template.id,
    });

    if (!link) {
      shikshaMitraToast.error({ message: 'Tenant context is required to copy the public link.' });
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      shikshaMitraToast.success({ message: 'Public inquiry link copied.' });
    } catch {
      shikshaMitraToast.error({ message: 'Unable to copy public inquiry link.' });
    }
  };

  const handleDownloadPublicFormQr = async (template: AdmissionCrmFormTemplateDto) => {
    const publicUrl = buildPublicAdmissionInquiryUrl({
      origin: typeof window === 'undefined' ? null : window.location.origin,
      tenantId,
      templateId: template.id,
    });

    if (!publicUrl) {
      shikshaMitraToast.error({
        message: 'Tenant context is required to download the public form QR code.',
      });
      return;
    }

    setDownloadingQrTemplateId(template.id);
    try {
      await downloadInquiryFormQr({
        publicUrl,
        templateName: template.templateName,
      });
      shikshaMitraToast.success({ message: 'Public inquiry QR code downloaded.' });
    } catch {
      shikshaMitraToast.error({ message: 'Unable to generate the public form QR code.' });
    } finally {
      setDownloadingQrTemplateId(null);
    }
  };

  const handleCampaignLinkNameChange = (templateId: string, value: string) => {
    setCampaignLinkNames((previous) => ({ ...previous, [templateId]: value }));
  };

  const handleStaffLinkOwnerChange = (templateId: string, value: string) => {
    setStaffLinkOwnerIds((previous) => ({ ...previous, [templateId]: value }));
  };

  const handleCopyCampaignFormLink = async (template: AdmissionCrmFormTemplateDto) => {
    const campaignName = campaignLinkNames[template.id]?.trim();

    if (!campaignName) {
      shikshaMitraToast.error({ message: 'Campaign name is required to copy a campaign link.' });
      return;
    }

    const link = buildPublicAdmissionInquiryUrl({
      origin: typeof window === 'undefined' ? null : window.location.origin,
      tenantId,
      templateId: template.id,
      campaignName,
    });

    if (!link) {
      shikshaMitraToast.error({ message: 'Tenant context is required to copy the campaign link.' });
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      shikshaMitraToast.success({ message: 'Campaign inquiry link copied.' });
    } catch {
      shikshaMitraToast.error({ message: 'Unable to copy campaign inquiry link.' });
    }
  };

  const handleCopyStaffSharedFormLink = async (template: AdmissionCrmFormTemplateDto) => {
    const ownerUserId = staffLinkOwnerIds[template.id]?.trim();

    if (!ownerUserId) {
      shikshaMitraToast.error({ message: 'Owner is required to copy a staff-shared link.' });
      return;
    }

    const link = buildPublicAdmissionInquiryUrl({
      origin: typeof window === 'undefined' ? null : window.location.origin,
      tenantId,
      templateId: template.id,
      ownerUserId,
    });

    if (!link) {
      shikshaMitraToast.error({
        message: 'Tenant context is required to copy the staff-shared link.',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      shikshaMitraToast.success({ message: 'Staff-shared inquiry link copied.' });
    } catch {
      shikshaMitraToast.error({ message: 'Unable to copy staff-shared inquiry link.' });
    }
  };

  const handleCopyProviderCallbackUrl = async (channel: AdmissionCrmMessageChannel) => {
    const link = buildAdmissionCrmProviderDeliveryCallbackUrl({
      apiOrigin: process.env.NEXT_PUBLIC_API_URL,
      tenantId,
      academicYearId,
      channel,
    });

    if (!link) {
      shikshaMitraToast.error({
        message: 'Tenant and academic year context are required to copy the callback URL.',
      });
      return;
    }

    try {
      await navigator.clipboard.writeText(link);
      shikshaMitraToast.success({ message: 'Provider callback URL copied.' });
    } catch {
      shikshaMitraToast.error({ message: 'Unable to copy provider callback URL.' });
    }
  };

  const buildTemplateFieldsPayload = (): AdmissionCrmFormFieldDto[] =>
    templateForm.fields
      .filter(
        (field) =>
          field.key.trim() ||
          field.label.trim() ||
          field.systemField?.trim() ||
          (field.options ?? []).length > 0
      )
      .map((field, index) => {
        const { fieldType } = field;
        const options = fieldNeedsOptions(fieldType)
          ? [...new Set((field.options ?? []).map((option) => option.trim()).filter(Boolean))]
          : [];

        return {
          key: normalizeTemplateFieldKey(field.key || field.label, index),
          label: field.label.trim(),
          fieldType,
          systemField: field.systemField?.trim() || null,
          sectionName: field.sectionName?.trim() || null,
          helperText: field.helperText?.trim() || null,
          placeholder: field.placeholder?.trim() || null,
          defaultValue: field.defaultValue?.trim() || null,
          visibleWhenFieldKey: field.visibleWhenFieldKey?.trim() || null,
          visibleWhenValue: field.visibleWhenValue?.trim() || null,
          required: field.required,
          displayOrder: Number.isFinite(field.displayOrder) ? field.displayOrder : (index + 1) * 10,
          options,
          localizedLabels: field.localizedLabels ? { ...field.localizedLabels } : undefined,
          localizedHelperTexts: field.localizedHelperTexts
            ? { ...field.localizedHelperTexts }
            : undefined,
          localizedPlaceholders: field.localizedPlaceholders
            ? { ...field.localizedPlaceholders }
            : undefined,
          localizedOptions: field.localizedOptions
            ? Object.fromEntries(
                Object.entries(field.localizedOptions).map(([language, values]) => [
                  language,
                  [...values],
                ])
              )
            : undefined,
        };
      });

  const validateTemplateFields = (fields: AdmissionCrmFormFieldDto[]) => {
    if (fields.length === 0) {
      return 'Add at least one form field.';
    }

    const missingLabel = fields.some((field) => !field.label);
    if (missingLabel) {
      return 'Every form field needs a label.';
    }

    const duplicateKey = fields.find(
      (field, index) => fields.findIndex((candidate) => candidate.key === field.key) !== index
    );
    if (duplicateKey) {
      return `Form field key "${duplicateKey.key}" is duplicated.`;
    }

    const fieldWithoutOptions = fields.find(
      (field) => fieldNeedsOptions(field.fieldType) && (field.options ?? []).length === 0
    );
    if (fieldWithoutOptions) {
      return `${fieldWithoutOptions.label} needs at least one option.`;
    }

    const fieldKeys = new Set(fields.map((field) => field.key));
    const invalidVisibilityRule = fields.find((field) => {
      const controllingKey = field.visibleWhenFieldKey?.trim();
      if (!controllingKey) {
        return false;
      }

      return controllingKey === field.key || !fieldKeys.has(controllingKey);
    });
    if (invalidVisibilityRule) {
      return `${invalidVisibilityRule.label} has an invalid visibility field key.`;
    }

    return null;
  };

  const handleSaveTemplate = async () => {
    if (!academicYearId) {
      shikshaMitraToast.error({
        message: 'Select an academic year before saving a form template.',
      });
      return;
    }

    if (!templateForm.templateName.trim()) {
      shikshaMitraToast.error({ message: 'Template name is required.' });
      return;
    }

    if (
      templateForm.isPublic &&
      (!templateForm.consentText.trim() || !templateForm.privacyNoticeUrl.trim())
    ) {
      shikshaMitraToast.error({
        message: 'Public forms require consent text and a privacy notice URL.',
      });
      return;
    }

    const fields = buildTemplateFieldsPayload();
    const fieldValidationMessage = validateTemplateFields(fields);
    if (fieldValidationMessage) {
      shikshaMitraToast.error({ message: fieldValidationMessage });
      return;
    }

    try {
      const body = {
        templateName: templateForm.templateName,
        description: templateForm.description || undefined,
        channel: templateForm.channel,
        isPublic: templateForm.isPublic,
        isActive: templateForm.isActive,
        consentText: templateForm.isPublic ? templateForm.consentText : undefined,
        privacyNoticeUrl: templateForm.isPublic ? templateForm.privacyNoticeUrl : undefined,
        fields,
        localizations: templateForm.localizations,
      };

      if (editingTemplateId) {
        await updateTemplate({
          templateId: editingTemplateId,
          body,
        }).unwrap();
      } else {
        await createTemplate({
          academicYearId,
          body,
        }).unwrap();
      }

      shikshaMitraToast.success({
        message: editingTemplateId ? 'Form template updated.' : 'Form template created.',
      });
      handleCloseTemplateDialog();
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to save form template.');
      shikshaMitraToast.error({ message });
    }
  };

  const handleToggleTemplateStatus = async (templateId: string, isActive: boolean) => {
    try {
      await updateTemplateStatus({
        templateId,
        body: { isActive: !isActive },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Form template status updated.' });
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to update form template.');
      shikshaMitraToast.error({ message });
    }
  };

  const handleCreateMessageTemplate = async () => {
    if (!academicYearId) {
      shikshaMitraToast.error({
        message: 'Select an academic year before creating a message template.',
      });
      return;
    }

    if (!messageTemplateForm.templateName.trim() || !messageTemplateForm.body.trim()) {
      shikshaMitraToast.error({ message: 'Template name and body are required.' });
      return;
    }

    if (
      messageTemplateForm.channel === AdmissionCrmMessageChannel.Email &&
      !messageTemplateForm.subject.trim()
    ) {
      shikshaMitraToast.error({ message: 'Email templates require a subject.' });
      return;
    }

    try {
      await createMessageTemplate({
        academicYearId,
        body: {
          templateName: messageTemplateForm.templateName,
          channel: messageTemplateForm.channel,
          purpose: messageTemplateForm.purpose,
          subject: messageTemplateForm.subject || undefined,
          body: messageTemplateForm.body,
          variables: messageTemplateForm.variables
            .split(',')
            .map((variable) => variable.trim())
            .filter(Boolean),
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Message template created.' });
      handleCloseMessageDialog();
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to create message template.');
      shikshaMitraToast.error({ message });
    }
  };

  const handleToggleMessageTemplateApproval = async (
    templateId: string,
    status: AdmissionCrmMessageTemplateStatus,
    isActive: boolean
  ) => {
    try {
      await updateMessageTemplateStatus({
        templateId,
        body: {
          status:
            status === AdmissionCrmMessageTemplateStatus.Approved
              ? AdmissionCrmMessageTemplateStatus.Retired
              : AdmissionCrmMessageTemplateStatus.Approved,
          isActive,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Message template status updated.' });
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to update message template status.');
      shikshaMitraToast.error({ message });
    }
  };

  const handleProviderChange = (
    channel: AdmissionCrmMessageChannel,
    field: keyof CommunicationProviderForm,
    value: string | boolean
  ) => {
    setProviderForms((prev) => ({
      ...prev,
      [channel]: {
        ...(prev[channel] || defaultProviderForm),
        [field]: value,
      },
    }));
  };

  const handleProviderAdapterChange = (channel: AdmissionCrmMessageChannel, adapter: string) => {
    setProviderForms((prev) => {
      const current = prev[channel] || defaultProviderForm;

      return {
        ...prev,
        [channel]: {
          ...current,
          settingsJson: updateAdmissionCrmProviderAdapter(current.settingsJson, adapter),
        },
      };
    });
  };

  const handleProviderPayloadModeChange = (
    channel: AdmissionCrmMessageChannel,
    payloadMode: string
  ) => {
    setProviderForms((prev) => {
      const current = prev[channel] || defaultProviderForm;
      return {
        ...prev,
        [channel]: {
          ...current,
          settingsJson: updateAdmissionCrmProviderPayloadMode(current.settingsJson, payloadMode),
        },
      };
    });
  };

  const handleProviderKeyValueChange = (
    channel: AdmissionCrmMessageChannel,
    field: 'headers' | 'parameters',
    currentKey: string,
    nextKey: string,
    nextValue: string
  ) => {
    setProviderForms((prev) => {
      const current = prev[channel] || defaultProviderForm;
      const values = { ...getAdmissionCrmProviderKeyValueSettings(current.settingsJson, field) };
      delete values[currentKey];
      if (nextKey.trim()) values[nextKey.trim()] = nextValue;
      return {
        ...prev,
        [channel]: {
          ...current,
          settingsJson: updateAdmissionCrmProviderKeyValueSettings(
            current.settingsJson,
            field,
            values
          ),
        },
      };
    });
  };

  const handleProviderResponseMessageIdPathChange = (
    channel: AdmissionCrmMessageChannel,
    value: string
  ) => {
    setProviderForms((prev) => {
      const current = prev[channel] || defaultProviderForm;

      return {
        ...prev,
        [channel]: {
          ...current,
          settingsJson: updateAdmissionCrmProviderResponseMessageIdPath(
            current.settingsJson,
            value
          ),
        },
      };
    });
  };

  const handleProviderCallbackSecretChange = (
    channel: AdmissionCrmMessageChannel,
    value: string
  ) => {
    setProviderForms((prev) => {
      const current = prev[channel] || defaultProviderForm;

      return {
        ...prev,
        [channel]: {
          ...current,
          settingsJson: updateAdmissionCrmProviderCallbackSecret(current.settingsJson, value),
        },
      };
    });
  };

  const handleProviderCallbackMappingPathChange = (
    channel: AdmissionCrmMessageChannel,
    field: 'statusPath' | 'statusDetailsPath' | 'providerMessageIdPath',
    value: string
  ) => {
    setProviderForms((prev) => {
      const current = prev[channel] || defaultProviderForm;

      return {
        ...prev,
        [channel]: {
          ...current,
          settingsJson: updateAdmissionCrmProviderCallbackMappingPath(
            current.settingsJson,
            field,
            value
          ),
        },
      };
    });
  };

  const handleSaveCommunicationProvider = async (channel: AdmissionCrmMessageChannel) => {
    if (!academicYearId) {
      shikshaMitraToast.error({
        message: 'Select an academic year before saving communication providers.',
      });
      return;
    }

    const providerForm = providerForms[channel];
    if (!providerForm?.providerName.trim() && providerForm?.isEnabled) {
      shikshaMitraToast.error({ message: 'Enabled providers require a provider name.' });
      return;
    }

    if (providerForm?.settingsJson.trim()) {
      try {
        const parsedSettings = JSON.parse(providerForm.settingsJson);
        if (
          !parsedSettings ||
          typeof parsedSettings !== 'object' ||
          Array.isArray(parsedSettings)
        ) {
          throw new Error('Provider settings must be an object.');
        }
      } catch {
        shikshaMitraToast.error({ message: 'Provider settings must be valid JSON.' });
        return;
      }
    }

    try {
      await updateCommunicationProvider({
        academicYearId,
        channel,
        body: {
          isEnabled: providerForm?.isEnabled ?? false,
          providerName: providerForm?.providerName || undefined,
          senderId: providerForm?.senderId || undefined,
          settings: buildAdmissionCrmProviderSettingsInput(providerForm?.settingsJson || '{}'),
          webhookUrl: providerForm?.webhookUrl || undefined,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Communication provider saved.' });
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to save communication provider.');
      shikshaMitraToast.error({ message });
    }
  };

  const channelSettings = mergeChannelSettings(cycleForm.channelSettings);

  const inquirySourceOptions = buildInquirySourceSelectOptions(
    (inquirySources?.items || []).map((source) => ({
      ...source,
      preferenceName: source.displayName,
    })),
    [
      ...channelSettings.map((setting) => setting.defaultInquirySourceId),
      ...cycleForm.leadRoutingSettings.rules.map((rule) => rule.inquirySourceId),
      ...cycleForm.journeyRules.map((rule) => rule.inquirySourceId),
    ]
  );

  const ownerOptions = buildCrmUserSelectOptions(users, [
    ...channelSettings.map((setting) => setting.defaultOwnerUserId),
    cycleForm.leadRoutingSettings.defaultOwnerUserId,
    cycleForm.slaPolicy.escalationOwnerUserId,
    ...(cycleForm.leadRoutingSettings.ownerPoolUserIds ?? []),
    ...cycleForm.leadRoutingSettings.rules.map((rule) => rule.ownerUserId),
    ...cycleForm.journeyRules.map((rule) => rule.ownerUserId),
  ]);

  const approvedMessageTemplates = (messageTemplates?.items || []).filter(
    (template) =>
      template.status === AdmissionCrmMessageTemplateStatus.Approved && template.isActive
  );

  const getJourneyRuleSummary = (rule: AdmissionCrmJourneyRuleDto) => {
    const trigger =
      rule.trigger === AdmissionCrmJourneyTrigger.StageReached && rule.stage != null
        ? `When applicant reaches ${
            stages.find((stage) => stage.systemStage === rule.stage)?.stageName ||
            getAdmissionCrmStageLabel(rule.stage)
          }`
        : `When ${journeyTriggerLabel[rule.trigger].toLowerCase()}`;
    const template = approvedMessageTemplates.find((item) => item.id === rule.messageTemplateId);
    const actions = [
      rule.createTask ? 'create a staff task' : null,
      rule.sendMessage
        ? `send ${template ? messageChannelLabel[template.channel] : 'a parent message'}`
        : null,
    ].filter(Boolean);

    return actions.length ? `${trigger}, ${actions.join(' and ')}.` : `${trigger}.`;
  };

  return {
    state: {
      academicYearId,
      admissionsCrmConfigurationDialog,
      campaignLinkNames,
      channelSettings,
      communicationProviders,
      customStageForm,
      customStageOpen,
      cycleForm,
      downloadingQrTemplateId,
      duplicateInquiryFormTemplate,
      editingInquirySourceId,
      editingTemplateId,
      focusPanel,
      focusSection,
      formTemplates,
      getJourneyRuleSummary,
      inquiryFormPreviewTemplate,
      inquirySourceForm,
      inquirySourceOpen,
      inquirySources,
      journeyLockReason,
      messageDialogOpen,
      messagePreviewVariablesText,
      messageTemplateForm,
      messageTemplatePreview,
      messageTemplates,
      pendingCycleUpdate,
      pendingStageUpdate,
      providerForms,
      schoolDefaultCycle,
      staffLinkOwnerIds,
      staffSearch,
      stageForms,
      stages,
      templateForm,
      templates,
      tenantId,
    },
    actions: {
      approvedMessageTemplates,
      handleAddApplicantChecklistItem,
      handleAddJourneyRule,
      handleAddRoutingRule,
      handleAddTemplateField,
      handleApplicantChecklistChange,
      handleApplySchoolDefaultCycle,
      handleCampaignLinkNameChange,
      handleChannelSettingChange,
      handleCloseMessageDialog,
      handleCloseMessagePreview,
      handleCloseTemplateDialog,
      handleConfirmCycleUpdate,
      handleConfirmStageUpdate,
      handleCopyCampaignFormLink,
      handleCopyPreviewText,
      handleCopyProviderCallbackUrl,
      handleCopyPublicFormLink,
      handleCopyStaffSharedFormLink,
      handleCreateCustomStage,
      handleCreateMessageTemplate,
      handleCycleChange,
      handleCycleReadinessToggle,
      handleDownloadPublicFormQr,
      handleDuplicateFormTemplate,
      handleDuplicateJourneyRule,
      handleDuplicateRoutingRule,
      handleJourneyRuleChange,
      handleMessageTemplateChange,
      handleOpenCreateTemplate,
      handleOpenEditTemplate,
      handleOpenMessageTemplatePreview,
      handleProviderAdapterChange,
      handleProviderCallbackMappingPathChange,
      handleProviderCallbackSecretChange,
      handleProviderChange,
      handleProviderKeyValueChange,
      handleProviderPayloadModeChange,
      handleProviderResponseMessageIdPathChange,
      handleRefreshMessagePreview,
      handleRemoveApplicantChecklistItem,
      handleRemoveJourneyRule,
      handleRemoveRoutingRule,
      handleRemoveTemplateField,
      handleRoutingRuleChange,
      handleRoutingSettingsChange,
      handleSaveCommunicationProvider,
      handleSaveCycle,
      handleSaveInquirySource,
      handleSaveSchoolDefaultCycle,
      handleSaveStage,
      handleSaveTemplate,
      handleScoringRuleChange,
      handleStaffLinkOwnerChange,
      handleStageChange,
      handleTemplateChange,
      handleTemplateFieldChange,
      handleTemplateFieldOptionsChange,
      handleTemplateFieldTypeChange,
      handleToggleJourneyLock,
      handleToggleMessageTemplateApproval,
      handleToggleTemplateStatus,
      openInquirySourceDialog,
      previewTemplate,
      retryActiveQueries,
      setCustomStageForm,
      setCustomStageOpen,
      setCycleForm,
      setDuplicateInquiryFormTemplate,
      setInquiryFormPreviewTemplate,
      setInquirySourceForm,
      setInquirySourceOpen,
      setInquirySourceStatus,
      setJourneyLockReason,
      setMessageDialogOpen,
      setMessagePreviewVariablesText,
      setPendingCycleUpdate,
      setPendingStageUpdate,
      setStaffSearch,
      setTemplateForm,
    },
    meta: {
      hasActiveQueryError,
      inquirySourceOptions,
      isCreatingInquirySource,
      isCreatingMessageTemplate,
      isCreatingPipelineStage,
      isCreatingTemplate,
      isFetching,
      isInitialLoading,
      isLockingJourney,
      isPreviewingCycleImpact,
      isPreviewingMessageTemplate,
      isSchoolDefaultCycleFetching,
      isUnlockingJourney,
      isUpdatingCommunicationProvider,
      isUpdatingCycle,
      isUpdatingInquirySource,
      isUpdatingMessageTemplateStatus,
      isUpdatingPipelineStage,
      isUpdatingSchoolDefaultCycle,
      isUpdatingTemplate,
      isUpdatingTemplateStatus,
      isUsersFetching,
      ownerOptions,
    },
  };
}

export type AdmissionsCrmConfigurationController = ReturnType<
  typeof useAdmissionsCrmConfigurationController
>;
