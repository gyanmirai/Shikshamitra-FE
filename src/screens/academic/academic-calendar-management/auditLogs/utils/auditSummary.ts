import { CalendarAuditAction } from 'src/enums/academic-calendar';

import type { AuditLog } from '../types/auditLogs.types';

export function buildAuditSummary(logs: AuditLog[]) {
  const high = logs.filter((log) => (log.riskLevel ?? 0) >= 3).length;
  const workingDayImpacts = logs.filter((log) => (log.impact?.workingDaysAffected ?? 0) > 0).length;
  const publishedMods = logs.filter(
    (log) => log.action === CalendarAuditAction.CalendarPublished
  ).length;
  const suggestedActions: string[] = [];
  const riskText = logs.some((log) => log.riskLevel != null)
    ? `High risk: ${high} of ${logs.filter((log) => log.riskLevel != null).length} assessed changes.`
    : 'Risk assessment not recorded.';
  const impactText = logs.some((log) => log.impact != null)
    ? `Working days affected: ${workingDayImpacts} of ${logs.filter((log) => log.impact != null).length} assessed changes.`
    : 'Impact not recorded.';
  if (high) suggestedActions.push('Review the recorded reasons for high-risk changes.');
  if (workingDayImpacts)
    suggestedActions.push('Review timetable impacts for changes to working days.');
  if (publishedMods) suggestedActions.push('Review the recorded changes to published calendars.');
  return {
    text: logs.length
      ? `The loaded results contain ${logs.length} calendar ${logs.length === 1 ? 'change' : 'changes'}. ${riskText} ${impactText} Calendar publications: ${publishedMods}. This summary covers the loaded results only.`
      : 'No audit records are available in the current results. Change the filters or page to review other records.',
    suggestedActions,
  };
}
