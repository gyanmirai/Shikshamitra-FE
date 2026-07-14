import { CalendarAuditAction } from 'src/enums/academic-calendar';

import { AuditRiskLevel } from '../types/auditLogs.types';

/** Heuristic risk detection based on action type. */
export const detectRiskLevel = (action: CalendarAuditAction): AuditRiskLevel => {
  switch (action) {
    case CalendarAuditAction.CalendarCreated:
    case CalendarAuditAction.DayAdded:
      return AuditRiskLevel.Low;

    case CalendarAuditAction.CalendarUpdated:
    case CalendarAuditAction.DayUpdated:
    case CalendarAuditAction.OverrideApplied:
      return AuditRiskLevel.Medium;

    case CalendarAuditAction.CalendarPublished:
    case CalendarAuditAction.DayDeleted:
    case CalendarAuditAction.EmergencyClosureDeclared:
      return AuditRiskLevel.High;

    case CalendarAuditAction.CalendarArchived:
    case CalendarAuditAction.ImpactResolved:
      return AuditRiskLevel.Medium;

    default:
      return AuditRiskLevel.Low;
  }
};

/** Short reason explaining why an action carries a given risk. */
export const explainRisk = (action: CalendarAuditAction, level: AuditRiskLevel): string => {
  const base: Record<AuditRiskLevel, string> = {
    [AuditRiskLevel.Low]: 'Routine change with little to no academic disruption.',
    [AuditRiskLevel.Medium]: 'Noticeable change that may affect planning.',
    [AuditRiskLevel.High]: 'Modified a published calendar and may affect timetable or exams.',
    [AuditRiskLevel.Critical]:
      'Severe change — deletion, rollback, or disruption to a live academic year.',
  };

  const specific: Partial<Record<CalendarAuditAction, string>> = {
    [CalendarAuditAction.CalendarCreated]:
      'This was an initial calendar creation; no published data was affected.',
    [CalendarAuditAction.CalendarPublished]:
      'Publishing locks calendar data for downstream modules like timetable and attendance.',
    [CalendarAuditAction.DayDeleted]:
      'Removing a calendar day can invalidate existing timetable slots and homework due dates.',
    [CalendarAuditAction.EmergencyClosureDeclared]:
      'Emergency closures impact attendance, transport, and scheduled classes.',
    [CalendarAuditAction.CalendarUpdated]:
      'Updating calendar settings can change working-day calculations.',
  };

  return specific[action] ?? base[level];
};
