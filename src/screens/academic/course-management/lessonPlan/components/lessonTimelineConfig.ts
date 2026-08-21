'use client';

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { varAlpha } from 'src/theme/styles';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export type LessonVisualStateKey =
  | 'inProgress'
  | 'needsChanges'
  | 'rejected'
  | 'completed'
  | 'approved'
  | 'submitted'
  | 'scheduled'
  | 'draft'
  | 'missed'
  | 'rescheduled'
  | 'cancelled'
  | 'unplanned'
  | 'unknown';

export type LabelColor =
  'default' | 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error';

export type LabelVariant = 'soft' | 'filled' | 'outlined';

export interface SecondaryHodStatus {
  label: string;
  color: LabelColor;
  variant: LabelVariant;
  icon: string;
}

export interface LessonStatusConfigItem {
  stateKey: LessonVisualStateKey;
  label: string;
  badgeColor: LabelColor;
  badgeVariant: LabelVariant;
  icon: string;
  accentPaletteKey: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'grey';
  nodeColor: string; // for the timeline node bullet
  periodBg: (theme: any) => string;
  periodTextColor: string;
  cardBg: (theme: any) => string;
  cardBorder: (theme: any, isNow?: boolean) => string;
  showProgress: boolean;
  progressColor: 'primary' | 'success' | 'warning' | 'error' | 'info';
  activeIndicator?: boolean;
  isActionable?: boolean; // If true, requires teacher attention
  actionableReason?: string;
  primaryActionLabel?: string;
  primaryActionIcon?: string;
  primaryActionVariant?: 'contained' | 'outlined' | 'soft';
  primaryActionColor?: 'primary' | 'success' | 'warning' | 'error' | 'info' | 'inherit';
  secondaryHodStatus?: SecondaryHodStatus;
}

/**
 * Centralized Lesson Status Configuration Dictionary
 * Single unambiguous status badge per lesson, mapped to standard ERP semantic colors.
 * Green = Completed / Approved
 * Blue = In Progress / Active
 * Neutral/Grey = Scheduled / Upcoming / Draft
 * Amber = Needs Changes / Submitted
 * Red = Rejected / Missed
 */
export const LESSON_STATUS_CONFIG: Record<LessonVisualStateKey, LessonStatusConfigItem> = {
  inProgress: {
    stateKey: 'inProgress',
    label: 'In Progress',
    badgeColor: 'info',
    badgeVariant: 'soft',
    icon: 'solar:play-circle-bold-duotone',
    accentPaletteKey: 'info',
    nodeColor: 'info.main',
    periodBg: (t: any) => varAlpha(t.vars.palette.info.mainChannel, 0.15),
    periodTextColor: 'info.main',
    cardBg: (t: any) => varAlpha(t.vars.palette.info.mainChannel, 0.04),
    cardBorder: (t: any, isNow) =>
      isNow ? t.palette.info.main : varAlpha(t.vars.palette.info.mainChannel, 0.4),
    showProgress: true,
    progressColor: 'info',
    activeIndicator: true,
    isActionable: true,
    actionableReason: 'Class is active — record diary when finished',
    primaryActionLabel: 'Record Diary',
    primaryActionIcon: 'solar:notebook-bookmark-bold',
    primaryActionVariant: 'contained',
    primaryActionColor: 'info',
  },
  needsChanges: {
    stateKey: 'needsChanges',
    label: 'Needs Changes',
    badgeColor: 'warning',
    badgeVariant: 'soft',
    icon: 'solar:danger-bold',
    accentPaletteKey: 'warning',
    nodeColor: 'warning.main',
    periodBg: (t: any) => varAlpha(t.vars.palette.warning.mainChannel, 0.18),
    periodTextColor: 'warning.dark',
    cardBg: (t: any) => varAlpha(t.vars.palette.warning.mainChannel, 0.04),
    cardBorder: (t: any) => varAlpha(t.vars.palette.warning.mainChannel, 0.4),
    showProgress: true,
    progressColor: 'warning',
    isActionable: true,
    actionableReason: 'HOD requested changes',
    primaryActionLabel: 'Review Changes',
    primaryActionIcon: 'solar:pen-bold',
    primaryActionVariant: 'contained',
    primaryActionColor: 'warning',
  },
  rejected: {
    stateKey: 'rejected',
    label: 'Rejected',
    badgeColor: 'error',
    badgeVariant: 'soft',
    icon: 'solar:close-circle-bold-duotone',
    accentPaletteKey: 'error',
    nodeColor: 'error.main',
    periodBg: (t: any) => varAlpha(t.vars.palette.error.mainChannel, 0.15),
    periodTextColor: 'error.main',
    cardBg: (t: any) => varAlpha(t.vars.palette.error.mainChannel, 0.04),
    cardBorder: (t: any) => varAlpha(t.vars.palette.error.mainChannel, 0.4),
    showProgress: false,
    progressColor: 'error',
    isActionable: true,
    actionableReason: 'HOD returned revision',
    primaryActionLabel: 'Edit & Resubmit',
    primaryActionIcon: 'solar:refresh-bold',
    primaryActionVariant: 'contained',
    primaryActionColor: 'error',
  },
  completed: {
    stateKey: 'completed',
    label: 'Completed',
    badgeColor: 'success',
    badgeVariant: 'soft',
    icon: 'solar:verified-check-bold',
    accentPaletteKey: 'success',
    nodeColor: 'success.main',
    periodBg: (t: any) => varAlpha(t.vars.palette.success.mainChannel, 0.18),
    periodTextColor: 'success.dark',
    cardBg: (t: any) => varAlpha(t.vars.palette.success.mainChannel, 0.02),
    cardBorder: (t: any) => varAlpha(t.vars.palette.success.mainChannel, 0.3),
    showProgress: true,
    progressColor: 'success',
    primaryActionLabel: 'View Diary',
    primaryActionIcon: 'solar:eye-bold',
    primaryActionVariant: 'outlined',
    primaryActionColor: 'success',
  },
  approved: {
    stateKey: 'approved',
    label: 'Approved',
    badgeColor: 'success',
    badgeVariant: 'soft',
    icon: 'solar:check-circle-bold',
    accentPaletteKey: 'success',
    nodeColor: 'success.main',
    periodBg: (t: any) => varAlpha(t.vars.palette.success.mainChannel, 0.14),
    periodTextColor: 'success.dark',
    cardBg: () => 'background.paper',
    cardBorder: (t: any) => t.palette.divider,
    showProgress: true,
    progressColor: 'success',
    primaryActionLabel: 'Record Diary',
    primaryActionIcon: 'solar:notebook-bookmark-bold',
    primaryActionVariant: 'contained',
    primaryActionColor: 'primary',
  },
  submitted: {
    stateKey: 'submitted',
    label: 'Pending Approval',
    badgeColor: 'warning',
    badgeVariant: 'soft',
    icon: 'solar:clock-circle-bold',
    accentPaletteKey: 'warning',
    nodeColor: 'warning.main',
    periodBg: (t: any) => varAlpha(t.vars.palette.warning.mainChannel, 0.15),
    periodTextColor: 'warning.dark',
    cardBg: (t: any) => varAlpha(t.vars.palette.warning.mainChannel, 0.02),
    cardBorder: (t: any) => t.palette.divider,
    showProgress: true,
    progressColor: 'warning',
    primaryActionLabel: 'View Details',
    primaryActionIcon: 'solar:eye-bold',
    primaryActionVariant: 'outlined',
    primaryActionColor: 'inherit',
  },
  scheduled: {
    stateKey: 'scheduled',
    label: 'Upcoming',
    badgeColor: 'default',
    badgeVariant: 'soft',
    icon: 'solar:clock-circle-bold-duotone',
    accentPaletteKey: 'grey',
    nodeColor: 'text.disabled',
    periodBg: (t: any) => varAlpha(t.vars.palette.grey['500Channel'], 0.12),
    periodTextColor: 'text.secondary',
    cardBg: () => 'background.paper',
    cardBorder: (t: any) => t.palette.divider,
    showProgress: false,
    progressColor: 'primary',
    primaryActionLabel: 'View Plan',
    primaryActionIcon: 'solar:eye-bold',
    primaryActionVariant: 'outlined',
    primaryActionColor: 'inherit',
  },
  draft: {
    stateKey: 'draft',
    label: 'Draft',
    badgeColor: 'default',
    badgeVariant: 'soft',
    icon: 'solar:pen-new-square-bold',
    accentPaletteKey: 'grey',
    nodeColor: 'text.secondary',
    periodBg: (t: any) => varAlpha(t.vars.palette.grey['500Channel'], 0.12),
    periodTextColor: 'text.secondary',
    cardBg: () => 'background.paper',
    cardBorder: (t: any) => t.palette.divider,
    showProgress: false,
    progressColor: 'primary',
    primaryActionLabel: 'Submit',
    primaryActionIcon: 'solar:plain-bold',
    primaryActionVariant: 'contained',
    primaryActionColor: 'primary',
  },
  missed: {
    stateKey: 'missed',
    label: 'Missed',
    badgeColor: 'error',
    badgeVariant: 'soft',
    icon: 'solar:danger-circle-bold-duotone',
    accentPaletteKey: 'error',
    nodeColor: 'error.main',
    periodBg: (t: any) => varAlpha(t.vars.palette.error.mainChannel, 0.15),
    periodTextColor: 'error.main',
    cardBg: (t: any) => varAlpha(t.vars.palette.error.mainChannel, 0.03),
    cardBorder: (t: any) => varAlpha(t.vars.palette.error.mainChannel, 0.3),
    showProgress: false,
    progressColor: 'error',
    primaryActionLabel: 'Reschedule',
    primaryActionIcon: 'solar:calendar-add-bold-duotone',
    primaryActionVariant: 'outlined',
    primaryActionColor: 'error',
  },
  rescheduled: {
    stateKey: 'rescheduled',
    label: 'Rescheduled',
    badgeColor: 'info',
    badgeVariant: 'soft',
    icon: 'solar:calendar-add-bold-duotone',
    accentPaletteKey: 'info',
    nodeColor: 'info.main',
    periodBg: (t: any) => varAlpha(t.vars.palette.info.mainChannel, 0.12),
    periodTextColor: 'info.main',
    cardBg: () => 'background.paper',
    cardBorder: (t: any) => t.palette.divider,
    showProgress: false,
    progressColor: 'info',
    primaryActionLabel: 'View Plan',
    primaryActionIcon: 'solar:eye-bold',
    primaryActionVariant: 'outlined',
    primaryActionColor: 'inherit',
  },
  cancelled: {
    stateKey: 'cancelled',
    label: 'Cancelled',
    badgeColor: 'default',
    badgeVariant: 'soft',
    icon: 'solar:close-circle-linear',
    accentPaletteKey: 'grey',
    nodeColor: 'text.disabled',
    periodBg: (t: any) => varAlpha(t.vars.palette.grey['500Channel'], 0.12),
    periodTextColor: 'text.disabled',
    cardBg: () => 'background.neutral',
    cardBorder: (t: any) => t.palette.divider,
    showProgress: false,
    progressColor: 'primary',
  },
  unplanned: {
    stateKey: 'unplanned',
    label: 'No Plan',
    badgeColor: 'default',
    badgeVariant: 'soft',
    icon: 'solar:document-add-bold',
    accentPaletteKey: 'grey',
    nodeColor: 'text.disabled',
    periodBg: (t: any) => varAlpha(t.vars.palette.grey['500Channel'], 0.1),
    periodTextColor: 'text.disabled',
    cardBg: () => 'background.neutral',
    cardBorder: (t: any) => t.palette.divider,
    showProgress: false,
    progressColor: 'primary',
    primaryActionLabel: 'Create Plan',
    primaryActionIcon: 'solar:add-circle-bold',
    primaryActionVariant: 'outlined',
    primaryActionColor: 'primary',
  },
  unknown: {
    stateKey: 'unknown',
    label: 'Upcoming',
    badgeColor: 'default',
    badgeVariant: 'soft',
    icon: 'solar:info-circle-bold',
    accentPaletteKey: 'grey',
    nodeColor: 'text.disabled',
    periodBg: (t: any) => varAlpha(t.vars.palette.grey['500Channel'], 0.1),
    periodTextColor: 'text.secondary',
    cardBg: () => 'background.paper',
    cardBorder: (t: any) => t.palette.divider,
    showProgress: false,
    progressColor: 'primary',
    primaryActionLabel: 'View Details',
    primaryActionIcon: 'solar:eye-bold',
    primaryActionVariant: 'outlined',
    primaryActionColor: 'inherit',
  },
};

const PLAN_STATUS_BY_VALUE = ['Draft', 'Submitted', 'Approved', 'Rejected', 'NeedsChanges'];

export const normalizePlanStatus = (rawStatus: unknown): string => {
  if (typeof rawStatus === 'number') {
    return PLAN_STATUS_BY_VALUE[rawStatus] ?? 'Draft';
  }
  if (typeof rawStatus === 'string' && rawStatus.trim().length > 0) {
    return rawStatus.trim();
  }
  return 'Draft';
};

/**
 * Parse time string like "01:00 PM" or "13:00" into a Dayjs instance on the target date.
 */
export function parseSlotTime(timeStr: string | undefined, date: dayjs.Dayjs): dayjs.Dayjs | null {
  if (!timeStr) return null;
  const clean = timeStr.trim();
  if (!clean) return null;

  // Try 12-hour format "01:00 PM", "1:00 PM", "01:00:00 PM"
  const parsed12 = dayjs(`${date.format('YYYY-MM-DD')} ${clean}`, [
    'YYYY-MM-DD hh:mm A',
    'YYYY-MM-DD h:mm A',
    'YYYY-MM-DD hh:mm:ss A',
    'YYYY-MM-DD h:mm:ss A',
    'YYYY-MM-DD HH:mm',
    'YYYY-MM-DD HH:mm:ss',
  ]);

  return parsed12.isValid() ? parsed12 : null;
}

/**
 * Determines if a given timetable slot is active right now.
 */
export function isSlotCurrentlyActive(slot: any, selectedDate: dayjs.Dayjs): boolean {
  if (!slot) return false;

  // If selected date is not today, it's not active NOW
  if (!selectedDate.isSame(dayjs(), 'day')) {
    return false;
  }

  const now = dayjs();
  const start = parseSlotTime(slot.startTime, selectedDate);
  const end = parseSlotTime(slot.endTime, selectedDate);

  if (start && end) {
    return (now.isAfter(start) || now.isSame(start)) && now.isBefore(end);
  }

  return false;
}

/**
 * Calculates human-readable duration between slot startTime and endTime (e.g. "45 min", "1h 15m")
 */
export function calculateSlotDuration(startTime?: string, endTime?: string): string {
  if (!startTime || !endTime) return '';
  const now = dayjs();
  const start = parseSlotTime(startTime, now);
  const end = parseSlotTime(endTime, now);

  if (!start || !end || !end.isAfter(start)) return '';

  const diffMins = end.diff(start, 'minute');
  if (diffMins <= 0) return '';
  if (diffMins < 60) return `${diffMins} min`;

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}

/**
 * Resolves slot data to a specific LessonStatusConfigItem.
 * Handles edge cases, missing data, and unknown statuses gracefully.
 */
export function getLessonStatusConfig(
  slot: any,
  selectedDate?: dayjs.Dayjs
): LessonStatusConfigItem {
  if (!slot || !slot.lessonPlan) {
    return LESSON_STATUS_CONFIG.unplanned;
  }

  const plan = slot.lessonPlan;
  const statusStr = normalizePlanStatus(plan.status || plan.planStatus);
  const completion = Number(
    plan.plannedCompletionPercentage ?? plan.actualCompletionPercentage ?? 0
  );

  const normalizedLower = statusStr.toLowerCase();

  // 1. Rejected
  if (normalizedLower === 'rejected') {
    return LESSON_STATUS_CONFIG.rejected;
  }

  // 2. Needs Changes
  if (normalizedLower === 'needschanges' || normalizedLower === 'changesrequested') {
    return LESSON_STATUS_CONFIG.needsChanges;
  }

  // 3. Submitted
  if (normalizedLower === 'submitted') {
    return LESSON_STATUS_CONFIG.submitted;
  }

  // 4. Completed only after the teacher has submitted a diary for the period.
  //
  // Lesson-plan approval and lecture delivery are separate workflows. A plan
  // can be approved before the class happens, and planned completion can be
  // 100% without any lecture being conducted. Neither is evidence that the
  // period was completed. The backend's TeacherDiaryStatus.Submitted value is
  // the delivery signal available to the timeline.
  if (
    normalizedLower === 'completed' ||
    plan.diaryStatus === 1 ||
    plan.diaryStatus === 'Submitted'
  ) {
    return LESSON_STATUS_CONFIG.completed;
  }

  // 5. In Progress (if active time or completion > 0% or marked inprogress)
  const isNow = selectedDate ? isSlotCurrentlyActive(slot, selectedDate) : false;
  if (normalizedLower === 'inprogress' || normalizedLower === 'in_progress' || isNow) {
    return LESSON_STATUS_CONFIG.inProgress;
  }

  // 6. Approved
  if (normalizedLower === 'approved') {
    return LESSON_STATUS_CONFIG.approved;
  }

  // 7. Missed
  if (normalizedLower === 'missed') {
    return LESSON_STATUS_CONFIG.missed;
  }

  // 8. Rescheduled
  if (normalizedLower === 'rescheduled') {
    return LESSON_STATUS_CONFIG.rescheduled;
  }

  // 9. Cancelled
  if (normalizedLower === 'cancelled') {
    return LESSON_STATUS_CONFIG.cancelled;
  }

  // 10. Draft
  if (normalizedLower === 'draft') {
    return LESSON_STATUS_CONFIG.draft;
  }

  // 11. Scheduled / Upcoming
  if (
    normalizedLower === 'scheduled' ||
    normalizedLower === 'autocreated' ||
    normalizedLower === 'aigenerated'
  ) {
    if (completion > 0) {
      return LESSON_STATUS_CONFIG.inProgress;
    }
    return LESSON_STATUS_CONFIG.scheduled;
  }

  return {
    ...LESSON_STATUS_CONFIG.unknown,
    label: statusStr || 'Upcoming',
  };
}
