import type {
  ApiAffectedLecture,
  ApiSuggestedTeacher,
} from 'src/redux/academicAPI/timetableApi/substitutionManagementApi';

import type { QuickSubstitutionContext } from './types';

export const quickContext: QuickSubstitutionContext = {
  teacherId: 'original-1',
  teacherName: 'Absent Teacher',
  departmentName: 'Academic',
  date: '2026-10-05T00:00:00+05:30',
  startTime: '08:00',
  endTime: '11:00',
  isFullDay: false,
  reason: 'Marked half-day unavailable in HR attendance.',
  source: 5,
  academicYearId: 'year-1',
};

export const quickLecture: ApiAffectedLecture = {
  timetableId: 'timetable-1',
  timetableSlotId: 'slot-1',
  slotSubjectId: 'slot-subject-1',
  standardId: 'standard-1',
  divisionId: 'division-1',
  subjectId: 'subject-1',
  period: 'Period 1',
  time: '10:30 - 11:30',
  startTime: '10:30',
  endTime: '11:30',
  className: '6',
  divisionName: 'A',
  subjectName: 'Science',
  roomName: '',
  teacherId: 'original-1',
  teacherName: 'Absent Teacher',
  canCreateSubstitution: true,
};

export const quickCandidate: ApiSuggestedTeacher = {
  teacherId: 'substitute-1',
  teacherName: 'Free Teacher',
  departmentName: 'Academic',
  canTeachSubject: true,
  hasConflict: false,
  conflictSeverity: 'Clear',
  todaySubstitutionCount: 0,
  weekSubstitutionCount: 0,
  monthSubstitutionCount: 0,
  todayTeachingLoad: 1,
  freePeriods: 1,
  loadStatus: 'Low',
  score: 95,
  coverageStartTime: '10:30',
  coverageEndTime: '11:00',
  coverageMinutes: 30,
  isFullSlotCoverage: true,
  isPartialCoverage: false,
  recommendationReason: 'Free for the requested coverage window.',
};
