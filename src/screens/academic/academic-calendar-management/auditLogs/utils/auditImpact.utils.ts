import { CalendarAuditAction } from 'src/enums/academic-calendar';

import type { AuditLogImpact } from '../types/auditLogs.types';

/**
 * Estimate the academic impact of a calendar audit action.
 * Used to enrich mock logs with impact intelligence.
 */
export const estimateImpact = (
  action: CalendarAuditAction,
  entityName?: string
): AuditLogImpact => {
  switch (action) {
    case CalendarAuditAction.CalendarCreated:
      return {
        workingDaysAffected: 220,
        eventsAffected: 12,
        holidaysAffected: 18,
        notificationsTriggered: false,
        impactSummary: 'New calendar initialized with default working-day plan.',
      };

    case CalendarAuditAction.CalendarUpdated:
      return {
        workingDaysAffected: 1,
        timetablesAffected: 6,
        lecturesAffected: 32,
        studentsAffected: 480,
        staffAffected: 32,
        notificationsTriggered: true,
        impactSummary: 'Calendar settings change recalculated working-day total.',
      };

    case CalendarAuditAction.CalendarPublished:
      return {
        notificationsTriggered: true,
        studentsAffected: 480,
        staffAffected: 32,
        impactSummary: 'Calendar published — notifications dispatched to all stakeholders.',
      };

    case CalendarAuditAction.CalendarArchived:
      return {
        impactSummary: 'Calendar archived; historical reference retained.',
      };

    case CalendarAuditAction.DayAdded:
      return {
        holidaysAffected: 1,
        lecturesAffected: 0,
        impactSummary: `Holiday marker added: ${entityName ?? 'calendar day'}.`,
      };

    case CalendarAuditAction.DayUpdated:
      return {
        timetablesAffected: 6,
        lecturesAffected: 32,
        studentsAffected: 480,
        staffAffected: 32,
        examsAffected: 0,
        transportRoutesAffected: 12,
        notificationsTriggered: true,
        impactSummary: 'Holiday metadata updated; timetable cascade recommended.',
      };

    case CalendarAuditAction.DayDeleted:
      return {
        timetablesAffected: 34,
        lecturesAffected: 34,
        examsAffected: 2,
        studentsAffected: 480,
        staffAffected: 32,
        transportRoutesAffected: 12,
        hostelActivitiesAffected: 18,
        notificationsTriggered: true,
        impactSummary: 'Calendar day removed — downstream schedules require review.',
      };

    case CalendarAuditAction.EmergencyClosureDeclared:
      return {
        workingDaysAffected: 1,
        timetablesAffected: 14,
        lecturesAffected: 42,
        examsAffected: 1,
        assignmentsAffected: 5,
        studentsAffected: 480,
        staffAffected: 32,
        transportRoutesAffected: 12,
        hostelActivitiesAffected: 18,
        notificationsTriggered: true,
        impactSummary: 'Emergency closure affects all scheduled academic activities for the day.',
      };

    case CalendarAuditAction.ImpactResolved:
      return {
        impactSummary: 'Pending impact manually resolved.',
      };

    case CalendarAuditAction.OverrideApplied:
      return {
        impactSummary: 'Manual override applied to calendar rule.',
      };

    default:
      return { impactSummary: 'No academic impact recorded.' };
  }
};
