// ─── Day Type ───────────────────────────────────────────────────────────────

export enum DayType {
  WorkingDay = 1,
  Holiday = 2,
  Vacation = 3,
  HalfDay = 4,
  Event = 5,
  Exam = 6,
  PTM = 7,
  EmergencyClosure = 8,
}

export const DAY_TYPE_LABELS: Record<DayType, string> = {
  [DayType.WorkingDay]: 'Working Day',
  [DayType.Holiday]: 'Holiday',
  [DayType.Vacation]: 'Vacation',
  [DayType.HalfDay]: 'Half Day',
  [DayType.Event]: 'Event',
  [DayType.Exam]: 'Exam Day',
  [DayType.PTM]: 'PTM Day',
  [DayType.EmergencyClosure]: 'Emergency Closure',
};

export const DAY_TYPE_COLORS: Record<DayType, string> = {
  [DayType.WorkingDay]: '#10B981', // Clean Emerald Green
  [DayType.Holiday]: '#EF4444', // Clean Ruby Red
  [DayType.Vacation]: '#F59E0B', // Clean Warm Amber
  [DayType.HalfDay]: '#3B82F6', // Clean Soft Blue
  [DayType.Event]: '#8B5CF6', // Clean Violet
  [DayType.Exam]: '#EC4899', // Clean Pink
  [DayType.PTM]: '#06B6D4', // Clean Teal/Cyan
  [DayType.EmergencyClosure]: '#B91C1C', // Deep Crimson
};

export const DAY_TYPE_OPTIONS = Object.values(DayType)
  .filter((v) => typeof v === 'number')
  .map((v) => ({
    label: DAY_TYPE_LABELS[v as DayType],
    value: v as DayType,
  }));

// ─── Holiday Category ────────────────────────────────────────────────────────

export enum HolidayCategory {
  National = 1,
  Regional = 2,
  Festival = 3,
  Management = 4,
  WeatherEmergency = 5,
  GovernmentOrder = 6,
  Other = 7,
}

export const HOLIDAY_CATEGORY_LABELS: Record<HolidayCategory, string> = {
  [HolidayCategory.National]: 'National',
  [HolidayCategory.Regional]: 'Regional',
  [HolidayCategory.Festival]: 'Festival',
  [HolidayCategory.Management]: 'Management',
  [HolidayCategory.WeatherEmergency]: 'Weather Emergency',
  [HolidayCategory.GovernmentOrder]: 'Government Order',
  [HolidayCategory.Other]: 'Other',
};

export const HOLIDAY_CATEGORY_OPTIONS = Object.values(HolidayCategory)
  .filter((v) => typeof v === 'number')
  .map((v) => ({
    label: HOLIDAY_CATEGORY_LABELS[v as HolidayCategory],
    value: v as HolidayCategory,
  }));

// ─── Calendar Status ─────────────────────────────────────────────────────────

export enum CalendarStatus {
  Draft = 1,
  Published = 2,
  Archived = 3,
}

export const CALENDAR_STATUS_LABELS: Record<CalendarStatus, string> = {
  [CalendarStatus.Draft]: 'Draft',
  [CalendarStatus.Published]: 'Published',
  [CalendarStatus.Archived]: 'Archived',
};

export const CALENDAR_STATUS_COLORS: Record<CalendarStatus, 'default' | 'success' | 'warning'> = {
  [CalendarStatus.Draft]: 'default',
  [CalendarStatus.Published]: 'success',
  [CalendarStatus.Archived]: 'warning',
};

// ─── Calendar Day Status ─────────────────────────────────────────────────────

export enum CalendarDayStatus {
  Active = 1,
  Cancelled = 2,
  Rescheduled = 3,
}

export const CALENDAR_DAY_STATUS_LABELS: Record<CalendarDayStatus, string> = {
  [CalendarDayStatus.Active]: 'Active',
  [CalendarDayStatus.Cancelled]: 'Cancelled',
  [CalendarDayStatus.Rescheduled]: 'Rescheduled',
};

// ─── Weekend Rule ────────────────────────────────────────────────────────────

export enum WeekendRule {
  SundayOnly = 1,
  SaturdaySunday = 2,
  AlternateSaturday = 3,
  Custom = 4,
}

export const WEEKEND_RULE_LABELS: Record<WeekendRule, string> = {
  [WeekendRule.SundayOnly]: 'Sunday Only',
  [WeekendRule.SaturdaySunday]: 'Saturday & Sunday',
  [WeekendRule.AlternateSaturday]: 'Alternate Saturday',
  [WeekendRule.Custom]: 'Custom',
};

export const WEEKEND_RULE_OPTIONS = Object.values(WeekendRule)
  .filter((v) => typeof v === 'number')
  .map((v) => ({
    label: WEEKEND_RULE_LABELS[v as WeekendRule],
    value: v as WeekendRule,
  }));

// ─── Reschedule Mode ─────────────────────────────────────────────────────────

export enum RescheduleMode {
  ManualReviewOnly = 1,
  SuggestNewDate = 2,
  AutoReschedule = 3,
}

export const RESCHEDULE_MODE_LABELS: Record<RescheduleMode, string> = {
  [RescheduleMode.ManualReviewOnly]: 'Manual Review Only',
  [RescheduleMode.SuggestNewDate]: 'Suggest New Date',
  [RescheduleMode.AutoReschedule]: 'Auto Reschedule',
};

export const RESCHEDULE_MODE_OPTIONS = Object.values(RescheduleMode)
  .filter((v) => typeof v === 'number')
  .map((v) => ({
    label: RESCHEDULE_MODE_LABELS[v as RescheduleMode],
    value: v as RescheduleMode,
  }));

// ─── Calendar Visibility ─────────────────────────────────────────────────────

export enum CalendarVisibility {
  InternalOnly = 1,
  TeachersOnly = 2,
  StaffAndStudents = 3,
  ParentsAndStudents = 4,
  Public = 5,
}

export const CALENDAR_VISIBILITY_LABELS: Record<CalendarVisibility, string> = {
  [CalendarVisibility.InternalOnly]: 'Internal Only',
  [CalendarVisibility.TeachersOnly]: 'Teachers Only',
  [CalendarVisibility.StaffAndStudents]: 'Staff & Students',
  [CalendarVisibility.ParentsAndStudents]: 'Parents & Students',
  [CalendarVisibility.Public]: 'Public',
};

export const CALENDAR_VISIBILITY_OPTIONS = Object.values(CalendarVisibility)
  .filter((v) => typeof v === 'number')
  .map((v) => ({
    label: CALENDAR_VISIBILITY_LABELS[v as CalendarVisibility],
    value: v as CalendarVisibility,
  }));

// ─── Calendar Impact Type ────────────────────────────────────────────────────

export enum CalendarImpactType {
  TimetableSlot = 1,
  HomeworkDueDate = 2,
  AssignmentDueDate = 3,
  ExamSchedule = 4,
  OnlineClass = 5,
  AttendanceSession = 6,
  LessonPlan = 7,
  TeacherDiary = 8,
  PTMBooking = 9,
  EventSchedule = 10,
}

export const CALENDAR_IMPACT_TYPE_LABELS: Record<CalendarImpactType, string> = {
  [CalendarImpactType.TimetableSlot]: 'Timetable Slot',
  [CalendarImpactType.HomeworkDueDate]: 'Homework Due Date',
  [CalendarImpactType.AssignmentDueDate]: 'Assignment Due Date',
  [CalendarImpactType.ExamSchedule]: 'Exam Schedule',
  [CalendarImpactType.OnlineClass]: 'Online Class',
  [CalendarImpactType.AttendanceSession]: 'Attendance Session',
  [CalendarImpactType.LessonPlan]: 'Lesson Plan',
  [CalendarImpactType.TeacherDiary]: 'Teacher Diary',
  [CalendarImpactType.PTMBooking]: 'PTM Booking',
  [CalendarImpactType.EventSchedule]: 'Event Schedule',
};

// ─── Calendar Impact Status ──────────────────────────────────────────────────

export enum CalendarImpactStatus {
  Pending = 1,
  Suggested = 2,
  Rescheduled = 3,
  IgnoredWithReason = 4,
  Resolved = 5,
}

export const CALENDAR_IMPACT_STATUS_LABELS: Record<CalendarImpactStatus, string> = {
  [CalendarImpactStatus.Pending]: 'Pending',
  [CalendarImpactStatus.Suggested]: 'Suggested',
  [CalendarImpactStatus.Rescheduled]: 'Rescheduled',
  [CalendarImpactStatus.IgnoredWithReason]: 'Ignored',
  [CalendarImpactStatus.Resolved]: 'Resolved',
};

export const CALENDAR_IMPACT_STATUS_COLORS: Record<
  CalendarImpactStatus,
  'default' | 'warning' | 'info' | 'error' | 'success'
> = {
  [CalendarImpactStatus.Pending]: 'error',
  [CalendarImpactStatus.Suggested]: 'info',
  [CalendarImpactStatus.Rescheduled]: 'warning',
  [CalendarImpactStatus.IgnoredWithReason]: 'default',
  [CalendarImpactStatus.Resolved]: 'success',
};

// ─── Calendar Audit Action ───────────────────────────────────────────────────

export enum CalendarAuditAction {
  CalendarCreated = 1,
  CalendarUpdated = 2,
  CalendarPublished = 3,
  CalendarArchived = 4,
  DayAdded = 5,
  DayUpdated = 6,
  DayDeleted = 7,
  EmergencyClosureDeclared = 8,
  ImpactResolved = 9,
  OverrideApplied = 10,
  CalendarDeleted = 11,
  WorkingHourAdded = 12,
  WorkingHourUpdated = 13,
  WorkingHourDeleted = 14,
  SettingsUpdated = 15,
}

export const CALENDAR_AUDIT_ACTION_LABELS: Record<CalendarAuditAction, string> = {
  [CalendarAuditAction.CalendarCreated]: 'Calendar Created',
  [CalendarAuditAction.CalendarUpdated]: 'Calendar Updated',
  [CalendarAuditAction.CalendarPublished]: 'Calendar Published',
  [CalendarAuditAction.CalendarArchived]: 'Calendar Archived',
  [CalendarAuditAction.DayAdded]: 'Day Added',
  [CalendarAuditAction.DayUpdated]: 'Day Updated',
  [CalendarAuditAction.DayDeleted]: 'Day Deleted',
  [CalendarAuditAction.EmergencyClosureDeclared]: 'Emergency Closure Declared',
  [CalendarAuditAction.ImpactResolved]: 'Impact Resolved',
  [CalendarAuditAction.OverrideApplied]: 'Override Applied',
  [CalendarAuditAction.CalendarDeleted]: 'Calendar Deleted',
  [CalendarAuditAction.WorkingHourAdded]: 'Working Hours Added',
  [CalendarAuditAction.WorkingHourUpdated]: 'Working Hours Updated',
  [CalendarAuditAction.WorkingHourDeleted]: 'Working Hours Deleted',
  [CalendarAuditAction.SettingsUpdated]: 'Calendar Settings Updated',
};

// ─── School Shift Type ───────────────────────────────────────────────────────

export enum SchoolShiftType {
  FullDay = 1,
  Morning = 2,
  Afternoon = 3,
  Evening = 4,
}

export const SCHOOL_SHIFT_TYPE_LABELS: Record<SchoolShiftType, string> = {
  [SchoolShiftType.FullDay]: 'Full Day',
  [SchoolShiftType.Morning]: 'Morning',
  [SchoolShiftType.Afternoon]: 'Afternoon',
  [SchoolShiftType.Evening]: 'Evening',
};

export const SCHOOL_SHIFT_TYPE_OPTIONS = Object.values(SchoolShiftType)
  .filter((v) => typeof v === 'number')
  .map((v) => ({
    label: SCHOOL_SHIFT_TYPE_LABELS[v as SchoolShiftType],
    value: v as SchoolShiftType,
  }));
