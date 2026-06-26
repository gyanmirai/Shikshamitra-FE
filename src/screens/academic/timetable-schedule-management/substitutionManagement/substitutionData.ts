import dayjs from 'dayjs';

export type SubstitutionStatus =
  | 'Pending'
  | 'Assigned'
  | 'Acknowledged'
  | 'Completed'
  | 'Cancelled'
  | 'Rejected';

export type SubstitutionPriority = 'Low' | 'Normal' | 'High' | 'Urgent';

export type SubstitutionRow = {
  id: string;
  date: string;
  day: string;
  period: string;
  time: string;
  className: string;
  divisionName: string;
  subjectName: string;
  originalTeacherName: string;
  substituteTeacherName?: string;
  roomName: string;
  reason: string;
  status: SubstitutionStatus;
  priority: SubstitutionPriority;
  acknowledgedAt?: string;
  createdAt: string;
  remarks?: string;
};

export type TeacherAvailabilityRow = {
  id: string;
  teacherName: string;
  departmentName: string;
  availabilityDate: string;
  startTime: string;
  endTime: string;
  availabilityStatus: string;
  sourceType: string;
  reason: string;
  remarks?: string;
};

export type AvailableTeacherRow = {
  teacherId: string;
  teacherName: string;
  departmentName: string;
  canTeachSubject: boolean;
  hasConflict: boolean;
  conflictReason?: string;
  todaySubstitutionCount: number;
  weekSubstitutionCount: number;
  todayTeachingLoad: number;
  score: number;
  recommendationReason: string;
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
  { value: 'Pending', label: 'Pending' },
  { value: 'Assigned', label: 'Assigned' },
  { value: 'Acknowledged', label: 'Acknowledged' },
  { value: 'Completed', label: 'Completed' },
  { value: 'Cancelled', label: 'Cancelled' },
  { value: 'Rejected', label: 'Rejected' },
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

export const initialSubstitutions: SubstitutionRow[] = [
  {
    id: 'sub-1',
    date: todayIso,
    day: dayjs(todayIso).format('dddd'),
    period: 'Period 2',
    time: '10:00 - 10:45',
    className: '7',
    divisionName: 'A',
    subjectName: 'Mathematics',
    originalTeacherName: 'Rohit Mehta',
    substituteTeacherName: 'Nisha Rao',
    roomName: 'Room 201',
    reason: 'Leave',
    status: 'Assigned',
    priority: 'High',
    createdAt: dayjs().subtract(2, 'hour').toISOString(),
    remarks: 'Same subject teacher preferred.',
  },
  {
    id: 'sub-2',
    date: todayIso,
    day: dayjs(todayIso).format('dddd'),
    period: 'Period 3',
    time: '11:00 - 11:45',
    className: '8',
    divisionName: 'B',
    subjectName: 'Science',
    originalTeacherName: 'Anita Sharma',
    roomName: 'Physics Lab',
    reason: 'Meeting',
    status: 'Pending',
    priority: 'Urgent',
    createdAt: dayjs().subtract(45, 'minute').toISOString(),
    remarks: 'Principal review requested.',
  },
  {
    id: 'sub-3',
    date: todayIso,
    day: dayjs(todayIso).format('dddd'),
    period: 'Period 4',
    time: '12:00 - 12:45',
    className: '9',
    divisionName: 'A',
    subjectName: 'English',
    originalTeacherName: 'Farah Khan',
    substituteTeacherName: 'Kiran Patel',
    roomName: 'Room 202',
    reason: 'Exam Duty',
    status: 'Acknowledged',
    priority: 'Normal',
    acknowledgedAt: dayjs().subtract(20, 'minute').format('HH:mm'),
    createdAt: dayjs().subtract(3, 'hour').toISOString(),
  },
  {
    id: 'sub-4',
    date: dayjs().subtract(1, 'day').format('YYYY-MM-DD'),
    day: dayjs().subtract(1, 'day').format('dddd'),
    period: 'Period 1',
    time: '09:00 - 09:45',
    className: '10',
    divisionName: 'C',
    subjectName: 'ICT',
    originalTeacherName: 'Vikram Desai',
    substituteTeacherName: 'Nisha Rao',
    roomName: 'Computer Lab',
    reason: 'Training',
    status: 'Completed',
    priority: 'Normal',
    acknowledgedAt: '08:35',
    createdAt: dayjs().subtract(1, 'day').toISOString(),
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
  },
];

export const suggestedTeachers: AvailableTeacherRow[] = [
  {
    teacherId: 'teacher-nisha',
    teacherName: 'Nisha Rao',
    departmentName: 'Mathematics',
    canTeachSubject: true,
    hasConflict: false,
    todaySubstitutionCount: 1,
    weekSubstitutionCount: 3,
    todayTeachingLoad: 4,
    score: 92,
    recommendationReason: 'Same Subject, Free This Period, Low Load',
  },
  {
    teacherId: 'teacher-kiran',
    teacherName: 'Kiran Patel',
    departmentName: 'English',
    canTeachSubject: false,
    hasConflict: false,
    todaySubstitutionCount: 0,
    weekSubstitutionCount: 2,
    todayTeachingLoad: 3,
    score: 68,
    recommendationReason: 'Free This Period, Low Load, Department fallback',
  },
  {
    teacherId: 'teacher-vikram',
    teacherName: 'Vikram Desai',
    departmentName: 'ICT',
    canTeachSubject: false,
    hasConflict: true,
    conflictReason: 'Already teaching 9-A ICT in the selected period',
    todaySubstitutionCount: 2,
    weekSubstitutionCount: 5,
    todayTeachingLoad: 6,
    score: 12,
    recommendationReason: 'Conflict detected',
  },
];
