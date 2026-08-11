import {
  AdmissionInquiryChannel,
  AdmissionCrmLeadPriority,
  AdmissionCrmPipelineColumnKey,
  AdmissionCrmServiceHandoffStatus,
} from 'src/redux/student/admissions-crm/core-leads-contracts';

import {
  AdmissionCrmRouteType,
  AdmissionCrmSeatOfferStatus,
  AdmissionCrmActivationStatus,
} from 'src/redux/student/admissions-crm/final-admission-contracts';

import {
  AdmissionCrmEventType,
  EntranceExamStatusEnum,
  AdmissionCrmEventStatus,
  AdmissionCrmEligibilityDecision,
  AdmissionCrmExamAttendanceStatus,
} from 'src/redux/student/admissions-crm/communication-exams-events-contracts';

import {
  AdmissionCrmMyWorkType,
  AdmissionCrmWorkUrgency,
  AdmissionCrmOperationsQueueType,
} from 'src/redux/student/admissions-crm/operations-governance-contracts';

import {
  AdmissionCrmRegistrationStatus,
  AdmissionCrmApplicantDocumentStatus,
} from 'src/redux/student/admissions-crm/registration-documents-contracts';

import { isValidAdmissionReportDate } from './admission-report-date-range';

export type EnrollmentWorkspace =
  | 'overview'
  | 'pipeline'
  | 'applicant'
  | 'exams'
  | 'events'
  | 'registrations'
  | 'offers'
  | 'activation'
  | 'operations'
  | 'analytics'
  | 'settings';

export type EnrollmentPersona =
  'administrator' | 'receptionist' | 'counselor' | 'approver' | 'restricted';

export type PipelineView = 'board' | 'list';
export type EnrollmentReportView = 'lifecycle' | 'sources' | 'standards' | 'outcomes';
export type ScoreBandFilter = 'all' | 'hot' | 'warm' | 'needsAttention';
export type EnrollmentApplicantTab =
  'next' | 'inquiry' | 'exam' | 'registration' | 'finance' | 'offer' | 'activation' | 'governance';
export type EnrollmentExamAction = 'record-result' | 'review-eligibility' | 'review-absence';
export type EnrollmentSettingsPanel =
  | 'cycle'
  | 'pipeline'
  | 'sources'
  | 'types'
  | 'capture'
  | 'forms'
  | 'scoring'
  | 'routing'
  | 'registration'
  | 'form-numbering'
  | 'documents'
  | 'activation'
  | 'numbering'
  | 'criteria'
  | 'routes'
  | 'policy-packs'
  | 'compliance'
  | 'configuration-safety'
  | 'templates'
  | 'providers'
  | 'reminders';

export type EnrollmentWorkspaceState = {
  cycle?: string;
  board?: string;
  medium?: string;
  returnTo?: string;
  applicantReturn?: string;
  applicant?: string;
  workItem?: string;
  applicantTab?: EnrollmentApplicantTab;
  applicantActivity?: boolean;
  examAction?: EnrollmentExamAction;
  page: number;
  pageSize?: number;
  search?: string;
  sorting?: string;
  workType?: AdmissionCrmMyWorkType;
  urgency?: AdmissionCrmWorkUrgency;
  view?: PipelineView;
  pipelineColumn?: AdmissionCrmPipelineColumnKey;
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
  registrationStatus?: AdmissionCrmRegistrationStatus;
  documentStatus?: AdmissionCrmApplicantDocumentStatus;
  offerStatus?: AdmissionCrmSeatOfferStatus;
  routeType?: AdmissionCrmRouteType;
  seatPoolId?: string;
  activationStatus?: AdmissionCrmActivationStatus;
  serviceHandoffStatus?: AdmissionCrmServiceHandoffStatus;
  attendance?: AdmissionCrmExamAttendanceStatus;
  examStatus?: EntranceExamStatusEnum;
  eligibility?: AdmissionCrmEligibilityDecision;
  eventType?: AdmissionCrmEventType;
  eventStatus?: AdmissionCrmEventStatus;
  from?: string;
  to?: string;
  compareCycle?: string;
  exportId?: string;
  reportView?: EnrollmentReportView;
  settingsPanel?: EnrollmentSettingsPanel;
};

export type EnrollmentWorkspaceStatePatch = Partial<
  Record<keyof EnrollmentWorkspaceState, EnrollmentWorkspaceState[keyof EnrollmentWorkspaceState]>
>;

const enumValues = <T extends number>(source: Record<string, string | number>) =>
  new Set(Object.values(source).filter((value): value is T => typeof value === 'number'));

const pipelineColumns = enumValues<AdmissionCrmPipelineColumnKey>(AdmissionCrmPipelineColumnKey);
const channels = enumValues<AdmissionInquiryChannel>(AdmissionInquiryChannel);
const priorities = enumValues<AdmissionCrmLeadPriority>(AdmissionCrmLeadPriority);
const queues = enumValues<AdmissionCrmOperationsQueueType>(AdmissionCrmOperationsQueueType);
const workTypes = enumValues<AdmissionCrmMyWorkType>(AdmissionCrmMyWorkType);
const workUrgencies = enumValues<AdmissionCrmWorkUrgency>(AdmissionCrmWorkUrgency);
const registrationStatuses = enumValues<AdmissionCrmRegistrationStatus>(
  AdmissionCrmRegistrationStatus
);
const documentStatuses = enumValues<AdmissionCrmApplicantDocumentStatus>(
  AdmissionCrmApplicantDocumentStatus
);
const offerStatuses = enumValues<AdmissionCrmSeatOfferStatus>(AdmissionCrmSeatOfferStatus);
const routeTypes = enumValues<AdmissionCrmRouteType>(AdmissionCrmRouteType);
const activationStatuses = enumValues<AdmissionCrmActivationStatus>(AdmissionCrmActivationStatus);
const serviceHandoffStatuses = enumValues<AdmissionCrmServiceHandoffStatus>(
  AdmissionCrmServiceHandoffStatus
);
const attendanceStatuses = enumValues<AdmissionCrmExamAttendanceStatus>(
  AdmissionCrmExamAttendanceStatus
);
const examStatuses = enumValues<EntranceExamStatusEnum>(EntranceExamStatusEnum);
const eligibilityDecisions = enumValues<AdmissionCrmEligibilityDecision>(
  AdmissionCrmEligibilityDecision
);
const eventTypes = enumValues<AdmissionCrmEventType>(AdmissionCrmEventType);
const eventStatuses = enumValues<AdmissionCrmEventStatus>(AdmissionCrmEventStatus);
const scoreBands = new Set<ScoreBandFilter>(['all', 'hot', 'warm', 'needsAttention']);
const applicantTabs = new Set<EnrollmentApplicantTab>([
  'next',
  'inquiry',
  'exam',
  'registration',
  'finance',
  'offer',
  'activation',
  'governance',
]);
const examActions = new Set<EnrollmentExamAction>([
  'record-result',
  'review-eligibility',
  'review-absence',
]);
const settingsPanels = new Set<EnrollmentSettingsPanel>([
  'cycle',
  'pipeline',
  'sources',
  'types',
  'capture',
  'forms',
  'scoring',
  'routing',
  'registration',
  'form-numbering',
  'documents',
  'activation',
  'numbering',
  'criteria',
  'routes',
  'policy-packs',
  'compliance',
  'configuration-safety',
  'templates',
  'providers',
  'reminders',
]);
const reportViews = new Set<EnrollmentReportView>([
  'lifecycle',
  'sources',
  'standards',
  'outcomes',
]);

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
  if (pathname.includes('/applicants/')) return 'applicant';
  if (pathname.includes('/my-work')) return 'overview';
  if (pathname.includes('/settings')) return 'settings';
  if (pathname.includes('/entrance-exams')) return 'exams';
  if (pathname.includes('/visits-events')) return 'events';
  if (pathname.includes('/registration')) return 'registrations';
  if (pathname.includes('/class-placement')) return 'offers';
  if (pathname.includes('/activation')) return 'activation';
  if (pathname.includes('/follow-ups-messages')) return 'operations';
  if (pathname.includes('/reports')) return 'analytics';
  return 'pipeline';
};

export const getPersonaWorkspaceDefaults = (
  workspace: EnrollmentWorkspace,
  persona: EnrollmentPersona
): Partial<EnrollmentWorkspaceState> => {
  if (workspace === 'applicant') return { applicantTab: 'inquiry' };
  if (workspace === 'pipeline') {
    if (persona === 'receptionist')
      return { view: 'list', pipelineColumn: AdmissionCrmPipelineColumnKey.NewInquiry };
    if (persona === 'counselor') return { view: 'board', owner: 'me' };
    return { view: 'list' };
  }

  if (workspace === 'registrations') {
    return { pipelineColumn: AdmissionCrmPipelineColumnKey.RegistrationPending };
  }
  if (workspace === 'offers') {
    return { queue: AdmissionCrmOperationsQueueType.FinalApproval };
  }
  if (workspace === 'activation') {
    return { queue: AdmissionCrmOperationsQueueType.ActivationRepair };
  }
  if (workspace === 'operations') {
    return { queue: AdmissionCrmOperationsQueueType.HouseholdResolution };
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
  const reportViewValue = searchParams.get('report') as EnrollmentReportView | null;
  const settingsPanelValue = searchParams.get('panel') as EnrollmentSettingsPanel | null;
  const applicantTabValue = searchParams.get('tab') as EnrollmentApplicantTab | null;
  const examActionValue = searchParams.get('examAction') as EnrollmentExamAction | null;

  return {
    ...defaults,
    cycle: parseToken(searchParams.get('cycle')) ?? defaults.cycle,
    board: parseToken(searchParams.get('board')) ?? defaults.board,
    medium: parseToken(searchParams.get('medium')) ?? defaults.medium,
    returnTo: parseToken(searchParams.get('return'), 2_000) ?? defaults.returnTo,
    applicantReturn:
      parseToken(searchParams.get('applicantReturn'), 2_000) ?? defaults.applicantReturn,
    applicant: parseToken(searchParams.get('applicant')) ?? defaults.applicant,
    workItem: parseToken(searchParams.get('workItem')) ?? defaults.workItem,
    applicantTab:
      applicantTabValue && applicantTabs.has(applicantTabValue)
        ? applicantTabValue
        : defaults.applicantTab,
    applicantActivity:
      searchParams.get('activity') === '1' ? true : defaults.applicantActivity,
    examAction:
      examActionValue && examActions.has(examActionValue) ? examActionValue : defaults.examAction,
    page: parsePositiveInteger(searchParams.get('page')) ?? defaults.page ?? 1,
    pageSize: parsePositiveInteger(searchParams.get('pageSize'), 200) ?? defaults.pageSize,
    search: parseToken(searchParams.get('search'), 500) ?? defaults.search,
    sorting: parseToken(searchParams.get('sorting')) ?? defaults.sorting,
    workType: parseEnum(searchParams.get('workType'), workTypes) ?? defaults.workType,
    urgency: parseEnum(searchParams.get('urgency'), workUrgencies) ?? defaults.urgency,
    view:
      viewValue === 'board' || viewValue === 'list'
        ? viewValue
        : (defaults.view as PipelineView | undefined),
    pipelineColumn:
      parseEnum(searchParams.get('column'), pipelineColumns) ?? defaults.pipelineColumn,
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
    registrationStatus:
      parseEnum(searchParams.get('registrationStatus'), registrationStatuses) ??
      defaults.registrationStatus,
    documentStatus:
      parseEnum(searchParams.get('documentStatus'), documentStatuses) ?? defaults.documentStatus,
    offerStatus: parseEnum(searchParams.get('offerStatus'), offerStatuses) ?? defaults.offerStatus,
    routeType: parseEnum(searchParams.get('routeType'), routeTypes) ?? defaults.routeType,
    seatPoolId: parseToken(searchParams.get('seatPool')) ?? defaults.seatPoolId,
    activationStatus:
      parseEnum(searchParams.get('activationStatus'), activationStatuses) ??
      defaults.activationStatus,
    serviceHandoffStatus:
      parseEnum(searchParams.get('handoffStatus'), serviceHandoffStatuses) ??
      defaults.serviceHandoffStatus,
    attendance:
      parseEnum(searchParams.get('attendance'), attendanceStatuses) ?? defaults.attendance,
    examStatus: parseEnum(searchParams.get('result'), examStatuses) ?? defaults.examStatus,
    eligibility:
      parseEnum(searchParams.get('eligibility'), eligibilityDecisions) ?? defaults.eligibility,
    eventType: parseEnum(searchParams.get('eventType'), eventTypes) ?? defaults.eventType,
    eventStatus: parseEnum(searchParams.get('eventStatus'), eventStatuses) ?? defaults.eventStatus,
    from: fromValue && isValidAdmissionReportDate(fromValue) ? fromValue : defaults.from,
    to: toValue && isValidAdmissionReportDate(toValue) ? toValue : defaults.to,
    compareCycle: parseToken(searchParams.get('compare')) ?? defaults.compareCycle,
    exportId: parseToken(searchParams.get('export')) ?? defaults.exportId,
    reportView:
      reportViewValue && reportViews.has(reportViewValue) ? reportViewValue : defaults.reportView,
    settingsPanel:
      settingsPanelValue && settingsPanels.has(settingsPanelValue)
        ? settingsPanelValue
        : defaults.settingsPanel,
  };
};

export const serializeEnrollmentWorkspaceState = (state: EnrollmentWorkspaceState) => {
  const params = new URLSearchParams();
  const set = (key: string, value: string | number | undefined) => {
    if (value !== undefined && value !== '') params.set(key, String(value));
  };

  set('cycle', state.cycle);
  set('board', state.board);
  set('medium', state.medium);
  set('return', state.returnTo);
  set('applicantReturn', state.applicantReturn);
  set('applicant', state.applicant);
  set('workItem', state.workItem);
  set('tab', state.applicantTab);
  if (state.applicantActivity) set('activity', 1);
  set('examAction', state.examAction);
  if (state.page > 1) set('page', state.page);
  set('pageSize', state.pageSize);
  set('search', state.search);
  set('sorting', state.sorting);
  set('workType', state.workType);
  set('urgency', state.urgency);
  set('view', state.view);
  set('column', state.pipelineColumn);
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
  set('registrationStatus', state.registrationStatus);
  set('documentStatus', state.documentStatus);
  set('offerStatus', state.offerStatus);
  set('routeType', state.routeType);
  set('seatPool', state.seatPoolId);
  set('activationStatus', state.activationStatus);
  set('handoffStatus', state.serviceHandoffStatus);
  set('attendance', state.attendance);
  set('result', state.examStatus);
  set('eligibility', state.eligibility);
  set('eventType', state.eventType);
  set('eventStatus', state.eventStatus);
  set('from', state.from);
  set('to', state.to);
  set('compare', state.compareCycle);
  set('export', state.exportId);
  set('report', state.reportView);
  set('panel', state.settingsPanel);
  return params;
};

export const areSearchParamsEquivalent = (left: URLSearchParams, right: URLSearchParams) => {
  const normalize = (params: URLSearchParams) =>
    Array.from(params.entries()).sort(([leftKey, leftValue], [rightKey, rightValue]) =>
      leftKey === rightKey ? leftValue.localeCompare(rightValue) : leftKey.localeCompare(rightKey)
    );

  return JSON.stringify(normalize(left)) === JSON.stringify(normalize(right));
};
