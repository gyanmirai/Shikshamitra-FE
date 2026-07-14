import dayjs from 'dayjs';

import { IMPACT_LABELS } from '../constants/auditLogs.constants';
import { type AuditLog, AuditImpactLevel, type AuditLogImpact } from '../types/auditLogs.types';

/** Friendly timestamp like "Today, 06:19 AM" with full tooltip value. */
export const formatAuditTimestamp = (iso: string) => {
  const d = dayjs(iso);
  const now = dayjs();
  const isToday = d.isSame(now, 'day');
  const isYesterday = d.isSame(now.subtract(1, 'day'), 'day');

  let label: string;
  if (isToday) {
    label = `Today, ${d.format('hh:mm A')}`;
  } else if (isYesterday) {
    label = `Yesterday, ${d.format('hh:mm A')}`;
  } else {
    label = d.format('DD MMM YYYY, hh:mm A');
  }

  return {
    label,
    full: d.format('DD MMM YYYY, hh:mm:ss A'),
    short: d.format('hh:mm A'),
    date: d.format('DD MMM YYYY'),
    relative: humanizeRelative(d),
  };
};

/** Quick "x minutes ago" style relative time. */
export const humanizeRelative = (d: dayjs.Dayjs) => {
  const now = dayjs();
  const diffMin = now.diff(d, 'minute');
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = now.diff(d, 'hour');
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = now.diff(d, 'day');
  if (diffDay < 30) return `${diffDay}d ago`;
  return d.format('DD MMM YYYY');
};

/** Initials for avatar chips. */
export const getUserInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/** Determine the impact level for an impact payload. */
export const deriveImpactLevel = (impact?: AuditLogImpact): AuditImpactLevel => {
  if (!impact) return AuditImpactLevel.None;
  const weighted =
    (impact.examsAffected ?? 0) +
    (impact.lecturesAffected ?? 0) +
    (impact.timetablesAffected ?? 0) +
    (impact.studentsAffected ?? 0) / 10 +
    (impact.workingDaysAffected ?? 0) * 5;
  if (weighted <= 0) return AuditImpactLevel.None;
  if (weighted < 5) return AuditImpactLevel.Minor;
  if (weighted < 30) return AuditImpactLevel.Academic;
  return AuditImpactLevel.High;
};

/** One-line impact summary like "1 working day · 32 lectures affected". */
export const summarizeImpact = (impact?: AuditLogImpact): string => {
  if (!impact) return 'No academic impact';
  const parts: string[] = [];
  if (impact.workingDaysAffected)
    parts.push(
      `${impact.workingDaysAffected} working day${impact.workingDaysAffected > 1 ? 's' : ''}`
    );
  if (impact.holidaysAffected)
    parts.push(
      `${impact.holidaysAffected} holiday change${impact.holidaysAffected > 1 ? 's' : ''}`
    );
  if (impact.eventsAffected)
    parts.push(`${impact.eventsAffected} event${impact.eventsAffected > 1 ? 's' : ''}`);
  if (impact.timetablesAffected)
    parts.push(`${impact.timetablesAffected} timetable${impact.timetablesAffected > 1 ? 's' : ''}`);
  if (impact.lecturesAffected)
    parts.push(`${impact.lecturesAffected} lecture${impact.lecturesAffected > 1 ? 's' : ''}`);
  if (impact.examsAffected)
    parts.push(`${impact.examsAffected} exam${impact.examsAffected > 1 ? 's' : ''}`);
  if (impact.assignmentsAffected)
    parts.push(
      `${impact.assignmentsAffected} assignment${impact.assignmentsAffected > 1 ? 's' : ''}`
    );
  if (impact.studentsAffected)
    parts.push(`${impact.studentsAffected} student${impact.studentsAffected > 1 ? 's' : ''}`);
  if (impact.staffAffected) parts.push(`${impact.staffAffected} staff`);
  if (impact.transportRoutesAffected)
    parts.push(
      `${impact.transportRoutesAffected} transport route${impact.transportRoutesAffected > 1 ? 's' : ''}`
    );
  if (impact.hostelActivitiesAffected)
    parts.push(
      `${impact.hostelActivitiesAffected} hostel activit${impact.hostelActivitiesAffected > 1 ? 'ies' : 'y'}`
    );
  return parts.length ? `${parts.join(' · ')} affected` : 'No academic impact';
};

export const impactLevelLabel = (level: AuditImpactLevel) => IMPACT_LABELS[level];

/** Truncate text with ellipsis. */
export const truncate = (text: string, max = 60) =>
  text.length > max ? `${text.slice(0, max)}…` : text;

/** Convert a list of audit logs into date buckets for timeline/analytics. */
export const groupLogsByDate = (logs: AuditLog[]) => {
  const map = new Map<string, AuditLog[]>();
  logs.forEach((log) => {
    const key = dayjs(log.timestamp).format('YYYY-MM-DD');
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(log);
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => (a < b ? 1 : -1))
    .map(([date, items]) => ({
      date,
      label: dayjs(date).format('DD MMM YYYY'),
      items: items.sort((a, b) => (a.timestamp < b.timestamp ? 1 : -1)),
    }));
};
