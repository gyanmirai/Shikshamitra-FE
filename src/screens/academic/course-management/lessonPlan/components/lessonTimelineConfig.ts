'use client';

import { varAlpha } from 'src/theme/styles';

export type LessonVisualStateKey =
  | 'scheduled'
  | 'inProgress'
  | 'submitted'
  | 'approved'
  | 'needsChanges'
  | 'rejected'
  | 'completed'
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
  periodBg: (theme: any) => string;
  periodTextColor: string;
  cardBg: (theme: any) => string;
  showProgress: boolean;
  progressColor: 'primary' | 'success' | 'warning' | 'error' | 'info';
  secondaryHodStatus?: SecondaryHodStatus;
  activeIndicator?: boolean;
}

/**
 * Centralized Lesson Status Configuration Dictionary
 * Controls status labels, icons, badge variants, card accent colors,
 * period badge styling, card background tinting, progress rules,
 * and secondary HOD approval status across all visual states.
 */
export const LESSON_STATUS_CONFIG: Record<LessonVisualStateKey, LessonStatusConfigItem> = {
  scheduled: {
    stateKey: 'scheduled',
    label: 'Scheduled',
    badgeColor: 'default',
    badgeVariant: 'soft',
    icon: 'solar:clock-circle-bold-duotone',
    accentPaletteKey: 'grey',
    periodBg: (t: any) => varAlpha(t.vars.palette.grey['500Channel'], 0.12),
    periodTextColor: 'text.secondary',
    cardBg: () => 'background.paper',
    showProgress: false,
    progressColor: 'primary',
  },
  inProgress: {
    stateKey: 'inProgress',
    label: 'In Progress',
    badgeColor: 'info',
    badgeVariant: 'filled',
    icon: 'solar:play-circle-bold-duotone',
    accentPaletteKey: 'info',
    periodBg: (t: any) => varAlpha(t.vars.palette.info.mainChannel, 0.15),
    periodTextColor: 'info.main',
    cardBg: (t: any) => varAlpha(t.vars.palette.info.mainChannel, 0.03),
    showProgress: true,
    progressColor: 'info',
    activeIndicator: true,
  },
  submitted: {
    stateKey: 'submitted',
    label: 'Submitted',
    badgeColor: 'warning',
    badgeVariant: 'soft',
    icon: 'solar:plain-bold',
    accentPaletteKey: 'warning',
    periodBg: (t: any) => varAlpha(t.vars.palette.warning.mainChannel, 0.15),
    periodTextColor: 'warning.dark',
    cardBg: (t: any) => varAlpha(t.vars.palette.warning.mainChannel, 0.02),
    showProgress: true,
    progressColor: 'warning',
    secondaryHodStatus: {
      label: 'Pending HOD',
      color: 'warning',
      variant: 'outlined',
      icon: 'solar:clock-circle-bold',
    },
  },
  approved: {
    stateKey: 'approved',
    label: 'Approved',
    badgeColor: 'success',
    badgeVariant: 'soft',
    icon: 'solar:check-circle-bold',
    accentPaletteKey: 'success',
    periodBg: (t: any) => varAlpha(t.vars.palette.success.mainChannel, 0.15),
    periodTextColor: 'success.dark',
    cardBg: () => 'background.paper',
    showProgress: true,
    progressColor: 'success',
    secondaryHodStatus: {
      label: 'HOD Approved',
      color: 'success',
      variant: 'soft',
      icon: 'solar:check-circle-bold',
    },
  },
  needsChanges: {
    stateKey: 'needsChanges',
    label: 'Needs Changes',
    badgeColor: 'warning',
    badgeVariant: 'filled',
    icon: 'solar:alt-arrow-right-bold-duotone',
    accentPaletteKey: 'warning',
    periodBg: (t: any) => varAlpha(t.vars.palette.warning.mainChannel, 0.18),
    periodTextColor: 'warning.dark',
    cardBg: (t: any) => varAlpha(t.vars.palette.warning.mainChannel, 0.03),
    showProgress: true,
    progressColor: 'warning',
    secondaryHodStatus: {
      label: 'Changes Requested',
      color: 'warning',
      variant: 'outlined',
      icon: 'solar:danger-bold',
    },
  },
  rejected: {
    stateKey: 'rejected',
    label: 'Rejected',
    badgeColor: 'error',
    badgeVariant: 'soft',
    icon: 'solar:close-circle-bold-duotone',
    accentPaletteKey: 'error',
    periodBg: (t: any) => varAlpha(t.vars.palette.error.mainChannel, 0.15),
    periodTextColor: 'error.main',
    cardBg: (t: any) => varAlpha(t.vars.palette.error.mainChannel, 0.02),
    showProgress: false,
    progressColor: 'error',
    secondaryHodStatus: {
      label: 'HOD Rejected',
      color: 'error',
      variant: 'soft',
      icon: 'solar:close-circle-bold',
    },
  },
  completed: {
    stateKey: 'completed',
    label: 'Completed',
    badgeColor: 'success',
    badgeVariant: 'filled',
    icon: 'solar:verified-check-bold',
    accentPaletteKey: 'success',
    periodBg: (t: any) => varAlpha(t.vars.palette.success.mainChannel, 0.18),
    periodTextColor: 'success.dark',
    cardBg: (t: any) => varAlpha(t.vars.palette.success.mainChannel, 0.04),
    showProgress: true,
    progressColor: 'success',
    secondaryHodStatus: {
      label: 'HOD Approved',
      color: 'success',
      variant: 'soft',
      icon: 'solar:check-circle-bold',
    },
  },
  draft: {
    stateKey: 'draft',
    label: 'Draft',
    badgeColor: 'default',
    badgeVariant: 'soft',
    icon: 'solar:pen-new-square-bold',
    accentPaletteKey: 'grey',
    periodBg: (t: any) => varAlpha(t.vars.palette.grey['500Channel'], 0.12),
    periodTextColor: 'text.secondary',
    cardBg: () => 'background.paper',
    showProgress: false,
    progressColor: 'primary',
  },
  missed: {
    stateKey: 'missed',
    label: 'Missed',
    badgeColor: 'error',
    badgeVariant: 'filled',
    icon: 'solar:danger-circle-bold-duotone',
    accentPaletteKey: 'error',
    periodBg: (t: any) => varAlpha(t.vars.palette.error.mainChannel, 0.18),
    periodTextColor: 'error.main',
    cardBg: (t: any) => varAlpha(t.vars.palette.error.mainChannel, 0.04),
    showProgress: false,
    progressColor: 'error',
  },
  rescheduled: {
    stateKey: 'rescheduled',
    label: 'Rescheduled',
    badgeColor: 'info',
    badgeVariant: 'soft',
    icon: 'solar:calendar-add-bold-duotone',
    accentPaletteKey: 'info',
    periodBg: (t: any) => varAlpha(t.vars.palette.info.mainChannel, 0.12),
    periodTextColor: 'info.main',
    cardBg: () => 'background.paper',
    showProgress: false,
    progressColor: 'info',
  },
  cancelled: {
    stateKey: 'cancelled',
    label: 'Cancelled',
    badgeColor: 'default',
    badgeVariant: 'soft',
    icon: 'solar:close-circle-linear',
    accentPaletteKey: 'grey',
    periodBg: (t: any) => varAlpha(t.vars.palette.grey['500Channel'], 0.12),
    periodTextColor: 'text.secondary',
    cardBg: () => 'background.neutral',
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
    periodBg: (t: any) => varAlpha(t.vars.palette.grey['500Channel'], 0.1),
    periodTextColor: 'text.disabled',
    cardBg: () => 'background.neutral',
    showProgress: false,
    progressColor: 'primary',
  },
  unknown: {
    stateKey: 'unknown',
    label: 'Scheduled',
    badgeColor: 'default',
    badgeVariant: 'soft',
    icon: 'solar:info-circle-bold',
    accentPaletteKey: 'grey',
    periodBg: (t: any) => varAlpha(t.vars.palette.grey['500Channel'], 0.1),
    periodTextColor: 'text.secondary',
    cardBg: () => 'background.paper',
    showProgress: false,
    progressColor: 'primary',
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
 * Resolves slot data to a specific LessonStatusConfigItem.
 * Handles edge cases, missing data, and unknown statuses gracefully without breaking UI.
 */
export function getLessonStatusConfig(slot: any): LessonStatusConfigItem {
  if (!slot || !slot.lessonPlan) {
    return LESSON_STATUS_CONFIG.unplanned;
  }

  const plan = slot.lessonPlan;
  const statusStr = normalizePlanStatus(plan.status || plan.planStatus);
  const completion = Number(
    plan.plannedCompletionPercentage ?? plan.actualCompletionPercentage ?? 0
  );

  const normalizedLower = statusStr.toLowerCase();

  if (normalizedLower === 'submitted') {
    return LESSON_STATUS_CONFIG.submitted;
  }

  if (normalizedLower === 'approved') {
    if (completion >= 100) {
      return LESSON_STATUS_CONFIG.completed;
    }
    if (completion > 0) {
      return LESSON_STATUS_CONFIG.inProgress;
    }
    return LESSON_STATUS_CONFIG.approved;
  }

  if (normalizedLower === 'needschanges' || normalizedLower === 'changesrequested') {
    return LESSON_STATUS_CONFIG.needsChanges;
  }

  if (normalizedLower === 'rejected') {
    return LESSON_STATUS_CONFIG.rejected;
  }

  if (normalizedLower === 'missed') {
    return LESSON_STATUS_CONFIG.missed;
  }

  if (normalizedLower === 'rescheduled') {
    return LESSON_STATUS_CONFIG.rescheduled;
  }

  if (normalizedLower === 'cancelled') {
    return LESSON_STATUS_CONFIG.cancelled;
  }

  if (normalizedLower === 'inprogress' || normalizedLower === 'in_progress') {
    return LESSON_STATUS_CONFIG.inProgress;
  }

  if (normalizedLower === 'scheduled') {
    if (completion > 0) {
      return LESSON_STATUS_CONFIG.inProgress;
    }
    return LESSON_STATUS_CONFIG.scheduled;
  }

  if (
    normalizedLower === 'draft' ||
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
    label: statusStr || 'Scheduled',
  };
}
