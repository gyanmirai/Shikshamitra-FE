/* eslint-disable no-bitwise, no-restricted-syntax */

'use client';

import type { RootState } from 'src/redux/store';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';
import type {
  AdmissionCrmFormFieldDto,
  AdmissionCrmJourneyRuleDto,
  AdmissionCrmFormTemplateDto,
  AdmissionCrmPipelineStageDto,
  AdmissionCrmChannelSettingDto,
  AdmissionCrmLeadRoutingRuleDto,
  AdmissionCrmMessageTemplateDto,
  AdmissionCrmLeadScoringRulesDto,
  AdmissionCrmCycleConfigurationDto,
  AdmissionCrmLeadRoutingSettingsDto,
  AdmissionCrmCommunicationProviderDto,
  AdmissionCrmApplicantChecklistItemDto,
  AdmissionCrmMessageTemplatePreviewDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { useRef, useMemo, useState, useEffect } from 'react';
import { LoadingButton } from 'src/components/loading-button';
import { Add, Delete, ExpandMore, Visibility, ContentCopy } from '@mui/icons-material';
import {
  Box,
  Chip,
  Alert,
  Stack,
  Paper,
  Switch,
  Select,
  Dialog,
  Button,
  Divider,
  Checkbox,
  MenuItem,
  Accordion,
  TextField,
  Typography,
  IconButton,
  InputLabel,
  DialogTitle,
  FormControl,
  Autocomplete,
  DialogActions,
  DialogContent,
  LinearProgress,
  AccordionDetails,
  AccordionSummary,
  FormControlLabel,
} from '@mui/material';
import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
  AdmissionCrmFormFieldType,
  AdmissionCrmJourneyTrigger,
  AdmissionCrmMessageChannel,
  AdmissionCrmMeritRankingMode,
  useGetAdmissionCrmStaffQuery,
  AdmissionCrmExamReadinessField,
  AdmissionCrmLeadRoutingStrategy,
  AdmissionCrmMessageTemplateStatus,
  useGetAdmissionCrmFormTemplatesQuery,
  useGetAdmissionCrmPipelineStagesQuery,
  useGetAdmissionCrmInquirySourcesQuery,
  useGetAdmissionCrmMessageTemplatesQuery,
  useCreateAdmissionCrmFormTemplateMutation,
  useGetAdmissionCrmCycleConfigurationQuery,
  useUpdateAdmissionCrmFormTemplateMutation,
  useUpdateAdmissionCrmPipelineStageMutation,
  useCreateAdmissionCrmMessageTemplateMutation,
  useGetAdmissionCrmCommunicationProvidersQuery,
  usePreviewAdmissionCrmMessageTemplateMutation,
  useUpdateAdmissionCrmCycleConfigurationMutation,
  useUpdateAdmissionCrmFormTemplateStatusMutation,
  useUpdateAdmissionCrmCommunicationProviderMutation,
  useUpdateAdmissionCrmMessageTemplateStatusMutation,
  useGetAdmissionCrmSchoolDefaultCycleConfigurationQuery,
  useUpdateAdmissionCrmSchoolDefaultCycleConfigurationMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { buildInquirySourceSelectOptions } from './inquiry-source-utils';
import { useEnrollmentSettingsDirtyState } from './enrollment-settings-dirty-state';
import {
  getAdmissionCrmStageLabel,
  getAdmissionCrmChannelLabel,
} from '../admissions-crm/admissions-crm-utils';
import {
  getCrmUserOptionLabel,
  buildCrmUserSelectOptions,
  getAdmissionCrmProviderAdapter,
  buildPublicAdmissionInquiryUrl,
  updateAdmissionCrmProviderAdapter,
  getAdmissionCrmProviderPayloadMode,
  updateAdmissionCrmProviderPayloadMode,
  getAdmissionCrmProviderCallbackSecret,
  getAdmissionCrmProviderKeyValueSettings,
  updateAdmissionCrmProviderCallbackSecret,
  updateAdmissionCrmProviderKeyValueSettings,
  getAdmissionCrmProviderCallbackMappingPath,
  buildAdmissionCrmProviderDeliveryCallbackUrl,
  getAdmissionCrmProviderResponseMessageIdPath,
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
  | 'journey'
  | 'capture'
  | 'routing'
  | 'communications'
  | 'automation';

type AdmissionsCrmConfigurationProps = {
  academicYearId?: string;
  admissionsCrmConfigurationDialog: UseBooleanReturn;
  focusSection?: AdmissionsCrmConfigurationFocusSection;
  focusPanel?: EnrollmentSettingsPanel;
};

const emptyPipelineStages: AdmissionCrmPipelineStageDto[] = [];
const emptyFormTemplates: AdmissionCrmFormTemplateDto[] = [];
const emptyCommunicationProviders: AdmissionCrmCommunicationProviderDto[] = [];

const getSettingsErrorMessage = (error: unknown, fallback: string) => {
  const message = (error as any)?.data?.error?.message || (error as any)?.data?.message;
  return typeof message === 'string' && message.trim() ? message : fallback;
};

const pipelineStageOptions = [
  AdmissionInquiryStage.NewInquiry,
  AdmissionInquiryStage.FollowUp,
  AdmissionInquiryStage.ExamReady,
  AdmissionInquiryStage.ExamScheduled,
  AdmissionInquiryStage.ExamCompleted,
  AdmissionInquiryStage.Eligible,
  AdmissionInquiryStage.Waitlisted,
  AdmissionInquiryStage.Rejected,
  AdmissionInquiryStage.Stale,
  AdmissionInquiryStage.Archived,
];

const slaWorkingDayOptions = [
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
  { value: 0, label: 'Sun' },
];

const createEmptyPipelineStageForm = (): PipelineStageForm => ({
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

const providerAdapterOptions = [
  { value: 'webhook', label: 'Webhook' },
  { value: 'custom-webhook', label: 'Custom webhook' },
  { value: 'manual', label: 'Manual queue' },
];

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
  notes: '',
};

const formFieldTypeLabel: Record<AdmissionCrmFormFieldType, string> = {
  [AdmissionCrmFormFieldType.Text]: 'Text',
  [AdmissionCrmFormFieldType.TextArea]: 'Long text',
  [AdmissionCrmFormFieldType.Number]: 'Number',
  [AdmissionCrmFormFieldType.Date]: 'Date',
  [AdmissionCrmFormFieldType.Email]: 'Email',
  [AdmissionCrmFormFieldType.Phone]: 'Phone',
  [AdmissionCrmFormFieldType.Select]: 'Select',
  [AdmissionCrmFormFieldType.MultiSelect]: 'Multi-select',
  [AdmissionCrmFormFieldType.Checkbox]: 'Checkbox',
};

const formFieldTypeOptions = Object.values(AdmissionCrmFormFieldType).filter(
  (value): value is AdmissionCrmFormFieldType => typeof value === 'number'
);

const templateSystemFieldOptions = [
  { value: 'FirstName', label: 'Student first name' },
  { value: 'MiddleName', label: 'Student middle name' },
  { value: 'LastName', label: 'Student last name' },
  { value: 'DateOfBirth', label: 'Student date of birth' },
  { value: 'ParentGuardianName', label: 'Parent or guardian name' },
  { value: 'PrimaryContactNo', label: 'Primary contact number' },
  { value: 'Email', label: 'Email' },
  { value: 'AdmissionIntent', label: 'Admission intent' },
  { value: 'TargetStandardId', label: 'Target class' },
  { value: 'DesiredClassName', label: 'Desired class text' },
  { value: 'CampaignName', label: 'Campaign name' },
  { value: 'CampusBranchName', label: 'Campus branch' },
  { value: 'PreferredCommunicationLanguage', label: 'Preferred language' },
];

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

const buildDefaultTemplateFields = (): AdmissionCrmFormFieldDto[] => [
  {
    key: 'studentFirstName',
    label: 'Student first name',
    fieldType: AdmissionCrmFormFieldType.Text,
    systemField: 'FirstName',
    required: true,
    displayOrder: 10,
    options: [],
  },
  {
    key: 'parentPhone',
    label: 'Parent phone',
    fieldType: AdmissionCrmFormFieldType.Phone,
    systemField: 'PrimaryContactNo',
    required: true,
    displayOrder: 20,
    options: [],
  },
  {
    key: 'admissionIntent',
    label: 'Admission intent',
    fieldType: AdmissionCrmFormFieldType.TextArea,
    systemField: 'AdmissionIntent',
    required: true,
    displayOrder: 30,
    options: [],
  },
  {
    key: 'desiredClass',
    label: 'Desired class',
    fieldType: AdmissionCrmFormFieldType.Text,
    systemField: 'DesiredClassName',
    required: true,
    displayOrder: 40,
    options: [],
  },
];

const createDefaultTemplateForm = (): TemplateForm => ({
  templateName: '',
  description: '',
  channel: AdmissionInquiryChannel.SchoolWebsiteForm,
  isPublic: true,
  isActive: true,
  consentText: 'I agree that the school may contact me about this admission inquiry.',
  privacyNoticeUrl: '',
  fields: buildDefaultTemplateFields(),
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

const meritModeLabel: Record<AdmissionCrmMeritRankingMode, string> = {
  [AdmissionCrmMeritRankingMode.MarksThenInquiryDate]: 'Marks, then inquiry date',
  [AdmissionCrmMeritRankingMode.MarksThenLeadScore]: 'Marks, then lead score',
  [AdmissionCrmMeritRankingMode.LeadScoreThenMarks]: 'Lead score, then marks',
};

const routingStrategyLabel: Record<AdmissionCrmLeadRoutingStrategy, string> = {
  [AdmissionCrmLeadRoutingStrategy.FirstMatchingRule]: 'Rule/default owner',
  [AdmissionCrmLeadRoutingStrategy.RoundRobin]: 'Round robin owner pool',
  [AdmissionCrmLeadRoutingStrategy.LeastOpenLeads]: 'Least open leads',
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
};

const leadPriorityLabel: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'No priority',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
};

const leadPriorityOptions = [
  AdmissionCrmLeadPriority.None,
  AdmissionCrmLeadPriority.Hot,
  AdmissionCrmLeadPriority.Warm,
  AdmissionCrmLeadPriority.Cold,
  AdmissionCrmLeadPriority.Low,
];

const readinessOptions = [
  { value: AdmissionCrmExamReadinessField.Contact, label: 'Contact' },
  { value: AdmissionCrmExamReadinessField.AdmissionIntent, label: 'Admission intent' },
  { value: AdmissionCrmExamReadinessField.DesiredClass, label: 'Desired class' },
  { value: AdmissionCrmExamReadinessField.StudentName, label: 'Student name' },
  { value: AdmissionCrmExamReadinessField.ParentGuardianName, label: 'Parent name' },
  { value: AdmissionCrmExamReadinessField.InquirySource, label: 'Inquiry source' },
];

const scoringRuleFields: Array<{ field: keyof AdmissionCrmLeadScoringRulesDto; label: string }> = [
  { field: 'baseScore', label: 'Base' },
  { field: 'bothContactChannelsScore', label: 'Phone + email' },
  { field: 'parentGuardianScore', label: 'Parent name' },
  { field: 'desiredClassScore', label: 'Desired class' },
  { field: 'campaignScore', label: 'Campaign' },
  { field: 'manualBackOfficeChannelScore', label: 'Manual' },
  { field: 'quickCallEntryChannelScore', label: 'Quick call' },
  { field: 'walkInReceptionChannelScore', label: 'Walk-in' },
  { field: 'schoolWebsiteFormChannelScore', label: 'Website' },
  { field: 'whatsAppInquiryChannelScore', label: 'WhatsApp' },
  { field: 'staffSharedLinkChannelScore', label: 'Staff link' },
  { field: 'qrCodeScanChannelScore', label: 'QR scan' },
  { field: 'campaignLinkChannelScore', label: 'Campaign link' },
  { field: 'examPassScore', label: 'Exam pass' },
  { field: 'examFailPenalty', label: 'Exam fail' },
  { field: 'highPerformanceScore', label: 'High score' },
  { field: 'highPerformancePercentage', label: 'High score %' },
  { field: 'maxScore', label: 'Max' },
];

const messageChannelLabel: Record<AdmissionCrmMessageChannel, string> = {
  [AdmissionCrmMessageChannel.WhatsApp]: 'WhatsApp',
  [AdmissionCrmMessageChannel.Sms]: 'SMS',
  [AdmissionCrmMessageChannel.Email]: 'Email',
};

const messageStatusLabel: Record<AdmissionCrmMessageTemplateStatus, string> = {
  [AdmissionCrmMessageTemplateStatus.Draft]: 'Draft',
  [AdmissionCrmMessageTemplateStatus.Approved]: 'Approved',
  [AdmissionCrmMessageTemplateStatus.Retired]: 'Retired',
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
  notes: configuration.notes || '',
});

const AdmissionsCrmConfiguration = ({
  academicYearId,
  admissionsCrmConfigurationDialog,
  focusSection = 'journey',
  focusPanel,
}: AdmissionsCrmConfigurationProps) => {
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
  const [updateSchoolDefaultCycle, { isLoading: isUpdatingSchoolDefaultCycle }] =
    useUpdateAdmissionCrmSchoolDefaultCycleConfigurationMutation();
  const [updatePipelineStage, { isLoading: isUpdatingPipelineStage }] =
    useUpdateAdmissionCrmPipelineStageMutation();
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
    : createDefaultTemplateForm();
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
      setTemplateForm(createDefaultTemplateForm());
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
      shikshaMitraToast.error({ message: 'Cycle name is required.' });
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

    try {
      await updateCycle({
        academicYearId,
        body: buildCycleUpdatePayload(journeyRules),
      }).unwrap();
      shikshaMitraToast.success({ message: 'Admission cycle updated.' });
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to update admission cycle.');
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

    try {
      await updatePipelineStage({
        stageId,
        body: {
          stageName: stageForm.stageName,
          displayOrder: stageForm.displayOrder,
          isEnabled: stageForm.isEnabled,
          colorHex,
          slaTargetHours,
          ownerResponsibility: stageForm.ownerResponsibility.trim(),
          allowedNextStages: stageForm.allowedNextStages,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Pipeline stage updated.' });
    } catch (error) {
      const message = getSettingsErrorMessage(error, 'Unable to update pipeline stage.');
      shikshaMitraToast.error({ message });
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
    field: 'statusPath' | 'statusDetailsPath' | 'providerMessageIdPath' | 'callbackSecretPath',
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
          settings: JSON.parse(providerForm?.settingsJson || '{}'),
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

  if (isInitialLoading) {
    return <LinearProgress aria-label="Loading Enrollment settings" />;
  }

  if (hasActiveQueryError) {
    return (
      <Alert
        severity="error"
        action={
          <LoadingButton size="small" color="inherit" onClick={retryActiveQueries}>
            Retry
          </LoadingButton>
        }
      >
        This settings panel could not be loaded completely.
      </Alert>
    );
  }

  return (
    <Box sx={{ display: 'grid', gap: 1.5 }}>
      {isFetching && <LinearProgress />}

      {!academicYearId && (
        <Paper variant="outlined" sx={{ p: 2, borderRadius: 1 }}>
          <Typography variant="body2" color="text.secondary">
            Select an academic year to configure admissions CRM.
          </Typography>
        </Paper>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr)',
          gap: 1.5,
        }}
      >
        {focusSection === 'journey' && (!focusPanel || focusPanel === 'cycle') && (
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
            <Stack spacing={1.25}>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} justifyContent="space-between">
                <Box>
                  <Typography component="h2" variant="subtitle1">
                    Admission Cycle
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    School defaults can be applied to the current form or saved from it.
                  </Typography>
                </Box>
                <Stack direction="row" gap={1} flexWrap="wrap">
                  <LoadingButton
                    size="small"
                    variant="outlined"
                    loading={isSchoolDefaultCycleFetching}
                    disabled={
                      !schoolDefaultCycle || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                    }
                    onClick={handleApplySchoolDefaultCycle}
                  >
                    Apply Default
                  </LoadingButton>
                  <LoadingButton
                    size="small"
                    variant="outlined"
                    loading={isUpdatingSchoolDefaultCycle}
                    disabled={isUpdatingCycle}
                    onClick={handleSaveSchoolDefaultCycle}
                  >
                    Save As Default
                  </LoadingButton>
                </Stack>
              </Stack>
              <Divider />
              <TextField
                size="small"
                label="Cycle name"
                value={cycleForm.cycleName}
                disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                onChange={(event) => handleCycleChange('cycleName', event.target.value)}
              />
              <Typography variant="subtitle2">SLA working calendar</Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  label="Time zone"
                  value={cycleForm.slaPolicy.timeZoneId}
                  onChange={(event) =>
                    setCycleForm((current) => ({
                      ...current,
                      slaPolicy: { ...current.slaPolicy, timeZoneId: event.target.value },
                    }))
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Working day starts"
                  inputProps={{ min: 0, max: 23 }}
                  value={cycleForm.slaPolicy.workingDayStartHour}
                  onChange={(event) =>
                    setCycleForm((current) => ({
                      ...current,
                      slaPolicy: {
                        ...current.slaPolicy,
                        workingDayStartHour: Number(event.target.value),
                      },
                    }))
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Working day ends"
                  inputProps={{ min: 1, max: 24 }}
                  value={cycleForm.slaPolicy.workingDayEndHour}
                  onChange={(event) =>
                    setCycleForm((current) => ({
                      ...current,
                      slaPolicy: {
                        ...current.slaPolicy,
                        workingDayEndHour: Number(event.target.value),
                      },
                    }))
                  }
                />
              </Stack>
              <Stack direction="row" gap={0.5} flexWrap="wrap">
                {slaWorkingDayOptions.map((day) => (
                  <FormControlLabel
                    key={day.value}
                    label={day.label}
                    control={
                      <Checkbox
                        size="small"
                        checked={cycleForm.slaPolicy.workingDays.includes(day.value)}
                        onChange={(event) =>
                          setCycleForm((current) => ({
                            ...current,
                            slaPolicy: {
                              ...current.slaPolicy,
                              workingDays: event.target.checked
                                ? [...current.slaPolicy.workingDays, day.value]
                                : current.slaPolicy.workingDays.filter(
                                    (value) => value !== day.value
                                  ),
                            },
                          }))
                        }
                      />
                    }
                  />
                ))}
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  label="Holidays"
                  helperText="Comma-separated dates in YYYY-MM-DD format"
                  value={cycleForm.slaPolicy.holidays.join(', ')}
                  onChange={(event) =>
                    setCycleForm((current) => ({
                      ...current,
                      slaPolicy: {
                        ...current.slaPolicy,
                        holidays: event.target.value
                          .split(',')
                          .map((value) => value.trim())
                          .filter(Boolean),
                      },
                    }))
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Escalate after additional hours"
                  inputProps={{ min: 0, max: 720 }}
                  value={cycleForm.slaPolicy.escalationAfterHours}
                  onChange={(event) =>
                    setCycleForm((current) => ({
                      ...current,
                      slaPolicy: {
                        ...current.slaPolicy,
                        escalationAfterHours: Number(event.target.value),
                      },
                    }))
                  }
                />
                <FormControl fullWidth size="small">
                  <InputLabel>Escalation owner</InputLabel>
                  <Select
                    label="Escalation owner"
                    inputProps={{ 'aria-label': 'Escalation owner' }}
                    value={cycleForm.slaPolicy.escalationOwnerUserId || ''}
                    onChange={(event) =>
                      setCycleForm((current) => ({
                        ...current,
                        slaPolicy: {
                          ...current.slaPolicy,
                          escalationOwnerUserId: event.target.value || null,
                        },
                      }))
                    }
                  >
                    <MenuItem value="">Lead owner</MenuItem>
                    {ownerOptions.map((owner) => (
                      <MenuItem key={owner.id} value={owner.id}>
                        {getCrmUserOptionLabel(owner)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Lead SLA hours"
                  value={cycleForm.defaultLeadSlaHours}
                  disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                  onChange={(event) =>
                    handleCycleChange('defaultLeadSlaHours', Number(event.target.value))
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Passing %"
                  value={cycleForm.defaultExamPassingPercentage}
                  disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                  onChange={(event) =>
                    handleCycleChange('defaultExamPassingPercentage', Number(event.target.value))
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Activation cancellation window (days)"
                  inputProps={{ min: 0, max: 90 }}
                  value={cycleForm.activationCancellationWindowDays}
                  disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                  onChange={(event) =>
                    handleCycleChange(
                      'activationCancellationWindowDays',
                      Number(event.target.value)
                    )
                  }
                />
              </Stack>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Stale after days"
                  value={cycleForm.staleAfterDays}
                  disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                  onChange={(event) =>
                    handleCycleChange('staleAfterDays', Number(event.target.value))
                  }
                />
                <TextField
                  fullWidth
                  size="small"
                  type="number"
                  label="Archive after days"
                  value={cycleForm.archiveAfterDays}
                  disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                  onChange={(event) =>
                    handleCycleChange('archiveAfterDays', Number(event.target.value))
                  }
                />
              </Stack>
              <FormControl fullWidth size="small">
                <InputLabel>Merit ranking</InputLabel>
                <Select
                  label="Merit ranking"
                  inputProps={{ 'aria-label': 'Merit ranking' }}
                  value={cycleForm.meritRankingMode}
                  disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                  onChange={(event) =>
                    handleCycleChange(
                      'meritRankingMode',
                      Number(event.target.value) as AdmissionCrmMeritRankingMode
                    )
                  }
                >
                  {Object.entries(meritModeLabel).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={cycleForm.isActive}
                      disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                      onChange={(event) => handleCycleChange('isActive', event.target.checked)}
                    />
                  }
                  label="Active"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={cycleForm.registrationFormRequiredBeforeExam}
                      disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                      onChange={(event) =>
                        handleCycleChange(
                          'registrationFormRequiredBeforeExam',
                          event.target.checked
                        )
                      }
                    />
                  }
                  label="Registration before exam"
                />
              </Stack>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2">Exam readiness</Typography>
                <Stack direction="row" gap={0.5} flexWrap="wrap">
                  {readinessOptions.map((option) => (
                    <FormControlLabel
                      key={option.value}
                      sx={{ mr: 1 }}
                      control={
                        <Checkbox
                          size="small"
                          checked={(cycleForm.examReadinessFields & option.value) === option.value}
                          disabled={
                            !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                          }
                          onChange={() => handleCycleReadinessToggle(option.value)}
                        />
                      }
                      label={option.label}
                    />
                  ))}
                </Stack>
              </Stack>
              <Stack spacing={0.75}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  justifyContent="space-between"
                  gap={1}
                  alignItems={{ sm: 'center' }}
                >
                  <Box>
                    <Typography variant="subtitle2">Applicant checklist</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Show required and optional items on the secure status link.
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={!academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle}
                    onClick={handleAddApplicantChecklistItem}
                  >
                    Add Item
                  </Button>
                </Stack>
                <Box sx={{ display: 'grid', gap: 1 }}>
                  {cycleForm.applicantChecklist.map((item, index) => (
                    <Box
                      key={`${item.key}-${index}`}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1,
                        display: 'grid',
                        gap: 1,
                      }}
                    >
                      <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Label"
                          value={item.label}
                          disabled={
                            !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                          }
                          onChange={(event) =>
                            handleApplicantChecklistChange(index, 'label', event.target.value)
                          }
                        />
                        <TextField
                          fullWidth
                          size="small"
                          label="Key"
                          value={item.key}
                          disabled={
                            !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                          }
                          onChange={(event) =>
                            handleApplicantChecklistChange(index, 'key', event.target.value)
                          }
                        />
                      </Stack>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        gap={1}
                        alignItems={{ md: 'center' }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Details"
                          value={item.details ?? ''}
                          disabled={
                            !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                          }
                          onChange={(event) =>
                            handleApplicantChecklistChange(index, 'details', event.target.value)
                          }
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Order"
                          value={item.displayOrder}
                          disabled={
                            !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                          }
                          onChange={(event) =>
                            handleApplicantChecklistChange(
                              index,
                              'displayOrder',
                              Number(event.target.value)
                            )
                          }
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={item.isRequired}
                              disabled={
                                !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                              }
                              onChange={(event) =>
                                handleApplicantChecklistChange(
                                  index,
                                  'isRequired',
                                  event.target.checked
                                )
                              }
                            />
                          }
                          label="Required"
                        />
                        <Button
                          size="small"
                          color="error"
                          disabled={
                            !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                          }
                          onClick={() => handleRemoveApplicantChecklistItem(index)}
                        >
                          Remove
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                  {!cycleForm.applicantChecklist.length && (
                    <Typography variant="body2" color="text.secondary">
                      No applicant checklist items configured
                    </Typography>
                  )}
                </Box>
              </Stack>
              <LoadingButton
                size="small"
                variant="contained"
                loading={isUpdatingCycle}
                disabled={!academicYearId || isUpdatingSchoolDefaultCycle}
                onClick={handleSaveCycle}
                sx={{ alignSelf: 'flex-start' }}
              >
                Save Cycle
              </LoadingButton>
            </Stack>
          </Paper>
        )}

        {focusSection === 'capture' && (!focusPanel || focusPanel === 'capture') && (
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
            <Stack spacing={1.25}>
              <Box>
                <Typography component="h2" variant="subtitle1">
                  Inquiry Channels
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Enable intake channels and set cycle defaults for source, owner, form, and
                  acknowledgement.
                </Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'grid', gap: 1 }}>
                {channelSettings.map((setting) => {
                  const templatesForChannel = formTemplates.filter(
                    (template) => template.channel === setting.channel
                  );
                  const channelFieldId = `inquiry-channel-${setting.channel}`;

                  return (
                    <Box
                      key={setting.channel}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        p: 1,
                        display: 'grid',
                        gap: 1,
                      }}
                    >
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        gap={1}
                        alignItems={{ md: 'center' }}
                        justifyContent="space-between"
                      >
                        <FormControlLabel
                          control={
                            <Switch
                              checked={setting.isEnabled}
                              disabled={
                                !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                              }
                              onChange={(event) =>
                                handleChannelSettingChange(
                                  setting.channel,
                                  'isEnabled',
                                  event.target.checked
                                )
                              }
                            />
                          }
                          label={getAdmissionCrmChannelLabel(setting.channel)}
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Display order"
                          value={setting.displayOrder}
                          disabled={
                            !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                          }
                          onChange={(event) =>
                            handleChannelSettingChange(
                              setting.channel,
                              'displayOrder',
                              Number(event.target.value)
                            )
                          }
                          sx={{ width: { xs: '100%', md: 140 } }}
                        />
                      </Stack>
                      <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`${channelFieldId}-source-label`}>
                            Default Inquiry Source
                          </InputLabel>
                          <Select
                            id={`${channelFieldId}-source`}
                            labelId={`${channelFieldId}-source-label`}
                            label="Default Inquiry Source"
                            value={setting.defaultInquirySourceId ?? ''}
                            disabled={
                              !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                            }
                            onChange={(event) =>
                              handleChannelSettingChange(
                                setting.channel,
                                'defaultInquirySourceId',
                                event.target.value || null
                              )
                            }
                          >
                            <MenuItem value="">No default source</MenuItem>
                            {inquirySourceOptions.map((source) => (
                              <MenuItem key={source.id} value={source.id}>
                                {source.displayName || source.preferenceName}
                                {source.isActive === false ? ' (Inactive)' : ''}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`${channelFieldId}-owner-label`}>
                            Default owner
                          </InputLabel>
                          <Select
                            id={`${channelFieldId}-owner`}
                            labelId={`${channelFieldId}-owner-label`}
                            label="Default owner"
                            value={setting.defaultOwnerUserId ?? ''}
                            disabled={
                              !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                            }
                            onChange={(event) =>
                              handleChannelSettingChange(
                                setting.channel,
                                'defaultOwnerUserId',
                                event.target.value || null
                              )
                            }
                          >
                            <MenuItem value="">No default owner</MenuItem>
                            {ownerOptions.map((owner) => (
                              <MenuItem key={owner.id} value={owner.id}>
                                {getCrmUserOptionLabel(owner)}
                                {owner.isActive === false ? ' (Inactive)' : ''}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                      <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`${channelFieldId}-form-label`}>
                            Default form template
                          </InputLabel>
                          <Select
                            id={`${channelFieldId}-form`}
                            labelId={`${channelFieldId}-form-label`}
                            label="Default form template"
                            value={setting.defaultFormTemplateId ?? ''}
                            disabled={
                              !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                            }
                            onChange={(event) =>
                              handleChannelSettingChange(
                                setting.channel,
                                'defaultFormTemplateId',
                                event.target.value || null
                              )
                            }
                          >
                            <MenuItem value="">No default form</MenuItem>
                            {templatesForChannel.map((template) => (
                              <MenuItem key={template.id} value={template.id}>
                                {template.templateName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                        <FormControl fullWidth size="small">
                          <InputLabel id={`${channelFieldId}-acknowledgement-label`}>
                            Acknowledgement template
                          </InputLabel>
                          <Select
                            id={`${channelFieldId}-acknowledgement`}
                            labelId={`${channelFieldId}-acknowledgement-label`}
                            label="Acknowledgement template"
                            value={setting.defaultAcknowledgementTemplateId ?? ''}
                            disabled={
                              !academicYearId || isUpdatingCycle || isUpdatingSchoolDefaultCycle
                            }
                            onChange={(event) =>
                              handleChannelSettingChange(
                                setting.channel,
                                'defaultAcknowledgementTemplateId',
                                event.target.value || null
                              )
                            }
                          >
                            <MenuItem value="">No acknowledgement template</MenuItem>
                            {approvedMessageTemplates.map((template) => (
                              <MenuItem key={template.id} value={template.id}>
                                {template.templateName}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
              <LoadingButton
                size="small"
                variant="contained"
                loading={isUpdatingCycle}
                disabled={!academicYearId || isUpdatingSchoolDefaultCycle}
                onClick={handleSaveCycle}
                sx={{ alignSelf: 'flex-start' }}
              >
                Save Channels
              </LoadingButton>
            </Stack>
          </Paper>
        )}

        {focusSection === 'journey' && (!focusPanel || focusPanel === 'pipeline') && (
          <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
            <Stack spacing={1.25}>
              <Box>
                <Typography component="h2" variant="subtitle1">
                  Applicant Stages
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep the standard journey recognizable while tailoring names, service targets,
                  ownership, and the next steps staff can select.
                </Typography>
              </Box>
              <Alert severity="info">
                Exam scheduling, results, eligibility, and stale or archive actions update their
                related stages through the corresponding workflow. These stage settings control
                presentation and permitted staff transitions; they do not replace those operational
                actions.
              </Alert>
              <Divider />
              <Box sx={{ display: 'grid', gap: 1 }}>
                {stages.map((stage) => {
                  const stageForm = stageForms[stage.id] ?? buildPipelineStageFormFromStage(stage);
                  const stageColor =
                    stageForm.colorHex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(stageForm.colorHex)
                      ? stageForm.colorHex
                      : 'transparent';

                  return (
                    <Accordion
                      key={stage.id}
                      disableGutters
                      elevation={0}
                      sx={{
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 1,
                        '&:before': { display: 'none' },
                        '&.Mui-expanded': { m: 0 },
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMore />}
                        aria-controls={`applicant-stage-${stage.id}-content`}
                        id={`applicant-stage-${stage.id}-header`}
                        sx={{
                          px: 1.25,
                          minHeight: 56,
                          '& .MuiAccordionSummary-content': { my: 1 },
                        }}
                      >
                        <Stack
                          direction={{ xs: 'column', sm: 'row' }}
                          justifyContent="space-between"
                          alignItems={{ xs: 'flex-start', sm: 'center' }}
                          gap={1}
                          sx={{ width: '100%', pr: 1 }}
                        >
                          <Stack direction="row" gap={1} alignItems="center" sx={{ minWidth: 0 }}>
                            <Box
                              sx={{
                                width: 18,
                                height: 18,
                                borderRadius: 0.5,
                                border: 1,
                                borderColor: 'divider',
                                bgcolor: stageColor,
                                flexShrink: 0,
                              }}
                            />
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" noWrap>
                                {stageForm.stageName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                Order {stageForm.displayOrder}
                                {stageForm.slaTargetHours
                                  ? ` - ${stageForm.slaTargetHours} hour target`
                                  : ' - No service target'}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" gap={0.5} flexWrap="wrap">
                            <Chip
                              size="small"
                              label={stage.isSystem ? 'Core stage' : 'School stage'}
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={stageForm.isEnabled ? 'Enabled' : 'Disabled'}
                              color={stageForm.isEnabled ? 'primary' : 'default'}
                              sx={
                                stageForm.isEnabled
                                  ? { bgcolor: 'primary.darker', color: 'common.white' }
                                  : undefined
                              }
                            />
                          </Stack>
                        </Stack>
                      </AccordionSummary>
                      <AccordionDetails
                        id={`applicant-stage-${stage.id}-content`}
                        sx={{ px: 1.25, pt: 0, pb: 1.25 }}
                      >
                        <Stack spacing={1}>
                          <Divider />
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr' },
                              gap: 1,
                            }}
                          >
                            <TextField
                              size="small"
                              label="Stage name"
                              value={stageForm.stageName}
                              disabled={isUpdatingPipelineStage}
                              onChange={(event) =>
                                handleStageChange(stage.id, 'stageName', event.target.value)
                              }
                            />
                            <TextField
                              size="small"
                              type="number"
                              label="Display order"
                              value={stageForm.displayOrder}
                              disabled={isUpdatingPipelineStage}
                              onChange={(event) =>
                                handleStageChange(
                                  stage.id,
                                  'displayOrder',
                                  Number(event.target.value)
                                )
                              }
                            />
                            <TextField
                              size="small"
                              label="Color hex"
                              placeholder="#1976D2"
                              value={stageForm.colorHex}
                              disabled={isUpdatingPipelineStage}
                              inputProps={{ maxLength: 16 }}
                              onChange={(event) =>
                                handleStageChange(stage.id, 'colorHex', event.target.value)
                              }
                            />
                          </Box>
                          <Box
                            sx={{
                              display: 'grid',
                              gridTemplateColumns: { xs: '1fr', md: '1fr 2fr' },
                              gap: 1,
                            }}
                          >
                            <TextField
                              size="small"
                              type="number"
                              label="Service target (hours)"
                              value={stageForm.slaTargetHours}
                              disabled={isUpdatingPipelineStage}
                              onChange={(event) =>
                                handleStageChange(stage.id, 'slaTargetHours', event.target.value)
                              }
                            />
                            <TextField
                              size="small"
                              label="Typical owner and responsibility"
                              value={stageForm.ownerResponsibility}
                              disabled={isUpdatingPipelineStage}
                              inputProps={{ maxLength: 500 }}
                              onChange={(event) =>
                                handleStageChange(
                                  stage.id,
                                  'ownerResponsibility',
                                  event.target.value
                                )
                              }
                            />
                          </Box>
                          <FormControl size="small" disabled={isUpdatingPipelineStage}>
                            <InputLabel id={`allowed-next-stages-${stage.id}`}>
                              Staff can move applicants to
                            </InputLabel>
                            <Select
                              multiple
                              displayEmpty
                              labelId={`allowed-next-stages-${stage.id}`}
                              label="Staff can move applicants to"
                              SelectDisplayProps={{
                                'aria-label': `Allowed next stages for ${stageForm.stageName}`,
                              }}
                              value={stageForm.allowedNextStages}
                              renderValue={(selected) =>
                                selected.length
                                  ? selected
                                      .map((value) =>
                                        getAdmissionCrmStageLabel(value as AdmissionInquiryStage)
                                      )
                                      .join(', ')
                                  : 'No manual next stage'
                              }
                              onChange={(event) => {
                                const { value } = event.target;
                                const selectedValues = Array.isArray(value)
                                  ? value.map(Number)
                                  : String(value).split(',').filter(Boolean).map(Number);
                                handleStageChange(
                                  stage.id,
                                  'allowedNextStages',
                                  selectedValues as AdmissionInquiryStage[]
                                );
                              }}
                            >
                              {pipelineStageOptions
                                .filter((option) => option !== stage.systemStage)
                                .map((option) => (
                                  <MenuItem key={option} value={option}>
                                    <Checkbox
                                      checked={stageForm.allowedNextStages.includes(option)}
                                    />
                                    {getAdmissionCrmStageLabel(option)}
                                  </MenuItem>
                                ))}
                            </Select>
                          </FormControl>
                          <Stack
                            direction={{ xs: 'column', sm: 'row' }}
                            justifyContent="space-between"
                            gap={1}
                            alignItems={{ sm: 'center' }}
                          >
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={stageForm.isEnabled}
                                  disabled={isUpdatingPipelineStage}
                                  onChange={(event) =>
                                    handleStageChange(stage.id, 'isEnabled', event.target.checked)
                                  }
                                />
                              }
                              label="Available in Enrollment"
                            />
                            <LoadingButton
                              size="small"
                              variant="contained"
                              loading={isUpdatingPipelineStage}
                              onClick={() => handleSaveStage(stage.id)}
                            >
                              Save Stage
                            </LoadingButton>
                          </Stack>
                        </Stack>
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
                {!stages.length && (
                  <Typography variant="body2" color="text.secondary">
                    No stages configured
                  </Typography>
                )}
              </Box>
            </Stack>
          </Paper>
        )}
      </Box>

      {focusSection === 'routing' && (!focusPanel || focusPanel === 'scoring') && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1.25}>
            <Typography component="h2" variant="subtitle1">
              Lead Scoring
            </Typography>
            <Divider />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr 1fr', md: 'repeat(6, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              {scoringRuleFields.map((option) => (
                <TextField
                  key={option.field}
                  size="small"
                  type="number"
                  label={option.label}
                  value={cycleForm.leadScoringRules[option.field]}
                  disabled={!academicYearId || isUpdatingCycle}
                  onChange={(event) =>
                    handleScoringRuleChange(option.field, Number(event.target.value))
                  }
                />
              ))}
            </Box>
            <LoadingButton
              size="small"
              variant="contained"
              loading={isUpdatingCycle}
              disabled={!academicYearId}
              onClick={handleSaveCycle}
              sx={{ alignSelf: 'flex-start' }}
            >
              Save Scoring
            </LoadingButton>
          </Stack>
        </Paper>
      )}

      {focusSection === 'routing' && (!focusPanel || focusPanel === 'routing') && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
              <Typography component="h2" variant="subtitle1">
                Lead Routing
              </Typography>
              <Button size="small" variant="outlined" onClick={handleAddRoutingRule}>
                Add Rule
              </Button>
            </Stack>
            <Divider />
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1} alignItems={{ md: 'center' }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={cycleForm.leadRoutingSettings.isEnabled}
                    disabled={!academicYearId || isUpdatingCycle}
                    onChange={(event) =>
                      handleRoutingSettingsChange('isEnabled', event.target.checked)
                    }
                  />
                }
                label="Enabled"
              />
              <FormControl fullWidth size="small">
                <InputLabel>Default owner</InputLabel>
                <Select
                  label="Default owner"
                  value={cycleForm.leadRoutingSettings.defaultOwnerUserId ?? ''}
                  disabled={!academicYearId || isUpdatingCycle}
                  onChange={(event) =>
                    handleRoutingSettingsChange('defaultOwnerUserId', event.target.value || null)
                  }
                >
                  <MenuItem value="">No default owner</MenuItem>
                  {ownerOptions.map((owner) => (
                    <MenuItem key={owner.id} value={owner.id}>
                      {getCrmUserOptionLabel(owner)}
                      {owner.isActive === false ? ' (Inactive)' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
              <FormControl fullWidth size="small">
                <InputLabel>Routing strategy</InputLabel>
                <Select
                  label="Routing strategy"
                  value={cycleForm.leadRoutingSettings.routingStrategy}
                  disabled={!academicYearId || isUpdatingCycle}
                  onChange={(event) =>
                    handleRoutingSettingsChange(
                      'routingStrategy',
                      Number(event.target.value) as AdmissionCrmLeadRoutingStrategy
                    )
                  }
                >
                  {Object.entries(routingStrategyLabel).map(([value, label]) => (
                    <MenuItem key={value} value={Number(value)}>
                      {label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Autocomplete
                multiple
                fullWidth
                size="small"
                limitTags={2}
                options={ownerOptions.filter((owner) => owner.isActive !== false)}
                value={(cycleForm.leadRoutingSettings.ownerPoolUserIds ?? [])
                  .map((id) => ownerOptions.find((owner) => owner.id === id))
                  .filter((owner): owner is (typeof ownerOptions)[number] => Boolean(owner))}
                inputValue={staffSearch}
                onInputChange={(_, value) => setStaffSearch(value)}
                onChange={(_, selected) =>
                  handleRoutingSettingsChange(
                    'ownerPoolUserIds',
                    selected.map((owner) => owner.id)
                  )
                }
                disabled={!academicYearId || isUpdatingCycle}
                loading={isUsersFetching}
                getOptionLabel={getCrmUserOptionLabel}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Pipeline owners"
                    helperText="Only active HR employees with Enrollment CRM access are available."
                  />
                )}
              />
            </Stack>
            <Box sx={{ display: 'grid', gap: 1 }}>
              {cycleForm.leadRoutingSettings.rules.map((rule, index) => (
                <Box
                  key={`${rule.ruleName}-${index}`}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                    display: 'grid',
                    gap: 1,
                  }}
                >
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Rule name"
                      value={rule.ruleName}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleRoutingRuleChange(index, 'ruleName', event.target.value)
                      }
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Priority"
                      value={rule.priority}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleRoutingRuleChange(index, 'priority', Number(event.target.value))
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.isEnabled}
                          disabled={!academicYearId || isUpdatingCycle}
                          onChange={(event) =>
                            handleRoutingRuleChange(index, 'isEnabled', event.target.checked)
                          }
                        />
                      }
                      label="Enabled"
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Channel</InputLabel>
                      <Select
                        label="Channel"
                        value={rule.channel ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleRoutingRuleChange(
                            index,
                            'channel',
                            String(event.target.value) === ''
                              ? null
                              : (Number(event.target.value) as AdmissionInquiryChannel)
                          )
                        }
                      >
                        <MenuItem value="">Any channel</MenuItem>
                        {inquiryChannelOptions.map((channel) => (
                          <MenuItem key={channel} value={channel}>
                            {getAdmissionCrmChannelLabel(channel)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Owner</InputLabel>
                      <Select
                        label="Owner"
                        value={rule.ownerUserId ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleRoutingRuleChange(index, 'ownerUserId', event.target.value || null)
                        }
                      >
                        <MenuItem value="">No owner</MenuItem>
                        {ownerOptions.map((owner) => (
                          <MenuItem key={owner.id} value={owner.id}>
                            {getCrmUserOptionLabel(owner)}
                            {owner.isActive === false ? ' (Inactive)' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Inquiry Source</InputLabel>
                      <Select
                        label="Inquiry Source"
                        value={rule.inquirySourceId ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleRoutingRuleChange(
                            index,
                            'inquirySourceId',
                            event.target.value || null
                          )
                        }
                      >
                        <MenuItem value="">Any source</MenuItem>
                        {inquirySourceOptions.map((source) => (
                          <MenuItem key={source.id} value={source.id}>
                            {source.displayName || source.preferenceName}
                            {source.isActive === false ? ' (Inactive)' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      size="small"
                      label="Target standard ID"
                      value={rule.targetStandardId ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleRoutingRuleChange(index, 'targetStandardId', event.target.value)
                      }
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Campaign contains"
                      value={rule.campaignContains ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleRoutingRuleChange(index, 'campaignContains', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Class contains"
                      value={rule.desiredClassContains ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleRoutingRuleChange(index, 'desiredClassContains', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Branch contains"
                      value={rule.campusBranchContains ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleRoutingRuleChange(index, 'campusBranchContains', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Language contains"
                      value={rule.preferredLanguageContains ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleRoutingRuleChange(
                          index,
                          'preferredLanguageContains',
                          event.target.value
                        )
                      }
                    />
                    <Button
                      size="small"
                      color="error"
                      disabled={!academicYearId || isUpdatingCycle}
                      onClick={() => handleRemoveRoutingRule(index)}
                    >
                      Remove
                    </Button>
                  </Stack>
                </Box>
              ))}
              {!cycleForm.leadRoutingSettings.rules.length && (
                <Typography variant="body2" color="text.secondary">
                  No routing rules configured
                </Typography>
              )}
            </Box>
            <LoadingButton
              size="small"
              variant="contained"
              loading={isUpdatingCycle}
              disabled={!academicYearId}
              onClick={handleSaveCycle}
              sx={{ alignSelf: 'flex-start' }}
            >
              Save Routing
            </LoadingButton>
          </Stack>
        </Paper>
      )}

      {focusSection === 'automation' && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
              <Typography component="h2" variant="subtitle1">
                Journey Automation
              </Typography>
              <Button size="small" variant="outlined" onClick={handleAddJourneyRule}>
                Add Rule
              </Button>
            </Stack>
            <Divider />
            <Box sx={{ display: 'grid', gap: 1 }}>
              {cycleForm.journeyRules.map((rule, index) => (
                <Box
                  key={`${rule.ruleName}-${index}`}
                  sx={{
                    border: 1,
                    borderColor: 'divider',
                    borderRadius: 1,
                    p: 1,
                    display: 'grid',
                    gap: 1,
                  }}
                >
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Rule name"
                      value={rule.ruleName}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleJourneyRuleChange(index, 'ruleName', event.target.value)
                      }
                    />
                    <TextField
                      size="small"
                      type="number"
                      label="Priority"
                      value={rule.priority}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleJourneyRuleChange(index, 'priority', Number(event.target.value))
                      }
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.isEnabled}
                          disabled={!academicYearId || isUpdatingCycle}
                          onChange={(event) =>
                            handleJourneyRuleChange(index, 'isEnabled', event.target.checked)
                          }
                        />
                      }
                      label="Enabled"
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Trigger</InputLabel>
                      <Select
                        label="Trigger"
                        value={rule.trigger}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleJourneyRuleChange(
                            index,
                            'trigger',
                            Number(event.target.value) as AdmissionCrmJourneyTrigger
                          )
                        }
                      >
                        {Object.entries(journeyTriggerLabel).map(([value, label]) => (
                          <MenuItem key={value} value={Number(value)}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    {rule.trigger === AdmissionCrmJourneyTrigger.StageReached && (
                      <FormControl fullWidth size="small">
                        <InputLabel>Pipeline stage</InputLabel>
                        <Select
                          label="Pipeline stage"
                          value={rule.stage ?? ''}
                          disabled={!academicYearId || isUpdatingCycle}
                          onChange={(event) =>
                            handleJourneyRuleChange(
                              index,
                              'stage',
                              String(event.target.value) === ''
                                ? null
                                : (Number(event.target.value) as AdmissionInquiryStage)
                            )
                          }
                        >
                          <MenuItem value="">Select stage</MenuItem>
                          {stages.map((stage) => (
                            <MenuItem key={stage.id} value={stage.systemStage}>
                              {stage.stageName || getAdmissionCrmStageLabel(stage.systemStage)}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    <Button
                      size="small"
                      color="error"
                      disabled={!academicYearId || isUpdatingCycle}
                      onClick={() => handleRemoveJourneyRule(index)}
                      sx={{ alignSelf: { md: 'center' } }}
                    >
                      Remove
                    </Button>
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Channel condition</InputLabel>
                      <Select
                        label="Channel condition"
                        value={rule.channel ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleJourneyRuleChange(
                            index,
                            'channel',
                            String(event.target.value) === ''
                              ? null
                              : (Number(event.target.value) as AdmissionInquiryChannel)
                          )
                        }
                      >
                        <MenuItem value="">Any channel</MenuItem>
                        {inquiryChannelOptions.map((channel) => (
                          <MenuItem key={channel} value={channel}>
                            {getAdmissionCrmChannelLabel(channel)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Inquiry Source condition</InputLabel>
                      <Select
                        label="Inquiry Source condition"
                        value={rule.inquirySourceId ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleJourneyRuleChange(
                            index,
                            'inquirySourceId',
                            event.target.value || null
                          )
                        }
                      >
                        <MenuItem value="">Any source</MenuItem>
                        {inquirySourceOptions.map((source) => (
                          <MenuItem key={source.id} value={source.id}>
                            {source.displayName || source.preferenceName}
                            {source.isActive === false ? ' (Inactive)' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Current stage condition</InputLabel>
                      <Select
                        label="Current stage condition"
                        value={rule.leadStage ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleJourneyRuleChange(
                            index,
                            'leadStage',
                            String(event.target.value) === ''
                              ? null
                              : (Number(event.target.value) as AdmissionInquiryStage)
                          )
                        }
                      >
                        <MenuItem value="">Any current stage</MenuItem>
                        {stages.map((stage) => (
                          <MenuItem key={stage.id} value={stage.systemStage}>
                            {stage.stageName || getAdmissionCrmStageLabel(stage.systemStage)}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <FormControl fullWidth size="small">
                      <InputLabel>Owner condition</InputLabel>
                      <Select
                        label="Owner condition"
                        value={rule.ownerUserId ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleJourneyRuleChange(index, 'ownerUserId', event.target.value || null)
                        }
                      >
                        <MenuItem value="">Any owner</MenuItem>
                        {ownerOptions.map((owner) => (
                          <MenuItem key={owner.id} value={owner.id}>
                            {getCrmUserOptionLabel(owner)}
                            {owner.isActive === false ? ' (Inactive)' : ''}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <TextField
                      fullWidth
                      size="small"
                      label="Campaign contains"
                      value={rule.campaignContains ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleJourneyRuleChange(index, 'campaignContains', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Min lead score"
                      value={rule.minimumLeadScore ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleJourneyRuleChange(
                          index,
                          'minimumLeadScore',
                          event.target.value === '' ? null : Number(event.target.value)
                        )
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Max lead score"
                      value={rule.maximumLeadScore ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleJourneyRuleChange(
                          index,
                          'maximumLeadScore',
                          event.target.value === '' ? null : Number(event.target.value)
                        )
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Idle days"
                      value={rule.daysSinceLastActivity ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleJourneyRuleChange(
                          index,
                          'daysSinceLastActivity',
                          event.target.value === '' ? null : Number(event.target.value)
                        )
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      type="number"
                      label="Lead age days"
                      value={rule.daysSinceCreation ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleJourneyRuleChange(
                          index,
                          'daysSinceCreation',
                          event.target.value === '' ? null : Number(event.target.value)
                        )
                      }
                    />
                  </Stack>
                  <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <FormControl fullWidth size="small">
                      <InputLabel>Priority condition</InputLabel>
                      <Select
                        label="Priority condition"
                        value={rule.leadPriority ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleJourneyRuleChange(
                            index,
                            'leadPriority',
                            String(event.target.value) === ''
                              ? null
                              : (Number(event.target.value) as AdmissionCrmLeadPriority)
                          )
                        }
                      >
                        <MenuItem value="">Any priority</MenuItem>
                        {leadPriorityOptions.map((priority) => (
                          <MenuItem key={priority} value={priority}>
                            {leadPriorityLabel[priority]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      fullWidth
                      size="small"
                      label="Target standard ID"
                      value={rule.targetStandardId ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleJourneyRuleChange(index, 'targetStandardId', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Desired class contains"
                      value={rule.desiredClassContains ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleJourneyRuleChange(index, 'desiredClassContains', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Branch contains"
                      value={rule.campusBranchContains ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleJourneyRuleChange(index, 'campusBranchContains', event.target.value)
                      }
                    />
                    <TextField
                      fullWidth
                      size="small"
                      label="Language contains"
                      value={rule.preferredLanguageContains ?? ''}
                      disabled={!academicYearId || isUpdatingCycle}
                      onChange={(event) =>
                        handleJourneyRuleChange(
                          index,
                          'preferredLanguageContains',
                          event.target.value
                        )
                      }
                    />
                  </Stack>
                  <Stack
                    direction={{ xs: 'column', md: 'row' }}
                    gap={1}
                    alignItems={{ md: 'center' }}
                  >
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.createTask}
                          disabled={!academicYearId || isUpdatingCycle}
                          onChange={(event) =>
                            handleJourneyRuleChange(index, 'createTask', event.target.checked)
                          }
                        />
                      }
                      label="Create task"
                    />
                    <FormControlLabel
                      control={
                        <Switch
                          checked={rule.sendMessage}
                          disabled={!academicYearId || isUpdatingCycle}
                          onChange={(event) =>
                            handleJourneyRuleChange(index, 'sendMessage', event.target.checked)
                          }
                        />
                      }
                      label="Send message"
                    />
                  </Stack>
                  {rule.createTask && (
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Task title"
                        value={rule.taskTitle ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleJourneyRuleChange(index, 'taskTitle', event.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        type="number"
                        label="Due offset hours"
                        value={rule.taskDueOffsetHours}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleJourneyRuleChange(
                            index,
                            'taskDueOffsetHours',
                            Number(event.target.value)
                          )
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Task notes"
                        value={rule.taskNotes ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleJourneyRuleChange(index, 'taskNotes', event.target.value)
                        }
                      />
                    </Stack>
                  )}
                  {rule.sendMessage && (
                    <FormControl fullWidth size="small">
                      <InputLabel>Message template</InputLabel>
                      <Select
                        label="Message template"
                        value={rule.messageTemplateId ?? ''}
                        disabled={!academicYearId || isUpdatingCycle}
                        onChange={(event) =>
                          handleJourneyRuleChange(
                            index,
                            'messageTemplateId',
                            String(event.target.value) || null
                          )
                        }
                      >
                        <MenuItem value="">Select approved template</MenuItem>
                        {approvedMessageTemplates.map((template) => (
                          <MenuItem key={template.id} value={template.id}>
                            {template.templateName} - {messageChannelLabel[template.channel]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </Box>
              ))}
              {!cycleForm.journeyRules.length && (
                <Typography variant="body2" color="text.secondary">
                  No journey rules configured
                </Typography>
              )}
            </Box>
            <LoadingButton
              size="small"
              variant="contained"
              loading={isUpdatingCycle}
              disabled={!academicYearId}
              onClick={handleSaveCycle}
              sx={{ alignSelf: 'flex-start' }}
            >
              Save Journeys
            </LoadingButton>
          </Stack>
        </Paper>
      )}

      {focusSection === 'capture' && (!focusPanel || focusPanel === 'forms') && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
              <Typography component="h2" variant="subtitle1">
                Form Templates
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {templates?.totalCount || 0} templates
              </Typography>
            </Stack>
            <Divider />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              {(templates?.items || []).map((template) => (
                <Paper key={template.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
                        {template.templateName}
                      </Typography>
                      <Chip
                        size="small"
                        label={template.isActive ? 'Active' : 'Inactive'}
                        color={template.isActive ? 'success' : 'default'}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {getAdmissionCrmChannelLabel(template.channel)}
                      {template.isPublic ? ' - Public' : ' - Internal'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {template.fields.length} fields
                    </Typography>
                    <Stack direction="row" gap={0.75} flexWrap="wrap">
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={isCreatingTemplate || isUpdatingTemplate}
                        onClick={() => handleOpenEditTemplate(template)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        variant="outlined"
                        disabled={isUpdatingTemplateStatus}
                        onClick={() => handleToggleTemplateStatus(template.id, template.isActive)}
                      >
                        {template.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      {template.isPublic && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopy />}
                          disabled={!template.isActive || !tenantId}
                          onClick={() => handleCopyPublicFormLink(template)}
                        >
                          Copy Link
                        </Button>
                      )}
                    </Stack>
                    {template.isPublic && (
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        gap={0.75}
                        alignItems={{ xs: 'stretch', md: 'center' }}
                      >
                        <TextField
                          size="small"
                          label="Campaign name"
                          value={campaignLinkNames[template.id] || ''}
                          disabled={!template.isActive || !tenantId}
                          onChange={(event) =>
                            handleCampaignLinkNameChange(template.id, event.target.value)
                          }
                          sx={{ flex: 1, minWidth: 0 }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopy />}
                          disabled={
                            !template.isActive ||
                            !tenantId ||
                            !campaignLinkNames[template.id]?.trim()
                          }
                          onClick={() => handleCopyCampaignFormLink(template)}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          Copy Campaign Link
                        </Button>
                      </Stack>
                    )}
                    {template.isPublic &&
                      template.channel === AdmissionInquiryChannel.StaffSharedLink && (
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          gap={0.75}
                          alignItems={{ xs: 'stretch', md: 'center' }}
                        >
                          <FormControl size="small" sx={{ flex: 1, minWidth: 0 }}>
                            <InputLabel>Staff owner</InputLabel>
                            <Select
                              label="Staff owner"
                              value={staffLinkOwnerIds[template.id] || ''}
                              disabled={!template.isActive || !tenantId}
                              onChange={(event) =>
                                handleStaffLinkOwnerChange(template.id, event.target.value)
                              }
                            >
                              <MenuItem value="">Select owner</MenuItem>
                              {ownerOptions.map((owner) => (
                                <MenuItem key={owner.id} value={owner.id}>
                                  {getCrmUserOptionLabel(owner)}
                                  {owner.isActive === false ? ' (Inactive)' : ''}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<ContentCopy />}
                            disabled={
                              !template.isActive ||
                              !tenantId ||
                              !staffLinkOwnerIds[template.id]?.trim()
                            }
                            onClick={() => handleCopyStaffSharedFormLink(template)}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            Copy Staff Link
                          </Button>
                        </Stack>
                      )}
                  </Stack>
                </Paper>
              ))}
              {!templates?.items?.length && (
                <Typography variant="body2" color="text.secondary">
                  No form templates configured
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      )}

      {focusSection === 'communications' && (!focusPanel || focusPanel === 'templates') && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
              <Box>
                <Typography component="h2" variant="subtitle1">
                  Message Templates
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {messageTemplates?.totalCount || 0} templates
                </Typography>
              </Box>
              <Button size="small" variant="outlined" onClick={() => setMessageDialogOpen(true)}>
                New Template
              </Button>
            </Stack>
            <Divider />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              {(messageTemplates?.items || []).map((template) => (
                <Paper key={template.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
                        {template.templateName}
                      </Typography>
                      <Chip
                        size="small"
                        label={messageStatusLabel[template.status]}
                        color={
                          template.status === AdmissionCrmMessageTemplateStatus.Approved
                            ? 'success'
                            : template.status === AdmissionCrmMessageTemplateStatus.Retired
                              ? 'default'
                              : 'warning'
                        }
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">
                      {messageChannelLabel[template.channel]} - {template.purpose}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {template.body}
                    </Typography>
                    <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center">
                      <Chip
                        size="small"
                        label={template.isActive ? 'Active' : 'Inactive'}
                        variant="outlined"
                      />
                      <Button
                        size="small"
                        startIcon={<Visibility />}
                        disabled={isPreviewingMessageTemplate}
                        onClick={() => handleOpenMessageTemplatePreview(template)}
                      >
                        Preview
                      </Button>
                      <Button
                        size="small"
                        disabled={isUpdatingMessageTemplateStatus}
                        onClick={() =>
                          handleToggleMessageTemplateApproval(
                            template.id,
                            template.status,
                            template.isActive
                          )
                        }
                      >
                        {template.status === AdmissionCrmMessageTemplateStatus.Approved
                          ? 'Retire'
                          : 'Approve'}
                      </Button>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
              {!messageTemplates?.items?.length && (
                <Typography variant="body2" color="text.secondary">
                  No message templates configured
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      )}

      {focusSection === 'communications' && (!focusPanel || focusPanel === 'providers') && (
        <Paper variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
          <Stack spacing={1.25}>
            <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
              <Typography component="h2" variant="subtitle1">
                Communication Providers
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {communicationProviders?.totalCount || 0} channels
              </Typography>
            </Stack>
            <Divider />
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
                gap: 1,
              }}
            >
              {(communicationProviders?.items || []).map((provider) => {
                const providerForm = providerForms[provider.channel] || defaultProviderForm;
                const providerAdapter = getAdmissionCrmProviderAdapter(providerForm.settingsJson);
                const providerPayloadMode = getAdmissionCrmProviderPayloadMode(
                  providerForm.settingsJson
                );
                const providerHeaders = Object.entries(
                  getAdmissionCrmProviderKeyValueSettings(providerForm.settingsJson, 'headers')
                );
                const providerParameters = Object.entries(
                  getAdmissionCrmProviderKeyValueSettings(providerForm.settingsJson, 'parameters')
                );
                const providerCallbackUrl = buildAdmissionCrmProviderDeliveryCallbackUrl({
                  apiOrigin: process.env.NEXT_PUBLIC_API_URL,
                  tenantId,
                  academicYearId,
                  channel: provider.channel,
                });

                return (
                  <Paper key={provider.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                    <Stack spacing={1}>
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        gap={1}
                        alignItems="center"
                      >
                        <Typography variant="subtitle2">
                          {messageChannelLabel[provider.channel]}
                        </Typography>
                        <Chip
                          size="small"
                          label={provider.status}
                          color={provider.isEnabled ? 'success' : 'default'}
                        />
                      </Stack>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={providerForm.isEnabled}
                            onChange={(event) =>
                              handleProviderChange(
                                provider.channel,
                                'isEnabled',
                                event.target.checked
                              )
                            }
                          />
                        }
                        label="Enabled"
                      />
                      <TextField
                        size="small"
                        label="Provider"
                        value={providerForm.providerName}
                        onChange={(event) =>
                          handleProviderChange(provider.channel, 'providerName', event.target.value)
                        }
                      />
                      <TextField
                        size="small"
                        label="Sender"
                        value={providerForm.senderId}
                        onChange={(event) =>
                          handleProviderChange(provider.channel, 'senderId', event.target.value)
                        }
                      />
                      <FormControl size="small">
                        <InputLabel>Adapter</InputLabel>
                        <Select
                          label="Adapter"
                          value={providerAdapter}
                          onChange={(event) =>
                            handleProviderAdapterChange(provider.channel, event.target.value)
                          }
                        >
                          {providerAdapterOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl size="small" disabled={providerAdapter === 'manual'}>
                        <InputLabel>Payload</InputLabel>
                        <Select
                          label="Payload"
                          value={providerPayloadMode}
                          onChange={(event) =>
                            handleProviderPayloadModeChange(provider.channel, event.target.value)
                          }
                        >
                          <MenuItem value="default">Default</MenuItem>
                          <MenuItem value="envelope">Envelope</MenuItem>
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        label="Webhook URL"
                        value={providerForm.webhookUrl}
                        onChange={(event) =>
                          handleProviderChange(provider.channel, 'webhookUrl', event.target.value)
                        }
                      />
                      {providerAdapter !== 'manual' && (
                        <Stack spacing={1}>
                          <Typography variant="caption" color="text.secondary">
                            Request headers
                          </Typography>
                          {providerHeaders.map(([key, value]) => (
                            <Stack key={key} direction="row" spacing={0.75} alignItems="center">
                              <TextField
                                size="small"
                                label="Header"
                                value={key}
                                onChange={(event) =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'headers',
                                    key,
                                    event.target.value,
                                    value
                                  )
                                }
                              />
                              <TextField
                                size="small"
                                label="Value"
                                value={value}
                                type={
                                  key.toLowerCase().includes('authorization') ? 'password' : 'text'
                                }
                                onChange={(event) =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'headers',
                                    key,
                                    key,
                                    event.target.value
                                  )
                                }
                                fullWidth
                              />
                              <IconButton
                                size="small"
                                aria-label={`Remove ${key} header`}
                                onClick={() =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'headers',
                                    key,
                                    '',
                                    ''
                                  )
                                }
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          ))}
                          <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={() =>
                              handleProviderKeyValueChange(
                                provider.channel,
                                'headers',
                                '',
                                `Header-${providerHeaders.length + 1}`,
                                ''
                              )
                            }
                          >
                            Add header
                          </Button>
                          <Typography variant="caption" color="text.secondary">
                            Payload parameters
                          </Typography>
                          {providerParameters.map(([key, value]) => (
                            <Stack key={key} direction="row" spacing={0.75} alignItems="center">
                              <TextField
                                size="small"
                                label="Parameter"
                                value={key}
                                onChange={(event) =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'parameters',
                                    key,
                                    event.target.value,
                                    value
                                  )
                                }
                              />
                              <TextField
                                size="small"
                                label="Value"
                                value={value}
                                onChange={(event) =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'parameters',
                                    key,
                                    key,
                                    event.target.value
                                  )
                                }
                                fullWidth
                              />
                              <IconButton
                                size="small"
                                aria-label={`Remove ${key} parameter`}
                                onClick={() =>
                                  handleProviderKeyValueChange(
                                    provider.channel,
                                    'parameters',
                                    key,
                                    '',
                                    ''
                                  )
                                }
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </Stack>
                          ))}
                          <Button
                            size="small"
                            startIcon={<Add />}
                            onClick={() =>
                              handleProviderKeyValueChange(
                                provider.channel,
                                'parameters',
                                '',
                                `parameter${providerParameters.length + 1}`,
                                ''
                              )
                            }
                          >
                            Add parameter
                          </Button>
                        </Stack>
                      )}
                      <TextField
                        size="small"
                        label="Response message ID path"
                        value={getAdmissionCrmProviderResponseMessageIdPath(
                          providerForm.settingsJson
                        )}
                        disabled={providerAdapter === 'manual'}
                        onChange={(event) =>
                          handleProviderResponseMessageIdPathChange(
                            provider.channel,
                            event.target.value
                          )
                        }
                      />
                      <TextField
                        size="small"
                        label="Callback secret"
                        value={getAdmissionCrmProviderCallbackSecret(providerForm.settingsJson)}
                        onChange={(event) =>
                          handleProviderCallbackSecretChange(provider.channel, event.target.value)
                        }
                      />
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <TextField
                          size="small"
                          label="Provider callback URL"
                          value={providerCallbackUrl || ''}
                          fullWidth
                          InputProps={{ readOnly: true }}
                        />
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<ContentCopy />}
                          disabled={!providerCallbackUrl}
                          onClick={() => handleCopyProviderCallbackUrl(provider.channel)}
                        >
                          Copy
                        </Button>
                      </Stack>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1,
                        }}
                      >
                        <TextField
                          size="small"
                          label="Callback status path"
                          value={getAdmissionCrmProviderCallbackMappingPath(
                            providerForm.settingsJson,
                            'statusPath'
                          )}
                          onChange={(event) =>
                            handleProviderCallbackMappingPathChange(
                              provider.channel,
                              'statusPath',
                              event.target.value
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="Callback detail path"
                          value={getAdmissionCrmProviderCallbackMappingPath(
                            providerForm.settingsJson,
                            'statusDetailsPath'
                          )}
                          onChange={(event) =>
                            handleProviderCallbackMappingPathChange(
                              provider.channel,
                              'statusDetailsPath',
                              event.target.value
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="Callback message ID path"
                          value={getAdmissionCrmProviderCallbackMappingPath(
                            providerForm.settingsJson,
                            'providerMessageIdPath'
                          )}
                          onChange={(event) =>
                            handleProviderCallbackMappingPathChange(
                              provider.channel,
                              'providerMessageIdPath',
                              event.target.value
                            )
                          }
                        />
                        <TextField
                          size="small"
                          label="Callback secret path"
                          value={getAdmissionCrmProviderCallbackMappingPath(
                            providerForm.settingsJson,
                            'callbackSecretPath'
                          )}
                          onChange={(event) =>
                            handleProviderCallbackMappingPathChange(
                              provider.channel,
                              'callbackSecretPath',
                              event.target.value
                            )
                          }
                        />
                      </Box>
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        loading={isUpdatingCommunicationProvider}
                        disabled={!academicYearId}
                        onClick={() => handleSaveCommunicationProvider(provider.channel)}
                      >
                        Save Provider
                      </LoadingButton>
                    </Stack>
                  </Paper>
                );
              })}
              {!communicationProviders?.items?.length && (
                <Typography variant="body2" color="text.secondary">
                  No communication providers configured
                </Typography>
              )}
            </Box>
          </Stack>
        </Paper>
      )}

      <Dialog
        open={admissionsCrmConfigurationDialog.value}
        onClose={handleCloseTemplateDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          {editingTemplateId ? 'Edit Form Template' : 'Create Form Template'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField
              required
              label="Template name"
              value={templateForm.templateName}
              onChange={(event) => handleTemplateChange('templateName', event.target.value)}
              fullWidth
            />
            <TextField
              label="Description"
              value={templateForm.description}
              onChange={(event) => handleTemplateChange('description', event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControl fullWidth>
              <InputLabel id="crm-template-channel-label">Channel</InputLabel>
              <Select
                labelId="crm-template-channel-label"
                label="Channel"
                value={templateForm.channel}
                onChange={(event) =>
                  handleTemplateChange(
                    'channel',
                    Number(event.target.value) as AdmissionInquiryChannel
                  )
                }
              >
                {inquiryChannelOptions.map((channel) => (
                  <MenuItem key={channel} value={channel}>
                    {getAdmissionCrmChannelLabel(channel)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={
                <Switch
                  checked={templateForm.isPublic}
                  onChange={(event) => handleTemplateChange('isPublic', event.target.checked)}
                />
              }
              label="Public website form"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={templateForm.isActive}
                  onChange={(event) => handleTemplateChange('isActive', event.target.checked)}
                />
              }
              label="Active"
            />
            {templateForm.isPublic && (
              <>
                <TextField
                  required
                  label="Consent text"
                  value={templateForm.consentText}
                  onChange={(event) => handleTemplateChange('consentText', event.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <TextField
                  required
                  label="Privacy notice URL"
                  value={templateForm.privacyNoticeUrl}
                  onChange={(event) => handleTemplateChange('privacyNoticeUrl', event.target.value)}
                  fullWidth
                />
              </>
            )}
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack spacing={1}>
                <Typography variant="subtitle2">Parent-facing translations</Typography>
                {[
                  { code: 'gu' as const, label: 'Gujarati' },
                  { code: 'hi' as const, label: 'Hindi' },
                ].map((language) => (
                  <Stack key={language.code} direction={{ xs: 'column', md: 'row' }} gap={1}>
                    <TextField
                      size="small"
                      label={`${language.label} template name`}
                      value={templateForm.localizations[language.code].templateName}
                      onChange={(event) =>
                        setTemplateForm((current) => ({
                          ...current,
                          localizations: {
                            ...current.localizations,
                            [language.code]: {
                              ...current.localizations[language.code],
                              templateName: event.target.value,
                            },
                          },
                        }))
                      }
                      fullWidth
                    />
                    <TextField
                      size="small"
                      label={`${language.label} consent text`}
                      value={templateForm.localizations[language.code].consentText}
                      onChange={(event) =>
                        setTemplateForm((current) => ({
                          ...current,
                          localizations: {
                            ...current.localizations,
                            [language.code]: {
                              ...current.localizations[language.code],
                              consentText: event.target.value,
                            },
                          },
                        }))
                      }
                      fullWidth
                    />
                  </Stack>
                ))}
              </Stack>
            </Paper>
            <Divider />
            <Stack spacing={1}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                gap={1}
                alignItems={{ sm: 'center' }}
              >
                <Box>
                  <Typography variant="subtitle2">Fields</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Map known fields to CRM lead data and keep custom fields on the submission.
                  </Typography>
                </Box>
                <Button size="small" variant="outlined" onClick={handleAddTemplateField}>
                  Add Field
                </Button>
              </Stack>
              <Box sx={{ display: 'grid', gap: 1 }}>
                {templateForm.fields.map((field, index) => (
                  <Box
                    key={`${field.key}-${index}`}
                    sx={{
                      border: 1,
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1,
                      display: 'grid',
                      gap: 1,
                    }}
                  >
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Label"
                        value={field.label}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { label: event.target.value })
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Key"
                        value={field.key}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { key: event.target.value })
                        }
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Gujarati label"
                        value={field.localizedLabels?.gu || ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, {
                            localizedLabels: {
                              ...(field.localizedLabels || {}),
                              gu: event.target.value,
                            },
                          })
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Hindi label"
                        value={field.localizedLabels?.hi || ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, {
                            localizedLabels: {
                              ...(field.localizedLabels || {}),
                              hi: event.target.value,
                            },
                          })
                        }
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`crm-template-field-type-${index}`}>Type</InputLabel>
                        <Select
                          labelId={`crm-template-field-type-${index}`}
                          label="Type"
                          value={field.fieldType}
                          onChange={(event) =>
                            handleTemplateFieldTypeChange(
                              index,
                              Number(event.target.value) as AdmissionCrmFormFieldType
                            )
                          }
                        >
                          {formFieldTypeOptions.map((fieldType) => (
                            <MenuItem key={fieldType} value={fieldType}>
                              {formFieldTypeLabel[fieldType]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <FormControl fullWidth size="small">
                        <InputLabel id={`crm-template-system-field-${index}`}>
                          CRM mapping
                        </InputLabel>
                        <Select
                          labelId={`crm-template-system-field-${index}`}
                          label="CRM mapping"
                          value={field.systemField ?? ''}
                          onChange={(event) =>
                            handleTemplateFieldChange(index, {
                              systemField: String(event.target.value) || null,
                            })
                          }
                        >
                          <MenuItem value="">Custom submission field</MenuItem>
                          {templateSystemFieldOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Section"
                        value={field.sectionName ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { sectionName: event.target.value })
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Placeholder"
                        value={field.placeholder ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { placeholder: event.target.value })
                        }
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Helper text"
                        value={field.helperText ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { helperText: event.target.value })
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Default value"
                        value={field.defaultValue ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, { defaultValue: event.target.value })
                        }
                      />
                    </Stack>
                    <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
                      <TextField
                        fullWidth
                        size="small"
                        label="Visible when field key"
                        value={field.visibleWhenFieldKey ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, {
                            visibleWhenFieldKey: event.target.value,
                          })
                        }
                      />
                      <TextField
                        fullWidth
                        size="small"
                        label="Visible when value"
                        value={field.visibleWhenValue ?? ''}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, {
                            visibleWhenValue: event.target.value,
                          })
                        }
                      />
                    </Stack>
                    <Stack
                      direction={{ xs: 'column', md: 'row' }}
                      gap={1}
                      alignItems={{ md: 'center' }}
                    >
                      <TextField
                        size="small"
                        type="number"
                        label="Order"
                        value={field.displayOrder}
                        onChange={(event) =>
                          handleTemplateFieldChange(index, {
                            displayOrder: Number(event.target.value),
                          })
                        }
                      />
                      <FormControlLabel
                        control={
                          <Switch
                            checked={field.required}
                            onChange={(event) =>
                              handleTemplateFieldChange(index, { required: event.target.checked })
                            }
                          />
                        }
                        label="Required"
                      />
                      <Button
                        size="small"
                        color="error"
                        disabled={templateForm.fields.length <= 1}
                        onClick={() => handleRemoveTemplateField(index)}
                      >
                        Remove
                      </Button>
                    </Stack>
                    {fieldNeedsOptions(field.fieldType) && (
                      <TextField
                        size="small"
                        label="Options"
                        value={(field.options ?? []).join('\n')}
                        onChange={(event) =>
                          handleTemplateFieldOptionsChange(index, event.target.value)
                        }
                        multiline
                        minRows={2}
                        fullWidth
                      />
                    )}
                  </Box>
                ))}
              </Box>
            </Stack>
            <Stack spacing={0.75}>
              <Typography variant="subtitle2">Preview</Typography>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                {[...templateForm.fields]
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((field) => (
                    <Chip
                      key={`${field.key}-${field.displayOrder}`}
                      size="small"
                      label={`${field.label || 'Untitled'}${
                        field.required ? ' *' : ''
                      } - ${formFieldTypeLabel[field.fieldType]}`}
                      variant="outlined"
                    />
                  ))}
              </Stack>
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTemplateDialog}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isCreatingTemplate || isUpdatingTemplate}
            onClick={handleSaveTemplate}
          >
            {editingTemplateId ? 'Save' : 'Create'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={messageDialogOpen} onClose={handleCloseMessageDialog} fullWidth maxWidth="sm">
        <DialogTitle>Create Message Template</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <TextField
              required
              label="Template name"
              value={messageTemplateForm.templateName}
              onChange={(event) => handleMessageTemplateChange('templateName', event.target.value)}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel id="crm-message-channel-label">Channel</InputLabel>
              <Select
                labelId="crm-message-channel-label"
                label="Channel"
                value={messageTemplateForm.channel}
                onChange={(event) =>
                  handleMessageTemplateChange(
                    'channel',
                    Number(event.target.value) as AdmissionCrmMessageChannel
                  )
                }
              >
                {Object.values(AdmissionCrmMessageChannel)
                  .filter((value) => typeof value === 'number')
                  .map((channel) => (
                    <MenuItem key={channel} value={channel}>
                      {messageChannelLabel[channel as AdmissionCrmMessageChannel]}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
            <TextField
              required
              label="Purpose"
              value={messageTemplateForm.purpose}
              onChange={(event) => handleMessageTemplateChange('purpose', event.target.value)}
              fullWidth
            />
            {messageTemplateForm.channel === AdmissionCrmMessageChannel.Email && (
              <TextField
                required
                label="Subject"
                value={messageTemplateForm.subject}
                onChange={(event) => handleMessageTemplateChange('subject', event.target.value)}
                fullWidth
              />
            )}
            <TextField
              required
              label="Body"
              value={messageTemplateForm.body}
              onChange={(event) => handleMessageTemplateChange('body', event.target.value)}
              fullWidth
              multiline
              minRows={4}
            />
            <TextField
              label="Variables"
              value={messageTemplateForm.variables}
              onChange={(event) => handleMessageTemplateChange('variables', event.target.value)}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessageDialog}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isCreatingMessageTemplate}
            onClick={handleCreateMessageTemplate}
          >
            Create
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(previewTemplate)}
        onClose={handleCloseMessagePreview}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Message Template Preview</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {previewTemplate && (
              <Alert severity="info">
                {previewTemplate.templateName} - {messageChannelLabel[previewTemplate.channel]}
              </Alert>
            )}
            <TextField
              label="Preview variables"
              value={messagePreviewVariablesText}
              onChange={(event) => setMessagePreviewVariablesText(event.target.value)}
              fullWidth
              multiline
              minRows={3}
              placeholder="examDate=15 July"
            />
            <Stack direction="row" justifyContent="flex-end">
              <LoadingButton
                variant="outlined"
                loading={isPreviewingMessageTemplate}
                onClick={handleRefreshMessagePreview}
              >
                Refresh Preview
              </LoadingButton>
            </Stack>
            {messageTemplatePreview?.unresolvedVariables.length ? (
              <Alert severity="warning">
                Unresolved: {messageTemplatePreview.unresolvedVariables.join(', ')}
              </Alert>
            ) : null}
            {messageTemplatePreview?.renderedSubject && (
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Typography variant="subtitle2">Subject</Typography>
                    <Button
                      size="small"
                      startIcon={<ContentCopy />}
                      onClick={() => handleCopyPreviewText(messageTemplatePreview.renderedSubject)}
                    >
                      Copy
                    </Button>
                  </Stack>
                  <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                    {messageTemplatePreview.renderedSubject}
                  </Typography>
                </Stack>
              </Paper>
            )}
            {messageTemplatePreview && (
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between" gap={1}>
                    <Typography variant="subtitle2">Body</Typography>
                    <Button
                      size="small"
                      startIcon={<ContentCopy />}
                      onClick={() => handleCopyPreviewText(messageTemplatePreview.renderedBody)}
                    >
                      Copy
                    </Button>
                  </Stack>
                  <Typography
                    variant="body2"
                    sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                  >
                    {messageTemplatePreview.renderedBody}
                  </Typography>
                </Stack>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMessagePreview}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdmissionsCrmConfiguration;
