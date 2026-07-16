'use client';

import { useFormik } from 'formik';
import { Iconify } from 'src/components/iconify';
import { alpha, useTheme } from '@mui/material/styles';
import {
  WEEKEND_RULE_OPTIONS,
  RESCHEDULE_MODE_OPTIONS,
  CALENDAR_VISIBILITY_OPTIONS,
} from 'src/enums/academic-calendar';
import {
  Box,
  Grid,
  Paper,
  Stack,
  Switch,
  Select,
  Divider,
  MenuItem,
  Typography,
  InputLabel,
  FormControl,
} from '@mui/material';

// ─── Settings Section Card ────────────────────────────────────────────────────

interface SectionProps {
  icon: string;
  title: string;
  description?: string;
  iconColor?: string;
  children: React.ReactNode;
}

const SettingsSection = ({ icon, title, description, iconColor, children }: SectionProps) => {
  const theme = useTheme();
  const color = iconColor ?? theme.palette.primary.main;
  return (
    <Paper
      sx={{
        p: 0,
        borderRadius: 2.5,
        border: `1px solid ${alpha(color, 0.15)}`,
        overflow: 'hidden',
        height: '100%',
        '&:hover': {
          borderColor: alpha(color, 0.28),
          boxShadow: `0 2px 12px ${alpha(color, 0.08)}`,
        },
        transition: 'all 0.2s',
      }}
    >
      {/* Section header */}
      <Box
        sx={{
          p: 2,
          background: alpha(color, 0.06),
          borderBottom: `1px solid ${alpha(color, 0.12)}`,
        }}
      >
        <Stack direction="row" alignItems="center" gap={1}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              backgroundColor: alpha(color, 0.14),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Iconify icon={icon} width={18} sx={{ color }} />
          </Box>
          <Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {title}
            </Typography>
            {description && (
              <Typography variant="caption" color="text.secondary">
                {description}
              </Typography>
            )}
          </Box>
        </Stack>
      </Box>
      <Box sx={{ p: 2 }}>{children}</Box>
    </Paper>
  );
};

// ─── Toggle Row ───────────────────────────────────────────────────────────────

interface ToggleRowProps {
  name: string;
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const ToggleRow = ({ name, label, description, checked, onChange }: ToggleRowProps) => {
  const theme = useTheme();
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      py={0.9}
      sx={{
        borderRadius: 1.5,
        px: 0.5,
        transition: 'background-color 0.15s',
        '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.04) },
      }}
    >
      <Box>
        <Typography variant="body2" fontWeight={checked ? 600 : 400}>
          {label}
        </Typography>
        {description && (
          <Typography variant="caption" color="text.secondary">
            {description}
          </Typography>
        )}
      </Box>
      <Switch
        size="small"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        name={name}
        color="primary"
      />
    </Stack>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  settingsData?: any;
  onSave: (values: any) => Promise<void>;
  isSaving: boolean;
}

const CalendarSettingsForm = ({ settingsData, onSave, isSaving }: Props) => {
  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      // Weekend & Working Day
      weekendRule: settingsData?.weekendRule ?? 1,
      // Class-specific
      allowClassSpecificHolidays: settingsData?.allowClassSpecificHolidays ?? true,
      allowDivisionSpecificHolidays: settingsData?.allowDivisionSpecificHolidays ?? true,
      // Features
      enableHolidayCategories: settingsData?.enableHolidayCategories ?? true,
      enableVacationRanges: settingsData?.enableVacationRanges ?? true,
      enableHalfDayRules: settingsData?.enableHalfDayRules ?? true,
      // Timetable blocks
      blockTimetableOnHoliday: settingsData?.blockTimetableOnHoliday ?? true,
      blockTimetableOnVacation: settingsData?.blockTimetableOnVacation ?? true,
      blockTimetableOnEmergencyClosure: settingsData?.blockTimetableOnEmergencyClosure ?? true,
      // Homework blocks
      blockHomeworkDueDateOnHoliday: settingsData?.blockHomeworkDueDateOnHoliday ?? true,
      blockHomeworkDueDateOnVacation: settingsData?.blockHomeworkDueDateOnVacation ?? true,
      // Exam blocks
      blockExamScheduleOnHoliday: settingsData?.blockExamScheduleOnHoliday ?? true,
      blockExamScheduleOnVacation: settingsData?.blockExamScheduleOnVacation ?? true,
      allowExamOnHalfDay: settingsData?.allowExamOnHalfDay ?? false,
      // Lesson plan
      blockLessonPlanOnHoliday: settingsData?.blockLessonPlanOnHoliday ?? true,
      blockLessonPlanOnVacation: settingsData?.blockLessonPlanOnVacation ?? true,
      // Online class
      blockOnlineClassOnHoliday: settingsData?.blockOnlineClassOnHoliday ?? false,
      blockOnlineClassOnEventDay: settingsData?.blockOnlineClassOnEventDay ?? false,
      // Attendance
      autoExemptAttendanceOnHoliday: settingsData?.autoExemptAttendanceOnHoliday ?? true,
      autoExemptAttendanceOnVacation: settingsData?.autoExemptAttendanceOnVacation ?? true,
      // Emergency closure
      enableEmergencyClosure: settingsData?.enableEmergencyClosure ?? true,
      emergencyClosureRequiresPrincipalApproval:
        settingsData?.emergencyClosureRequiresPrincipalApproval ?? true,
      // Automation
      autoScanImpactedActivities: settingsData?.autoScanImpactedActivities ?? true,
      rescheduleMode: settingsData?.rescheduleMode ?? 2,
      // Notifications
      notifyTeachersOnCalendarChange: settingsData?.notifyTeachersOnCalendarChange ?? true,
      notifyParentsOnCalendarChange: settingsData?.notifyParentsOnCalendarChange ?? true,
      notifyStudentsOnCalendarChange: settingsData?.notifyStudentsOnCalendarChange ?? true,
      notifyStaffOnCalendarChange: settingsData?.notifyStaffOnCalendarChange ?? false,
      // Visibility
      calendarVisibility: settingsData?.calendarVisibility ?? 4,
      // Audit
      requireReasonForPublishedCalendarChange:
        settingsData?.requireReasonForPublishedCalendarChange ?? true,
    },
    onSubmit: async (values) => {
      await onSave(values);
    },
  });

  const t = (key: string, checked: boolean) => formik.setFieldValue(key, checked);

  const theme = useTheme();
  const colors = {
    primary: theme.palette.primary.main,
    info: theme.palette.info.main,
    success: theme.palette.success.main,
    warning: theme.palette.warning.main,
  };

  return (
    <Box component="form" id="calendar-settings-form" onSubmit={formik.handleSubmit} noValidate>
      <Grid container spacing={1}>
        {/* ROW 1: Weekend & Working Day Rules (1 select) & Visibility Rules (1 select) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:calendar-week-outline"
            title="Weekend & Working Day Rules"
            description="Define which days are weekends"
            iconColor={colors.primary}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Weekend Rule</InputLabel>
              <Select
                label="Weekend Rule"
                name="weekendRule"
                value={formik.values.weekendRule}
                onChange={formik.handleChange}
              >
                {WEEKEND_RULE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SettingsSection>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:eye-outline"
            title="Visibility Rules"
            description="Control who can see the published calendar"
            iconColor={colors.primary}
          >
            <FormControl fullWidth size="small">
              <InputLabel>Calendar Visibility</InputLabel>
              <Select
                label="Calendar Visibility"
                name="calendarVisibility"
                value={formik.values.calendarVisibility}
                onChange={formik.handleChange}
              >
                {CALENDAR_VISIBILITY_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SettingsSection>
        </Grid>
        {/* ROW 2: Class-Specific Holiday Rules (2 toggles) & Homework & Assignment Rules (2 toggles) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:school-outline"
            title="Class-Specific Holiday Rules"
            description="Allow holidays for specific standards or divisions"
            iconColor={colors.primary}
          >
            <ToggleRow
              name="allowClassSpecificHolidays"
              label="Allow class-specific holidays"
              checked={formik.values.allowClassSpecificHolidays}
              onChange={(v) => t('allowClassSpecificHolidays', v)}
            />
            <Divider />
            <ToggleRow
              name="allowDivisionSpecificHolidays"
              label="Allow division-specific holidays"
              checked={formik.values.allowDivisionSpecificHolidays}
              onChange={(v) => t('allowDivisionSpecificHolidays', v)}
            />
          </SettingsSection>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:notebook-edit-outline"
            title="Homework & Assignment Rules"
            description="Control due dates on non-working days"
            iconColor={colors.info}
          >
            <ToggleRow
              name="blockHomeworkDueDateOnHoliday"
              label="Block homework due date on holidays"
              checked={formik.values.blockHomeworkDueDateOnHoliday}
              onChange={(v) => t('blockHomeworkDueDateOnHoliday', v)}
            />
            <Divider />
            <ToggleRow
              name="blockHomeworkDueDateOnVacation"
              label="Block homework due date on vacations"
              checked={formik.values.blockHomeworkDueDateOnVacation}
              onChange={(v) => t('blockHomeworkDueDateOnVacation', v)}
            />
          </SettingsSection>
        </Grid>
        {/* ROW 3: Holiday & Vacation Rules (3 toggles) & Timetable Block Rules (3 toggles) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:flag-outline"
            title="Holiday & Vacation Rules"
            description="Configure holiday categories and vacation ranges"
            iconColor={colors.primary}
          >
            <ToggleRow
              name="enableHolidayCategories"
              label="Enable holiday categories"
              description="National, Regional, Festival, etc."
              checked={formik.values.enableHolidayCategories}
              onChange={(v) => t('enableHolidayCategories', v)}
            />
            <Divider />
            <ToggleRow
              name="enableVacationRanges"
              label="Enable vacation date ranges"
              checked={formik.values.enableVacationRanges}
              onChange={(v) => t('enableVacationRanges', v)}
            />
            <Divider />
            <ToggleRow
              name="enableHalfDayRules"
              label="Enable half-day scheduling"
              checked={formik.values.enableHalfDayRules}
              onChange={(v) => t('enableHalfDayRules', v)}
            />
          </SettingsSection>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:calendar-clock-outline"
            title="Timetable Block Rules"
            description="Block timetable generation on certain days"
            iconColor={colors.info}
          >
            <ToggleRow
              name="blockTimetableOnHoliday"
              label="Block timetable on holidays"
              checked={formik.values.blockTimetableOnHoliday}
              onChange={(v) => t('blockTimetableOnHoliday', v)}
            />
            <Divider />
            <ToggleRow
              name="blockTimetableOnVacation"
              label="Block timetable on vacations"
              checked={formik.values.blockTimetableOnVacation}
              onChange={(v) => t('blockTimetableOnVacation', v)}
            />
            <Divider />
            <ToggleRow
              name="blockTimetableOnEmergencyClosure"
              label="Block timetable on emergency closure"
              checked={formik.values.blockTimetableOnEmergencyClosure}
              onChange={(v) => t('blockTimetableOnEmergencyClosure', v)}
            />
          </SettingsSection>
        </Grid>
        {/* ROW 4: Exam Day Rules (3 toggles) & Notification Rules (4 toggles) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:file-document-edit-outline"
            title="Exam Day Rules"
            description="Manage exam scheduling on special days"
            iconColor={colors.info}
          >
            <ToggleRow
              name="blockExamScheduleOnHoliday"
              label="Block exam schedule on holidays"
              checked={formik.values.blockExamScheduleOnHoliday}
              onChange={(v) => t('blockExamScheduleOnHoliday', v)}
            />
            <Divider />
            <ToggleRow
              name="blockExamScheduleOnVacation"
              label="Block exam schedule on vacations"
              checked={formik.values.blockExamScheduleOnVacation}
              onChange={(v) => t('blockExamScheduleOnVacation', v)}
            />
            <Divider />
            <ToggleRow
              name="allowExamOnHalfDay"
              label="Allow exam on half-day"
              checked={formik.values.allowExamOnHalfDay}
              onChange={(v) => t('allowExamOnHalfDay', v)}
            />
          </SettingsSection>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:bell-outline"
            title="Notification Rules"
            description="Who gets notified on calendar changes"
            iconColor={colors.success}
          >
            <ToggleRow
              name="notifyTeachersOnCalendarChange"
              label="Notify teachers"
              checked={formik.values.notifyTeachersOnCalendarChange}
              onChange={(v) => t('notifyTeachersOnCalendarChange', v)}
            />
            <Divider />
            <ToggleRow
              name="notifyParentsOnCalendarChange"
              label="Notify parents"
              checked={formik.values.notifyParentsOnCalendarChange}
              onChange={(v) => t('notifyParentsOnCalendarChange', v)}
            />
            <Divider />
            <ToggleRow
              name="notifyStudentsOnCalendarChange"
              label="Notify students"
              checked={formik.values.notifyStudentsOnCalendarChange}
              onChange={(v) => t('notifyStudentsOnCalendarChange', v)}
            />
            <Divider />
            <ToggleRow
              name="notifyStaffOnCalendarChange"
              label="Notify non-teaching staff"
              checked={formik.values.notifyStaffOnCalendarChange}
              onChange={(v) => t('notifyStaffOnCalendarChange', v)}
            />
          </SettingsSection>
        </Grid>
        {/* ROW 5: Lesson Plan Rules (2 toggles) & Online Class Rules (2 toggles) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:book-open-outline"
            title="Lesson Plan Rules"
            description="Control lesson planning on non-working days"
            iconColor={colors.info}
          >
            <ToggleRow
              name="blockLessonPlanOnHoliday"
              label="Block lesson plan on holidays"
              checked={formik.values.blockLessonPlanOnHoliday}
              onChange={(v) => t('blockLessonPlanOnHoliday', v)}
            />
            <Divider />
            <ToggleRow
              name="blockLessonPlanOnVacation"
              label="Block lesson plan on vacations"
              checked={formik.values.blockLessonPlanOnVacation}
              onChange={(v) => t('blockLessonPlanOnVacation', v)}
            />
          </SettingsSection>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:video-outline"
            title="Online Class Rules"
            description="Control online class scheduling"
            iconColor={colors.info}
          >
            <ToggleRow
              name="blockOnlineClassOnHoliday"
              label="Block online class on holidays"
              checked={formik.values.blockOnlineClassOnHoliday}
              onChange={(v) => t('blockOnlineClassOnHoliday', v)}
            />
            <Divider />
            <ToggleRow
              name="blockOnlineClassOnEventDay"
              label="Block online class on event days"
              checked={formik.values.blockOnlineClassOnEventDay}
              onChange={(v) => t('blockOnlineClassOnEventDay', v)}
            />
          </SettingsSection>
        </Grid>
        {/* ROW 6: Attendance Rules (2 toggles) & Emergency Closure Rules (2 toggles) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:account-check-outline"
            title="Attendance Rules"
            description="Auto-exempt attendance on non-working days"
            iconColor={colors.success}
          >
            <ToggleRow
              name="autoExemptAttendanceOnHoliday"
              label="Auto-exempt attendance on holidays"
              description="Holidays will not count in attendance records"
              checked={formik.values.autoExemptAttendanceOnHoliday}
              onChange={(v) => t('autoExemptAttendanceOnHoliday', v)}
            />
            <Divider />
            <ToggleRow
              name="autoExemptAttendanceOnVacation"
              label="Auto-exempt attendance on vacations"
              checked={formik.values.autoExemptAttendanceOnVacation}
              onChange={(v) => t('autoExemptAttendanceOnVacation', v)}
            />
          </SettingsSection>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:alert-octagon-outline"
            title="Emergency Closure Rules"
            description="Configure who can declare emergency closures"
            iconColor={colors.warning}
          >
            <ToggleRow
              name="enableEmergencyClosure"
              label="Enable emergency closure feature"
              checked={formik.values.enableEmergencyClosure}
              onChange={(v) => t('enableEmergencyClosure', v)}
            />
            <Divider />
            <ToggleRow
              name="emergencyClosureRequiresPrincipalApproval"
              label="Require principal approval"
              description="Only principal can declare emergency closure"
              checked={formik.values.emergencyClosureRequiresPrincipalApproval}
              onChange={(v) => t('emergencyClosureRequiresPrincipalApproval', v)}
            />
          </SettingsSection>
        </Grid>
        {/* ROW 7: Automation Rules (1 toggle + 1 select) & Audit Requirements (1 toggle + description) */}
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:robot-outline"
            title="Automation Rules"
            description="Configure automatic scanning and rescheduling"
            iconColor={colors.success}
          >
            <ToggleRow
              name="autoScanImpactedActivities"
              label="Auto-scan impacted activities"
              description="Automatically find affected academic activities"
              checked={formik.values.autoScanImpactedActivities}
              onChange={(v) => t('autoScanImpactedActivities', v)}
            />
            <Divider sx={{ my: 1 }} />
            <FormControl fullWidth size="small">
              <InputLabel>Reschedule Mode</InputLabel>
              <Select
                label="Reschedule Mode"
                name="rescheduleMode"
                value={formik.values.rescheduleMode}
                onChange={formik.handleChange}
              >
                {RESCHEDULE_MODE_OPTIONS.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </SettingsSection>
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <SettingsSection
            icon="mdi:history"
            title="Audit Requirements"
            description="Control change tracking and audit trail"
            iconColor={colors.success}
          >
            <ToggleRow
              name="requireReasonForPublishedCalendarChange"
              label="Require reason for published calendar changes"
              description="Any change after publishing requires a written reason"
              checked={formik.values.requireReasonForPublishedCalendarChange}
              onChange={(v) => t('requireReasonForPublishedCalendarChange', v)}
            />
          </SettingsSection>
        </Grid>{' '}
      </Grid>
    </Box>
  );
};

export default CalendarSettingsForm;
