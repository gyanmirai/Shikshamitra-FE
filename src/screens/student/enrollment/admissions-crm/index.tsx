'use client';

import type { RootState } from 'src/redux/store';
import type {
  AdmissionCrmLeadDto,
  CreateAdmissionCrmLeadDto,
  AdmissionCrmFollowUpTaskDto,
  AdmissionCrmEntranceExamDto,
  AdmissionCrmLeadDuplicateDto,
  AdmissionCrmStaffWorkloadDto,
  AdmissionCrmPipelineStageDto,
  AdmissionCrmAnalyticsSummaryDto,
  AdmissionCrmMessageDeliveryLogDto,
  AdmissionCrmOperationsQueueItemDto,
  AdmissionCrmOperationsQueueFilters,
  AdmissionCrmExamClassPerformanceDto,
  AdmissionCrmApplicantChecklistProgressDto,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import dayjs from 'dayjs';
import { LoadingButton } from '@mui/lab';
import { useSelector } from 'react-redux';
import { Iconify } from 'src/components/iconify';
import { useMemo, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import {
  Add,
  Star,
  Edit,
  Flag,
  Send,
  Notes,
  Replay,
  Delete,
  TaskAlt,
  Archive,
  History,
  Refresh,
  CallMerge,
  SwapHoriz,
  ViewColumn,
  ReceiptLong,
  BookmarkAdd,
  FilterAltOff,
  WarningAmber,
  AssignmentInd,
  EventAvailable,
  FormatListBulleted,
  AssignmentTurnedIn,
  NotificationsActive,
} from '@mui/icons-material';
import {
  Box,
  Card,
  Chip,
  Table,
  Alert,
  Stack,
  Paper,
  Button,
  Dialog,
  Select,
  Tooltip,
  Divider,
  Checkbox,
  MenuItem,
  TableRow,
  TextField,
  TableBody,
  TableCell,
  TableHead,
  Typography,
  IconButton,
  InputLabel,
  DialogTitle,
  FormControl,
  ToggleButton,
  DialogContent,
  DialogActions,
  LinearProgress,
  FormControlLabel,
  ToggleButtonGroup,
} from '@mui/material';
import {
  AdmissionInquiryStage,
  EntranceExamStatusEnum,
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
  AdmissionCrmSlaHoldReason,
  AdmissionCrmJourneyTrigger,
  AdmissionCrmMessageChannel,
  useGetAdmissionCrmStaffQuery,
  useGetAdmissionCrmLeadsQuery,
  useGetAdmissionCrmTasksQuery,
  AdmissionCrmAutomationRunType,
  AdmissionCrmAutomationRunStatus,
  AdmissionCrmOperationsQueueType,
  AdmissionCrmEligibilityDecision,
  useGetAdmissionCrmSlaHoldsQuery,
  useGetAdmissionCrmTimelineQuery,
  AdmissionCrmExamAttendanceStatus,
  useGetAdmissionCrmExamSlotsQuery,
  AdmissionCrmMessageTemplateStatus,
  useCreateAdmissionCrmLeadMutation,
  useCreateAdmissionCrmTaskMutation,
  useReopenAdmissionCrmLeadMutation,
  useAddAdmissionCrmLeadNoteMutation,
  useArchiveAdmissionCrmLeadMutation,
  useCompleteAdmissionCrmTaskMutation,
  useGetAdmissionCrmEntranceExamsQuery,
  useRunAdmissionCrmStaleRulesMutation,
  useCreateAdmissionCrmSlaHoldMutation,
  useResumeAdmissionCrmSlaHoldMutation,
  useGetAdmissionCrmPipelineStagesQuery,
  useAssignAdmissionCrmLeadOwnerMutation,
  useChangeAdmissionCrmLeadStageMutation,
  useGetAdmissionCrmOperationsQueueQuery,
  useRunAdmissionCrmSlaRemindersMutation,
  useBulkCreateAdmissionCrmTasksMutation,
  useGetAdmissionCrmMessageTemplatesQuery,
  useGetAdmissionCrmAnalyticsSummaryQuery,
  useUploadAdmissionCrmExamResultMutation,
  useBulkChangeAdmissionCrmStagesMutation,
  useBulkArchiveAdmissionCrmLeadsMutation,
  useBulkSendAdmissionCrmMessagesMutation,
  useDecideAdmissionCrmEligibilityMutation,
  useChangeAdmissionCrmLeadPriorityMutation,
  useGetAdmissionCrmEligibilityHandoffQuery,
  useMarkAdmissionCrmExamAttendanceMutation,
  useMergeAdmissionCrmDuplicateLeadMutation,
  useGetAdmissionCrmMessageDeliveryLogsQuery,
  useSendAdmissionCrmTemplateMessageMutation,
  useGetAdmissionCrmCommunicationOptOutsQuery,
  useRetryAdmissionCrmMessageDeliveryMutation,
  useScheduleAdmissionCrmEntranceExamMutation,
  useRecalculateAdmissionCrmLeadScoreMutation,
  useBulkAssignAdmissionCrmLeadOwnersMutation,
  useGetAdmissionCrmOperationsSavedViewsQuery,
  AdmissionCrmApplicantChecklistProgressStatus,
  useIssueAdmissionCrmRegistrationFormMutation,
  usePreviewAdmissionCrmLeadDuplicatesMutation,
  useGetAdmissionCrmOperationsQueueSummaryQuery,
  useGetAdmissionCrmLeadApplicantChecklistQuery,
  useClearAdmissionCrmCommunicationOptOutMutation,
  useCreateAdmissionCrmCommunicationOptOutMutation,
  useCreateAdmissionCrmOperationsSavedViewMutation,
  useDeleteAdmissionCrmOperationsSavedViewMutation,
  useUpdateAdmissionCrmLeadApplicantChecklistMutation,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

import { RteAllotmentImport } from './rte-allotment-import';
import { AdmissionsDataQuality } from './admissions-data-quality';
import { ApplicantPolicyReadiness } from './applicant-policy-readiness';
import { ApplicantRouteOperations } from './applicant-route-operations';
import { ApplicantFinancialReadiness } from './applicant-financial-readiness';
import { GeneratedDocumentOperations } from './generated-document-operations';
import { ApplicantActivationOperations } from './applicant-activation-operations';
import { ApplicantRegistrationOperations } from './applicant-registration-operations';
import { ApplicantFinalAdmissionOperations } from './applicant-final-admission-operations';
import { ApplicantHouseholdIdentityOperations } from './applicant-household-identity-operations';
import {
  getAdmissionCrmKpis,
  getAdmissionCrmLeadName,
  admissionCrmStageColors,
  getAdmissionCrmStageLabel,
  getAdmissionCrmChannelLabel,
  admissionCrmEligibilityLabels,
  buildAdmissionCrmBoardColumns,
  canRetryAdmissionCrmDeliveryLog,
  getAdmissionCrmMessageChannelLabel,
  getAdmissionCrmDeliveryLogStatusLabel,
  getAdmissionCrmRecipientForMessageChannel,
} from './admissions-crm-utils';

type WorkspaceView = 'board' | 'list' | 'exams' | 'operations';

type StudentAdmissionsCrmScreenProps = {
  heading?: string;
  initialView?: WorkspaceView;
  initialOperationsQueueType?: AdmissionCrmOperationsQueueType;
  fixedView?: boolean;
};

type ScoreBandFilter = 'all' | 'hot' | 'warm' | 'needsAttention';

type PriorityFilter = AdmissionCrmLeadPriority | 'all';

type DeliveryLogStatusFilter =
  | 'all'
  | 'ProviderNotConfigured'
  | 'BlockedByOptOut'
  | 'Queued'
  | 'Sent'
  | 'Delivered'
  | 'Failed';

type OptOutStatusFilter = 'all' | 'active' | 'cleared';

type BulkAction = 'owner' | 'task' | 'stage' | 'archive' | 'message';

type QuickLeadForm = {
  firstName: string;
  dateOfBirth: string;
  parentGuardianName: string;
  primaryContactNo: string;
  email: string;
  admissionIntent: string;
  desiredClassName: string;
  channel: AdmissionInquiryChannel;
  campaignName: string;
  campusBranchName: string;
  preferredCommunicationLanguage: string;
  notes: string;
  duplicateContinueReason: string;
};

type ExamActionForm = {
  attendanceStatus: AdmissionCrmExamAttendanceStatus;
  totalMarks: string;
  passingMarks: string;
  obtainedMarks: string;
  meritRank: string;
  eligibilityDecision: AdmissionCrmEligibilityDecision;
  eligibilityDecisionReason: string;
  overrideDecision: boolean;
  overrideReason: string;
};

type TaskForm = {
  title: string;
  dueAt: string;
  assignedUserId: string;
  notes: string;
};

const defaultQuickLeadForm: QuickLeadForm = {
  firstName: '',
  dateOfBirth: '',
  parentGuardianName: '',
  primaryContactNo: '',
  email: '',
  admissionIntent: '',
  desiredClassName: '',
  channel: AdmissionInquiryChannel.QuickCallEntry,
  campaignName: '',
  campusBranchName: '',
  preferredCommunicationLanguage: '',
  notes: '',
  duplicateContinueReason: '',
};

const defaultStageTransitions: Record<AdmissionInquiryStage, AdmissionInquiryStage[]> = {
  [AdmissionInquiryStage.NewInquiry]: [
    AdmissionInquiryStage.FollowUp,
    AdmissionInquiryStage.ExamReady,
    AdmissionInquiryStage.Stale,
    AdmissionInquiryStage.Archived,
  ],
  [AdmissionInquiryStage.FollowUp]: [
    AdmissionInquiryStage.ExamReady,
    AdmissionInquiryStage.Stale,
    AdmissionInquiryStage.Archived,
  ],
  [AdmissionInquiryStage.ExamReady]: [
    AdmissionInquiryStage.ExamScheduled,
    AdmissionInquiryStage.FollowUp,
    AdmissionInquiryStage.Archived,
  ],
  [AdmissionInquiryStage.ExamScheduled]: [
    AdmissionInquiryStage.ExamCompleted,
    AdmissionInquiryStage.FollowUp,
  ],
  [AdmissionInquiryStage.ExamCompleted]: [
    AdmissionInquiryStage.Eligible,
    AdmissionInquiryStage.Waitlisted,
    AdmissionInquiryStage.Rejected,
  ],
  [AdmissionInquiryStage.Eligible]: [],
  [AdmissionInquiryStage.Waitlisted]: [
    AdmissionInquiryStage.Eligible,
    AdmissionInquiryStage.Rejected,
    AdmissionInquiryStage.Archived,
  ],
  [AdmissionInquiryStage.Rejected]: [AdmissionInquiryStage.Archived],
  [AdmissionInquiryStage.Stale]: [AdmissionInquiryStage.FollowUp, AdmissionInquiryStage.Archived],
  [AdmissionInquiryStage.Archived]: [],
};

const fallbackStages = [
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
].map((systemStage, index) => ({
  id: `fallback-${systemStage}`,
  academicYearId: '',
  systemStage,
  stageName: getAdmissionCrmStageLabel(systemStage),
  displayOrder: index + 1,
  isEnabled: true,
  isSystem: true,
  allowedNextStages: defaultStageTransitions[systemStage],
}));

const channelOptions = [
  AdmissionInquiryChannel.QuickCallEntry,
  AdmissionInquiryChannel.WalkInReception,
  AdmissionInquiryChannel.SchoolWebsiteForm,
  AdmissionInquiryChannel.WhatsAppInquiry,
  AdmissionInquiryChannel.StaffSharedLink,
  AdmissionInquiryChannel.QrCodeScan,
  AdmissionInquiryChannel.CampaignLink,
  AdmissionInquiryChannel.ManualBackOffice,
];

const messageChannelOptions = [
  AdmissionCrmMessageChannel.WhatsApp,
  AdmissionCrmMessageChannel.Sms,
  AdmissionCrmMessageChannel.Email,
];

const deliveryLogStatusOptions: DeliveryLogStatusFilter[] = [
  'all',
  'ProviderNotConfigured',
  'BlockedByOptOut',
  'Queued',
  'Sent',
  'Delivered',
  'Failed',
];

const attendanceStatusLabels: Record<AdmissionCrmExamAttendanceStatus, string> = {
  [AdmissionCrmExamAttendanceStatus.NotMarked]: 'Not marked',
  [AdmissionCrmExamAttendanceStatus.Present]: 'Present',
  [AdmissionCrmExamAttendanceStatus.Absent]: 'Absent',
};

const examStatusLabels: Record<EntranceExamStatusEnum, string> = {
  [EntranceExamStatusEnum.Pending]: 'Pending',
  [EntranceExamStatusEnum.Pass]: 'Pass',
  [EntranceExamStatusEnum.Fail]: 'Fail',
  [EntranceExamStatusEnum.Absent]: 'Absent',
};

const eligibilityDecisionOptions = [
  AdmissionCrmEligibilityDecision.Eligible,
  AdmissionCrmEligibilityDecision.Waitlisted,
  AdmissionCrmEligibilityDecision.Rejected,
];

const taskStatusLabels: Record<number, string> = {
  1: 'Pending',
  2: 'Completed',
  3: 'Cancelled',
};

const automationRunTypeLabels: Record<AdmissionCrmAutomationRunType, string> = {
  [AdmissionCrmAutomationRunType.StaleArchive]: 'Stale/archive',
  [AdmissionCrmAutomationRunType.SlaReminder]: 'SLA reminder',
  [AdmissionCrmAutomationRunType.Journey]: 'Journey',
};

const automationRunStatusLabels: Record<AdmissionCrmAutomationRunStatus, string> = {
  [AdmissionCrmAutomationRunStatus.Completed]: 'Completed',
  [AdmissionCrmAutomationRunStatus.CompletedWithFailures]: 'Completed with failures',
};

const journeyTriggerLabels: Record<AdmissionCrmJourneyTrigger, string> = {
  [AdmissionCrmJourneyTrigger.LeadCreated]: 'Lead created',
  [AdmissionCrmJourneyTrigger.StageReached]: 'Stage reached',
  [AdmissionCrmJourneyTrigger.SlaMissed]: 'SLA missed',
  [AdmissionCrmJourneyTrigger.StaleMarked]: 'Stale marked',
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

const defaultTaskForm = (): TaskForm => ({
  title: 'Follow up with parent',
  dueAt: dayjs().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
  assignedUserId: '',
  notes: '',
});

const scoreBandOptions: Array<{
  value: ScoreBandFilter;
  label: string;
  minimumLeadScore?: number;
  maximumLeadScore?: number;
}> = [
  { value: 'all', label: 'All scores' },
  { value: 'hot', label: 'Score 80+', minimumLeadScore: 80 },
  { value: 'warm', label: 'Score 50-79', minimumLeadScore: 50, maximumLeadScore: 79 },
  { value: 'needsAttention', label: 'Score <50', maximumLeadScore: 49 },
];

const leadPriorityLabels: Record<AdmissionCrmLeadPriority, string> = {
  [AdmissionCrmLeadPriority.None]: 'No priority',
  [AdmissionCrmLeadPriority.Hot]: 'Hot',
  [AdmissionCrmLeadPriority.Warm]: 'Warm',
  [AdmissionCrmLeadPriority.Cold]: 'Cold',
  [AdmissionCrmLeadPriority.Low]: 'Low',
};

const leadPriorityColors: Record<
  AdmissionCrmLeadPriority,
  'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'
> = {
  [AdmissionCrmLeadPriority.None]: 'default',
  [AdmissionCrmLeadPriority.Hot]: 'error',
  [AdmissionCrmLeadPriority.Warm]: 'warning',
  [AdmissionCrmLeadPriority.Cold]: 'info',
  [AdmissionCrmLeadPriority.Low]: 'default',
};

const leadPriorityOptions = [
  AdmissionCrmLeadPriority.None,
  AdmissionCrmLeadPriority.Hot,
  AdmissionCrmLeadPriority.Warm,
  AdmissionCrmLeadPriority.Cold,
  AdmissionCrmLeadPriority.Low,
];

const applicantChecklistStatusOptions = [
  AdmissionCrmApplicantChecklistProgressStatus.Pending,
  AdmissionCrmApplicantChecklistProgressStatus.Requested,
  AdmissionCrmApplicantChecklistProgressStatus.Received,
  AdmissionCrmApplicantChecklistProgressStatus.Waived,
];

const applicantChecklistStatusLabels: Record<AdmissionCrmApplicantChecklistProgressStatus, string> =
  {
    [AdmissionCrmApplicantChecklistProgressStatus.Pending]: 'Pending',
    [AdmissionCrmApplicantChecklistProgressStatus.Requested]: 'Requested',
    [AdmissionCrmApplicantChecklistProgressStatus.Received]: 'Received',
    [AdmissionCrmApplicantChecklistProgressStatus.Waived]: 'Waived',
  };

const applicantChecklistStatusColors: Record<
  AdmissionCrmApplicantChecklistProgressStatus,
  'default' | 'info' | 'success' | 'warning'
> = {
  [AdmissionCrmApplicantChecklistProgressStatus.Pending]: 'default',
  [AdmissionCrmApplicantChecklistProgressStatus.Requested]: 'info',
  [AdmissionCrmApplicantChecklistProgressStatus.Received]: 'success',
  [AdmissionCrmApplicantChecklistProgressStatus.Waived]: 'success',
};

const manualStageOptions = [
  AdmissionInquiryStage.NewInquiry,
  AdmissionInquiryStage.FollowUp,
  AdmissionInquiryStage.ExamReady,
  AdmissionInquiryStage.Stale,
];

const getManualStageOptionsForLead = (
  lead: AdmissionCrmLeadDto,
  stages: AdmissionCrmPipelineStageDto[]
) => {
  if (!manualStageOptions.includes(lead.stage)) {
    return [];
  }

  const stageConfiguration = stages.find((stage) => stage.systemStage === lead.stage);
  const configuredNextStages = Array.isArray(stageConfiguration?.allowedNextStages)
    ? stageConfiguration.allowedNextStages
    : null;
  const allowedNextStages =
    configuredNextStages ?? defaultStageTransitions[lead.stage] ?? manualStageOptions;

  return allowedNextStages.filter(
    (stage) => stage !== lead.stage && manualStageOptions.includes(stage)
  );
};

const getConfiguredStageColor = (colorHex?: string | null) =>
  colorHex && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(colorHex) ? colorHex : null;

const buildExamActionForm = (exam: AdmissionCrmEntranceExamDto): ExamActionForm => ({
  attendanceStatus: exam.attendanceStatus,
  totalMarks: exam.totalMarks == null ? '' : String(exam.totalMarks),
  passingMarks: exam.passingMarks == null ? '' : String(exam.passingMarks),
  obtainedMarks: exam.obtainedMarks == null ? '' : String(exam.obtainedMarks),
  meritRank: exam.meritRank == null ? '' : String(exam.meritRank),
  eligibilityDecision: exam.eligibilityDecision,
  eligibilityDecisionReason: exam.eligibilityDecisionReason || '',
  overrideDecision: exam.eligibilityOverrideUsed,
  overrideReason: exam.eligibilityOverrideReason || '',
});

const isExamReady = (lead: AdmissionCrmLeadDto) =>
  Boolean(
    (lead.primaryContactNo || lead.email) &&
    lead.admissionIntent &&
    (lead.desiredClassName || lead.targetStandardId)
  );

const getWorkloadOwnerLabel = (item: AdmissionCrmStaffWorkloadDto) =>
  item.ownerLabel === 'Unassigned' ? 'Unassigned' : `Owner ${item.ownerLabel.slice(0, 8)}`;

const getLeadOwnerLabel = (
  lead: AdmissionCrmLeadDto,
  staff: Array<{ id: string; displayName: string }> = []
) =>
  staff.find((item) => item.id === lead.ownerUserId)?.displayName ||
  (lead.ownerUserId ? 'Assigned staff' : 'Unassigned');

const formatRate = (value?: number | null) => `${(value ?? 0).toFixed(1)}%`;

const getAutomationRunContext = (
  run: AdmissionCrmAnalyticsSummaryDto['automationAnalytics']['recentRuns'][number]
) =>
  run.trigger == null
    ? '-'
    : `${journeyTriggerLabels[run.trigger]}${
        run.stage == null ? '' : ` / ${getAdmissionCrmStageLabel(run.stage)}`
      }`;

const getExamClassKey = (item: AdmissionCrmExamClassPerformanceDto) =>
  item.targetStandardId || item.className;

const getScoreBandRange = (scoreBand: ScoreBandFilter) =>
  scoreBandOptions.find((option) => option.value === scoreBand) || scoreBandOptions[0];

const getDeliveryLogStatusColor = (
  status?: string | null
): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case 'Delivered':
      return 'success';
    case 'Sent':
    case 'Queued':
      return 'info';
    case 'Failed':
      return 'error';
    case 'ProviderNotConfigured':
    case 'BlockedByOptOut':
      return 'warning';
    default:
      return 'default';
  }
};

const getBulkActionTitle = (action: BulkAction | null) => {
  switch (action) {
    case 'owner':
      return 'Bulk Assign Owner';
    case 'task':
      return 'Bulk Follow-up Task';
    case 'stage':
      return 'Bulk Move Stage';
    case 'archive':
      return 'Bulk Archive';
    case 'message':
      return 'Bulk Message';
    default:
      return 'Bulk Action';
  }
};

const getApiErrorMessage = (error: unknown, fallback: string) => {
  const data = (error as any)?.data;
  return data?.error?.code || data?.error?.message || data?.message || fallback;
};

const StudentAdmissionsCrmScreen = ({
  heading = 'Admissions Pipeline',
  initialView = 'board',
  initialOperationsQueueType = AdmissionCrmOperationsQueueType.UnassignedExam,
  fixedView = false,
}: StudentAdmissionsCrmScreenProps) => {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const academicYearId = currentYear?.id as string | undefined;
  const [view, setView] = useState<WorkspaceView>(initialView);
  const [operationsQueueType, setOperationsQueueType] = useState<AdmissionCrmOperationsQueueType>(
    initialOperationsQueueType
  );
  const [operationsSearch, setOperationsSearch] = useState('');
  const [operationsOwnerUserId, setOperationsOwnerUserId] = useState('');
  const [operationsAssignedToUserId, setOperationsAssignedToUserId] = useState('');
  const [operationsUrgentOnly, setOperationsUrgentOnly] = useState(false);
  const [operationsMinimumAgeDays, setOperationsMinimumAgeDays] = useState('');
  const [operationsSavedViewName, setOperationsSavedViewName] = useState('');
  const [searchText, setSearchText] = useState('');
  const [stageFilter, setStageFilter] = useState<AdmissionInquiryStage | 'all'>('all');
  const [channelFilter, setChannelFilter] = useState<AdmissionInquiryChannel | 'all'>('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [ownerFilter, setOwnerFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [scoreBandFilter, setScoreBandFilter] = useState<ScoreBandFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');
  const [deliveryLogChannelFilter, setDeliveryLogChannelFilter] = useState<
    AdmissionCrmMessageChannel | 'all'
  >('all');
  const [deliveryLogStatusFilter, setDeliveryLogStatusFilter] =
    useState<DeliveryLogStatusFilter>('all');
  const [deliveryLogProviderMessageId, setDeliveryLogProviderMessageId] = useState('');
  const [optOutChannelFilter, setOptOutChannelFilter] = useState<
    AdmissionCrmMessageChannel | 'all'
  >('all');
  const [optOutStatusFilter, setOptOutStatusFilter] = useState<OptOutStatusFilter>('active');
  const [optOutContactSearch, setOptOutContactSearch] = useState('');
  const [analyticsFromDate, setAnalyticsFromDate] = useState(() =>
    dayjs().subtract(29, 'day').format('YYYY-MM-DD')
  );
  const [analyticsToDate, setAnalyticsToDate] = useState(() => dayjs().format('YYYY-MM-DD'));
  const [quickDialogOpen, setQuickDialogOpen] = useState(false);
  const [quickForm, setQuickForm] = useState<QuickLeadForm>(defaultQuickLeadForm);
  const [duplicateMatches, setDuplicateMatches] = useState<AdmissionCrmLeadDuplicateDto[]>([]);
  const [duplicateAcknowledged, setDuplicateAcknowledged] = useState(false);
  const [scheduleLead, setScheduleLead] = useState<AdmissionCrmLeadDto | null>(null);
  const [registrationLead, setRegistrationLead] = useState<AdmissionCrmLeadDto | null>(null);
  const [registrationFormNumber, setRegistrationFormNumber] = useState('');
  const [registrationFormAmount, setRegistrationFormAmount] = useState('250');
  const [timelineLead, setTimelineLead] = useState<AdmissionCrmLeadDto | null>(null);
  const [noteLead, setNoteLead] = useState<AdmissionCrmLeadDto | null>(null);
  const [noteText, setNoteText] = useState('');
  const [isCallNote, setIsCallNote] = useState(false);
  const [messageLead, setMessageLead] = useState<AdmissionCrmLeadDto | null>(null);
  const [stageLead, setStageLead] = useState<AdmissionCrmLeadDto | null>(null);
  const [selectedStage, setSelectedStage] = useState<AdmissionInquiryStage>(
    AdmissionInquiryStage.FollowUp
  );
  const [stageReason, setStageReason] = useState('');
  const [selectedMessageTemplateId, setSelectedMessageTemplateId] = useState('');
  const [messageVariablesText, setMessageVariablesText] = useState('');
  const [messageOptOutReason, setMessageOptOutReason] = useState('');
  const [selectedSlotId, setSelectedSlotId] = useState('');
  const [handoffExamId, setHandoffExamId] = useState('');
  const [mergeLead, setMergeLead] = useState<AdmissionCrmLeadDto | null>(null);
  const [selectedDuplicateLeadId, setSelectedDuplicateLeadId] = useState('');
  const [mergeReason, setMergeReason] = useState('');
  const [examActionRecord, setExamActionRecord] = useState<AdmissionCrmEntranceExamDto | null>(
    null
  );
  const [examActionForm, setExamActionForm] = useState<ExamActionForm | null>(null);
  const [operationsLead, setOperationsLead] = useState<AdmissionCrmLeadDto | null>(null);
  const [ownerUserIdText, setOwnerUserIdText] = useState('');
  const [slaHoldReason, setSlaHoldReason] = useState<AdmissionCrmSlaHoldReason>(
    AdmissionCrmSlaHoldReason.ParentAction
  );
  const [slaHoldNotes, setSlaHoldNotes] = useState('');
  const [selectedPriority, setSelectedPriority] = useState<AdmissionCrmLeadPriority>(
    AdmissionCrmLeadPriority.None
  );
  const [priorityReason, setPriorityReason] = useState('');
  const [taskForm, setTaskForm] = useState<TaskForm>(() => defaultTaskForm());
  const [taskCompletionNotes, setTaskCompletionNotes] = useState<Record<string, string>>({});
  const [checklistStatusByKey, setChecklistStatusByKey] = useState<
    Record<string, AdmissionCrmApplicantChecklistProgressStatus>
  >({});
  const [checklistNotesByKey, setChecklistNotesByKey] = useState<Record<string, string>>({});
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<BulkAction | null>(null);
  const [bulkOwnerUserIdText, setBulkOwnerUserIdText] = useState('');
  const [bulkTaskForm, setBulkTaskForm] = useState<TaskForm>(() => defaultTaskForm());
  const [bulkStage, setBulkStage] = useState<AdmissionInquiryStage>(AdmissionInquiryStage.FollowUp);
  const [bulkMessageTemplateId, setBulkMessageTemplateId] = useState('');
  const [bulkMessageVariablesText, setBulkMessageVariablesText] = useState('');
  const [bulkReason, setBulkReason] = useState('');
  const [isBulkActionRunning, setIsBulkActionRunning] = useState(false);
  const scoreBandRange = getScoreBandRange(scoreBandFilter);

  const {
    data: leadsData,
    isLoading: isLeadsLoading,
    isFetching: isLeadsFetching,
    refetch: refetchLeads,
  } = useGetAdmissionCrmLeadsQuery(
    {
      academicYearId: academicYearId || '',
      maxResultCount: 200,
      sorting: 'LastActivityTime DESC',
      ...(stageFilter === 'all' ? {} : { stage: stageFilter }),
      ...(channelFilter === 'all' ? {} : { channel: channelFilter }),
      ...(campaignFilter === 'all' ? {} : { campaignName: campaignFilter }),
      ...(ownerFilter === 'all' || ownerFilter === 'unassigned'
        ? {}
        : { ownerUserId: ownerFilter }),
      ...(priorityFilter === 'all' ? {} : { priority: priorityFilter }),
    },
    { skip: !academicYearId }
  );
  const { data: stagesData, isFetching: isStagesFetching } = useGetAdmissionCrmPipelineStagesQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const { data: examsData, isFetching: isExamsFetching } = useGetAdmissionCrmEntranceExamsQuery(
    { academicYearId: academicYearId || '', maxResultCount: 200 },
    { skip: !academicYearId }
  );
  const { data: analyticsSummary, isFetching: isAnalyticsFetching } =
    useGetAdmissionCrmAnalyticsSummaryQuery(
      {
        academicYearId: academicYearId || '',
        fromDate: analyticsFromDate || undefined,
        toDate: analyticsToDate || undefined,
        ...(channelFilter === 'all' ? {} : { channel: channelFilter }),
        ...(campaignFilter === 'all' ? {} : { campaignName: campaignFilter }),
        ...(stageFilter === 'all' ? {} : { stage: stageFilter }),
        ...(ownerFilter === 'all' || ownerFilter === 'unassigned'
          ? {}
          : { ownerUserId: ownerFilter }),
        ...(scoreBandRange.minimumLeadScore == null
          ? {}
          : { minimumLeadScore: scoreBandRange.minimumLeadScore }),
        ...(scoreBandRange.maximumLeadScore == null
          ? {}
          : { maximumLeadScore: scoreBandRange.maximumLeadScore }),
      },
      { skip: !academicYearId }
    );
  const { data: operationsQueueSummary, isFetching: isOperationsSummaryFetching } =
    useGetAdmissionCrmOperationsQueueSummaryQuery(
      { academicYearId: academicYearId || '' },
      { skip: !academicYearId }
    );
  const { data: operationsQueue, isFetching: isOperationsQueueFetching } =
    useGetAdmissionCrmOperationsQueueQuery(
      {
        academicYearId: academicYearId || '',
        queueType: operationsQueueType,
        search: operationsSearch.trim() || undefined,
        ownerUserId: operationsOwnerUserId.trim() || undefined,
        assignedToUserId: operationsAssignedToUserId.trim() || undefined,
        urgentOnly: operationsUrgentOnly || undefined,
        minimumAgeDays: operationsMinimumAgeDays ? Number(operationsMinimumAgeDays) : undefined,
      },
      { skip: !academicYearId || view !== 'operations' }
    );
  const { data: operationsSavedViews } = useGetAdmissionCrmOperationsSavedViewsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId || view !== 'operations' }
  );
  const { data: slotsData, isFetching: isSlotsFetching } = useGetAdmissionCrmExamSlotsQuery(
    { academicYearId: academicYearId || '' },
    { skip: !academicYearId }
  );
  const { data: crmStaff = [] } = useGetAdmissionCrmStaffQuery();
  const { data: tasksData, isFetching: isTasksFetching } = useGetAdmissionCrmTasksQuery(
    { leadId: operationsLead?.id || '', maxResultCount: 50 },
    { skip: !operationsLead }
  );
  const { data: applicantChecklistData, isFetching: isApplicantChecklistFetching } =
    useGetAdmissionCrmLeadApplicantChecklistQuery(
      { leadId: operationsLead?.id || '' },
      { skip: !operationsLead }
    );
  const { data: approvedMessageTemplates } = useGetAdmissionCrmMessageTemplatesQuery(
    {
      academicYearId: academicYearId || '',
      status: AdmissionCrmMessageTemplateStatus.Approved,
      isActive: true,
      maxResultCount: 100,
    },
    { skip: !academicYearId }
  );
  const { data: deliveryLogsData, isFetching: isDeliveryLogsFetching } =
    useGetAdmissionCrmMessageDeliveryLogsQuery(
      {
        academicYearId: academicYearId || '',
        maxResultCount: 10,
        sorting: 'CreatedAt DESC',
        ...(deliveryLogChannelFilter === 'all' ? {} : { channel: deliveryLogChannelFilter }),
        ...(deliveryLogStatusFilter === 'all' ? {} : { status: deliveryLogStatusFilter }),
        ...(deliveryLogProviderMessageId.trim()
          ? { providerMessageId: deliveryLogProviderMessageId.trim() }
          : {}),
      },
      { skip: !academicYearId }
    );
  const { data: optOutsData, isFetching: isOptOutsFetching } =
    useGetAdmissionCrmCommunicationOptOutsQuery(
      {
        academicYearId: academicYearId || '',
        maxResultCount: 10,
        sorting: 'OptedOutAt DESC',
        ...(optOutChannelFilter === 'all' ? {} : { channel: optOutChannelFilter }),
        ...(optOutStatusFilter === 'all' ? {} : { isActive: optOutStatusFilter === 'active' }),
        ...(optOutContactSearch.trim() ? { contactSearch: optOutContactSearch.trim() } : {}),
      },
      { skip: !academicYearId }
    );
  const { data: timelineData, isFetching: isTimelineFetching } = useGetAdmissionCrmTimelineQuery(
    { leadId: timelineLead?.id || '', maxResultCount: 50 },
    { skip: !timelineLead }
  );
  const { data: slaHolds = [], isFetching: isSlaHoldsFetching } = useGetAdmissionCrmSlaHoldsQuery(
    { leadId: operationsLead?.id || '' },
    { skip: !operationsLead }
  );
  const { data: handoffData, isFetching: isHandoffFetching } =
    useGetAdmissionCrmEligibilityHandoffQuery(
      { examRecordId: handoffExamId },
      { skip: !handoffExamId }
    );

  const [createLead, { isLoading: isCreatingLead }] = useCreateAdmissionCrmLeadMutation();
  const [assignLeadOwner, { isLoading: isAssigningLeadOwner }] =
    useAssignAdmissionCrmLeadOwnerMutation();
  const [changeLeadPriority, { isLoading: isChangingLeadPriority }] =
    useChangeAdmissionCrmLeadPriorityMutation();
  const [changeLeadStage, { isLoading: isChangingLeadStage }] =
    useChangeAdmissionCrmLeadStageMutation();
  const [createTask, { isLoading: isCreatingTask }] = useCreateAdmissionCrmTaskMutation();
  const [bulkAssignOwners] = useBulkAssignAdmissionCrmLeadOwnersMutation();
  const [bulkCreateTasks] = useBulkCreateAdmissionCrmTasksMutation();
  const [bulkChangeStages] = useBulkChangeAdmissionCrmStagesMutation();
  const [bulkArchiveLeads] = useBulkArchiveAdmissionCrmLeadsMutation();
  const [bulkSendMessages] = useBulkSendAdmissionCrmMessagesMutation();
  const [createOperationsSavedView, createOperationsSavedViewState] =
    useCreateAdmissionCrmOperationsSavedViewMutation();
  const [deleteOperationsSavedView] = useDeleteAdmissionCrmOperationsSavedViewMutation();
  const [updateApplicantChecklist, { isLoading: isUpdatingApplicantChecklist }] =
    useUpdateAdmissionCrmLeadApplicantChecklistMutation();
  const [addLeadNote, { isLoading: isAddingLeadNote }] = useAddAdmissionCrmLeadNoteMutation();
  const [completeTask, { isLoading: isCompletingTask }] = useCompleteAdmissionCrmTaskMutation();
  const [previewDuplicates, { isLoading: isPreviewingDuplicates }] =
    usePreviewAdmissionCrmLeadDuplicatesMutation();
  const [runStaleRules, { isLoading: isRunningRules }] = useRunAdmissionCrmStaleRulesMutation();
  const [runSlaReminders, { isLoading: isRunningSlaReminders }] =
    useRunAdmissionCrmSlaRemindersMutation();
  const [createSlaHold, { isLoading: isCreatingSlaHold }] = useCreateAdmissionCrmSlaHoldMutation();
  const [resumeSlaHold, { isLoading: isResumingSlaHold }] = useResumeAdmissionCrmSlaHoldMutation();
  const [archiveLead, { isLoading: isArchivingLead }] = useArchiveAdmissionCrmLeadMutation();
  const [reopenLead, { isLoading: isReopeningLead }] = useReopenAdmissionCrmLeadMutation();
  const [mergeDuplicateLead, { isLoading: isMergingDuplicateLead }] =
    useMergeAdmissionCrmDuplicateLeadMutation();
  const [recalculateScore, { isLoading: isRecalculatingScore }] =
    useRecalculateAdmissionCrmLeadScoreMutation();
  const [scheduleExam, { isLoading: isSchedulingExam }] =
    useScheduleAdmissionCrmEntranceExamMutation();
  const [issueRegistrationForm, { isLoading: isIssuingRegistrationForm }] =
    useIssueAdmissionCrmRegistrationFormMutation();
  const [markExamAttendance, { isLoading: isMarkingExamAttendance }] =
    useMarkAdmissionCrmExamAttendanceMutation();
  const [uploadExamResult, { isLoading: isUploadingExamResult }] =
    useUploadAdmissionCrmExamResultMutation();
  const [decideExamEligibility, { isLoading: isDecidingExamEligibility }] =
    useDecideAdmissionCrmEligibilityMutation();
  const [sendTemplateMessage, { isLoading: isSendingTemplateMessage }] =
    useSendAdmissionCrmTemplateMessageMutation();
  const [retryMessageDelivery, { isLoading: isRetryingMessageDelivery }] =
    useRetryAdmissionCrmMessageDeliveryMutation();
  const [createCommunicationOptOut, { isLoading: isCreatingCommunicationOptOut }] =
    useCreateAdmissionCrmCommunicationOptOutMutation();
  const [clearCommunicationOptOut, { isLoading: isClearingCommunicationOptOut }] =
    useClearAdmissionCrmCommunicationOptOutMutation();

  const leads = useMemo(() => leadsData?.items || [], [leadsData?.items]);
  const exams = useMemo(() => examsData?.items || [], [examsData?.items]);
  const timelineEvents = timelineData?.items || [];
  const stages = stagesData?.length ? stagesData : fallbackStages;
  const stageDialogOptions = useMemo(
    () => (stageLead ? getManualStageOptionsForLead(stageLead, stages) : []),
    [stageLead, stages]
  );
  const slots = slotsData?.items || [];
  const filteredLeads = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesStage = stageFilter === 'all' || lead.stage === stageFilter;
      const matchesChannel = channelFilter === 'all' || lead.channel === channelFilter;
      const matchesCampaign = campaignFilter === 'all' || lead.campaignName === campaignFilter;
      const matchesOwner =
        ownerFilter === 'all' ||
        (ownerFilter === 'unassigned' ? !lead.ownerUserId : lead.ownerUserId === ownerFilter);
      const leadClass = lead.desiredClassName || lead.targetStandardId || '';
      const matchesClass = classFilter === 'all' || leadClass === classFilter;
      const matchesPriority = priorityFilter === 'all' || lead.priority === priorityFilter;
      const matchesScore =
        scoreBandFilter === 'all' ||
        ((scoreBandRange.minimumLeadScore == null ||
          lead.leadScore >= scoreBandRange.minimumLeadScore) &&
          (scoreBandRange.maximumLeadScore == null ||
            lead.leadScore <= scoreBandRange.maximumLeadScore));
      const searchable = [
        getAdmissionCrmLeadName(lead),
        lead.primaryContactNo,
        lead.email,
        lead.desiredClassName,
        lead.admissionIntent,
        lead.inquirySourceSnapshot,
        lead.campaignName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return (
        matchesStage &&
        matchesChannel &&
        matchesCampaign &&
        matchesOwner &&
        matchesClass &&
        matchesPriority &&
        matchesScore &&
        (!query || searchable.includes(query))
      );
    });
  }, [
    campaignFilter,
    channelFilter,
    classFilter,
    leads,
    ownerFilter,
    priorityFilter,
    scoreBandFilter,
    scoreBandRange.maximumLeadScore,
    scoreBandRange.minimumLeadScore,
    searchText,
    stageFilter,
  ]);
  const filteredLeadIds = useMemo(
    () => new Set(filteredLeads.map((lead) => lead.id)),
    [filteredLeads]
  );
  const selectedLeadIdSet = useMemo(() => new Set(selectedLeadIds), [selectedLeadIds]);
  const visibleLeadIds = useMemo(() => filteredLeads.map((lead) => lead.id), [filteredLeads]);
  const selectedLeads = useMemo(
    () => leads.filter((lead) => selectedLeadIdSet.has(lead.id)),
    [leads, selectedLeadIdSet]
  );
  const bulkStageOptions = useMemo(
    () =>
      manualStageOptions.filter(
        (stage) =>
          selectedLeads.length > 0 &&
          selectedLeads.every((lead) => getManualStageOptionsForLead(lead, stages).includes(stage))
      ),
    [selectedLeads, stages]
  );
  useEffect(() => {
    if (stageLead && stageDialogOptions.length > 0 && !stageDialogOptions.includes(selectedStage)) {
      setSelectedStage(stageDialogOptions[0]);
    }
  }, [selectedStage, stageDialogOptions, stageLead]);
  useEffect(() => {
    if (
      bulkAction === 'stage' &&
      bulkStageOptions.length > 0 &&
      !bulkStageOptions.includes(bulkStage)
    ) {
      setBulkStage(bulkStageOptions[0]);
    }
  }, [bulkAction, bulkStage, bulkStageOptions]);
  const isEveryVisibleLeadSelected =
    visibleLeadIds.length > 0 && visibleLeadIds.every((leadId) => selectedLeadIdSet.has(leadId));
  const isSomeVisibleLeadSelected = visibleLeadIds.some((leadId) => selectedLeadIdSet.has(leadId));
  const filteredExams = useMemo(
    () => exams.filter((exam) => filteredLeadIds.has(exam.leadId)),
    [exams, filteredLeadIds]
  );
  const kpis = useMemo(
    () => getAdmissionCrmKpis(filteredLeads, filteredExams),
    [filteredExams, filteredLeads]
  );
  const boardColumns = useMemo(
    () => buildAdmissionCrmBoardColumns(stages, filteredLeads),
    [filteredLeads, stages]
  );
  const isBusy =
    isLeadsLoading || isLeadsFetching || isStagesFetching || isExamsFetching || isAnalyticsFetching;
  const summaryKpis = [
    ['Total leads', analyticsSummary?.totalLeadCount ?? kpis.totalLeadCount],
    ['Active leads', analyticsSummary?.activeLeadCount ?? kpis.activeLeadCount],
    [
      'Exam scheduled',
      analyticsSummary
        ? `${analyticsSummary.examScheduledLeadCount} (${formatRate(analyticsSummary.examScheduledRate)})`
        : kpis.examScheduledCount,
    ],
    [
      'First response SLA',
      analyticsSummary
        ? `${analyticsSummary.slaAnalytics.firstResponseSlaMetCount}/${analyticsSummary.slaAnalytics.firstResponseCount} (${formatRate(
            analyticsSummary.slaAnalytics.firstResponseSlaMetRate
          )})`
        : '-',
    ],
    [
      'Duplicate warnings',
      analyticsSummary
        ? `${analyticsSummary.duplicateWarningCount} (${formatRate(
            analyticsSummary.duplicateWarningRate
          )})`
        : 0,
    ],
    [
      'Stale or archived',
      analyticsSummary
        ? `${analyticsSummary.staleOrArchivedLeadCount} (${formatRate(
            analyticsSummary.staleOrArchivedRate
          )})`
        : kpis.staleOrArchivedCount,
    ],
    [
      'Eligibility handoff',
      analyticsSummary
        ? `${analyticsSummary.eligibilityHandoffCount} (${formatRate(
            analyticsSummary.eligibilityHandoffRate
          )})`
        : kpis.eligibleCount,
    ],
  ] as const;
  const staffWorkload = analyticsSummary?.staffWorkload?.slice(0, 4) ?? [];
  const leadTasks = tasksData?.items || [];
  const applicantChecklist = applicantChecklistData || [];
  const messageTemplates = approvedMessageTemplates?.items || [];
  const deliveryLogs = deliveryLogsData?.items || [];
  const optOuts = optOutsData?.items || [];
  const examAnalytics = analyticsSummary?.examAnalytics;
  const registrationAnalytics = analyticsSummary?.registrationAnalytics;
  const documentAnalytics = analyticsSummary?.documentAnalytics;
  const finalAdmissionAnalytics = analyticsSummary?.finalAdmissionAnalytics;
  const financialAnalytics = analyticsSummary?.financialAnalytics;
  const householdIdentityAnalytics = analyticsSummary?.householdIdentityAnalytics;
  const policyAnalytics = analyticsSummary?.policyAnalytics;
  const routeAnalytics = analyticsSummary?.routeAnalytics;
  const activationAnalytics = analyticsSummary?.activationAnalytics;
  const automationAnalytics = analyticsSummary?.automationAnalytics;
  const recentAutomationRuns = automationAnalytics?.recentRuns?.slice(0, 5) ?? [];
  const recentAutomationFailures = automationAnalytics?.recentFailures?.slice(0, 5) ?? [];
  const campaignPerformance = analyticsSummary?.campaignPerformance?.slice(0, 5) ?? [];
  const dailyTrends = analyticsSummary?.dailyTrends ?? [];
  const recentDailyTrends = dailyTrends.slice(-7);
  const trendTotals = dailyTrends.reduce(
    (acc, trend) => ({
      leads: acc.leads + trend.leadCount,
      exams: acc.exams + trend.examScheduledCount,
      eligible: acc.eligible + trend.eligibleCount,
      stale: acc.stale + trend.staleCount,
      archived: acc.archived + trend.archivedCount,
      slaMissed: acc.slaMissed + trend.slaMissedCount,
    }),
    { leads: 0, exams: 0, eligible: 0, stale: 0, archived: 0, slaMissed: 0 }
  );
  const campaignOptions = useMemo(() => {
    const names = new Set<string>();
    analyticsSummary?.campaignPerformance?.forEach((campaign) => {
      if (campaign.campaignName) {
        names.add(campaign.campaignName);
      }
    });
    leads.forEach((lead) => {
      if (lead.campaignName) {
        names.add(lead.campaignName);
      }
    });

    return Array.from(names).sort((left, right) => left.localeCompare(right));
  }, [analyticsSummary, leads]);
  const ownerOptions = useMemo(() => {
    const owners = new Set<string>();
    leads.forEach((lead) => {
      if (lead.ownerUserId) {
        owners.add(lead.ownerUserId);
      }
    });
    analyticsSummary?.staffWorkload?.forEach((item) => {
      if (item.ownerUserId) {
        owners.add(item.ownerUserId);
      }
    });
    crmStaff.forEach((staff) => owners.add(staff.id));

    return Array.from(owners).sort((left, right) => left.localeCompare(right));
  }, [analyticsSummary, crmStaff, leads]);
  const getOwnerDisplayName = (ownerUserId: string) =>
    crmStaff.find((staff) => staff.id === ownerUserId)?.displayName || 'Assigned staff';
  const classOptions = useMemo(() => {
    const classes = new Set<string>();
    leads.forEach((lead) => {
      const leadClass = lead.desiredClassName || lead.targetStandardId;
      if (leadClass) {
        classes.add(leadClass);
      }
    });

    return Array.from(classes).sort((left, right) => left.localeCompare(right));
  }, [leads]);
  const leadNameById = useMemo(
    () => new Map(leads.map((lead) => [lead.id, getAdmissionCrmLeadName(lead)])),
    [leads]
  );
  const selectedMessageTemplate = messageTemplates.find(
    (template) => template.id === selectedMessageTemplateId
  );
  const selectedMessageRecipient =
    messageLead && selectedMessageTemplate
      ? getAdmissionCrmRecipientForMessageChannel(messageLead, selectedMessageTemplate.channel)
      : '';
  const examOutcomeMetrics = examAnalytics
    ? [
        ['Attendance', formatRate(examAnalytics.attendanceRate)],
        ['Pass', formatRate(examAnalytics.passRate)],
        ['Eligibility', formatRate(examAnalytics.eligibilityRate)],
        ['Waitlist', formatRate(examAnalytics.waitlistRate)],
        ['Rejection', formatRate(examAnalytics.rejectionRate)],
        ['Slot utilization', formatRate(examAnalytics.slotUtilizationRate)],
        ['Over capacity', examAnalytics.overCapacitySlotCount],
        ['Overrides', examAnalytics.capacityOverrideCount + examAnalytics.eligibilityOverrideCount],
      ]
    : [];
  const examClassPerformance = examAnalytics?.classPerformance?.slice(0, 4) ?? [];

  useEffect(() => {
    const leadIds = new Set(leads.map((lead) => lead.id));
    setSelectedLeadIds((prev) => prev.filter((leadId) => leadIds.has(leadId)));
  }, [leads]);

  const resetQuickForm = () => {
    setQuickForm(defaultQuickLeadForm);
    setDuplicateMatches([]);
    setDuplicateAcknowledged(false);
  };

  const handleClearWorkspaceFilters = () => {
    setSearchText('');
    setStageFilter('all');
    setChannelFilter('all');
    setCampaignFilter('all');
    setOwnerFilter('all');
    setClassFilter('all');
    setScoreBandFilter('all');
    setPriorityFilter('all');
  };

  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(leadId) ? prev.filter((id) => id !== leadId) : [...prev, leadId]
    );
  };

  const toggleVisibleLeadSelection = () => {
    setSelectedLeadIds((prev) => {
      if (isEveryVisibleLeadSelected) {
        return prev.filter((leadId) => !filteredLeadIds.has(leadId));
      }

      const next = new Set(prev);
      visibleLeadIds.forEach((leadId) => next.add(leadId));
      return Array.from(next);
    });
  };

  const openBulkAction = (action: BulkAction) => {
    setBulkAction(action);
    setBulkOwnerUserIdText('');
    setBulkTaskForm(defaultTaskForm());
    setBulkStage(AdmissionInquiryStage.FollowUp);
    setBulkMessageTemplateId('');
    setBulkMessageVariablesText('');
    setBulkReason('');
  };

  const closeBulkAction = () => {
    setBulkAction(null);
    setBulkReason('');
  };

  const handleQuickFormChange = (
    field: keyof QuickLeadForm,
    value: string | AdmissionInquiryChannel
  ) => {
    setQuickForm((prev) => ({ ...prev, [field]: value }));
    if (field === 'duplicateContinueReason') {
      return;
    }

    setDuplicateMatches([]);
    setDuplicateAcknowledged(false);
  };

  const handleCreateLead = async () => {
    if (!academicYearId) {
      shikshaMitraToast.error({ message: 'Select an academic year before creating an inquiry.' });
      return;
    }

    if (!quickForm.primaryContactNo.trim() && !quickForm.email.trim()) {
      shikshaMitraToast.error({ message: 'Contact number or email is required.' });
      return;
    }

    if (!quickForm.admissionIntent.trim()) {
      shikshaMitraToast.error({ message: 'Admission intent is required.' });
      return;
    }

    try {
      if (!duplicateAcknowledged) {
        const duplicates = await previewDuplicates({
          academicYearId,
          body: {
            firstName: quickForm.firstName || undefined,
            dateOfBirth: quickForm.dateOfBirth
              ? new Date(quickForm.dateOfBirth).toISOString()
              : undefined,
            parentGuardianName: quickForm.parentGuardianName || undefined,
            primaryContactNo: quickForm.primaryContactNo || undefined,
            email: quickForm.email || undefined,
            admissionIntent: quickForm.admissionIntent,
            desiredClassName: quickForm.desiredClassName || undefined,
            campaignName: quickForm.campaignName || undefined,
          },
        }).unwrap();

        if (duplicates.length > 0) {
          setDuplicateMatches(duplicates);
          setDuplicateAcknowledged(true);
          return;
        }
      }

      if (duplicateMatches.length > 0 && !quickForm.duplicateContinueReason.trim()) {
        shikshaMitraToast.error({
          message: 'Enter a reason before creating a duplicate inquiry.',
        });
        return;
      }

      const body: CreateAdmissionCrmLeadDto = {
        channel: quickForm.channel,
        campaignName: quickForm.campaignName || undefined,
        campusBranchName: quickForm.campusBranchName || undefined,
        preferredCommunicationLanguage: quickForm.preferredCommunicationLanguage || undefined,
        firstName: quickForm.firstName || undefined,
        dateOfBirth: quickForm.dateOfBirth
          ? new Date(quickForm.dateOfBirth).toISOString()
          : undefined,
        parentGuardianName: quickForm.parentGuardianName || undefined,
        primaryContactNo: quickForm.primaryContactNo || undefined,
        email: quickForm.email || undefined,
        admissionIntent: quickForm.admissionIntent,
        desiredClassName: quickForm.desiredClassName || undefined,
        notes: quickForm.notes || undefined,
        duplicateContinueReason: quickForm.duplicateContinueReason || undefined,
      };

      await createLead({ academicYearId, body }).unwrap();
      shikshaMitraToast.success({ message: 'Inquiry lead created.' });
      setQuickDialogOpen(false);
      resetQuickForm();
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to create inquiry lead.'),
      });
    }
  };

  const handleRunStaleRules = async () => {
    if (!academicYearId) return;

    try {
      await runStaleRules({ academicYearId }).unwrap();
      shikshaMitraToast.success({ message: 'Stale and archive rules applied.' });
    } catch (error) {
      shikshaMitraToast.error({ message: getApiErrorMessage(error, 'Unable to run CRM rules.') });
    }
  };

  const handleRunSlaReminders = async () => {
    if (!academicYearId) return;

    try {
      const result = await runSlaReminders({ academicYearId }).unwrap();
      shikshaMitraToast.success({
        message: `${result.createdTaskCount} SLA reminder task(s) created.`,
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to run SLA reminders.'),
      });
    }
  };

  const handleCreateSlaHold = async () => {
    if (!operationsLead || !slaHoldNotes.trim()) return;
    try {
      await createSlaHold({
        leadId: operationsLead.id,
        holdReason: slaHoldReason,
        reason: slaHoldNotes.trim(),
      }).unwrap();
      setSlaHoldNotes('');
      shikshaMitraToast.success({ message: 'SLA clock paused.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to pause the SLA clock.'),
      });
    }
  };

  const handleResumeSlaHold = async (holdId: string) => {
    if (!slaHoldNotes.trim()) return;
    try {
      await resumeSlaHold({ holdId, reason: slaHoldNotes.trim() }).unwrap();
      setSlaHoldNotes('');
      shikshaMitraToast.success({ message: 'SLA clock resumed.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to resume the SLA clock.'),
      });
    }
  };

  const handleArchiveToggle = async (lead: AdmissionCrmLeadDto) => {
    try {
      if (lead.stage === AdmissionInquiryStage.Archived) {
        await reopenLead({
          leadId: lead.id,
          body: { reason: 'Reopened from admissions CRM workspace.' },
        }).unwrap();
        shikshaMitraToast.success({ message: 'Lead reopened.' });
        return;
      }

      await archiveLead({
        leadId: lead.id,
        body: { reason: 'Archived from admissions CRM workspace.' },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Lead archived.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to update lead status.'),
      });
    }
  };

  const handleRecalculateScore = async (lead: AdmissionCrmLeadDto) => {
    try {
      await recalculateScore({ leadId: lead.id }).unwrap();
      shikshaMitraToast.success({ message: 'Lead score recalculated.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to recalculate score.'),
      });
    }
  };

  const handleOpenOperationsDialog = (lead: AdmissionCrmLeadDto) => {
    setOperationsLead(lead);
    setOwnerUserIdText(lead.ownerUserId || '');
    setSelectedPriority(lead.priority);
    setPriorityReason('');
    setTaskForm(defaultTaskForm());
    setTaskCompletionNotes({});
    setChecklistStatusByKey({});
    setChecklistNotesByKey({});
  };

  const handleOpenRegistrationFormDialog = (lead: AdmissionCrmLeadDto) => {
    setRegistrationLead(lead);
    setRegistrationFormNumber('');
    setRegistrationFormAmount('250');
  };

  const handleIssueRegistrationForm = async () => {
    if (!registrationLead) return;

    const formNumber = registrationFormNumber.trim().toUpperCase();
    const amount = Number(registrationFormAmount);

    if (!formNumber) {
      shikshaMitraToast.error({ message: 'Enter a registration form number.' });
      return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      shikshaMitraToast.error({ message: 'Enter a valid registration amount.' });
      return;
    }

    try {
      await issueRegistrationForm({
        leadId: registrationLead.id,
        body: {
          formNumber,
          amount,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Registration form issued.' });
      setRegistrationLead(null);
      setRegistrationFormNumber('');
      setRegistrationFormAmount('250');
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to issue registration form.'),
      });
    }
  };

  const handleOpenStageDialog = (lead: AdmissionCrmLeadDto) => {
    const options = getManualStageOptionsForLead(lead, stages);
    setStageLead(lead);
    setSelectedStage(options[0] ?? AdmissionInquiryStage.FollowUp);
    setStageReason('');
  };

  const handleOpenNoteDialog = (lead: AdmissionCrmLeadDto, callNote = false) => {
    setNoteLead(lead);
    setIsCallNote(callNote);
    setNoteText('');
  };

  const handleSaveOwner = async () => {
    if (!operationsLead) return;

    const ownerUserId = ownerUserIdText.trim() || null;

    try {
      const updated = await assignLeadOwner({
        leadId: operationsLead.id,
        body: { ownerUserId },
      }).unwrap();
      setOperationsLead(updated);
      setOwnerUserIdText(updated.ownerUserId || '');
      shikshaMitraToast.success({
        message: ownerUserId ? 'Lead owner assigned.' : 'Lead owner cleared.',
      });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to update lead owner.'),
      });
    }
  };

  const handleSavePriority = async () => {
    if (!operationsLead) return;

    try {
      const updated = await changeLeadPriority({
        leadId: operationsLead.id,
        body: {
          priority: selectedPriority,
          reason: priorityReason.trim() || null,
        },
      }).unwrap();
      setOperationsLead(updated);
      setSelectedPriority(updated.priority);
      setPriorityReason('');
      shikshaMitraToast.success({ message: 'Lead priority updated.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to update lead priority.'),
      });
    }
  };

  const handleAddLeadNote = async () => {
    if (!noteLead) return;

    if (!noteText.trim()) {
      shikshaMitraToast.error({ message: 'Enter a lead note.' });
      return;
    }

    try {
      await addLeadNote({
        leadId: noteLead.id,
        body: {
          note: noteText.trim(),
          isCallNote,
        },
      }).unwrap();
      shikshaMitraToast.success({
        message: isCallNote ? 'Call note added.' : 'Lead note added.',
      });
      setNoteLead(null);
      setNoteText('');
      setIsCallNote(false);
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to add lead note.'),
      });
    }
  };

  const handleCreateTask = async () => {
    if (!operationsLead) return;

    if (!taskForm.title.trim()) {
      shikshaMitraToast.error({ message: 'Enter a follow-up task title.' });
      return;
    }

    if (!taskForm.dueAt || !dayjs(taskForm.dueAt).isValid()) {
      shikshaMitraToast.error({ message: 'Enter a valid follow-up due date.' });
      return;
    }

    try {
      await createTask({
        leadId: operationsLead.id,
        body: {
          title: taskForm.title.trim(),
          dueAt: dayjs(taskForm.dueAt).toISOString(),
          assignedUserId: taskForm.assignedUserId.trim() || undefined,
          notes: taskForm.notes.trim() || undefined,
        },
      }).unwrap();
      setTaskForm(defaultTaskForm());
      shikshaMitraToast.success({ message: 'Follow-up task created.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to create follow-up task.'),
      });
    }
  };

  const handleCompleteTask = async (task: AdmissionCrmFollowUpTaskDto) => {
    try {
      await completeTask({
        taskId: task.id,
        body: { completionNotes: taskCompletionNotes[task.id]?.trim() || undefined },
      }).unwrap();
      setTaskCompletionNotes((prev) => {
        const next = { ...prev };
        delete next[task.id];
        return next;
      });
      shikshaMitraToast.success({ message: 'Follow-up task completed.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to complete follow-up task.'),
      });
    }
  };

  const handleUpdateApplicantChecklist = async (
    item: AdmissionCrmApplicantChecklistProgressDto
  ) => {
    if (!operationsLead) return;

    const status = checklistStatusByKey[item.key] ?? item.status;
    const notes = checklistNotesByKey[item.key] ?? item.notes ?? '';

    try {
      const updated = await updateApplicantChecklist({
        leadId: operationsLead.id,
        key: item.key,
        body: {
          status,
          notes: notes.trim() || null,
        },
      }).unwrap();
      setChecklistStatusByKey((prev) => ({ ...prev, [item.key]: updated.status }));
      setChecklistNotesByKey((prev) => ({ ...prev, [item.key]: updated.notes || '' }));
      shikshaMitraToast.success({ message: 'Applicant checklist updated.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to update applicant checklist.'),
      });
    }
  };

  const handleChangeStage = async () => {
    if (!stageLead) return;

    if (!stageReason.trim()) {
      shikshaMitraToast.error({ message: 'Enter a stage change reason.' });
      return;
    }

    if (!stageDialogOptions.includes(selectedStage)) {
      shikshaMitraToast.error({ message: 'Select an allowed next stage for this lead.' });
      return;
    }

    try {
      await changeLeadStage({
        leadId: stageLead.id,
        body: {
          stage: selectedStage,
          reason: stageReason.trim(),
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Pipeline stage updated.' });
      setStageLead(null);
      setStageReason('');
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to update pipeline stage.'),
      });
    }
  };

  const handleRunBulkAction = async () => {
    if (!bulkAction || selectedLeads.length === 0) {
      shikshaMitraToast.error({ message: 'Select at least one lead.' });
      return;
    }

    if (bulkAction === 'task') {
      if (!bulkTaskForm.title.trim()) {
        shikshaMitraToast.error({ message: 'Enter a follow-up task title.' });
        return;
      }

      if (!bulkTaskForm.dueAt || !dayjs(bulkTaskForm.dueAt).isValid()) {
        shikshaMitraToast.error({ message: 'Enter a valid follow-up due date.' });
        return;
      }
    }

    if (bulkAction === 'message' && !bulkMessageTemplateId) {
      shikshaMitraToast.error({ message: 'Select an approved message template.' });
      return;
    }

    if ((bulkAction === 'stage' || bulkAction === 'archive') && !bulkReason.trim()) {
      shikshaMitraToast.error({ message: 'Enter a bulk action reason.' });
      return;
    }

    if (
      bulkAction === 'stage' &&
      selectedLeads.some((lead) => getManualStageOptionsForLead(lead, stages).length === 0)
    ) {
      shikshaMitraToast.error({
        message: 'Stage movement is not available for one or more selected leads.',
      });
      return;
    }

    if (bulkAction === 'stage' && !bulkStageOptions.includes(bulkStage)) {
      shikshaMitraToast.error({
        message: 'Select a stage that is allowed for all selected leads.',
      });
      return;
    }

    if (!academicYearId) {
      shikshaMitraToast.error({
        message: 'Select an academic year before applying a bulk action.',
      });
      return;
    }

    setIsBulkActionRunning(true);
    try {
      const leadIds = selectedLeads.map((lead) => lead.id);
      const result =
        bulkAction === 'owner'
          ? await bulkAssignOwners({
              academicYearId,
              items: leadIds.map((leadId) => ({
                leadId,
                ownerUserId: bulkOwnerUserIdText.trim() || null,
              })),
            }).unwrap()
          : bulkAction === 'task'
            ? await bulkCreateTasks({
                academicYearId,
                leadIds,
                title: bulkTaskForm.title.trim(),
                dueAt: dayjs(bulkTaskForm.dueAt).toISOString(),
                assignedUserId: bulkTaskForm.assignedUserId.trim() || undefined,
                notes: bulkTaskForm.notes.trim() || undefined,
              }).unwrap()
            : bulkAction === 'stage'
              ? await bulkChangeStages({
                  academicYearId,
                  leadIds,
                  stage: bulkStage,
                  reason: bulkReason.trim(),
                }).unwrap()
              : bulkAction === 'archive'
                ? await bulkArchiveLeads({
                    academicYearId,
                    leadIds,
                    reason: bulkReason.trim(),
                  }).unwrap()
                : await bulkSendMessages({
                    academicYearId,
                    leadIds,
                    templateId: bulkMessageTemplateId,
                    variables: parseVariablesText(bulkMessageVariablesText),
                  }).unwrap();

      if (result.failedCount > 0) {
        const failedIds = result.items.filter((item) => !item.success).map((item) => item.entityId);
        const reasons = [
          ...new Set(
            result.items
              .filter((item) => !item.success)
              .map((item) => item.errorCode || 'Item failed')
          ),
        ];
        setSelectedLeadIds(failedIds);
        shikshaMitraToast.error({
          message: `${result.succeededCount} completed; ${result.failedCount} need attention. ${reasons.slice(0, 3).join(', ')}`,
        });
      } else {
        shikshaMitraToast.success({
          message: `Bulk action applied to ${result.succeededCount} lead(s).`,
        });
        setSelectedLeadIds([]);
        closeBulkAction();
      }
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to complete bulk action.'),
      });
    } finally {
      setIsBulkActionRunning(false);
    }
  };

  const getOperationsFilters = (): AdmissionCrmOperationsQueueFilters => ({
    search: operationsSearch.trim() || undefined,
    ownerUserId: operationsOwnerUserId.trim() || undefined,
    assignedToUserId: operationsAssignedToUserId.trim() || undefined,
    urgentOnly: operationsUrgentOnly || undefined,
    minimumAgeDays: operationsMinimumAgeDays ? Number(operationsMinimumAgeDays) : undefined,
    maxResultCount: 200,
  });

  const handleSaveOperationsView = async () => {
    if (!academicYearId || !operationsSavedViewName.trim()) {
      shikshaMitraToast.error({ message: 'Enter a saved-view name.' });
      return;
    }
    try {
      await createOperationsSavedView({
        academicYearId,
        name: operationsSavedViewName.trim(),
        queueType: operationsQueueType,
        filters: getOperationsFilters(),
        isShared: false,
      }).unwrap();
      setOperationsSavedViewName('');
      shikshaMitraToast.success({ message: 'Operations view saved.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to save the operations view.'),
      });
    }
  };

  const applyOperationsSavedView = (savedView: {
    queueType: AdmissionCrmOperationsQueueType;
    filters: AdmissionCrmOperationsQueueFilters;
  }) => {
    setOperationsQueueType(savedView.queueType);
    setOperationsSearch(savedView.filters.search || '');
    setOperationsOwnerUserId(savedView.filters.ownerUserId || '');
    setOperationsAssignedToUserId(savedView.filters.assignedToUserId || '');
    setOperationsUrgentOnly(Boolean(savedView.filters.urgentOnly));
    setOperationsMinimumAgeDays(savedView.filters.minimumAgeDays?.toString() || '');
  };

  const handleOpenMergeDialog = (lead: AdmissionCrmLeadDto) => {
    if (!lead.likelyDuplicates.length) {
      shikshaMitraToast.error({
        message: 'Refresh the lead list before merging this duplicate inquiry.',
      });
      return;
    }

    setMergeLead(lead);
    setSelectedDuplicateLeadId(lead.likelyDuplicates[0].leadId);
    setMergeReason('');
  };

  const handleMergeDuplicate = async () => {
    if (!mergeLead || !selectedDuplicateLeadId || !mergeReason.trim()) {
      shikshaMitraToast.error({
        message: 'Select a duplicate inquiry and enter a merge reason.',
      });
      return;
    }

    try {
      await mergeDuplicateLead({
        leadId: mergeLead.id,
        body: {
          duplicateLeadId: selectedDuplicateLeadId,
          reason: mergeReason.trim(),
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Duplicate inquiry merged.' });
      setMergeLead(null);
      setSelectedDuplicateLeadId('');
      setMergeReason('');
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to merge duplicate inquiry.'),
      });
    }
  };

  const handleOpenExamActions = (exam: AdmissionCrmEntranceExamDto) => {
    setExamActionRecord(exam);
    setExamActionForm(buildExamActionForm(exam));
  };

  const handleSaveExamAttendance = async () => {
    if (!examActionRecord || !examActionForm) return;

    try {
      const updated = await markExamAttendance({
        examRecordId: examActionRecord.id,
        body: { attendanceStatus: examActionForm.attendanceStatus },
      }).unwrap();
      setExamActionRecord(updated);
      setExamActionForm(buildExamActionForm(updated));
      shikshaMitraToast.success({ message: 'Exam attendance saved.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to save exam attendance.'),
      });
    }
  };

  const handleSaveExamResult = async () => {
    if (!examActionRecord || !examActionForm) return;

    const totalMarks = Number(examActionForm.totalMarks);
    const passingMarks = Number(examActionForm.passingMarks);
    const obtainedMarks = Number(examActionForm.obtainedMarks);
    const meritRank = examActionForm.meritRank.trim()
      ? Number(examActionForm.meritRank)
      : undefined;

    if (
      !Number.isFinite(totalMarks) ||
      !Number.isFinite(passingMarks) ||
      !Number.isFinite(obtainedMarks) ||
      totalMarks <= 0 ||
      passingMarks < 0 ||
      obtainedMarks < 0 ||
      obtainedMarks > totalMarks ||
      (meritRank != null && (!Number.isFinite(meritRank) || meritRank <= 0))
    ) {
      shikshaMitraToast.error({
        message: 'Enter valid total, passing, obtained marks, and optional merit rank.',
      });
      return;
    }

    try {
      const updated = await uploadExamResult({
        examRecordId: examActionRecord.id,
        body: {
          totalMarks,
          passingMarks,
          obtainedMarks,
          meritRank,
        },
      }).unwrap();
      setExamActionRecord(updated);
      setExamActionForm(buildExamActionForm(updated));
      shikshaMitraToast.success({ message: 'Exam result saved.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to save exam result.'),
      });
    }
  };

  const handleSaveEligibilityDecision = async () => {
    if (!examActionRecord || !examActionForm) return;

    if (examActionForm.eligibilityDecision === AdmissionCrmEligibilityDecision.Pending) {
      shikshaMitraToast.error({ message: 'Select an eligibility decision.' });
      return;
    }

    if (!examActionForm.eligibilityDecisionReason.trim()) {
      shikshaMitraToast.error({ message: 'Enter the eligibility decision reason.' });
      return;
    }

    if (examActionForm.overrideDecision && !examActionForm.overrideReason.trim()) {
      shikshaMitraToast.error({ message: 'Enter an override reason.' });
      return;
    }

    const meritRank = examActionForm.meritRank.trim()
      ? Number(examActionForm.meritRank)
      : undefined;
    if (meritRank != null && (!Number.isFinite(meritRank) || meritRank <= 0)) {
      shikshaMitraToast.error({ message: 'Enter a valid merit rank.' });
      return;
    }

    try {
      const updated = await decideExamEligibility({
        examRecordId: examActionRecord.id,
        body: {
          decision: examActionForm.eligibilityDecision,
          reason: examActionForm.eligibilityDecisionReason.trim(),
          meritRank,
          overrideDecision: examActionForm.overrideDecision,
          overrideReason: examActionForm.overrideDecision
            ? examActionForm.overrideReason.trim()
            : undefined,
        },
      }).unwrap();
      setExamActionRecord(updated);
      setExamActionForm(buildExamActionForm(updated));
      shikshaMitraToast.success({ message: 'Eligibility decision saved.' });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to save eligibility decision.'),
      });
    }
  };

  const handleScheduleExam = async () => {
    if (!scheduleLead || !selectedSlotId) {
      shikshaMitraToast.error({ message: 'Select an entrance exam slot.' });
      return;
    }

    try {
      await scheduleExam({
        leadId: scheduleLead.id,
        body: { entranceExamSlotId: selectedSlotId },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Entrance exam scheduled.' });
      setScheduleLead(null);
      setSelectedSlotId('');
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to schedule entrance exam.'),
      });
    }
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

  const parseMessageVariables = () => parseVariablesText(messageVariablesText);

  const resetMessageDialog = () => {
    setMessageLead(null);
    setSelectedMessageTemplateId('');
    setMessageVariablesText('');
    setMessageOptOutReason('');
  };

  const handleSendTemplateMessage = async () => {
    if (!messageLead || !selectedMessageTemplateId) {
      shikshaMitraToast.error({ message: 'Select an approved message template.' });
      return;
    }

    try {
      const result = await sendTemplateMessage({
        leadId: messageLead.id,
        body: {
          templateId: selectedMessageTemplateId,
          variables: parseMessageVariables(),
        },
      }).unwrap();
      shikshaMitraToast.success({ message: `Message status: ${result.status}.` });
      resetMessageDialog();
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to send message template.'),
      });
    }
  };

  const handleCreateMessageOptOut = async () => {
    if (!academicYearId || !messageLead || !selectedMessageTemplate) {
      shikshaMitraToast.error({ message: 'Select a lead and message template first.' });
      return;
    }

    if (!selectedMessageRecipient) {
      shikshaMitraToast.error({ message: 'Selected channel does not have a recipient.' });
      return;
    }

    if (!messageOptOutReason.trim()) {
      shikshaMitraToast.error({ message: 'Enter an opt-out reason.' });
      return;
    }

    try {
      await createCommunicationOptOut({
        academicYearId,
        body: {
          leadId: messageLead.id,
          channel: selectedMessageTemplate.channel,
          contactValue: selectedMessageRecipient,
          reason: messageOptOutReason,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Communication opt-out recorded.' });
      setMessageOptOutReason('');
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to record communication opt-out.'),
      });
    }
  };

  const handleClearMessageOptOut = async () => {
    if (!academicYearId || !messageLead || !selectedMessageTemplate) {
      shikshaMitraToast.error({ message: 'Select a lead and message template first.' });
      return;
    }

    if (!selectedMessageRecipient) {
      shikshaMitraToast.error({ message: 'Selected channel does not have a recipient.' });
      return;
    }

    if (!messageOptOutReason.trim()) {
      shikshaMitraToast.error({ message: 'Enter an opt-in reason.' });
      return;
    }

    try {
      await clearCommunicationOptOut({
        academicYearId,
        body: {
          leadId: messageLead.id,
          channel: selectedMessageTemplate.channel,
          contactValue: selectedMessageRecipient,
          reason: messageOptOutReason,
        },
      }).unwrap();
      shikshaMitraToast.success({ message: 'Communication opt-out cleared.' });
      setMessageOptOutReason('');
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to clear communication opt-out.'),
      });
    }
  };

  const handleRetryMessageDelivery = async (log: AdmissionCrmMessageDeliveryLogDto) => {
    try {
      const result = await retryMessageDelivery({
        deliveryLogId: log.id,
        body: { reason: 'Staff retry from Inquiry CRM workspace' },
      }).unwrap();
      shikshaMitraToast.success({ message: `Retry status: ${result.status}.` });
    } catch (error) {
      shikshaMitraToast.error({
        message: getApiErrorMessage(error, 'Unable to retry message delivery.'),
      });
    }
  };

  const renderLeadCard = (lead: AdmissionCrmLeadDto) => {
    const canSchedule = isExamReady(lead);

    return (
      <Card
        key={lead.id}
        variant="outlined"
        sx={{
          p: 1.25,
          borderRadius: 1,
          display: 'grid',
          gap: 1,
          minWidth: 0,
          boxShadow: 'none',
        }}
      >
        <Stack direction="row" justifyContent="space-between" gap={1} alignItems="flex-start">
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
              {getAdmissionCrmLeadName(lead)}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              {lead.desiredClassName || 'Class not captured'}
            </Typography>
          </Box>
          <Stack direction="row" gap={0.5} sx={{ flexShrink: 0 }}>
            <Chip
              size="small"
              color={leadPriorityColors[lead.priority]}
              label={leadPriorityLabels[lead.priority]}
              icon={<Flag sx={{ width: 14, height: 14 }} />}
            />
            <Chip
              size="small"
              label={lead.leadScore}
              icon={<Star sx={{ width: 14, height: 14 }} />}
            />
          </Stack>
        </Stack>

        <Stack spacing={0.25}>
          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
            {lead.primaryContactNo || lead.email || 'No contact'}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
            {getAdmissionCrmChannelLabel(lead.channel)}
            {lead.inquirySourceSnapshot ? ` - ${lead.inquirySourceSnapshot}` : ''}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
            {getLeadOwnerLabel(lead, crmStaff)}
          </Typography>
          <Stack direction="row" gap={0.75} flexWrap="wrap" sx={{ pt: 0.5 }}>
            <Tooltip
              title={
                lead.registrationFormNumber
                  ? `Issued${lead.registrationFormIssuedAt ? ` on ${dayjs(lead.registrationFormIssuedAt).format('DD MMM YYYY')}` : ''}`
                  : 'Registration form not issued'
              }
            >
              <Chip
                size="small"
                color={lead.registrationFormNumber ? 'success' : 'default'}
                variant={lead.registrationFormNumber ? 'filled' : 'outlined'}
                icon={<ReceiptLong sx={{ width: 14, height: 14 }} />}
                label={
                  lead.registrationFormNumber
                    ? `Form ${lead.registrationFormNumber}`
                    : 'Form pending'
                }
                sx={{
                  maxWidth: '100%',
                  '& .MuiChip-label': {
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  },
                }}
              />
            </Tooltip>
          </Stack>
        </Stack>

        {lead.likelyDuplicateCount > 0 && (
          <Alert
            icon={<WarningAmber fontSize="small" />}
            severity="warning"
            action={
              <Button
                size="small"
                color="warning"
                startIcon={<CallMerge />}
                disabled={isMergingDuplicateLead}
                onClick={() => handleOpenMergeDialog(lead)}
              >
                Merge
              </Button>
            }
            sx={{ py: 0 }}
          >
            {lead.likelyDuplicateCount} possible duplicate
          </Alert>
        )}

        <Stack direction="row" gap={0.75} flexWrap="wrap">
          <Tooltip
            title={
              canSchedule ? 'Schedule entrance exam' : 'Capture contact, intent, and class first'
            }
          >
            <span>
              <Button
                size="small"
                variant="outlined"
                startIcon={<EventAvailable />}
                disabled={!canSchedule || isSchedulingExam}
                onClick={() => {
                  setScheduleLead(lead);
                  setSelectedSlotId('');
                }}
              >
                Exam
              </Button>
            </span>
          </Tooltip>
          <Button
            size="small"
            variant="text"
            startIcon={<ReceiptLong />}
            disabled={Boolean(lead.registrationFormNumber) || isIssuingRegistrationForm}
            onClick={() => handleOpenRegistrationFormDialog(lead)}
          >
            {lead.registrationFormNumber ? 'Form Issued' : 'Issue Form'}
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<AssignmentInd />}
            onClick={() => handleOpenOperationsDialog(lead)}
          >
            Manage
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<Notes />}
            disabled={isAddingLeadNote}
            onClick={() => handleOpenNoteDialog(lead)}
          >
            Note
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<SwapHoriz />}
            disabled={
              getManualStageOptionsForLead(lead, stages).length === 0 || isChangingLeadStage
            }
            onClick={() => handleOpenStageDialog(lead)}
          >
            Stage
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<History />}
            onClick={() => setTimelineLead(lead)}
          >
            Timeline
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<Send />}
            disabled={!messageTemplates.length || isSendingTemplateMessage}
            onClick={() => {
              setMessageLead(lead);
              setSelectedMessageTemplateId('');
              setMessageVariablesText('');
              setMessageOptOutReason('');
            }}
          >
            Message
          </Button>
          <Button
            size="small"
            variant="text"
            startIcon={<Star />}
            disabled={isRecalculatingScore}
            onClick={() => handleRecalculateScore(lead)}
          >
            Score
          </Button>
          <Button
            size="small"
            color={lead.stage === AdmissionInquiryStage.Archived ? 'primary' : 'inherit'}
            startIcon={<Archive />}
            disabled={isArchivingLead || isReopeningLead}
            onClick={() => handleArchiveToggle(lead)}
          >
            {lead.stage === AdmissionInquiryStage.Archived ? 'Reopen' : 'Archive'}
          </Button>
        </Stack>
      </Card>
    );
  };

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      <CustomBreadcrumbs
        heading={heading}
        links={[
          { name: 'Student', href: '/student/dashboard' },
          { name: 'Student Enrollment', href: '/student/enrollment/dashboard' },
          { name: heading },
        ]}
        action={
          <Stack direction="row" gap={1} flexWrap="wrap">
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => refetchLeads()}
              disabled={!academicYearId || isLeadsFetching}
            >
              Refresh
            </Button>
            <LoadingButton
              variant="outlined"
              startIcon={<AssignmentTurnedIn />}
              loading={isRunningRules}
              disabled={!academicYearId}
              onClick={handleRunStaleRules}
            >
              Run Rules
            </LoadingButton>
            <LoadingButton
              variant="outlined"
              startIcon={<NotificationsActive />}
              loading={isRunningSlaReminders}
              disabled={!academicYearId}
              onClick={handleRunSlaReminders}
            >
              Run SLA
            </LoadingButton>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => {
                resetQuickForm();
                setQuickDialogOpen(true);
              }}
            >
              Quick Inquiry
            </Button>
          </Stack>
        }
      />

      {!academicYearId && (
        <Alert severity="info">Select an academic year to load admissions CRM inquiries.</Alert>
      )}

      {isBusy && <LinearProgress />}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, minmax(0, 1fr))',
            lg: 'repeat(6, minmax(0, 1fr))',
          },
          gap: 1.25,
        }}
      >
        {summaryKpis.map(([label, value]) => (
          <Paper key={label} variant="outlined" sx={{ p: 1.5, borderRadius: 1 }}>
            <Typography variant="caption" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h5">{value}</Typography>
          </Paper>
        ))}
      </Box>

      {dailyTrends.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            gap={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="subtitle2">Daily trends</Typography>
              <Typography variant="caption" color="text.secondary">
                {dayjs(analyticsSummary?.trendFromDate).format('DD MMM')} -{' '}
                {dayjs(analyticsSummary?.trendToDate).format('DD MMM YYYY')}
              </Typography>
            </Box>
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <Chip size="small" label={`Leads: ${trendTotals.leads}`} />
              <Chip size="small" label={`Exams: ${trendTotals.exams}`} />
              <Chip size="small" label={`Eligible: ${trendTotals.eligible}`} />
              <Chip size="small" label={`SLA: ${trendTotals.slaMissed}`} />
            </Stack>
          </Stack>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 840 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Leads</TableCell>
                  <TableCell align="right">Exams</TableCell>
                  <TableCell align="right">Completed</TableCell>
                  <TableCell align="right">Eligible</TableCell>
                  <TableCell align="right">Waitlist</TableCell>
                  <TableCell align="right">Rejected</TableCell>
                  <TableCell align="right">Stale</TableCell>
                  <TableCell align="right">Archived</TableCell>
                  <TableCell align="right">SLA</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentDailyTrends.map((trend) => (
                  <TableRow key={trend.date}>
                    <TableCell>{dayjs(trend.date).format('DD MMM')}</TableCell>
                    <TableCell align="right">{trend.leadCount}</TableCell>
                    <TableCell align="right">{trend.examScheduledCount}</TableCell>
                    <TableCell align="right">{trend.examCompletedCount}</TableCell>
                    <TableCell align="right">{trend.eligibleCount}</TableCell>
                    <TableCell align="right">{trend.waitlistedCount}</TableCell>
                    <TableCell align="right">{trend.rejectedCount}</TableCell>
                    <TableCell align="right">{trend.staleCount}</TableCell>
                    <TableCell align="right">{trend.archivedCount}</TableCell>
                    <TableCell align="right">{trend.slaMissedCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}

      {automationAnalytics && automationAnalytics.runCount > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            gap={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle2">Automation runs</Typography>
            <Stack direction="row" gap={1} flexWrap="wrap">
              <Chip size="small" label={`${automationAnalytics.runCount} run(s)`} />
              {automationAnalytics.failedRunCount > 0 && (
                <Chip
                  size="small"
                  color="warning"
                  label={`${automationAnalytics.failedRunCount} with failure(s)`}
                />
              )}
            </Stack>
          </Stack>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Completed</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Context</TableCell>
                  <TableCell align="right">Tasks</TableCell>
                  <TableCell align="right">Messages</TableCell>
                  <TableCell align="right">Stale</TableCell>
                  <TableCell align="right">Archived</TableCell>
                  <TableCell align="right">Failures</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentAutomationRuns.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{dayjs(item.completedAt).format('DD MMM, HH:mm')}</TableCell>
                    <TableCell>{automationRunTypeLabels[item.runType]}</TableCell>
                    <TableCell
                      sx={{ maxWidth: 280, whiteSpace: 'normal', wordBreak: 'break-word' }}
                    >
                      {getAutomationRunContext(item)}
                    </TableCell>
                    <TableCell align="right">{item.createdTaskCount}</TableCell>
                    <TableCell align="right">{item.sentMessageCount}</TableCell>
                    <TableCell align="right">{item.markedStaleCount}</TableCell>
                    <TableCell align="right">{item.archivedCount}</TableCell>
                    <TableCell align="right">{item.failedActionCount}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={
                          item.status === AdmissionCrmAutomationRunStatus.CompletedWithFailures
                            ? 'warning'
                            : 'success'
                        }
                        label={automationRunStatusLabels[item.status]}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}

      {automationAnalytics && automationAnalytics.failureCount > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            gap={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle2">Automation failures</Typography>
            <Chip
              size="small"
              color="warning"
              label={`${automationAnalytics.failureCount} failure(s)`}
            />
          </Stack>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Failure</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell>Lead</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recentAutomationFailures.map((item) => (
                  <TableRow key={item.eventId}>
                    <TableCell>{dayjs(item.occurredAt).format('DD MMM, HH:mm')}</TableCell>
                    <TableCell>{item.title}</TableCell>
                    <TableCell
                      sx={{ maxWidth: 480, whiteSpace: 'normal', wordBreak: 'break-word' }}
                    >
                      {item.details || '-'}
                    </TableCell>
                    <TableCell>{item.leadId.slice(0, 8)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}

      {campaignPerformance.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            gap={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle2">Campaign performance</Typography>
            <Chip size="small" label={`${campaignPerformance.length} campaign(s)`} />
          </Stack>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 760 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Campaign</TableCell>
                  <TableCell align="right">Leads</TableCell>
                  <TableCell align="right">Exams</TableCell>
                  <TableCell align="right">Eligible</TableCell>
                  <TableCell align="right">Waitlist</TableCell>
                  <TableCell align="right">Rejected</TableCell>
                  <TableCell align="right">Eligibility</TableCell>
                  <TableCell align="right">Avg score</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {campaignPerformance.map((campaign) => (
                  <TableRow key={campaign.campaignName}>
                    <TableCell>{campaign.campaignName}</TableCell>
                    <TableCell align="right">{campaign.leadCount}</TableCell>
                    <TableCell align="right">{campaign.examScheduledCount}</TableCell>
                    <TableCell align="right">{campaign.eligibleCount}</TableCell>
                    <TableCell align="right">{campaign.waitlistedCount}</TableCell>
                    <TableCell align="right">{campaign.rejectedCount}</TableCell>
                    <TableCell align="right">{formatRate(campaign.eligibilityRate)}</TableCell>
                    <TableCell align="right">{campaign.averageLeadScore.toFixed(1)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}

      {academicYearId && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            gap={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="subtitle2">Communication delivery logs</Typography>
              <Typography variant="caption" color="text.secondary">
                Recent template and OTP delivery evidence
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <FormControl size="small" sx={{ minWidth: { sm: 170 } }}>
                <InputLabel id="crm-delivery-channel-filter-label">Channel</InputLabel>
                <Select
                  labelId="crm-delivery-channel-filter-label"
                  label="Channel"
                  value={deliveryLogChannelFilter}
                  onChange={(event) =>
                    setDeliveryLogChannelFilter(
                      event.target.value === 'all'
                        ? 'all'
                        : (Number(event.target.value) as AdmissionCrmMessageChannel)
                    )
                  }
                >
                  <MenuItem value="all">All channels</MenuItem>
                  {messageChannelOptions.map((channel) => (
                    <MenuItem key={channel} value={channel}>
                      {getAdmissionCrmMessageChannelLabel(channel)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: { sm: 210 } }}>
                <InputLabel id="crm-delivery-status-filter-label">Status</InputLabel>
                <Select
                  labelId="crm-delivery-status-filter-label"
                  label="Status"
                  value={deliveryLogStatusFilter}
                  onChange={(event) =>
                    setDeliveryLogStatusFilter(event.target.value as DeliveryLogStatusFilter)
                  }
                >
                  {deliveryLogStatusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status === 'all'
                        ? 'All statuses'
                        : getAdmissionCrmDeliveryLogStatusLabel(status)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                size="small"
                label="Provider ID"
                value={deliveryLogProviderMessageId}
                onChange={(event) => setDeliveryLogProviderMessageId(event.target.value)}
                sx={{ minWidth: { sm: 210 } }}
              />
            </Stack>
          </Stack>
          {isDeliveryLogsFetching && <LinearProgress sx={{ mb: 1 }} />}
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 1020 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Time</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Lead</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Provider ID</TableCell>
                  <TableCell align="right">Attempts</TableCell>
                  <TableCell>Details</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {deliveryLogs.map((log) => (
                  <TableRow key={log.id} hover>
                    <TableCell>{dayjs(log.createdAt).format('DD MMM, HH:mm')}</TableCell>
                    <TableCell>{getAdmissionCrmMessageChannelLabel(log.channel)}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{log.recipient}</TableCell>
                    <TableCell>
                      {log.leadId ? leadNameById.get(log.leadId) || log.leadId.slice(0, 8) : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={getDeliveryLogStatusColor(log.status)}
                        label={getAdmissionCrmDeliveryLogStatusLabel(log.status)}
                      />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 180, wordBreak: 'break-word' }}>
                      {log.providerMessageId || '-'}
                    </TableCell>
                    <TableCell align="right">{log.attemptCount}</TableCell>
                    <TableCell
                      sx={{ maxWidth: 320, whiteSpace: 'normal', wordBreak: 'break-word' }}
                    >
                      {log.statusDetails || '-'}
                    </TableCell>
                    <TableCell align="right">
                      {canRetryAdmissionCrmDeliveryLog(log.status) ? (
                        <LoadingButton
                          size="small"
                          variant="text"
                          startIcon={<Replay />}
                          loading={isRetryingMessageDelivery}
                          onClick={() => handleRetryMessageDelivery(log)}
                        >
                          Retry
                        </LoadingButton>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          -
                        </Typography>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {!deliveryLogs.length && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        No communication delivery logs found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
            Showing {deliveryLogs.length} of {deliveryLogsData?.totalCount ?? 0} delivery log(s)
          </Typography>
        </Paper>
      )}

      {academicYearId && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            gap={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', md: 'center' }}
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="subtitle2">Communication opt-outs</Typography>
              <Typography variant="caption" color="text.secondary">
                Active and cleared consent blocks by channel and contact
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
              <TextField
                size="small"
                label="Contact"
                value={optOutContactSearch}
                onChange={(event) => setOptOutContactSearch(event.target.value)}
                sx={{ minWidth: { sm: 160 } }}
              />
              <FormControl size="small" sx={{ minWidth: { sm: 170 } }}>
                <InputLabel id="crm-opt-out-channel-filter-label">Channel</InputLabel>
                <Select
                  labelId="crm-opt-out-channel-filter-label"
                  label="Channel"
                  value={optOutChannelFilter}
                  onChange={(event) =>
                    setOptOutChannelFilter(
                      event.target.value === 'all'
                        ? 'all'
                        : (Number(event.target.value) as AdmissionCrmMessageChannel)
                    )
                  }
                >
                  <MenuItem value="all">All channels</MenuItem>
                  {messageChannelOptions.map((channel) => (
                    <MenuItem key={channel} value={channel}>
                      {getAdmissionCrmMessageChannelLabel(channel)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: { sm: 150 } }}>
                <InputLabel id="crm-opt-out-status-filter-label">Status</InputLabel>
                <Select
                  labelId="crm-opt-out-status-filter-label"
                  label="Status"
                  value={optOutStatusFilter}
                  onChange={(event) =>
                    setOptOutStatusFilter(event.target.value as OptOutStatusFilter)
                  }
                >
                  <MenuItem value="all">All statuses</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="cleared">Cleared</MenuItem>
                </Select>
              </FormControl>
            </Stack>
          </Stack>
          {isOptOutsFetching && <LinearProgress sx={{ mb: 1 }} />}
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 900 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Opted out</TableCell>
                  <TableCell>Channel</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Lead</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Cleared</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {optOuts.map((optOut) => (
                  <TableRow key={optOut.id} hover>
                    <TableCell>{dayjs(optOut.optedOutAt).format('DD MMM, HH:mm')}</TableCell>
                    <TableCell>{getAdmissionCrmMessageChannelLabel(optOut.channel)}</TableCell>
                    <TableCell sx={{ wordBreak: 'break-word' }}>{optOut.contactValue}</TableCell>
                    <TableCell>
                      {optOut.leadId
                        ? leadNameById.get(optOut.leadId) || optOut.leadId.slice(0, 8)
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={optOut.isActive ? 'warning' : 'default'}
                        label={optOut.isActive ? 'Active' : 'Cleared'}
                      />
                    </TableCell>
                    <TableCell
                      sx={{ maxWidth: 320, whiteSpace: 'normal', wordBreak: 'break-word' }}
                    >
                      {optOut.reason}
                    </TableCell>
                    <TableCell
                      sx={{ maxWidth: 260, whiteSpace: 'normal', wordBreak: 'break-word' }}
                    >
                      {optOut.optedInAt
                        ? `${dayjs(optOut.optedInAt).format('DD MMM, HH:mm')} - ${
                            optOut.optInReason || 'No reason'
                          }`
                        : '-'}
                    </TableCell>
                  </TableRow>
                ))}
                {!optOuts.length && (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        No communication opt-outs found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.75 }}>
            Showing {optOuts.length} of {optOutsData?.totalCount ?? 0} opt-out record(s)
          </Typography>
        </Paper>
      )}

      {staffWorkload.length > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            gap={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 1 }}
          >
            <Typography variant="subtitle2">Staff workload</Typography>
            <Chip size="small" label={`${staffWorkload.length} owner group(s)`} />
          </Stack>
          <Box sx={{ overflowX: 'auto' }}>
            <Table size="small" sx={{ minWidth: 620 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Owner</TableCell>
                  <TableCell align="right">Leads</TableCell>
                  <TableCell align="right">Open</TableCell>
                  <TableCell align="right">Pending tasks</TableCell>
                  <TableCell align="right">Overdue</TableCell>
                  <TableCell align="right">Exams</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {staffWorkload.map((item) => (
                  <TableRow key={item.ownerUserId || 'unassigned'}>
                    <TableCell>{getWorkloadOwnerLabel(item)}</TableCell>
                    <TableCell align="right">{item.leadCount}</TableCell>
                    <TableCell align="right">{item.openLeadCount}</TableCell>
                    <TableCell align="right">{item.pendingTaskCount}</TableCell>
                    <TableCell align="right">{item.overdueTaskCount}</TableCell>
                    <TableCell align="right">{item.examScheduledCount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Paper>
      )}

      {registrationAnalytics && registrationAnalytics.issuedCount > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
              <Box>
                <Typography variant="subtitle2">Registration and document readiness</Typography>
                <Typography variant="caption" color="text.secondary">
                  {registrationAnalytics.issuedCount} issued /{' '}
                  {registrationAnalytics.admissionReadyCount} admission ready
                </Typography>
              </Box>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                <Chip
                  size="small"
                  label={`Opened: ${formatRate(registrationAnalytics.openRate)}`}
                />
                <Chip
                  size="small"
                  label={`Completed: ${formatRate(registrationAnalytics.completionRate)}`}
                />
                <Chip
                  size="small"
                  label={`Verified: ${formatRate(registrationAnalytics.verificationRate)}`}
                />
                <Chip
                  size="small"
                  color="success"
                  label={`Yield: ${formatRate(registrationAnalytics.admissionYieldRate)}`}
                />
              </Stack>
            </Stack>
            <Divider />
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <Chip
                size="small"
                color={registrationAnalytics.abandonedCount ? 'warning' : 'default'}
                label={`Abandoned: ${registrationAnalytics.abandonedCount}`}
              />
              <Chip
                size="small"
                color={registrationAnalytics.expiredCount ? 'warning' : 'default'}
                label={`Expired: ${registrationAnalytics.expiredCount}`}
              />
              <Chip
                size="small"
                label={`Corrections: ${registrationAnalytics.correctionPendingCount}`}
              />
              {documentAnalytics ? (
                <>
                  <Chip
                    size="small"
                    label={`Document review: ${documentAnalytics.underReviewCount}`}
                  />
                  <Chip
                    size="small"
                    color={documentAnalytics.rejectedCount ? 'error' : 'default'}
                    label={`Rejected: ${documentAnalytics.rejectedCount}`}
                  />
                  <Chip
                    size="small"
                    label={`Review age: ${documentAnalytics.averageReviewAgeDays.toFixed(1)} days`}
                  />
                  <Chip
                    size="small"
                    label={`Readiness overrides: ${documentAnalytics.readinessOverrideCount}`}
                  />
                </>
              ) : null}
            </Stack>
          </Stack>
        </Paper>
      )}

      {finalAdmissionAnalytics && finalAdmissionAnalytics.seatPoolCount > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
              <Box>
                <Typography variant="subtitle2">Offers and seat conversion</Typography>
                <Typography variant="caption" color="text.secondary">
                  {finalAdmissionAnalytics.approvedCapacity} approved seats /{' '}
                  {finalAdmissionAnalytics.remainingSeatCount} remaining
                </Typography>
              </Box>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                <Chip
                  size="small"
                  label={`Occupied: ${formatRate(finalAdmissionAnalytics.seatOccupancyRate)}`}
                />
                <Chip
                  size="small"
                  label={`Offer response: ${formatRate(finalAdmissionAnalytics.offerResponseRate)}`}
                />
                <Chip
                  size="small"
                  color="success"
                  label={`Offer acceptance: ${formatRate(finalAdmissionAnalytics.offerAcceptanceRate)}`}
                />
                <Chip
                  size="small"
                  label={`Waitlist promotion: ${formatRate(finalAdmissionAnalytics.waitlistPromotionRate)}`}
                />
              </Stack>
            </Stack>
            <Divider />
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <Chip size="small" label={`Reserved: ${finalAdmissionAnalytics.reservedSeatCount}`} />
              <Chip size="small" label={`Accepted: ${finalAdmissionAnalytics.acceptedSeatCount}`} />
              <Chip
                size="small"
                label={`Activated: ${finalAdmissionAnalytics.activatedSeatCount}`}
              />
              <Chip
                size="small"
                label={`Offers awaiting approval: ${finalAdmissionAnalytics.approvalPendingOfferCount}`}
              />
              <Chip
                size="small"
                label={`Offers issued: ${finalAdmissionAnalytics.issuedOfferCount}`}
              />
              <Chip
                size="small"
                label={`Waitlisted: ${finalAdmissionAnalytics.activeWaitlistCount}`}
              />
              <Chip
                size="small"
                color={finalAdmissionAnalytics.capacityOverrideCount ? 'warning' : 'default'}
                label={`Capacity overrides: ${finalAdmissionAnalytics.capacityOverrideCount}`}
              />
              <Chip
                size="small"
                color={finalAdmissionAnalytics.overCapacityPoolCount ? 'error' : 'default'}
                label={`Over capacity: ${finalAdmissionAnalytics.overCapacityPoolCount}`}
              />
            </Stack>
          </Stack>
        </Paper>
      )}

      {financialAnalytics && financialAnalytics.issuedQuotationCount > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
              <Box>
                <Typography variant="subtitle2">Financial conversion</Typography>
                <Typography variant="caption" color="text.secondary">
                  {financialAnalytics.issuedQuotationCount} quotation(s) /{' '}
                  {financialAnalytics.financeConfirmedCount} Finance confirmed
                </Typography>
              </Box>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                <Chip
                  size="small"
                  label={`Finance confirmation: ${formatRate(financialAnalytics.financeConfirmationRate)}`}
                />
                <Chip
                  size="small"
                  color="success"
                  label={`Gate satisfied: ${formatRate(financialAnalytics.paymentGateSatisfactionRate)}`}
                />
              </Stack>
            </Stack>
            <Divider />
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <Chip
                size="small"
                label={`Quoted: INR ${financialAnalytics.netQuotedAmount.toFixed(2)}`}
              />
              <Chip
                size="small"
                label={`Confirmed: INR ${financialAnalytics.confirmedAmount.toFixed(2)}`}
              />
              <Chip
                size="small"
                color={financialAnalytics.outstandingAmount ? 'warning' : 'default'}
                label={`Outstanding: INR ${financialAnalytics.outstandingAmount.toFixed(2)}`}
              />
              <Chip
                size="small"
                color={financialAnalytics.pendingGateCount ? 'warning' : 'default'}
                label={`Pending gates: ${financialAnalytics.pendingGateCount}`}
              />
              <Chip
                size="small"
                label={`Concessions: INR ${financialAnalytics.concessionAmount.toFixed(2)}`}
              />
              <Chip
                size="small"
                color={financialAnalytics.concessionApprovalPendingCount ? 'warning' : 'default'}
                label={`Concession reviews: ${financialAnalytics.concessionApprovalPendingCount}`}
              />
              <Chip
                size="small"
                color={financialAnalytics.gateOverrideCount ? 'warning' : 'default'}
                label={`Gate overrides: ${financialAnalytics.gateOverrideCount}`}
              />
            </Stack>
          </Stack>
        </Paper>
      )}

      {householdIdentityAnalytics && householdIdentityAnalytics.profileCount > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack spacing={1}>
            <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
              <Box>
                <Typography variant="subtitle2">Household and identity readiness</Typography>
                <Typography variant="caption" color="text.secondary">
                  {householdIdentityAnalytics.readyCount} of{' '}
                  {householdIdentityAnalytics.profileCount} applicant(s) ready
                </Typography>
              </Box>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                <Chip
                  size="small"
                  color="success"
                  label={`Readiness: ${formatRate(householdIdentityAnalytics.identityReadinessRate)}`}
                />
                <Chip
                  size="small"
                  label={`Household reuse: ${formatRate(householdIdentityAnalytics.householdReuseRate)}`}
                />
              </Stack>
            </Stack>
            <Divider />
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <Chip
                size="small"
                label={`Guardian links: ${householdIdentityAnalytics.guardianRelationshipCount}`}
              />
              <Chip
                size="small"
                label={`Reused households: ${householdIdentityAnalytics.reusedHouseholdCount}`}
              />
              <Chip
                size="small"
                color={
                  householdIdentityAnalytics.missingAccountableContactCount ? 'warning' : 'default'
                }
                label={`Accountable contact pending: ${householdIdentityAnalytics.missingAccountableContactCount}`}
              />
              <Chip
                size="small"
                color={
                  householdIdentityAnalytics.missingIdentityConsentCount ? 'warning' : 'default'
                }
                label={`Consent pending: ${householdIdentityAnalytics.missingIdentityConsentCount}`}
              />
              <Chip
                size="small"
                color={householdIdentityAnalytics.accountLinkPendingCount ? 'warning' : 'default'}
                label={`Account links pending: ${householdIdentityAnalytics.accountLinkPendingCount}`}
              />
              <Chip
                size="small"
                color={householdIdentityAnalytics.conflictCount ? 'error' : 'default'}
                label={`Identity conflicts: ${householdIdentityAnalytics.conflictCount}`}
              />
              <Chip
                size="small"
                color={householdIdentityAnalytics.overrideCount ? 'warning' : 'default'}
                label={`Overrides: ${householdIdentityAnalytics.overrideCount}`}
              />
            </Stack>
          </Stack>
        </Paper>
      )}

      {policyAnalytics &&
        (policyAnalytics.activeAdoptionCount > 0 || policyAnalytics.evaluationCount > 0) && (
          <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2">Policy governance</Typography>
              <Stack direction="row" gap={0.75} flexWrap="wrap">
                <Chip size="small" label={`Active packs: ${policyAnalytics.activeAdoptionCount}`} />
                <Chip size="small" label={`Evaluations: ${policyAnalytics.evaluationCount}`} />
                <Chip
                  size="small"
                  color={policyAnalytics.blockingFailureCount ? 'error' : 'success'}
                  label={`Blocking: ${policyAnalytics.blockingFailureCount}`}
                />
                <Chip
                  size="small"
                  color={policyAnalytics.evidencePendingCount ? 'warning' : 'default'}
                  label={`Evidence pending: ${policyAnalytics.evidencePendingCount}`}
                />
                <Chip
                  size="small"
                  color={policyAnalytics.sourceReviewOverdueCount ? 'warning' : 'default'}
                  label={`Source review overdue: ${policyAnalytics.sourceReviewOverdueCount}`}
                />
              </Stack>
            </Stack>
          </Paper>
        )}

      {routeAnalytics && routeAnalytics.assignedApplicantCount > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Admission routes</Typography>
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <Chip size="small" label={`Assigned: ${routeAnalytics.assignedApplicantCount}`} />
              <Chip
                size="small"
                color="success"
                label={`Eligible: ${routeAnalytics.eligibleCount}`}
              />
              <Chip
                size="small"
                color={routeAnalytics.pendingReviewCount ? 'warning' : 'default'}
                label={`Review pending: ${routeAnalytics.pendingReviewCount}`}
              />
              <Chip
                size="small"
                color={routeAnalytics.appealPendingCount ? 'warning' : 'default'}
                label={`Appeals pending: ${routeAnalytics.appealPendingCount}`}
              />
              <Chip
                size="small"
                label={`Appeals approved: ${routeAnalytics.appealApprovedCount}`}
              />
              <Chip size="small" label={`Route changes: ${routeAnalytics.routeChangeCount}`} />
              {Object.entries(routeAnalytics.applicantsByRoute).map(([route, count]) => (
                <Chip key={route} size="small" variant="outlined" label={`${route}: ${count}`} />
              ))}
            </Stack>
          </Stack>
        </Paper>
      )}

      {activationAnalytics && activationAnalytics.requestedCount > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack spacing={1}>
            <Typography variant="subtitle2">Activation and first-day readiness</Typography>
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              <Chip size="small" label={`Requested: ${activationAnalytics.requestedCount}`} />
              <Chip
                size="small"
                color="success"
                label={`First-day ready: ${activationAnalytics.firstDayReadyCount}`}
              />
              <Chip
                size="small"
                color={activationAnalytics.repairRequiredCount ? 'error' : 'default'}
                label={`Repair: ${activationAnalytics.repairRequiredCount}`}
              />
              <Chip
                size="small"
                color={activationAnalytics.cancellationPendingCount ? 'warning' : 'default'}
                label={`Cancellation review: ${activationAnalytics.cancellationPendingCount}`}
              />
              <Chip size="small" label={`Cancelled: ${activationAnalytics.cancelledCount}`} />
              <Chip
                size="small"
                label={`First-pass success: ${formatRate(activationAnalytics.firstPassSuccessRate)}`}
              />
              <Chip
                size="small"
                label={`Average attempts: ${activationAnalytics.averageAttempts}`}
              />
              <Chip
                size="small"
                label={`Committed identifiers: ${activationAnalytics.committedIdentifierCount}`}
              />
              <Chip
                size="small"
                label={`Voided identifiers: ${activationAnalytics.voidedIdentifierCount}`}
              />
            </Stack>
          </Stack>
        </Paper>
      )}

      {examAnalytics && examAnalytics.scheduledCount > 0 && (
        <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            gap={1}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'center' }}
            sx={{ mb: 1 }}
          >
            <Box>
              <Typography variant="subtitle2">Exam outcomes</Typography>
              <Typography variant="caption" color="text.secondary">
                {examAnalytics.scheduledCount} scheduled / {examAnalytics.meritRankedCount} ranked
              </Typography>
            </Box>
            <Stack direction="row" gap={0.75} flexWrap="wrap">
              {examOutcomeMetrics.map(([label, value]) => (
                <Chip key={label} size="small" label={`${label}: ${value}`} />
              ))}
            </Stack>
          </Stack>
          {examClassPerformance.length > 0 && (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small" sx={{ minWidth: 720 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Class</TableCell>
                    <TableCell align="right">Scheduled</TableCell>
                    <TableCell align="right">Present</TableCell>
                    <TableCell align="right">Pass</TableCell>
                    <TableCell align="right">Eligible</TableCell>
                    <TableCell align="right">Waitlist</TableCell>
                    <TableCell align="right">Rejected</TableCell>
                    <TableCell align="right">Avg %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {examClassPerformance.map((item) => (
                    <TableRow key={getExamClassKey(item)}>
                      <TableCell>{item.className}</TableCell>
                      <TableCell align="right">{item.scheduledCount}</TableCell>
                      <TableCell align="right">{item.presentCount}</TableCell>
                      <TableCell align="right">{item.passCount}</TableCell>
                      <TableCell align="right">{item.eligibleCount}</TableCell>
                      <TableCell align="right">{item.waitlistedCount}</TableCell>
                      <TableCell align="right">{item.rejectedCount}</TableCell>
                      <TableCell align="right">{formatRate(item.averagePercentage)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </Paper>
      )}

      <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          gap={1}
          justifyContent="space-between"
          alignItems={{ xs: 'stretch', md: 'center' }}
        >
          {!fixedView && (
            <ToggleButtonGroup
              exclusive
              size="small"
              value={view}
              onChange={(_, value) => value && setView(value)}
            >
              <ToggleButton value="board">
                <ViewColumn sx={{ mr: 0.75 }} />
                Board
              </ToggleButton>
              <ToggleButton value="list">
                <FormatListBulleted sx={{ mr: 0.75 }} />
                List
              </ToggleButton>
              <ToggleButton value="exams">
                <EventAvailable sx={{ mr: 0.75 }} />
                Exams
              </ToggleButton>
              <ToggleButton value="operations">
                <AssignmentTurnedIn sx={{ mr: 0.75 }} />
                Operations
              </ToggleButton>
            </ToggleButtonGroup>
          )}

          <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} flexWrap="wrap">
            <TextField
              size="small"
              label="Search"
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              sx={{ minWidth: { sm: 180 } }}
            />
            <TextField
              size="small"
              type="date"
              label="From"
              value={analyticsFromDate}
              onChange={(event) => setAnalyticsFromDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { sm: 150 } }}
            />
            <TextField
              size="small"
              type="date"
              label="To"
              value={analyticsToDate}
              onChange={(event) => setAnalyticsToDate(event.target.value)}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: { sm: 150 } }}
            />
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="crm-stage-filter-label">Stage</InputLabel>
              <Select
                labelId="crm-stage-filter-label"
                label="Stage"
                value={stageFilter}
                onChange={(event) =>
                  setStageFilter(event.target.value === 'all' ? 'all' : Number(event.target.value))
                }
              >
                <MenuItem value="all">All stages</MenuItem>
                {stages.map((stage) => (
                  <MenuItem key={stage.id} value={stage.systemStage}>
                    {stage.stageName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel id="crm-channel-filter-label">Channel</InputLabel>
              <Select
                labelId="crm-channel-filter-label"
                label="Channel"
                value={channelFilter}
                onChange={(event) =>
                  setChannelFilter(
                    event.target.value === 'all'
                      ? 'all'
                      : (Number(event.target.value) as AdmissionInquiryChannel)
                  )
                }
              >
                <MenuItem value="all">All channels</MenuItem>
                {channelOptions.map((channel) => (
                  <MenuItem key={channel} value={channel}>
                    {getAdmissionCrmChannelLabel(channel)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {campaignOptions.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 190 }}>
                <InputLabel id="crm-campaign-filter-label">Campaign</InputLabel>
                <Select
                  labelId="crm-campaign-filter-label"
                  label="Campaign"
                  value={campaignFilter}
                  onChange={(event) => setCampaignFilter(event.target.value)}
                >
                  <MenuItem value="all">All campaigns</MenuItem>
                  {campaignOptions.map((campaign) => (
                    <MenuItem key={campaign} value={campaign}>
                      {campaign}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel id="crm-owner-filter-label">Owner</InputLabel>
              <Select
                labelId="crm-owner-filter-label"
                label="Owner"
                value={ownerFilter}
                onChange={(event) => setOwnerFilter(event.target.value)}
              >
                <MenuItem value="all">All owners</MenuItem>
                <MenuItem value="unassigned">Unassigned</MenuItem>
                {ownerOptions.map((ownerUserId) => (
                  <MenuItem key={ownerUserId} value={ownerUserId}>
                    {getOwnerDisplayName(ownerUserId)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {classOptions.length > 0 && (
              <FormControl size="small" sx={{ minWidth: 170 }}>
                <InputLabel id="crm-class-filter-label">Class</InputLabel>
                <Select
                  labelId="crm-class-filter-label"
                  label="Class"
                  value={classFilter}
                  onChange={(event) => setClassFilter(event.target.value)}
                >
                  <MenuItem value="all">All classes</MenuItem>
                  {classOptions.map((leadClass) => (
                    <MenuItem key={leadClass} value={leadClass}>
                      {leadClass}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            <FormControl size="small" sx={{ minWidth: 190 }}>
              <InputLabel id="crm-score-filter-label">Score</InputLabel>
              <Select
                labelId="crm-score-filter-label"
                label="Score"
                value={scoreBandFilter}
                onChange={(event) => setScoreBandFilter(event.target.value as ScoreBandFilter)}
              >
                {scoreBandOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel id="crm-priority-filter-label">Priority</InputLabel>
              <Select
                labelId="crm-priority-filter-label"
                label="Priority"
                value={priorityFilter}
                onChange={(event) => {
                  const { value } = event.target;
                  setPriorityFilter(
                    value === 'all' ? 'all' : (Number(value) as AdmissionCrmLeadPriority)
                  );
                }}
              >
                <MenuItem value="all">All priorities</MenuItem>
                {leadPriorityOptions.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {leadPriorityLabels[priority]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button
              size="small"
              variant="text"
              startIcon={<FilterAltOff />}
              onClick={handleClearWorkspaceFilters}
              sx={{ alignSelf: { xs: 'stretch', sm: 'center' } }}
            >
              Clear
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {view === 'board' && (
        <Box
          sx={{
            display: 'grid',
            gridAutoFlow: { xs: 'row', lg: 'column' },
            gridAutoColumns: { lg: 'minmax(260px, 1fr)' },
            gridTemplateColumns: { xs: '1fr' },
            gap: 1.25,
            overflowX: { lg: 'auto' },
            pb: 1,
          }}
        >
          {boardColumns.map((column) => {
            const configuredStageColor = getConfiguredStageColor(column.stage.colorHex);

            return (
              <Paper
                key={column.stage.id}
                variant="outlined"
                sx={{
                  p: 1.25,
                  borderRadius: 1,
                  minWidth: 0,
                  bgcolor: 'background.neutral',
                  borderTop: configuredStageColor ? `3px solid ${configuredStageColor}` : undefined,
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
                  <Chip
                    size="small"
                    color={
                      configuredStageColor
                        ? undefined
                        : admissionCrmStageColors[column.stage.systemStage]
                    }
                    variant={configuredStageColor ? 'outlined' : 'filled'}
                    sx={
                      configuredStageColor
                        ? { borderColor: configuredStageColor, color: configuredStageColor }
                        : undefined
                    }
                    label={column.stage.stageName}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {column.leads.length}
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {column.leads.length ? (
                    column.leads.map(renderLeadCard)
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No leads
                    </Typography>
                  )}
                </Stack>
              </Paper>
            );
          })}
        </Box>
      )}

      {view === 'list' && (
        <Stack spacing={1}>
          {selectedLeads.length > 0 && (
            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                gap={1}
                justifyContent="space-between"
                alignItems={{ xs: 'stretch', sm: 'center' }}
              >
                <Chip size="small" color="primary" label={`${selectedLeads.length} selected`} />
                <Stack direction="row" gap={0.75} flexWrap="wrap">
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<AssignmentInd />}
                    onClick={() => openBulkAction('owner')}
                  >
                    Owner
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<TaskAlt />}
                    onClick={() => openBulkAction('task')}
                  >
                    Task
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SwapHoriz />}
                    onClick={() => openBulkAction('stage')}
                  >
                    Stage
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    color="warning"
                    startIcon={<Archive />}
                    onClick={() => openBulkAction('archive')}
                  >
                    Archive
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<Send />}
                    disabled={!messageTemplates.length || isSendingTemplateMessage}
                    onClick={() => openBulkAction('message')}
                  >
                    Message
                  </Button>
                  <Button size="small" variant="text" onClick={() => setSelectedLeadIds([])}>
                    Clear
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          )}

          <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      checked={isEveryVisibleLeadSelected}
                      indeterminate={!isEveryVisibleLeadSelected && isSomeVisibleLeadSelected}
                      disabled={!filteredLeads.length}
                      onChange={toggleVisibleLeadSelection}
                    />
                  </TableCell>
                  <TableCell>Lead</TableCell>
                  <TableCell>Contact</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Stage</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell align="right">Score</TableCell>
                  <TableCell>Last Activity</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeads.map((lead) => (
                  <TableRow key={lead.id} hover selected={selectedLeadIdSet.has(lead.id)}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={selectedLeadIdSet.has(lead.id)}
                        onChange={() => toggleLeadSelection(lead.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="subtitle2">{getAdmissionCrmLeadName(lead)}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {lead.desiredClassName || lead.admissionIntent}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {getLeadOwnerLabel(lead, crmStaff)}
                      </Typography>
                    </TableCell>
                    <TableCell>{lead.primaryContactNo || lead.email || '-'}</TableCell>
                    <TableCell>{getAdmissionCrmChannelLabel(lead.channel)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={admissionCrmStageColors[lead.stage]}
                        label={getAdmissionCrmStageLabel(lead.stage)}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={leadPriorityColors[lead.priority]}
                        label={leadPriorityLabels[lead.priority]}
                      />
                    </TableCell>
                    <TableCell align="right">{lead.leadScore}</TableCell>
                    <TableCell>
                      {dayjs(lead.lastActivityTime).format('DD MMM YYYY, HH:mm')}
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" gap={0.5} justifyContent="flex-end" flexWrap="wrap">
                        {lead.likelyDuplicateCount > 0 && (
                          <Button
                            size="small"
                            variant="text"
                            color="warning"
                            startIcon={<CallMerge />}
                            disabled={isMergingDuplicateLead}
                            onClick={() => handleOpenMergeDialog(lead)}
                          >
                            Merge
                          </Button>
                        )}
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<AssignmentInd />}
                          onClick={() => handleOpenOperationsDialog(lead)}
                        >
                          Manage
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<Notes />}
                          disabled={isAddingLeadNote}
                          onClick={() => handleOpenNoteDialog(lead)}
                        >
                          Note
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<SwapHoriz />}
                          disabled={
                            getManualStageOptionsForLead(lead, stages).length === 0 ||
                            isChangingLeadStage
                          }
                          onClick={() => handleOpenStageDialog(lead)}
                        >
                          Stage
                        </Button>
                        <Button
                          size="small"
                          variant="text"
                          startIcon={<History />}
                          onClick={() => setTimelineLead(lead)}
                        >
                          Timeline
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
                {!filteredLeads.length && (
                  <TableRow>
                    <TableCell colSpan={9}>
                      <Typography variant="body2" color="text.secondary" align="center">
                        No CRM inquiries found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}

      {view === 'operations' && (
        <Stack spacing={1}>
          <RteAllotmentImport academicYearId={academicYearId || ''} />
          <AdmissionsDataQuality academicYearId={academicYearId || ''} />
          <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
            {(isOperationsSummaryFetching || isOperationsQueueFetching) && <LinearProgress />}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 0.75,
                mt: isOperationsSummaryFetching || isOperationsQueueFetching ? 1 : 0,
              }}
            >
              {(operationsQueueSummary?.queues || []).map((queue) => (
                <Button
                  key={queue.queueType}
                  size="small"
                  color={queue.urgentCount > 0 ? 'warning' : 'inherit'}
                  variant={operationsQueueType === queue.queueType ? 'contained' : 'outlined'}
                  onClick={() => setOperationsQueueType(queue.queueType)}
                  sx={{ minHeight: 44, justifyContent: 'space-between', textAlign: 'left' }}
                >
                  <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {queue.label}
                  </Box>
                  <Chip
                    component="span"
                    size="small"
                    color={queue.urgentCount > 0 ? 'warning' : 'default'}
                    label={queue.count}
                    sx={{ ml: 0.75, minWidth: 32 }}
                  />
                </Button>
              ))}
            </Box>
            <Divider sx={{ my: 1 }} />
            <Stack spacing={1}>
              <Stack direction={{ xs: 'column', md: 'row' }} gap={0.75}>
                <TextField
                  size="small"
                  label="Search queue"
                  value={operationsSearch}
                  onChange={(event) => setOperationsSearch(event.target.value)}
                  sx={{ flex: 1 }}
                />
                <TextField
                  size="small"
                  label="Owner user ID"
                  value={operationsOwnerUserId}
                  onChange={(event) => setOperationsOwnerUserId(event.target.value)}
                />
                <TextField
                  size="small"
                  label="Assigned to user ID"
                  value={operationsAssignedToUserId}
                  onChange={(event) => setOperationsAssignedToUserId(event.target.value)}
                />
                <TextField
                  size="small"
                  type="number"
                  label="Minimum age (days)"
                  value={operationsMinimumAgeDays}
                  onChange={(event) => setOperationsMinimumAgeDays(event.target.value)}
                  sx={{ width: { md: 170 } }}
                />
                <FormControlLabel
                  control={
                    <Checkbox
                      size="small"
                      checked={operationsUrgentOnly}
                      onChange={(_, checked) => setOperationsUrgentOnly(checked)}
                    />
                  }
                  label="Urgent only"
                />
              </Stack>
              <Stack
                direction={{ xs: 'column', md: 'row' }}
                gap={0.75}
                alignItems={{ md: 'center' }}
              >
                <TextField
                  size="small"
                  label="Saved-view name"
                  value={operationsSavedViewName}
                  onChange={(event) => setOperationsSavedViewName(event.target.value)}
                />
                <LoadingButton
                  size="small"
                  loading={createOperationsSavedViewState.isLoading}
                  startIcon={<BookmarkAdd />}
                  onClick={handleSaveOperationsView}
                >
                  Save view
                </LoadingButton>
                <Stack direction="row" gap={0.5} flexWrap="wrap" sx={{ flex: 1 }}>
                  {(operationsSavedViews || []).map((savedView) => (
                    <Chip
                      key={savedView.id}
                      size="small"
                      label={savedView.name}
                      onClick={() => applyOperationsSavedView(savedView)}
                      onDelete={() =>
                        deleteOperationsSavedView({ viewId: savedView.id })
                          .unwrap()
                          .catch((error) =>
                            shikshaMitraToast.error({
                              message: getApiErrorMessage(
                                error,
                                'Unable to delete the saved view.'
                              ),
                            })
                          )
                      }
                      deleteIcon={<Delete />}
                    />
                  ))}
                </Stack>
                <Chip size="small" label={`${operationsQueue?.totalCount || 0} matching`} />
              </Stack>
            </Stack>
          </Paper>

          <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Applicant</TableCell>
                  <TableCell>Action required</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Due</TableCell>
                  <TableCell align="right">Open</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(operationsQueue?.items || []).map((item: AdmissionCrmOperationsQueueItemDto) => {
                  const lead = leads.find((candidate) => candidate.id === item.leadId);
                  return (
                    <TableRow key={item.key} hover>
                      <TableCell>
                        <Typography variant="body2">{item.applicantName}</Typography>
                        {item.isUrgent ? (
                          <Chip size="small" color="warning" label="Urgent" />
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.title}</Typography>
                        {item.details ? (
                          <Typography variant="caption" color="text.secondary">
                            {item.details}
                          </Typography>
                        ) : null}
                      </TableCell>
                      <TableCell>{item.status}</TableCell>
                      <TableCell>
                        {item.ageDays} day{item.ageDays === 1 ? '' : 's'}
                      </TableCell>
                      <TableCell>
                        {item.dueAt ? dayjs(item.dueAt).format('DD MMM YYYY, HH:mm') : '-'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip
                          title={
                            lead
                              ? 'Open applicant workspace'
                              : 'Lead is outside the current filters'
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              aria-label={`Open ${item.applicantName}`}
                              disabled={!lead}
                              onClick={() => lead && handleOpenOperationsDialog(lead)}
                            >
                              <AssignmentInd fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {!isOperationsQueueFetching && (operationsQueue?.items.length || 0) === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No applicants require action in this queue.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}

      {view === 'exams' && (
        <Paper variant="outlined" sx={{ borderRadius: 1, overflow: 'hidden' }}>
          {isExamsFetching && <LinearProgress />}
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Slot</TableCell>
                <TableCell>Exam Time</TableCell>
                <TableCell>Room</TableCell>
                <TableCell>Attendance</TableCell>
                <TableCell>Marks</TableCell>
                <TableCell>Eligibility</TableCell>
                <TableCell align="right">Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {exams.map((exam) => (
                <TableRow key={exam.id} hover>
                  <TableCell>{exam.applicantName || 'Applicant unavailable'}</TableCell>
                  <TableCell>{exam.slotNameSnapshot || exam.entranceExamSlotId}</TableCell>
                  <TableCell>{dayjs(exam.examStartTime).format('DD MMM YYYY, HH:mm')}</TableCell>
                  <TableCell>{exam.examRoomNo}</TableCell>
                  <TableCell>{attendanceStatusLabels[exam.attendanceStatus]}</TableCell>
                  <TableCell>
                    {exam.obtainedMarks != null && exam.totalMarks != null
                      ? `${exam.obtainedMarks}/${exam.totalMarks} - ${
                          examStatusLabels[exam.examStatus]
                        }`
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={admissionCrmEligibilityLabels[exam.eligibilityDecision]}
                      color={
                        exam.eligibilityDecision === AdmissionCrmEligibilityDecision.Eligible
                          ? 'success'
                          : exam.eligibilityDecision === AdmissionCrmEligibilityDecision.Rejected
                            ? 'error'
                            : exam.eligibilityDecision ===
                                AdmissionCrmEligibilityDecision.Waitlisted
                              ? 'warning'
                              : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" gap={0.5} justifyContent="flex-end" flexWrap="wrap">
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<Edit />}
                        onClick={() => handleOpenExamActions(exam)}
                      >
                        Manage
                      </Button>
                      <Button
                        size="small"
                        variant="text"
                        startIcon={<AssignmentTurnedIn />}
                        onClick={() => setHandoffExamId(exam.id)}
                      >
                        Handoff
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
              {!exams.length && (
                <TableRow>
                  <TableCell colSpan={8}>
                    <Typography variant="body2" color="text.secondary" align="center">
                      No CRM entrance exams scheduled
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Paper>
      )}

      <Dialog
        open={quickDialogOpen}
        onClose={() => setQuickDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Quick Inquiry</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <TextField
                label="Student first name"
                value={quickForm.firstName}
                onChange={(event) => handleQuickFormChange('firstName', event.target.value)}
                fullWidth
              />
              <TextField
                label="Date of birth"
                type="date"
                value={quickForm.dateOfBirth}
                onChange={(event) => handleQuickFormChange('dateOfBirth', event.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                label="Parent or guardian"
                value={quickForm.parentGuardianName}
                onChange={(event) =>
                  handleQuickFormChange('parentGuardianName', event.target.value)
                }
                fullWidth
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <TextField
                label="Contact number"
                value={quickForm.primaryContactNo}
                onChange={(event) => handleQuickFormChange('primaryContactNo', event.target.value)}
                fullWidth
              />
              <TextField
                label="Email"
                value={quickForm.email}
                onChange={(event) => handleQuickFormChange('email', event.target.value)}
                fullWidth
              />
            </Stack>
            <TextField
              required
              label="Admission intent"
              value={quickForm.admissionIntent}
              onChange={(event) => handleQuickFormChange('admissionIntent', event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <TextField
                label="Desired class"
                value={quickForm.desiredClassName}
                onChange={(event) => handleQuickFormChange('desiredClassName', event.target.value)}
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="crm-channel-label">Inquiry channel</InputLabel>
                <Select
                  labelId="crm-channel-label"
                  label="Inquiry channel"
                  value={quickForm.channel}
                  onChange={(event) =>
                    handleQuickFormChange(
                      'channel',
                      Number(event.target.value) as AdmissionInquiryChannel
                    )
                  }
                >
                  {channelOptions.map((channel) => (
                    <MenuItem key={channel} value={channel}>
                      {getAdmissionCrmChannelLabel(channel)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>
            <TextField
              label="Campaign"
              value={quickForm.campaignName}
              onChange={(event) => handleQuickFormChange('campaignName', event.target.value)}
              fullWidth
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5}>
              <TextField
                label="Campus branch"
                value={quickForm.campusBranchName}
                onChange={(event) => handleQuickFormChange('campusBranchName', event.target.value)}
                fullWidth
              />
              <TextField
                label="Preferred language"
                value={quickForm.preferredCommunicationLanguage}
                onChange={(event) =>
                  handleQuickFormChange('preferredCommunicationLanguage', event.target.value)
                }
                fullWidth
              />
            </Stack>
            <TextField
              label="Notes"
              value={quickForm.notes}
              onChange={(event) => handleQuickFormChange('notes', event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />

            {duplicateMatches.length > 0 && (
              <Alert severity="warning">
                <Stack spacing={1}>
                  <Typography variant="body2">
                    Possible duplicate inquiries found. Review before creating another lead.
                  </Typography>
                  <Divider />
                  {duplicateMatches.map((match) => (
                    <Stack key={match.leadId} spacing={0.25}>
                      <Typography variant="subtitle2">
                        {[match.firstName, match.lastName].filter(Boolean).join(' ') ||
                          match.primaryContactNo}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {match.matchReason} - {match.confidenceScore}% confidence -{' '}
                        {getAdmissionCrmStageLabel(match.stage)}
                      </Typography>
                      {(match.matchedFields || []).length > 0 && (
                        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                          {(match.matchedFields || []).map((field) => (
                            <Chip key={field} size="small" label={field} />
                          ))}
                        </Stack>
                      )}
                    </Stack>
                  ))}
                  <TextField
                    required
                    label="Continue reason"
                    value={quickForm.duplicateContinueReason}
                    onChange={(event) =>
                      handleQuickFormChange('duplicateContinueReason', event.target.value)
                    }
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </Stack>
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setQuickDialogOpen(false)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isCreatingLead || isPreviewingDuplicates}
            onClick={handleCreateLead}
          >
            {duplicateAcknowledged ? 'Create Anyway' : 'Create Inquiry'}
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(examActionRecord)}
        onClose={() => setExamActionRecord(null)}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Manage Entrance Exam</DialogTitle>
        <DialogContent>
          {examActionRecord && examActionForm && (
            <Stack spacing={1.5} sx={{ pt: 1 }}>
              <Alert severity="info" icon={<EventAvailable />}>
                {examActionRecord.slotNameSnapshot || examActionRecord.entranceExamSlotId} -{' '}
                {dayjs(examActionRecord.examStartTime).format('DD MMM YYYY, HH:mm')}
              </Alert>

              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                <Stack spacing={1.25}>
                  <Typography variant="subtitle2">Attendance</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25} alignItems="center">
                    <FormControl fullWidth>
                      <InputLabel id="crm-exam-attendance-label">Attendance</InputLabel>
                      <Select
                        labelId="crm-exam-attendance-label"
                        label="Attendance"
                        value={examActionForm.attendanceStatus}
                        onChange={(event) =>
                          setExamActionForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  attendanceStatus: Number(
                                    event.target.value
                                  ) as AdmissionCrmExamAttendanceStatus,
                                }
                              : prev
                          )
                        }
                      >
                        {Object.entries(attendanceStatusLabels).map(([value, label]) => (
                          <MenuItem key={value} value={Number(value)}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <LoadingButton
                      variant="outlined"
                      loading={isMarkingExamAttendance}
                      onClick={handleSaveExamAttendance}
                    >
                      Save Attendance
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                <Stack spacing={1.25}>
                  <Typography variant="subtitle2">Marks</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
                    <TextField
                      label="Total marks"
                      type="number"
                      value={examActionForm.totalMarks}
                      onChange={(event) =>
                        setExamActionForm((prev) =>
                          prev ? { ...prev, totalMarks: event.target.value } : prev
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Passing marks"
                      type="number"
                      value={examActionForm.passingMarks}
                      onChange={(event) =>
                        setExamActionForm((prev) =>
                          prev ? { ...prev, passingMarks: event.target.value } : prev
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Obtained marks"
                      type="number"
                      value={examActionForm.obtainedMarks}
                      onChange={(event) =>
                        setExamActionForm((prev) =>
                          prev ? { ...prev, obtainedMarks: event.target.value } : prev
                        )
                      }
                      fullWidth
                    />
                    <TextField
                      label="Merit rank"
                      type="number"
                      value={examActionForm.meritRank}
                      onChange={(event) =>
                        setExamActionForm((prev) =>
                          prev ? { ...prev, meritRank: event.target.value } : prev
                        )
                      }
                      fullWidth
                    />
                  </Stack>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                    <Typography variant="body2" color="text.secondary">
                      Current status: {examStatusLabels[examActionRecord.examStatus]}
                    </Typography>
                    <LoadingButton
                      variant="outlined"
                      loading={isUploadingExamResult}
                      onClick={handleSaveExamResult}
                    >
                      Save Result
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Paper>

              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                <Stack spacing={1.25}>
                  <Typography variant="subtitle2">Eligibility</Typography>
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
                    <FormControl fullWidth>
                      <InputLabel id="crm-eligibility-decision-label">Decision</InputLabel>
                      <Select
                        labelId="crm-eligibility-decision-label"
                        label="Decision"
                        value={examActionForm.eligibilityDecision}
                        onChange={(event) =>
                          setExamActionForm((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  eligibilityDecision: Number(
                                    event.target.value
                                  ) as AdmissionCrmEligibilityDecision,
                                }
                              : prev
                          )
                        }
                      >
                        {eligibilityDecisionOptions.map((decision) => (
                          <MenuItem key={decision} value={decision}>
                            {admissionCrmEligibilityLabels[decision]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <TextField
                      label="Decision reason"
                      value={examActionForm.eligibilityDecisionReason}
                      onChange={(event) =>
                        setExamActionForm((prev) =>
                          prev ? { ...prev, eligibilityDecisionReason: event.target.value } : prev
                        )
                      }
                      fullWidth
                    />
                  </Stack>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={examActionForm.overrideDecision}
                        onChange={(event) =>
                          setExamActionForm((prev) =>
                            prev ? { ...prev, overrideDecision: event.target.checked } : prev
                          )
                        }
                      />
                    }
                    label="Record as override decision"
                  />
                  {examActionForm.overrideDecision && (
                    <TextField
                      required
                      label="Override reason"
                      value={examActionForm.overrideReason}
                      onChange={(event) =>
                        setExamActionForm((prev) =>
                          prev ? { ...prev, overrideReason: event.target.value } : prev
                        )
                      }
                      fullWidth
                      multiline
                      minRows={2}
                    />
                  )}
                  <Stack direction="row" justifyContent="flex-end">
                    <LoadingButton
                      variant="contained"
                      loading={isDecidingExamEligibility}
                      onClick={handleSaveEligibilityDecision}
                    >
                      Save Eligibility
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Paper>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExamActionRecord(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(noteLead)} onClose={() => setNoteLead(null)} fullWidth maxWidth="sm">
        <DialogTitle>{isCallNote ? 'Call Note' : 'Lead Note'}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {noteLead && (
              <Alert severity="info" icon={<Notes />}>
                {getAdmissionCrmLeadName(noteLead)} -{' '}
                {noteLead.desiredClassName || noteLead.admissionIntent}
              </Alert>
            )}
            <FormControlLabel
              control={
                <Checkbox
                  checked={isCallNote}
                  onChange={(event) => setIsCallNote(event.target.checked)}
                />
              }
              label="Call note"
            />
            <TextField
              required
              label="Note"
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              fullWidth
              multiline
              minRows={4}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNoteLead(null)}>Cancel</Button>
          <LoadingButton variant="contained" loading={isAddingLeadNote} onClick={handleAddLeadNote}>
            Save Note
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(timelineLead)}
        onClose={() => setTimelineLead(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Lead Timeline</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            {timelineLead && (
              <Alert severity="info" icon={<History />}>
                {getAdmissionCrmLeadName(timelineLead)} -{' '}
                {timelineLead.desiredClassName || timelineLead.admissionIntent}
              </Alert>
            )}
            {isTimelineFetching && <LinearProgress />}
            {timelineEvents.map((event) => (
              <Paper key={event.id} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                <Stack direction="row" justifyContent="space-between" gap={1}>
                  <Typography variant="subtitle2" sx={{ wordBreak: 'break-word' }}>
                    {event.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ flexShrink: 0, whiteSpace: 'nowrap' }}
                  >
                    {dayjs(event.occurredAt).format('DD MMM, HH:mm')}
                  </Typography>
                </Stack>
                {event.details && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5, wordBreak: 'break-word' }}
                  >
                    {event.details}
                  </Typography>
                )}
              </Paper>
            ))}
            {!isTimelineFetching && !timelineEvents.length && (
              <Typography variant="body2" color="text.secondary" align="center">
                No timeline events recorded yet
              </Typography>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimelineLead(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(operationsLead)}
        onClose={() => setOperationsLead(null)}
        fullWidth
        maxWidth="lg"
      >
        <DialogTitle>Applicant Operations</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {operationsLead && (
              <Alert severity="info" icon={<AssignmentInd />}>
                {getAdmissionCrmLeadName(operationsLead)} -{' '}
                {operationsLead.desiredClassName || operationsLead.admissionIntent}
              </Alert>
            )}

            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack spacing={1.25}>
                <Typography variant="subtitle2">Lead Owner</Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25} alignItems="flex-start">
                  <TextField
                    label="Owner user ID"
                    value={ownerUserIdText}
                    onChange={(event) => setOwnerUserIdText(event.target.value)}
                    helperText={
                      operationsLead ? getLeadOwnerLabel(operationsLead, crmStaff) : 'Unassigned'
                    }
                    fullWidth
                  />
                  <LoadingButton
                    variant="outlined"
                    loading={isAssigningLeadOwner}
                    onClick={handleSaveOwner}
                  >
                    Save Owner
                  </LoadingButton>
                </Stack>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                  <Typography variant="subtitle2">SLA Clock</Typography>
                  {slaHolds.some((hold) => hold.isActive) ? (
                    <Chip size="small" color="warning" label="Paused" />
                  ) : (
                    <Chip size="small" color="success" label="Running" />
                  )}
                </Stack>
                {isSlaHoldsFetching && <LinearProgress />}
                {slaHolds.slice(0, 3).map((hold) => (
                  <Alert key={hold.id} severity={hold.isActive ? 'warning' : 'info'}>
                    {hold.reason} - {dayjs(hold.startedAt).format('DD MMM YYYY, HH:mm')}
                    {hold.resumedAt
                      ? `; resumed ${dayjs(hold.resumedAt).format('DD MMM YYYY, HH:mm')}`
                      : ''}
                  </Alert>
                ))}
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1} alignItems="flex-start">
                  <FormControl fullWidth size="small">
                    <InputLabel>Hold reason</InputLabel>
                    <Select
                      label="Hold reason"
                      value={slaHoldReason}
                      disabled={slaHolds.some((hold) => hold.isActive)}
                      onChange={(event) =>
                        setSlaHoldReason(Number(event.target.value) as AdmissionCrmSlaHoldReason)
                      }
                    >
                      <MenuItem value={AdmissionCrmSlaHoldReason.ParentAction}>
                        Awaiting parent action
                      </MenuItem>
                      <MenuItem value={AdmissionCrmSlaHoldReason.ExternalAuthority}>
                        Awaiting external authority
                      </MenuItem>
                      <MenuItem value={AdmissionCrmSlaHoldReason.ApprovedHold}>
                        Approved operational hold
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    size="small"
                    label={slaHolds.some((hold) => hold.isActive) ? 'Resume reason' : 'Hold reason'}
                    value={slaHoldNotes}
                    onChange={(event) => setSlaHoldNotes(event.target.value)}
                  />
                  {slaHolds.find((hold) => hold.isActive) ? (
                    <LoadingButton
                      variant="outlined"
                      loading={isResumingSlaHold}
                      disabled={!slaHoldNotes.trim()}
                      onClick={() =>
                        handleResumeSlaHold(slaHolds.find((hold) => hold.isActive)!.id)
                      }
                    >
                      Resume
                    </LoadingButton>
                  ) : (
                    <LoadingButton
                      variant="outlined"
                      loading={isCreatingSlaHold}
                      disabled={!slaHoldNotes.trim()}
                      onClick={handleCreateSlaHold}
                    >
                      Pause
                    </LoadingButton>
                  )}
                </Stack>
              </Stack>
            </Paper>

            {operationsLead ? (
              <ApplicantRegistrationOperations
                leadId={operationsLead.id}
                academicYearId={operationsLead.academicYearId}
              />
            ) : null}

            {operationsLead ? (
              <ApplicantHouseholdIdentityOperations leadId={operationsLead.id} />
            ) : null}

            {operationsLead ? (
              <ApplicantFinancialReadiness
                leadId={operationsLead.id}
                academicYearId={operationsLead.academicYearId}
              />
            ) : null}

            {operationsLead ? (
              <ApplicantPolicyReadiness
                leadId={operationsLead.id}
                academicYearId={operationsLead.academicYearId}
              />
            ) : null}

            {operationsLead ? (
              <ApplicantRouteOperations
                leadId={operationsLead.id}
                academicYearId={operationsLead.academicYearId}
              />
            ) : null}

            {operationsLead ? (
              <ApplicantFinalAdmissionOperations
                leadId={operationsLead.id}
                academicYearId={operationsLead.academicYearId}
              />
            ) : null}

            {operationsLead ? (
              <ApplicantActivationOperations
                leadId={operationsLead.id}
                academicYearId={operationsLead.academicYearId}
              />
            ) : null}

            {operationsLead ? <GeneratedDocumentOperations leadId={operationsLead.id} /> : null}

            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack spacing={1.25}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                  <Typography variant="subtitle2">Lead Priority</Typography>
                  {operationsLead && (
                    <Chip
                      size="small"
                      color={leadPriorityColors[operationsLead.priority]}
                      label={leadPriorityLabels[operationsLead.priority]}
                    />
                  )}
                </Stack>
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25} alignItems="flex-start">
                  <FormControl fullWidth>
                    <InputLabel id="crm-lead-priority-label">Priority</InputLabel>
                    <Select
                      labelId="crm-lead-priority-label"
                      label="Priority"
                      value={selectedPriority}
                      onChange={(event) =>
                        setSelectedPriority(Number(event.target.value) as AdmissionCrmLeadPriority)
                      }
                    >
                      {leadPriorityOptions.map((priority) => (
                        <MenuItem key={priority} value={priority}>
                          {leadPriorityLabels[priority]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                  <TextField
                    label="Reason"
                    value={priorityReason}
                    onChange={(event) => setPriorityReason(event.target.value)}
                    fullWidth
                  />
                  <LoadingButton
                    variant="outlined"
                    startIcon={<Flag />}
                    loading={isChangingLeadPriority}
                    onClick={handleSavePriority}
                  >
                    Save Priority
                  </LoadingButton>
                </Stack>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                  <Typography variant="subtitle2">Applicant Checklist</Typography>
                  <Chip size="small" label={`${applicantChecklist.length} item(s)`} />
                </Stack>
                {isApplicantChecklistFetching && <LinearProgress />}
                {applicantChecklist.map((item) => {
                  const selectedStatus = checklistStatusByKey[item.key] ?? item.status;
                  const notesValue = checklistNotesByKey[item.key] ?? item.notes ?? '';
                  return (
                    <Stack
                      key={item.key}
                      direction={{ xs: 'column', md: 'row' }}
                      gap={1.25}
                      alignItems={{ xs: 'stretch', md: 'flex-start' }}
                      sx={{ borderTop: '1px solid', borderColor: 'divider', pt: 1.25 }}
                    >
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                            {item.label}
                          </Typography>
                          <Chip
                            size="small"
                            color={item.isRequired ? 'warning' : 'default'}
                            label={item.isRequired ? 'Required' : 'Optional'}
                          />
                          <Chip
                            size="small"
                            color={applicantChecklistStatusColors[item.status]}
                            label={item.statusLabel || applicantChecklistStatusLabels[item.status]}
                          />
                        </Stack>
                        {item.details && (
                          <Typography variant="caption" color="text.secondary">
                            {item.details}
                          </Typography>
                        )}
                      </Box>
                      <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 160 } }}>
                        <InputLabel id={`applicant-checklist-status-${item.key}`}>
                          Progress
                        </InputLabel>
                        <Select
                          labelId={`applicant-checklist-status-${item.key}`}
                          label="Progress"
                          value={selectedStatus}
                          onChange={(event) =>
                            setChecklistStatusByKey((prev) => ({
                              ...prev,
                              [item.key]: Number(
                                event.target.value
                              ) as AdmissionCrmApplicantChecklistProgressStatus,
                            }))
                          }
                        >
                          {applicantChecklistStatusOptions.map((status) => (
                            <MenuItem key={status} value={status}>
                              {applicantChecklistStatusLabels[status]}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                      <TextField
                        size="small"
                        label="Internal notes"
                        value={notesValue}
                        onChange={(event) =>
                          setChecklistNotesByKey((prev) => ({
                            ...prev,
                            [item.key]: event.target.value,
                          }))
                        }
                        sx={{ flex: 1, minWidth: { xs: '100%', md: 220 } }}
                      />
                      <LoadingButton
                        size="small"
                        variant="outlined"
                        startIcon={<AssignmentTurnedIn />}
                        loading={isUpdatingApplicantChecklist}
                        onClick={() => handleUpdateApplicantChecklist(item)}
                      >
                        Save
                      </LoadingButton>
                    </Stack>
                  );
                })}
                {!applicantChecklist.length && !isApplicantChecklistFetching && (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No applicant checklist configured for this admission cycle
                  </Typography>
                )}
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack spacing={1.25}>
                <Typography variant="subtitle2">New Follow-up Task</Typography>
                <TextField
                  label="Task title"
                  value={taskForm.title}
                  onChange={(event) =>
                    setTaskForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  fullWidth
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
                  <TextField
                    label="Due date"
                    type="datetime-local"
                    value={taskForm.dueAt}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, dueAt: event.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    select
                    label="Assigned staff"
                    value={taskForm.assignedUserId}
                    onChange={(event) =>
                      setTaskForm((prev) => ({ ...prev, assignedUserId: event.target.value }))
                    }
                    fullWidth
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {crmStaff.map((staff) => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.displayName} ({staff.userName})
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <TextField
                  label="Notes"
                  value={taskForm.notes}
                  onChange={(event) =>
                    setTaskForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  fullWidth
                  multiline
                  minRows={2}
                />
                <Stack direction="row" justifyContent="flex-end">
                  <LoadingButton
                    variant="contained"
                    startIcon={<TaskAlt />}
                    loading={isCreatingTask}
                    onClick={handleCreateTask}
                  >
                    Create Task
                  </LoadingButton>
                </Stack>
              </Stack>
            </Paper>

            <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
              <Stack spacing={1.25}>
                <Stack direction="row" justifyContent="space-between" gap={1} alignItems="center">
                  <Typography variant="subtitle2">Follow-up Tasks</Typography>
                  <Chip size="small" label={`${leadTasks.length} task(s)`} />
                </Stack>
                {isTasksFetching && <LinearProgress />}
                <Box sx={{ overflowX: 'auto' }}>
                  <Table size="small" sx={{ minWidth: 760 }}>
                    <TableHead>
                      <TableRow>
                        <TableCell>Task</TableCell>
                        <TableCell>Due</TableCell>
                        <TableCell>Assignee</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Completion</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {leadTasks.map((task) => (
                        <TableRow key={task.id} hover>
                          <TableCell>
                            <Typography variant="subtitle2">{task.title}</Typography>
                            {task.notes && (
                              <Typography variant="caption" color="text.secondary">
                                {task.notes}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell>{dayjs(task.dueAt).format('DD MMM YYYY, HH:mm')}</TableCell>
                          <TableCell>
                            {crmStaff.find((staff) => staff.id === task.assignedUserId)
                              ?.displayName || 'Unassigned'}
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={taskStatusLabels[task.status] || task.status}
                            />
                          </TableCell>
                          <TableCell sx={{ minWidth: 220 }}>
                            {task.status === 1 ? (
                              <TextField
                                size="small"
                                label="Completion notes"
                                value={taskCompletionNotes[task.id] || ''}
                                onChange={(event) =>
                                  setTaskCompletionNotes((prev) => ({
                                    ...prev,
                                    [task.id]: event.target.value,
                                  }))
                                }
                                fullWidth
                              />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                {task.completionNotes || '-'}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {task.status === 1 ? (
                              <LoadingButton
                                size="small"
                                variant="text"
                                loading={isCompletingTask}
                                onClick={() => handleCompleteTask(task)}
                              >
                                Complete
                              </LoadingButton>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                {task.completedAt
                                  ? dayjs(task.completedAt).format('DD MMM, HH:mm')
                                  : '-'}
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {!leadTasks.length && !isTasksFetching && (
                        <TableRow>
                          <TableCell colSpan={6}>
                            <Typography variant="body2" color="text.secondary" align="center">
                              No follow-up tasks recorded
                            </Typography>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </Stack>
            </Paper>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOperationsLead(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(bulkAction)} onClose={closeBulkAction} fullWidth maxWidth="sm">
        <DialogTitle>{getBulkActionTitle(bulkAction)}</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <Alert severity="info">
              {selectedLeads.length} selected lead{selectedLeads.length === 1 ? '' : 's'}
            </Alert>

            {bulkAction === 'owner' && (
              <TextField
                select
                label="Owner staff"
                value={bulkOwnerUserIdText}
                onChange={(event) => setBulkOwnerUserIdText(event.target.value)}
                fullWidth
              >
                <MenuItem value="">Clear owner</MenuItem>
                {crmStaff.map((staff) => (
                  <MenuItem key={staff.id} value={staff.id}>
                    {staff.displayName} ({staff.userName})
                  </MenuItem>
                ))}
              </TextField>
            )}

            {bulkAction === 'task' && (
              <Stack spacing={1.25}>
                <TextField
                  label="Task title"
                  value={bulkTaskForm.title}
                  onChange={(event) =>
                    setBulkTaskForm((prev) => ({ ...prev, title: event.target.value }))
                  }
                  fullWidth
                />
                <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.25}>
                  <TextField
                    label="Due date"
                    type="datetime-local"
                    value={bulkTaskForm.dueAt}
                    onChange={(event) =>
                      setBulkTaskForm((prev) => ({ ...prev, dueAt: event.target.value }))
                    }
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                  />
                  <TextField
                    select
                    label="Assigned staff"
                    value={bulkTaskForm.assignedUserId}
                    onChange={(event) =>
                      setBulkTaskForm((prev) => ({
                        ...prev,
                        assignedUserId: event.target.value,
                      }))
                    }
                    fullWidth
                  >
                    <MenuItem value="">Unassigned</MenuItem>
                    {crmStaff.map((staff) => (
                      <MenuItem key={staff.id} value={staff.id}>
                        {staff.displayName} ({staff.userName})
                      </MenuItem>
                    ))}
                  </TextField>
                </Stack>
                <TextField
                  label="Notes"
                  value={bulkTaskForm.notes}
                  onChange={(event) =>
                    setBulkTaskForm((prev) => ({ ...prev, notes: event.target.value }))
                  }
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Stack>
            )}

            {bulkAction === 'stage' && (
              <Stack spacing={1.25}>
                <FormControl fullWidth>
                  <InputLabel id="crm-bulk-stage-label">Stage</InputLabel>
                  <Select
                    labelId="crm-bulk-stage-label"
                    label="Stage"
                    value={bulkStage}
                    disabled={bulkStageOptions.length === 0}
                    onChange={(event) =>
                      setBulkStage(Number(event.target.value) as AdmissionInquiryStage)
                    }
                  >
                    {bulkStageOptions.map((stage) => (
                      <MenuItem key={stage} value={stage}>
                        {getAdmissionCrmStageLabel(stage)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {bulkStageOptions.length === 0 && (
                  <Alert severity="warning">
                    No shared allowed next stage is available for the selected leads.
                  </Alert>
                )}
                <TextField
                  required
                  label="Reason"
                  value={bulkReason}
                  onChange={(event) => setBulkReason(event.target.value)}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </Stack>
            )}

            {bulkAction === 'archive' && (
              <TextField
                required
                label="Archive reason"
                value={bulkReason}
                onChange={(event) => setBulkReason(event.target.value)}
                fullWidth
                multiline
                minRows={2}
              />
            )}

            {bulkAction === 'message' && (
              <Stack spacing={1.25}>
                <FormControl fullWidth>
                  <InputLabel id="crm-bulk-message-template-label">Template</InputLabel>
                  <Select
                    labelId="crm-bulk-message-template-label"
                    label="Template"
                    value={bulkMessageTemplateId}
                    onChange={(event) => setBulkMessageTemplateId(event.target.value)}
                  >
                    {messageTemplates.map((template) => (
                      <MenuItem key={template.id} value={template.id}>
                        {template.templateName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <TextField
                  label="Variables"
                  value={bulkMessageVariablesText}
                  onChange={(event) => setBulkMessageVariablesText(event.target.value)}
                  fullWidth
                  multiline
                  minRows={4}
                  placeholder="examDate=15 July"
                />
              </Stack>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeBulkAction}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isBulkActionRunning}
            onClick={handleRunBulkAction}
          >
            Apply
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(stageLead)} onClose={() => setStageLead(null)} fullWidth maxWidth="sm">
        <DialogTitle>Move Pipeline Stage</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {stageLead && (
              <Alert severity="info" icon={<SwapHoriz />}>
                {getAdmissionCrmLeadName(stageLead)} - {getAdmissionCrmStageLabel(stageLead.stage)}
              </Alert>
            )}
            <FormControl fullWidth>
              <InputLabel id="crm-manual-stage-label">Stage</InputLabel>
              <Select
                labelId="crm-manual-stage-label"
                label="Stage"
                value={stageDialogOptions.includes(selectedStage) ? selectedStage : ''}
                disabled={stageDialogOptions.length === 0}
                onChange={(event) =>
                  setSelectedStage(Number(event.target.value) as AdmissionInquiryStage)
                }
              >
                {stageDialogOptions.map((stage) => (
                  <MenuItem key={stage} value={stage}>
                    {getAdmissionCrmStageLabel(stage)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {stageDialogOptions.length === 0 && (
              <Alert severity="warning">No allowed manual next stage is configured.</Alert>
            )}
            <TextField
              required
              label="Reason"
              value={stageReason}
              onChange={(event) => setStageReason(event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setStageLead(null)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isChangingLeadStage}
            disabled={stageDialogOptions.length === 0}
            onClick={handleChangeStage}
          >
            Move Stage
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(handoffExamId)}
        onClose={() => setHandoffExamId('')}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Eligibility Handoff</DialogTitle>
        <DialogContent>
          <Stack spacing={1.25} sx={{ pt: 1 }}>
            {isHandoffFetching && <LinearProgress />}
            {handoffData && (
              <>
                <Alert severity={handoffData.canStartAdmission ? 'success' : 'warning'}>
                  {handoffData.canStartAdmission
                    ? 'Eligible for admission handoff'
                    : 'Review before admission handoff'}
                </Alert>
                <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Stack spacing={0.75}>
                    <Stack direction="row" justifyContent="space-between" gap={1}>
                      <Typography variant="subtitle2">{handoffData.applicantName}</Typography>
                      <Chip
                        size="small"
                        label={admissionCrmEligibilityLabels[handoffData.eligibilityDecision]}
                      />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {handoffData.desiredClassName || 'Class not captured'} -{' '}
                      {handoffData.admissionIntent}
                    </Typography>
                    {handoffData.dateOfBirth && (
                      <Typography variant="body2" color="text.secondary">
                        DOB: {new Date(handoffData.dateOfBirth).toLocaleDateString()}
                      </Typography>
                    )}
                    <Divider />
                    <Typography variant="body2">
                      {handoffData.primaryContactNo || handoffData.email || 'No contact captured'}
                    </Typography>
                    <Typography variant="body2">
                      Marks:{' '}
                      {handoffData.obtainedMarks != null && handoffData.totalMarks != null
                        ? `${handoffData.obtainedMarks}/${handoffData.totalMarks}`
                        : '-'}
                      {handoffData.meritRank ? ` - Rank ${handoffData.meritRank}` : ''}
                    </Typography>
                    {handoffData.eligibilityDecisionReason && (
                      <Typography variant="body2" color="text.secondary">
                        {handoffData.eligibilityDecisionReason}
                      </Typography>
                    )}
                    {handoffData.requiresManualReview && (
                      <Alert severity="info">
                        Manual review is required before the admission team proceeds.
                      </Alert>
                    )}
                    {handoffData.missingAdmissionFields?.length > 0 && (
                      <Alert severity="warning">
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          Missing before admission
                        </Typography>
                        <Box component="ul" sx={{ m: 0.5, pl: 2.25 }}>
                          {handoffData.missingAdmissionFields.map((field) => (
                            <Box component="li" key={field}>
                              <Typography variant="body2">{field}</Typography>
                            </Box>
                          ))}
                        </Box>
                      </Alert>
                    )}
                  </Stack>
                </Paper>
              </>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHandoffExamId('')}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(mergeLead)} onClose={() => setMergeLead(null)} fullWidth maxWidth="sm">
        <DialogTitle>Merge Duplicate Inquiry</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {mergeLead && (
              <Alert severity="warning" icon={<CallMerge />}>
                Keep {getAdmissionCrmLeadName(mergeLead)} as the surviving inquiry and archive the
                selected duplicate.
              </Alert>
            )}
            <FormControl fullWidth>
              <InputLabel id="crm-duplicate-lead-label">Duplicate inquiry</InputLabel>
              <Select
                labelId="crm-duplicate-lead-label"
                label="Duplicate inquiry"
                value={selectedDuplicateLeadId}
                onChange={(event) => setSelectedDuplicateLeadId(event.target.value)}
              >
                {(mergeLead?.likelyDuplicates || []).map((duplicate) => (
                  <MenuItem key={duplicate.leadId} value={duplicate.leadId}>
                    {[
                      [duplicate.firstName, duplicate.lastName].filter(Boolean).join(' '),
                      duplicate.primaryContactNo || duplicate.email,
                      getAdmissionCrmStageLabel(duplicate.stage),
                    ]
                      .filter(Boolean)
                      .join(' - ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {mergeLead?.likelyDuplicates
              .filter((duplicate) => duplicate.leadId === selectedDuplicateLeadId)
              .map((duplicate) => (
                <Paper key={duplicate.leadId} variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                  <Typography variant="subtitle2">
                    {duplicate.matchReason} - {duplicate.confidenceScore}% confidence
                  </Typography>
                  {(duplicate.matchedFields || []).length > 0 && (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      flexWrap="wrap"
                      useFlexGap
                      sx={{ mt: 0.75 }}
                    >
                      {(duplicate.matchedFields || []).map((field) => (
                        <Chip key={field} size="small" label={field} />
                      ))}
                    </Stack>
                  )}
                  <Typography variant="caption" color="text.secondary">
                    Last activity {dayjs(duplicate.lastActivityTime).format('DD MMM YYYY, HH:mm')}
                  </Typography>
                </Paper>
              ))}
            <TextField
              required
              label="Merge reason"
              value={mergeReason}
              onChange={(event) => setMergeReason(event.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeLead(null)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            color="warning"
            loading={isMergingDuplicateLead}
            onClick={handleMergeDuplicate}
          >
            Merge Duplicate
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(registrationLead)}
        onClose={() => setRegistrationLead(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Issue Registration Form</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {registrationLead && (
              <Alert severity="info" icon={<ReceiptLong />}>
                {getAdmissionCrmLeadName(registrationLead)} -{' '}
                {registrationLead.desiredClassName || registrationLead.admissionIntent}
              </Alert>
            )}
            <TextField
              label="Form number"
              value={registrationFormNumber}
              onChange={(event) => setRegistrationFormNumber(event.target.value.toUpperCase())}
              fullWidth
            />
            <TextField
              label="Amount"
              type="number"
              value={registrationFormAmount}
              onChange={(event) => setRegistrationFormAmount(event.target.value)}
              inputProps={{ min: 0.01, step: 0.01 }}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRegistrationLead(null)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isIssuingRegistrationForm}
            onClick={handleIssueRegistrationForm}
          >
            Issue Form
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog
        open={Boolean(scheduleLead)}
        onClose={() => setScheduleLead(null)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Schedule Entrance Exam</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            {scheduleLead && (
              <Alert severity="info" icon={<Iconify icon="solar:user-id-linear" />}>
                {getAdmissionCrmLeadName(scheduleLead)} -{' '}
                {scheduleLead.desiredClassName || 'Class not captured'}
              </Alert>
            )}
            <FormControl fullWidth disabled={isSlotsFetching}>
              <InputLabel id="crm-exam-slot-label">Entrance exam slot</InputLabel>
              <Select
                labelId="crm-exam-slot-label"
                label="Entrance exam slot"
                value={selectedSlotId}
                onChange={(event) => setSelectedSlotId(event.target.value)}
              >
                {slots.map((slot: any) => (
                  <MenuItem key={slot.id} value={slot.id}>
                    {slot.slotName || 'Unnamed slot'} -{' '}
                    {dayjs(slot.startDateTime).format('DD MMM, HH:mm')} - Room {slot.roomNo}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            {!slots.length && (
              <Alert severity="warning">
                Create an active entrance exam slot before scheduling.
              </Alert>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScheduleLead(null)}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isSchedulingExam}
            disabled={!selectedSlotId}
            onClick={handleScheduleExam}
          >
            Schedule
          </LoadingButton>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(messageLead)} onClose={resetMessageDialog} fullWidth maxWidth="sm">
        <DialogTitle>Send Message</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 1 }}>
            <FormControl fullWidth>
              <InputLabel id="crm-message-template-label">Template</InputLabel>
              <Select
                labelId="crm-message-template-label"
                label="Template"
                value={selectedMessageTemplateId}
                onChange={(event) => setSelectedMessageTemplateId(event.target.value)}
              >
                {messageTemplates.map((template) => (
                  <MenuItem key={template.id} value={template.id}>
                    {template.templateName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Variables"
              value={messageVariablesText}
              onChange={(event) => setMessageVariablesText(event.target.value)}
              fullWidth
              multiline
              minRows={4}
              placeholder="examDate=15 July"
            />
            {selectedMessageTemplate && (
              <Paper variant="outlined" sx={{ p: 1.25, borderRadius: 1 }}>
                <Stack spacing={1}>
                  <Stack direction={{ xs: 'column', sm: 'row' }} gap={0.75} flexWrap="wrap">
                    <Chip
                      size="small"
                      label={getAdmissionCrmMessageChannelLabel(selectedMessageTemplate.channel)}
                    />
                    <Chip
                      size="small"
                      variant="outlined"
                      color={selectedMessageRecipient ? 'default' : 'warning'}
                      label={selectedMessageRecipient || 'Missing recipient'}
                    />
                  </Stack>
                  {!selectedMessageRecipient && (
                    <Alert severity="warning">
                      Capture a recipient for this channel before sending or changing consent.
                    </Alert>
                  )}
                  <TextField
                    label="Opt-out / opt-in reason"
                    value={messageOptOutReason}
                    onChange={(event) => setMessageOptOutReason(event.target.value)}
                    fullWidth
                    multiline
                    minRows={2}
                  />
                  <Stack direction="row" gap={0.75} flexWrap="wrap">
                    <LoadingButton
                      size="small"
                      color="warning"
                      variant="outlined"
                      loading={isCreatingCommunicationOptOut}
                      disabled={!selectedMessageRecipient || isClearingCommunicationOptOut}
                      onClick={handleCreateMessageOptOut}
                    >
                      Record Opt-out
                    </LoadingButton>
                    <LoadingButton
                      size="small"
                      variant="outlined"
                      loading={isClearingCommunicationOptOut}
                      disabled={!selectedMessageRecipient || isCreatingCommunicationOptOut}
                      onClick={handleClearMessageOptOut}
                    >
                      Clear Opt-out
                    </LoadingButton>
                  </Stack>
                </Stack>
              </Paper>
            )}
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={resetMessageDialog}>Cancel</Button>
          <LoadingButton
            variant="contained"
            loading={isSendingTemplateMessage}
            disabled={Boolean(selectedMessageTemplate && !selectedMessageRecipient)}
            onClick={handleSendTemplateMessage}
          >
            Send
          </LoadingButton>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StudentAdmissionsCrmScreen;
