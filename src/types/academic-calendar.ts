import type {
  DayType,
  WeekendRule,
  CalendarStatus,
  RescheduleMode,
  HolidayCategory,
  SchoolShiftType,
  CalendarDayStatus,
  CalendarVisibility,
  CalendarImpactType,
  CalendarAuditAction,
  CalendarImpactStatus,
} from 'src/enums/academic-calendar';

// ─── Core Calendar ─────────────────────────────────────────────────────────

export interface AcademicCalendar {
  id: string;
  academicYearId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: CalendarStatus;
  isDefault: boolean;
  publishedByUserId?: string;
  publishedAt?: string;
  creationTime: string;
  lastModificationTime?: string;
  totalWorkingDays?: number;
  totalHolidays?: number;
  totalVacationDays?: number;
  totalHalfDays?: number;
  totalEvents?: number;
  totalExamDays?: number;
  totalPtmDays?: number;
  totalEmergencyClosures?: number;
}

export interface CreateCalendarPayload {
  academicYearId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  isDefault: boolean;
}

export interface UpdateCalendarPayload extends Partial<CreateCalendarPayload> {}

// ─── Calendar Day ───────────────────────────────────────────────────────────

export interface AcademicCalendarDay {
  id: string;
  academicCalendarId: string;
  date: string;
  endDate?: string;
  dayType: DayType;
  holidayCategory?: HolidayCategory;
  title: string;
  description?: string;
  appliesToAll: boolean;
  standardId?: string;
  divisionId?: string;
  startTime?: string;
  endTime?: string;
  status: CalendarDayStatus;
  changeReason?: string;
  creationTime?: string;
}

export interface CreateCalendarDayPayload {
  date: string;
  endDate?: string;
  dayType: DayType;
  holidayCategory?: HolidayCategory | '';
  title: string;
  description?: string;
  appliesToAll: boolean;
  standardId?: string | null;
  standardIds?: string[] | null;
  divisionId?: string | null;
  startTime?: string;
  endTime?: string;
  changeReason?: string;
}

export interface BulkCreateCalendarDaysPayload {
  days: CreateCalendarDayPayload[];
}

// ─── Working Hours ──────────────────────────────────────────────────────────

export interface AcademicCalendarWorkingHour {
  id: string;
  academicCalendarId: string;
  standardId?: string;
  divisionId?: string;
  shiftType: SchoolShiftType;
  startTime: string;
  endTime: string;
  recessStartTime?: string;
  recessEndTime?: string;
  isDefault: boolean;
}

export interface CreateWorkingHourPayload {
  standardId?: string;
  divisionId?: string;
  shiftType: SchoolShiftType;
  startTime: string;
  endTime: string;
  recessStartTime?: string;
  recessEndTime?: string;
  isDefault: boolean;
}

// ─── Calendar Settings ──────────────────────────────────────────────────────

export interface AcademicCalendarSetting {
  id: string;
  academicYearId: string;
  weekendRule: WeekendRule;
  allowClassSpecificHolidays: boolean;
  allowDivisionSpecificHolidays: boolean;
  enableHolidayCategories: boolean;
  enableVacationRanges: boolean;
  enableHalfDayRules: boolean;
  blockTimetableOnHoliday: boolean;
  blockTimetableOnVacation: boolean;
  blockTimetableOnEmergencyClosure: boolean;
  blockHomeworkDueDateOnHoliday: boolean;
  blockHomeworkDueDateOnVacation: boolean;
  blockExamScheduleOnHoliday: boolean;
  blockExamScheduleOnVacation: boolean;
  allowExamOnHalfDay: boolean;
  blockLessonPlanOnHoliday: boolean;
  blockLessonPlanOnVacation: boolean;
  blockOnlineClassOnHoliday: boolean;
  blockOnlineClassOnEventDay: boolean;
  autoExemptAttendanceOnHoliday: boolean;
  autoExemptAttendanceOnVacation: boolean;
  enableEmergencyClosure: boolean;
  emergencyClosureRequiresPrincipalApproval: boolean;
  autoScanImpactedActivities: boolean;
  rescheduleMode: RescheduleMode;
  notifyTeachersOnCalendarChange: boolean;
  notifyParentsOnCalendarChange: boolean;
  notifyStudentsOnCalendarChange: boolean;
  notifyStaffOnCalendarChange: boolean;
  calendarVisibility: CalendarVisibility;
  requireReasonForPublishedCalendarChange: boolean;
}

// ─── Impact Log ─────────────────────────────────────────────────────────────

export interface CalendarImpactLog {
  id: string;
  academicCalendarDayId: string;
  impactType: CalendarImpactType;
  affectedEntityId?: string;
  affectedEntityName: string;
  affectedDate: string;
  message: string;
  status: CalendarImpactStatus;
  suggestedNewDate?: string;
  isResolved: boolean;
  resolvedByUserId?: string;
  resolvedAt?: string;
  resolutionNote?: string;
  creationTime: string;
}

// ─── Audit Log ──────────────────────────────────────────────────────────────

export interface AcademicCalendarAuditLog {
  id: string;
  academicCalendarId: string;
  academicCalendarDayId?: string;
  action: CalendarAuditAction;
  oldValueJson: string;
  newValueJson: string;
  reason?: string;
  changedByUserId: string;
  changedAt: string;
}

// ─── Date Validation ────────────────────────────────────────────────────────

export interface CheckDateParams {
  date: string;
  standardId?: string;
  divisionId?: string;
  validationType:
    | 'Timetable'
    | 'HomeworkDueDate'
    | 'AssignmentDueDate'
    | 'ExamSchedule'
    | 'LessonPlan'
    | 'OnlineClass'
    | 'Attendance'
    | 'PTM';
}

export interface CheckDateResponse {
  isAllowed: boolean;
  date: string;
  dayType?: string;
  title?: string;
  message?: string;
  blockingReason?: string;
  suggestedNextWorkingDate?: string;
}

// ─── Emergency Closure ──────────────────────────────────────────────────────

export interface EmergencyClosurePayload {
  date: string;
  startDate?: string;
  endDate?: string;
  startTime?: string | null;
  endTime?: string | null;
  title: string;
  description: string;
  appliesToAll: boolean;
  standardIds?: string[];
  divisionIds?: string[];
  notifyParents: boolean;
  notifyTeachers: boolean;
  notifyStudents: boolean;
  notifyStaff: boolean;
  autoScanImpacts: boolean;
}

export interface EmergencyClosureImpactSummary {
  timetableSlots: number;
  homeworkDueDates: number;
  assignmentDueDates: number;
  examSchedules: number;
  onlineClasses: number;
  lessonPlans: number;
  attendanceSessions: number;
  ptmBookings: number;
}

// ─── Dashboard Stats ────────────────────────────────────────────────────────

export interface CalendarDashboardStats {
  calendarStatus: CalendarStatus;
  totalWorkingDays: number;
  totalHolidays: number;
  totalVacationDays: number;
  totalHalfDays: number;
  totalEvents: number;
  totalExamDays: number;
  totalPtmDays: number;
  totalEmergencyClosures: number;
  pendingImpactLogs: number;
  upcomingHolidays: AcademicCalendarDay[];
  upcomingEvents: AcademicCalendarDay[];
}

// ─── Paginated Response ─────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
}
