import {
  AdmissionInquiryStage,
  AdmissionInquiryChannel,
  type AdmissionCrmLeadDto,
  AdmissionCrmMessageChannel,
  AdmissionCrmEligibilityDecision,
  type AdmissionCrmEntranceExamDto,
  type AdmissionCrmPipelineStageDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

export const admissionCrmStageLabels: Record<AdmissionInquiryStage, string> = {
  [AdmissionInquiryStage.NewInquiry]: 'New Inquiry',
  [AdmissionInquiryStage.FollowUp]: 'Follow-up',
  [AdmissionInquiryStage.ExamReady]: 'Exam Ready',
  [AdmissionInquiryStage.ExamScheduled]: 'Exam Scheduled',
  [AdmissionInquiryStage.ExamCompleted]: 'Exam Completed',
  [AdmissionInquiryStage.Eligible]: 'Eligible',
  [AdmissionInquiryStage.Waitlisted]: 'Waitlisted',
  [AdmissionInquiryStage.Rejected]: 'Rejected',
  [AdmissionInquiryStage.Stale]: 'Stale',
  [AdmissionInquiryStage.Archived]: 'Archived',
};

export const admissionCrmChannelLabels: Record<AdmissionInquiryChannel, string> = {
  [AdmissionInquiryChannel.ManualBackOffice]: 'Manual Back Office',
  [AdmissionInquiryChannel.QuickCallEntry]: 'Quick Call',
  [AdmissionInquiryChannel.WalkInReception]: 'Walk-in Reception',
  [AdmissionInquiryChannel.SchoolWebsiteForm]: 'Website Form',
  [AdmissionInquiryChannel.WhatsAppInquiry]: 'WhatsApp',
  [AdmissionInquiryChannel.StaffSharedLink]: 'Staff Link',
  [AdmissionInquiryChannel.QrCodeScan]: 'QR Scan',
  [AdmissionInquiryChannel.CampaignLink]: 'Campaign Link',
};

export const admissionCrmStageColors: Record<
  AdmissionInquiryStage,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [AdmissionInquiryStage.NewInquiry]: 'info',
  [AdmissionInquiryStage.FollowUp]: 'warning',
  [AdmissionInquiryStage.ExamReady]: 'secondary',
  [AdmissionInquiryStage.ExamScheduled]: 'primary',
  [AdmissionInquiryStage.ExamCompleted]: 'success',
  [AdmissionInquiryStage.Eligible]: 'success',
  [AdmissionInquiryStage.Waitlisted]: 'warning',
  [AdmissionInquiryStage.Rejected]: 'error',
  [AdmissionInquiryStage.Stale]: 'warning',
  [AdmissionInquiryStage.Archived]: 'default',
};

export const admissionCrmEligibilityLabels: Record<AdmissionCrmEligibilityDecision, string> = {
  [AdmissionCrmEligibilityDecision.Pending]: 'Pending',
  [AdmissionCrmEligibilityDecision.Eligible]: 'Eligible',
  [AdmissionCrmEligibilityDecision.Waitlisted]: 'Waitlisted',
  [AdmissionCrmEligibilityDecision.Rejected]: 'Rejected',
};

export const admissionCrmMessageChannelLabels: Record<AdmissionCrmMessageChannel, string> = {
  [AdmissionCrmMessageChannel.WhatsApp]: 'WhatsApp',
  [AdmissionCrmMessageChannel.Sms]: 'SMS',
  [AdmissionCrmMessageChannel.Email]: 'Email',
};

export const admissionCrmDeliveryLogStatusLabels: Record<string, string> = {
  ProviderNotConfigured: 'Provider not configured',
  BlockedByOptOut: 'Opt-out blocked',
  Queued: 'Queued',
  Sent: 'Sent',
  Delivered: 'Delivered',
  Failed: 'Failed',
};

export const getAdmissionCrmLeadName = (lead: AdmissionCrmLeadDto) => {
  const name = [lead.firstName, lead.middleName, lead.lastName].filter(Boolean).join(' ').trim();
  return (
    name || lead.parentGuardianName || lead.primaryContactNo || lead.email || 'Unnamed inquiry'
  );
};

export const getAdmissionCrmStageLabel = (stage: AdmissionInquiryStage) =>
  admissionCrmStageLabels[stage] ?? 'Unknown';

export const getAdmissionCrmStageTooltipLines = (stage: AdmissionCrmPipelineStageDto) => [
  `Owner: ${stage.ownerResponsibility?.trim() || 'Not configured'}`,
  `SLA: ${stage.slaTargetHours ? `${stage.slaTargetHours}h` : 'Not configured'}`,
  `Next: ${
    stage.allowedNextStages.length
      ? stage.allowedNextStages.map(getAdmissionCrmStageLabel).join(', ')
      : 'No configured next stage'
  }`,
];

export const getAdmissionCrmChannelLabel = (channel: AdmissionInquiryChannel) =>
  admissionCrmChannelLabels[channel] ?? 'Unknown';

export const getAdmissionCrmMessageChannelLabel = (channel: AdmissionCrmMessageChannel) =>
  admissionCrmMessageChannelLabels[channel] ?? 'Unknown';

export const getAdmissionCrmRecipientForMessageChannel = (
  lead: AdmissionCrmLeadDto,
  channel: AdmissionCrmMessageChannel
) => {
  if (channel === AdmissionCrmMessageChannel.Email) {
    return lead.email || '';
  }

  return lead.primaryContactNo || '';
};

export const getAdmissionCrmDeliveryLogStatusLabel = (status?: string | null) =>
  admissionCrmDeliveryLogStatusLabels[status || ''] ?? status ?? 'Unknown';

export const canRetryAdmissionCrmDeliveryLog = (status?: string | null) =>
  ['ProviderNotConfigured', 'BlockedByOptOut', 'Failed'].includes(status || '');

export const buildAdmissionCrmBoardColumns = (
  stages: AdmissionCrmPipelineStageDto[],
  leads: AdmissionCrmLeadDto[]
) =>
  stages
    .filter((stage) => stage.isEnabled)
    .sort((first, second) => first.displayOrder - second.displayOrder)
    .map((stage) => ({
      stage,
      leads: leads.filter((lead) => lead.stage === stage.systemStage),
    }));

export const getAdmissionCrmKpis = (
  leads: AdmissionCrmLeadDto[],
  exams: AdmissionCrmEntranceExamDto[]
) => {
  const activeLeadCount = leads.filter(
    (lead) =>
      lead.stage !== AdmissionInquiryStage.Archived && lead.stage !== AdmissionInquiryStage.Rejected
  ).length;
  const examScheduledCount = leads.filter(
    (lead) => lead.stage === AdmissionInquiryStage.ExamScheduled
  ).length;
  const staleOrArchivedCount = leads.filter(
    (lead) =>
      lead.stage === AdmissionInquiryStage.Stale || lead.stage === AdmissionInquiryStage.Archived
  ).length;
  const eligibleCount = exams.filter(
    (exam) => exam.eligibilityDecision === AdmissionCrmEligibilityDecision.Eligible
  ).length;

  return {
    totalLeadCount: leads.length,
    activeLeadCount,
    examScheduledCount,
    staleOrArchivedCount,
    eligibleCount,
  };
};
