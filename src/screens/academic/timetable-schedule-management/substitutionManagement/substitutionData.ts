import dayjs from 'dayjs';

export type SubstitutionStatus =
  | 'Pending'
  | 'Assigned'
  | 'Waiting Ack'
  | 'Acknowledged'
  | 'Completed'
  | 'Rejected'
  | 'Cancelled'
  | 'Conflict'
  | 'Expired';

export type SubstitutionPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type AcknowledgementStatus =
  | 'Not Sent'
  | 'Sent'
  | 'Seen'
  | 'Accepted'
  | 'Rejected'
  | 'Change Requested'
  | 'Escalated';

export type ConflictStatus = 'Clear' | 'Hard Block' | 'Warning' | 'Info';
export type SubstitutionViewType = 'table' | 'kanban' | 'timeline' | 'calendar';

export type AuditLogEntry = {
  at: string;
  actor: string;
  action: string;
};

export type SubstitutionRow = {
  id: string;
  date: string;
  day: string;
  period: string;
  startTime: string;
  endTime: string;
  time: string;
  className: string;
  divisionName: string;
  departmentName: string;
  subjectName: string;
  originalTeacherName: string;
  substituteTeacherName?: string;
  roomName: string;
  assignedRoomName?: string;
  reason: string;
  status: SubstitutionStatus;
  priority: SubstitutionPriority;
  acknowledgementStatus: AcknowledgementStatus;
  notificationStatus: 'Not Sent' | 'Queued' | 'Sent' | 'Reminder Sent' | 'Escalated';
  source: 'Manual' | 'AI Suggested' | 'Auto Created' | 'HR Leave' | 'Calendar' | 'Attendance';
  conflictStatus: ConflictStatus;
  conflictReason?: string;
  aiScore?: number;
  isAiSuggested: boolean;
  workloadStatus: 'Low' | 'Medium' | 'High' | 'Overloaded';
  acknowledgementRequired: boolean;
  createdAt: string;
  acknowledgedAt?: string;
  completedAt?: string;
  remarks?: string;
  auditLog: AuditLogEntry[];
};

export type TeacherAvailabilityRow = {
  id: string;
  teacherId?: string | null;
  teacherName: string;
  departmentName: string;
  availabilityDate: string;
  startTime: string;
  endTime: string;
  availabilityStatus: string;
  sourceType: string;
  reason: string;
  isFullDay: boolean;
  affectedLectureCount: number;
  canCreateSubstitution?: boolean;
  autoCreateSubstitutions: boolean;
  notifyLeadership: boolean;
  activeSubstitutionStatuses?: SubstitutionStatus[];
  attachmentName?: string;
  remarks?: string;
};

export type AffectedLectureRow = {
  id: string;
  timetableId?: string | null;
  timetableSlotId?: string | null;
  slotSubjectId?: string | null;
  standardId?: string | null;
  divisionId?: string | null;
  subjectId?: string | null;
  roomId?: string | null;
  teacherId?: string | null;
  existingSubstitutionId?: string | null;
  existingSubstitutionStatus?: string | number | null;
  canCreateSubstitution?: boolean;
  period: string;
  time: string;
  startTime: string;
  endTime: string;
  className: string;
  divisionName: string;
  subjectName: string;
  roomName: string;
  teacherName: string;
};

export type AvailableTeacherRow = {
  teacherId: string;
  teacherName: string;
  departmentName: string;
  canTeachSubject: boolean;
  hasConflict: boolean;
  conflictSeverity: ConflictStatus;
  conflictReason?: string;
  todaySubstitutionCount: number;
  weekSubstitutionCount: number;
  monthSubstitutionCount: number;
  todayTeachingLoad: number;
  freePeriods: number;
  lastDutyDate: string;
  loadStatus: 'Low' | 'Medium' | 'High' | 'Overloaded';
  score: number;
  coverageStartTime?: string;
  coverageEndTime?: string;
  coverageMinutes?: number;
  isFullSlotCoverage?: boolean;
  isPartialCoverage?: boolean;
  recommendationReason: string;
};

export type RiskAlert = {
  id: string;
  type: 'Uncovered Risk' | 'Time Risk' | 'Acknowledgement Risk' | 'Workload Risk' | 'Pattern Risk';
  severity: 'error' | 'warning' | 'info' | 'success';
  message: string;
  action: string;
};

export type AnalyticsCard = {
  label: string;
  value: string;
  helper: string;
  icon: string;
  color: 'primary' | 'success' | 'warning' | 'error' | 'info';
};

export const todayIso = dayjs().format('YYYY-MM-DD');

export const classOptions = [
  { value: '7', label: 'Class 7' },
  { value: '8', label: 'Class 8' },
  { value: '9', label: 'Class 9' },
  { value: '10', label: 'Class 10' },
];

export const divisionOptions = [
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
];

export const subjectOptions = [
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Science', label: 'Science' },
  { value: 'English', label: 'English' },
  { value: 'ICT', label: 'ICT' },
  { value: 'Social Studies', label: 'Social Studies' },
];

export const teacherOptions = [
  { value: 'Anita Sharma', label: 'Anita Sharma' },
  { value: 'Rohit Mehta', label: 'Rohit Mehta' },
  { value: 'Farah Khan', label: 'Farah Khan' },
  { value: 'Kiran Patel', label: 'Kiran Patel' },
  { value: 'Nisha Rao', label: 'Nisha Rao' },
  { value: 'Vikram Desai', label: 'Vikram Desai' },
];

export const departmentOptions = [
  { value: 'all', label: 'All Departments' },
  { value: 'Mathematics', label: 'Mathematics' },
  { value: 'Science', label: 'Science' },
  { value: 'English', label: 'English' },
  { value: 'ICT', label: 'ICT' },
  { value: 'Social Studies', label: 'Social Studies' },
];

export const roomOptions = [
  { value: 'Room 201', label: 'Room 201' },
  { value: 'Room 202', label: 'Room 202' },
  { value: 'Physics Lab', label: 'Physics Lab' },
  { value: 'Computer Lab', label: 'Computer Lab' },
];

export const lectureSlotOptions = [
  { value: 'Period 1', label: 'Period 1 - 09:00 to 09:45' },
  { value: 'Period 2', label: 'Period 2 - 10:00 to 10:45' },
  { value: 'Period 3', label: 'Period 3 - 11:00 to 11:45' },
  { value: 'Period 4', label: 'Period 4 - 12:00 to 12:45' },
  { value: 'Period 5', label: 'Period 5 - 13:30 to 14:15' },
];

export const reasonOptions = [
  { value: 'Teacher Absent', label: 'Teacher Absent' },
  { value: 'Leave', label: 'Leave' },
  { value: 'Meeting', label: 'Meeting / Training' },
  { value: 'Exam Duty', label: 'Exam Duty' },
  { value: 'Emergency', label: 'Emergency' },
  { value: 'Other', label: 'Other' },
];

export const statusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'Pending', label: 'Pending Assignment' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Waiting Ack', label: 'Waiting Acknowledgement' },
  { value: 'Acknowledged', label: 'Acknowledged' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Conflict', label: 'Conflict Detected' },
  { value: 'Cancelled', label: 'Cancelled' },
];

export const acknowledgementOptions = [
  { value: 'all', label: 'All Acknowledgements' },
  { value: 'Not Sent', label: 'Not Sent' },
  { value: 'Sent', label: 'Sent' },
  { value: 'Seen', label: 'Seen' },
  { value: 'Accepted', label: 'Accepted' },
  { value: 'Rejected', label: 'Rejected' },
  { value: 'Change Requested', label: 'Change Requested' },
  { value: 'Escalated', label: 'Escalated' },
];

export const conflictOptions = [
  { value: 'all', label: 'All Conflict States' },
  { value: 'Clear', label: 'Clear' },
  { value: 'Hard Block', label: 'Hard Block' },
  { value: 'Warning', label: 'Warning' },
  { value: 'Info', label: 'Info' },
];

export const sourceOptions = [
  { value: 'all', label: 'All Sources' },
  { value: 'Manual', label: 'Manual' },
  { value: 'AI Suggested', label: 'AI Suggested' },
  { value: 'Auto Created', label: 'Auto Created' },
  { value: 'HR Leave', label: 'HR Leave' },
  { value: 'Calendar', label: 'Calendar' },
];

export const priorityOptions = [
  { value: 'Low', label: 'Low' },
  { value: 'Normal', label: 'Normal' },
  { value: 'High', label: 'High' },
  { value: 'Urgent', label: 'Urgent' },
];

export const availabilityStatusOptions = [
  { value: 'Unavailable', label: 'Unavailable' },
  { value: 'Leave', label: 'Leave' },
  { value: 'Training', label: 'Training' },
  { value: 'Meeting', label: 'Meeting' },
  { value: 'Exam Duty', label: 'Exam Duty' },
  { value: 'Other Duty', label: 'Other Duty' },
];

export const sourceTypeOptions = [
  { value: 'Manual', label: 'Manual' },
  { value: 'HR Leave', label: 'HR Leave' },
  { value: 'Exam Duty', label: 'Exam Duty' },
  { value: 'Event', label: 'Event' },
  { value: 'Calendar', label: 'Calendar' },
];

export const periodTimeMap: Record<string, { startTime: string; endTime: string; time: string }> = {
  'Period 1': { startTime: '09:00', endTime: '09:45', time: '09:00 - 09:45' },
  'Period 2': { startTime: '10:00', endTime: '10:45', time: '10:00 - 10:45' },
  'Period 3': { startTime: '11:00', endTime: '11:45', time: '11:00 - 11:45' },
  'Period 4': { startTime: '12:00', endTime: '12:45', time: '12:00 - 12:45' },
  'Period 5': { startTime: '13:30', endTime: '14:15', time: '13:30 - 14:15' },
};

export const affectedLectureTemplates: AffectedLectureRow[] = [
  {
    id: 'aff-1',
    period: 'Period 1',
    time: '09:00 - 09:45',
    startTime: '09:00',
    endTime: '09:45',
    className: '7',
    divisionName: 'A',
    subjectName: 'Mathematics',
    roomName: 'Room 201',
    teacherName: 'Rohit Mehta',
  },
  {
    id: 'aff-2',
    period: 'Period 2',
    time: '10:00 - 10:45',
    startTime: '10:00',
    endTime: '10:45',
    className: '8',
    divisionName: 'B',
    subjectName: 'Science',
    roomName: 'Physics Lab',
    teacherName: 'Anita Sharma',
  },
  {
    id: 'aff-3',
    period: 'Period 3',
    time: '11:00 - 11:45',
    startTime: '11:00',
    endTime: '11:45',
    className: '9',
    divisionName: 'A',
    subjectName: 'English',
    roomName: 'Room 202',
    teacherName: 'Farah Khan',
  },
];

export const initialSubstitutions: SubstitutionRow[] = [
  {
    id: 'sub-1',
    date: todayIso,
    day: dayjs(todayIso).format('dddd'),
    period: 'Period 2',
    startTime: '10:00',
    endTime: '10:45',
    time: '10:00 - 10:45',
    className: '7',
    divisionName: 'A',
    departmentName: 'Mathematics',
    subjectName: 'Mathematics',
    originalTeacherName: 'Rohit Mehta',
    substituteTeacherName: 'Nisha Rao',
    roomName: 'Room 201',
    assignedRoomName: 'Room 201',
    reason: 'Leave',
    status: 'Waiting Ack',
    priority: 'High',
    acknowledgementStatus: 'Sent',
    notificationStatus: 'Sent',
    source: 'AI Suggested',
    conflictStatus: 'Clear',
    aiScore: 92,
    isAiSuggested: true,
    workloadStatus: 'Low',
    acknowledgementRequired: true,
    createdAt: dayjs().subtract(2, 'hour').toISOString(),
    remarks: 'Same subject teacher preferred.',
    auditLog: [
      { at: '08:04', actor: 'Admin', action: 'AI recommendation accepted for Nisha Rao.' },
      { at: '08:05', actor: 'System', action: 'Notification sent to substitute teacher.' },
    ],
  },
  {
    id: 'sub-2',
    date: todayIso,
    day: dayjs(todayIso).format('dddd'),
    period: 'Period 3',
    startTime: '11:00',
    endTime: '11:45',
    time: '11:00 - 11:45',
    className: '8',
    divisionName: 'B',
    departmentName: 'Science',
    subjectName: 'Science',
    originalTeacherName: 'Anita Sharma',
    roomName: 'Physics Lab',
    reason: 'Meeting',
    status: 'Pending',
    priority: 'Urgent',
    acknowledgementStatus: 'Not Sent',
    notificationStatus: 'Not Sent',
    source: 'Auto Created',
    conflictStatus: 'Clear',
    aiScore: 96,
    isAiSuggested: true,
    workloadStatus: 'Medium',
    acknowledgementRequired: true,
    createdAt: dayjs().subtract(45, 'minute').toISOString(),
    remarks: 'Principal review requested.',
    auditLog: [
      {
        at: '09:10',
        actor: 'System',
        action: 'Affected lecture detected from unavailable teacher.',
      },
    ],
  },
  {
    id: 'sub-3',
    date: todayIso,
    day: dayjs(todayIso).format('dddd'),
    period: 'Period 4',
    startTime: '12:00',
    endTime: '12:45',
    time: '12:00 - 12:45',
    className: '9',
    divisionName: 'A',
    departmentName: 'English',
    subjectName: 'English',
    originalTeacherName: 'Farah Khan',
    substituteTeacherName: 'Kiran Patel',
    roomName: 'Room 202',
    assignedRoomName: 'Room 202',
    reason: 'Exam Duty',
    status: 'Acknowledged',
    priority: 'Normal',
    acknowledgementStatus: 'Accepted',
    notificationStatus: 'Sent',
    source: 'Manual',
    conflictStatus: 'Info',
    conflictReason: 'Different subject, but same standard experience.',
    aiScore: 78,
    isAiSuggested: false,
    workloadStatus: 'Medium',
    acknowledgementRequired: true,
    acknowledgedAt: dayjs().subtract(20, 'minute').format('HH:mm'),
    createdAt: dayjs().subtract(3, 'hour').toISOString(),
    auditLog: [
      { at: '08:40', actor: 'Admin', action: 'Substitute teacher assigned manually.' },
      { at: '08:48', actor: 'Kiran Patel', action: 'Duty accepted.' },
    ],
  },
  {
    id: 'sub-4',
    date: todayIso,
    day: dayjs(todayIso).format('dddd'),
    period: 'Period 5',
    startTime: '13:30',
    endTime: '14:15',
    time: '13:30 - 14:15',
    className: '10',
    divisionName: 'C',
    departmentName: 'ICT',
    subjectName: 'ICT',
    originalTeacherName: 'Vikram Desai',
    substituteTeacherName: 'Nisha Rao',
    roomName: 'Computer Lab',
    assignedRoomName: 'Computer Lab',
    reason: 'Training',
    status: 'Conflict',
    priority: 'Urgent',
    acknowledgementStatus: 'Escalated',
    notificationStatus: 'Escalated',
    source: 'Manual',
    conflictStatus: 'Hard Block',
    conflictReason: 'Nisha Rao already has Period 5 duty in another class.',
    aiScore: 42,
    isAiSuggested: false,
    workloadStatus: 'Overloaded',
    acknowledgementRequired: true,
    createdAt: dayjs().subtract(1, 'hour').toISOString(),
    auditLog: [
      { at: '10:15', actor: 'System', action: 'Conflict detected before final assignment.' },
      { at: '10:45', actor: 'System', action: 'Acknowledgement escalated to principal.' },
    ],
  },
  {
    id: 'sub-5',
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    day: dayjs().subtract(1, 'day').format('dddd'),
    period: 'Period 1',
    startTime: '09:00',
    endTime: '09:45',
    time: '09:00 - 09:45',
    className: '10',
    divisionName: 'C',
    departmentName: 'ICT',
    subjectName: 'ICT',
    originalTeacherName: 'Vikram Desai',
    substituteTeacherName: 'Nisha Rao',
    roomName: 'Computer Lab',
    assignedRoomName: 'Computer Lab',
    reason: 'Training',
    status: 'Completed',
    priority: 'Normal',
    acknowledgementStatus: 'Accepted',
    notificationStatus: 'Sent',
    source: 'Manual',
    conflictStatus: 'Clear',
    aiScore: 88,
    isAiSuggested: false,
    workloadStatus: 'Low',
    acknowledgementRequired: true,
    acknowledgedAt: '08:35',
    completedAt: '09:45',
    createdAt: dayjs().subtract(1, 'day').toISOString(),
    auditLog: [
      { at: '08:20', actor: 'Admin', action: 'Substitution created.' },
      { at: '09:45', actor: 'System', action: 'Period marked completed.' },
    ],
  },
];

export const initialTeacherAvailability: TeacherAvailabilityRow[] = [
  {
    id: 'av-1',
    teacherName: 'Rohit Mehta',
    departmentName: 'Mathematics',
    availabilityDate: todayIso,
    startTime: '09:00',
    endTime: '12:45',
    availabilityStatus: 'Leave',
    sourceType: 'Manual',
    reason: 'Medical leave',
    isFullDay: false,
    affectedLectureCount: 2,
    autoCreateSubstitutions: true,
    notifyLeadership: true,
  },
  {
    id: 'av-2',
    teacherName: 'Anita Sharma',
    departmentName: 'Science',
    availabilityDate: todayIso,
    startTime: '11:00',
    endTime: '11:45',
    availabilityStatus: 'Meeting',
    sourceType: 'Calendar',
    reason: 'Academic review meeting',
    isFullDay: false,
    affectedLectureCount: 1,
    autoCreateSubstitutions: true,
    notifyLeadership: true,
  },
];

export const suggestedTeachers: AvailableTeacherRow[] = [
  {
    teacherId: 'teacher-kiran',
    teacherName: 'Kiran Patel',
    departmentName: 'Science',
    canTeachSubject: true,
    hasConflict: false,
    conflictSeverity: 'Clear',
    todaySubstitutionCount: 0,
    weekSubstitutionCount: 2,
    monthSubstitutionCount: 7,
    todayTeachingLoad: 3,
    freePeriods: 3,
    lastDutyDate: dayjs().subtract(6, 'day').format('DD MMM'),
    loadStatus: 'Low',
    score: 96,
    recommendationReason:
      'Free during selected period, same subject expertise, same standard exposure and low workload.',
  },
  {
    teacherId: 'teacher-nisha',
    teacherName: 'Nisha Rao',
    departmentName: 'Mathematics',
    canTeachSubject: false,
    hasConflict: false,
    conflictSeverity: 'Warning',
    todaySubstitutionCount: 1,
    weekSubstitutionCount: 3,
    monthSubstitutionCount: 12,
    todayTeachingLoad: 4,
    freePeriods: 2,
    lastDutyDate: dayjs().subtract(1, 'day').format('DD MMM'),
    loadStatus: 'Medium',
    score: 84,
    recommendationReason: 'Free and same class group, but different subject and moderate workload.',
  },
  {
    teacherId: 'teacher-mehul',
    teacherName: 'Mehul Shah',
    departmentName: 'Social Studies',
    canTeachSubject: false,
    hasConflict: false,
    conflictSeverity: 'Info',
    todaySubstitutionCount: 0,
    weekSubstitutionCount: 1,
    monthSubstitutionCount: 5,
    todayTeachingLoad: 2,
    freePeriods: 4,
    lastDutyDate: dayjs().subtract(9, 'day').format('DD MMM'),
    loadStatus: 'Low',
    score: 72,
    recommendationReason: 'Free this period with low workload; subject mismatch is informational.',
  },
  {
    teacherId: 'teacher-vikram',
    teacherName: 'Vikram Desai',
    departmentName: 'ICT',
    canTeachSubject: false,
    hasConflict: true,
    conflictSeverity: 'Hard Block',
    conflictReason: 'Already teaching 9-A ICT in the selected period.',
    todaySubstitutionCount: 2,
    weekSubstitutionCount: 5,
    monthSubstitutionCount: 16,
    todayTeachingLoad: 6,
    freePeriods: 0,
    lastDutyDate: dayjs().format('DD MMM'),
    loadStatus: 'Overloaded',
    score: 12,
    recommendationReason: 'Conflict detected.',
  },
];

export const riskAlerts: RiskAlert[] = [
  {
    id: 'risk-1',
    type: 'Uncovered Risk',
    severity: 'warning',
    message: 'Period 3 Science for 8-B is still uncovered and starts soon.',
    action: 'Assign Teacher',
  },
  {
    id: 'risk-2',
    type: 'Acknowledgement Risk',
    severity: 'info',
    message: 'Nisha Rao has not acknowledged Period 2 duty.',
    action: 'Send Reminder',
  },
  {
    id: 'risk-3',
    type: 'Workload Risk',
    severity: 'error',
    message: 'One teacher is overloaded because of repeated urgent substitutions.',
    action: 'Review Load',
  },
];

export const analyticsCards: AnalyticsCard[] = [
  {
    label: 'Coverage Rate',
    value: '80%',
    helper: 'Covered periods / affected periods',
    icon: 'mdi:shield-check-outline',
    color: 'success',
  },
  {
    label: 'Avg Ack Time',
    value: '09 min',
    helper: 'Teacher response time today',
    icon: 'mdi:timer-check-outline',
    color: 'info',
  },
  {
    label: 'Top Substitute',
    value: 'Nisha Rao',
    helper: '12 duties this month',
    icon: 'mdi:account-star-outline',
    color: 'primary',
  },
  {
    label: 'AI Acceptance',
    value: '76%',
    helper: 'Accepted AI suggestions',
    icon: 'mdi:creation-outline',
    color: 'warning',
  },
];

export const substitutionSettings = [
  { setting: 'Max substitutions per teacher per day', value: '3', status: 'Active' },
  { setting: 'Max substitutions per teacher per week', value: '8', status: 'Active' },
  { setting: 'Acknowledgement timeout', value: '10 / 20 / 30 minutes', status: 'Active' },
  { setting: 'Allow teacher rejection', value: 'Yes, with reason', status: 'Active' },
  { setting: 'Require principal approval for urgent substitution', value: 'Yes', status: 'Active' },
  { setting: 'Allow AI auto plan', value: 'Review before approval', status: 'Active' },
  { setting: 'Allow conflict override', value: 'Admin and Principal only', status: 'Restricted' },
  {
    setting: 'Default notification channels',
    value: 'In-app, Email, SMS, WhatsApp',
    status: 'Active',
  },
  { setting: 'Auto-generate daily sheet', value: 'Every morning and on changes', status: 'Active' },
  { setting: 'Include room proximity in AI score', value: 'Yes', status: 'Active' },
  { setting: 'Include subject expertise in AI score', value: 'Yes', status: 'Active' },
];
