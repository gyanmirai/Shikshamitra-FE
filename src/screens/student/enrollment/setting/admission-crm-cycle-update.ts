import type { AdmissionCrmCycleConfigurationDto } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

export type AdmissionCrmCycleUpdate = Partial<AdmissionCrmCycleConfigurationDto>;

export const buildAdmissionCrmCycleUpdate = (
  configuration: AdmissionCrmCycleConfigurationDto,
  patch: AdmissionCrmCycleUpdate
): AdmissionCrmCycleUpdate => ({
  cycleName: configuration.cycleName,
  isActive: configuration.isActive,
  registrationFormRequiredBeforeExam: configuration.registrationFormRequiredBeforeExam,
  entranceExamRequired: configuration.entranceExamRequired,
  staleAfterDays: configuration.staleAfterDays,
  archiveAfterDays: configuration.archiveAfterDays,
  defaultLeadSlaHours: configuration.defaultLeadSlaHours,
  slaPolicy: configuration.slaPolicy,
  activationCancellationWindowDays: configuration.activationCancellationWindowDays,
  defaultExamPassingPercentage: configuration.defaultExamPassingPercentage,
  meritRankingMode: configuration.meritRankingMode,
  examReadinessFields: configuration.examReadinessFields,
  leadScoringRules: configuration.leadScoringRules,
  leadRoutingSettings: configuration.leadRoutingSettings,
  journeyRules: configuration.journeyRules,
  applicantChecklist: configuration.applicantChecklist,
  channelSettings: configuration.channelSettings,
  notes: configuration.notes,
  ...patch,
});
