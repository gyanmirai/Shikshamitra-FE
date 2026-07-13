import {
  AdmissionInquiryStage,
  EntranceExamStatusEnum,
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
  AdmissionCrmOperationsQueueType,
  AdmissionCrmEligibilityDecision,
  AdmissionCrmExamAttendanceStatus,
} from 'src/redux/student/admissions-crm/admissions-crm-api';

export type EnrollmentWorkspace =
  | 'pipeline'
  | 'exams'
  | 'registrations'
  | 'offers'
  | 'activation'
  | 'operations'
  | 'analytics'
  | 'settings';

export type EnrollmentPersona =
  | 'administrator'
  | 'receptionist'
  | 'counselor'
  | 'approver'
  | 'restricted';

export type PipelineView = 'board' | 'list';
export type ScoreBandFilter = 'all' | 'hot' | 'warm' | 'needsAttention';

export type EnrollmentWorkspaceState = {
  cycle?: string;
  applicant?: string;
  page: number;
  view?: PipelineView;
  stage?: AdmissionInquiryStage;
  channel?: AdmissionInquiryChannel;
  campaign?: string;
  owner?: string;
  className?: string;
  score?: ScoreBandFilter;
  priority?: AdmissionCrmLeadPriority;
  queue?: AdmissionCrmOperationsQueueType;
  assignee?: string;
  urgent?: boolean;
  minimumAgeDays?: number;
  attendance?: AdmissionCrmExamAttendanceStatus;
  examStatus?: EntranceExamStatusEnum;
  eligibility?: AdmissionCrmEligibilityDecision;
  from?: string;
  to?: string;
};

export type EnrollmentWorkspaceStatePatch = Partial<
  Record<keyof EnrollmentWorkspaceState, EnrollmentWorkspaceState[keyof EnrollmentWorkspaceState]>
>;

type LegacyWorkspaceFilters = {
  stageFilter?: AdmissionInquiryStage | 'all';
  channelFilter?: AdmissionInquiryChannel | 'all';
  campaignFilter?: string;
  ownerFilter?: string;
  classFilter?: string;
  scoreBandFilter?: ScoreBandFilter;
  priorityFilter?: AdmissionCrmLeadPriority | 'all';
  operationsQueueType?: AdmissionCrmOperationsQueueType;
  operationsOwnerUserId?: string;
  operationsAssignedToUserId?: string;
  operationsUrgentOnly?: boolean;
  operationsMinimumAgeDays?: string;
};

const enumValues = <T extends number>(source: Record<string, string | number>) =>
  new Set(Object.values(source).filter((value): value is T => typeof value === 'number'));

const stages = enumValues<AdmissionInquiryStage>(AdmissionInquiryStage);
const channels = enumValues<AdmissionInquiryChannel>(AdmissionInquiryChannel);
const priorities = enumValues<AdmissionCrmLeadPriority>(AdmissionCrmLeadPriority);
const queues = enumValues<AdmissionCrmOperationsQueueType>(AdmissionCrmOperationsQueueType);
const attendanceStatuses = enumValues<AdmissionCrmExamAttendanceStatus>(
  AdmissionCrmExamAttendanceStatus
);
const examStatuses = enumValues<EntranceExamStatusEnum>(EntranceExamStatusEnum);
const eligibilityDecisions = enumValues<AdmissionCrmEligibilityDecision>(
  AdmissionCrmEligibilityDecision
);
const scoreBands = new Set<ScoreBandFilter>(['all', 'hot', 'warm', 'needsAttention']);
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

const parseEnum = <T extends number>(value: string | null, values: Set<T>) => {
  if (value == null || value.trim() === '') return undefined;
  const parsed = Number(value);
  return values.has(parsed as T) ? (parsed as T) : undefined;
};

const parseToken = (value: string | null, maximumLength = 160) => {
  const trimmed = value?.trim();
  return trimmed && trimmed.length <= maximumLength ? trimmed : undefined;
};

const parsePositiveInteger = (value: string | null, maximum = 10_000) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 && parsed <= maximum ? parsed : undefined;
};

export const getWorkspaceFromPathname = (pathname: string): EnrollmentWorkspace => {
  if (pathname.includes('/settings')) return 'settings';
  if (pathname.includes('/exams')) return 'exams';
  if (pathname.includes('/registrations')) return 'registrations';
  if (pathname.includes('/offers-seats')) return 'offers';
  if (pathname.includes('/activation')) return 'activation';
  if (pathname.includes('/operations')) return 'operations';
  if (pathname.includes('/analytics')) return 'analytics';
  return 'pipeline';
};

export const getPersonaWorkspaceDefaults = (
  workspace: EnrollmentWorkspace,
  persona: EnrollmentPersona
): Partial<EnrollmentWorkspaceState> => {
  if (workspace === 'pipeline') {
    if (persona === 'receptionist')
      return { view: 'list', stage: AdmissionInquiryStage.NewInquiry };
    if (persona === 'counselor') return { view: 'board', owner: 'me' };
    return { view: 'list' };
  }

  if (workspace === 'registrations') {
    return { queue: AdmissionCrmOperationsQueueType.IncompleteRegistration };
  }
  if (workspace === 'offers') {
    return { queue: AdmissionCrmOperationsQueueType.FinalApproval };
  }
  if (workspace === 'activation') {
    return { queue: AdmissionCrmOperationsQueueType.ActivationRepair };
  }
  if (workspace === 'operations') {
    return { queue: AdmissionCrmOperationsQueueType.UnassignedExam };
  }
  return {};
};

export const parseEnrollmentWorkspaceState = (
  searchParams: URLSearchParams,
  defaults: Partial<EnrollmentWorkspaceState> = {}
): EnrollmentWorkspaceState => {
  const viewValue = searchParams.get('view');
  const scoreValue = searchParams.get('score') as ScoreBandFilter | null;
  const fromValue = searchParams.get('from');
  const toValue = searchParams.get('to');

  return {
    ...defaults,
    cycle: parseToken(searchParams.get('cycle')) ?? defaults.cycle,
    applicant: parseToken(searchParams.get('applicant')) ?? defaults.applicant,
    page: parsePositiveInteger(searchParams.get('page')) ?? defaults.page ?? 1,
    view:
      viewValue === 'board' || viewValue === 'list'
        ? viewValue
        : (defaults.view as PipelineView | undefined),
    stage: parseEnum(searchParams.get('stage'), stages) ?? defaults.stage,
    channel: parseEnum(searchParams.get('channel'), channels) ?? defaults.channel,
    campaign: parseToken(searchParams.get('campaign')) ?? defaults.campaign,
    owner: parseToken(searchParams.get('owner')) ?? defaults.owner,
    className: parseToken(searchParams.get('class')) ?? defaults.className,
    score: (scoreValue && scoreBands.has(scoreValue) ? scoreValue : undefined) ?? defaults.score,
    priority: parseEnum(searchParams.get('priority'), priorities) ?? defaults.priority,
    queue: parseEnum(searchParams.get('queue'), queues) ?? defaults.queue,
    assignee: parseToken(searchParams.get('assignee')) ?? defaults.assignee,
    urgent: searchParams.get('urgent') === '1' ? true : defaults.urgent,
    minimumAgeDays: parsePositiveInteger(searchParams.get('age'), 3_650) ?? defaults.minimumAgeDays,
    attendance:
      parseEnum(searchParams.get('attendance'), attendanceStatuses) ?? defaults.attendance,
    examStatus: parseEnum(searchParams.get('result'), examStatuses) ?? defaults.examStatus,
    eligibility:
      parseEnum(searchParams.get('eligibility'), eligibilityDecisions) ?? defaults.eligibility,
    from: fromValue && datePattern.test(fromValue) ? fromValue : defaults.from,
    to: toValue && datePattern.test(toValue) ? toValue : defaults.to,
  };
};

export const serializeEnrollmentWorkspaceState = (state: EnrollmentWorkspaceState) => {
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | undefined) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  };

  set('cycle', state.cycle);
  set('applicant', state.applicant);
  if (state.page > 1) set('page', state.page);
  set('view', state.view);
  set('stage', state.stage);
  set('channel', state.channel);
  set('campaign', state.campaign);
  set('owner', state.owner);
  set('class', state.className);
  if (state.score && state.score !== 'all') set('score', state.score);
  set('priority', state.priority);
  set('queue', state.queue);
  set('assignee', state.assignee);
  if (state.urgent) set('urgent', 1);
  set('age', state.minimumAgeDays);
  set('attendance', state.attendance);
  set('result', state.examStatus);
  set('eligibility', state.eligibility);
  set('from', state.from);
  set('to', state.to);
  return params;
};

export const migrateLegacyWorkspaceFilters = (
  serialized: string | null
): Partial<EnrollmentWorkspaceState> => {
  if (!serialized) return {};
  try {
    const legacy = JSON.parse(serialized) as LegacyWorkspaceFilters;
    return {
      stage: legacy.stageFilter === 'all' ? undefined : legacy.stageFilter,
      channel: legacy.channelFilter === 'all' ? undefined : legacy.channelFilter,
      campaign:
        legacy.campaignFilter === 'all' ? undefined : parseToken(legacy.campaignFilter || null),
      owner: legacy.ownerFilter === 'all' ? undefined : parseToken(legacy.ownerFilter || null),
      className: legacy.classFilter === 'all' ? undefined : parseToken(legacy.classFilter || null),
      score: legacy.scoreBandFilter === 'all' ? undefined : legacy.scoreBandFilter,
      priority: legacy.priorityFilter === 'all' ? undefined : legacy.priorityFilter,
      queue: legacy.operationsQueueType,
      assignee: parseToken(legacy.operationsAssignedToUserId || null),
      urgent: legacy.operationsUrgentOnly || undefined,
      minimumAgeDays: parsePositiveInteger(legacy.operationsMinimumAgeDays || null, 3_650),
    };
  } catch {
    return {};
  }
};
