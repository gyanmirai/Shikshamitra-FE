import { CalendarAuditAction } from 'src/enums/academic-calendar';

import { detectRiskLevel } from '../utils/auditRisk.utils';
import { estimateImpact } from '../utils/auditImpact.utils';
import { deriveImpactLevel } from '../utils/auditFormatters';
import {
  AuditSource,
  type AuditLog,
  AuditRiskLevel,
  type AuditLogDiff,
  AuditApprovalStatus,
} from '../types/auditLogs.types';

/** Helper to build a rich mock audit log with derived risk/impact. */
const build = (
  log: Partial<AuditLog> & {
    id: string;
    action: CalendarAuditAction;
    entityName: string;
    changedByName: string;
    changedByRole: string;
    timestamp: string;
  }
): AuditLog => {
  const riskLevel = log.riskLevel ?? detectRiskLevel(log.action);
  const impact = log.impact ?? estimateImpact(log.action, log.entityName);
  const impactLevel = log.impactLevel ?? deriveImpactLevel(impact);
  const actionLabel =
    log.actionLabel ??
    (
      {
        [CalendarAuditAction.CalendarCreated]: 'Calendar Created',
        [CalendarAuditAction.CalendarUpdated]: 'Calendar Updated',
        [CalendarAuditAction.CalendarPublished]: 'Calendar Published',
        [CalendarAuditAction.CalendarArchived]: 'Calendar Archived',
        [CalendarAuditAction.DayAdded]: 'Holiday Added',
        [CalendarAuditAction.DayUpdated]: 'Holiday Updated',
        [CalendarAuditAction.DayDeleted]: 'Holiday Removed',
        [CalendarAuditAction.EmergencyClosureDeclared]: 'Emergency Closure Added',
        [CalendarAuditAction.ImpactResolved]: 'Impact Resolved',
        [CalendarAuditAction.OverrideApplied]: 'Override Applied',
      } as Record<CalendarAuditAction, string>
    )[log.action];

  return {
    module: 'Academic Calendar',
    entityType: 'AcademicCalendar',
    changedByUserId: 'usr-unknown',
    approvalStatus: AuditApprovalStatus.NotRequired,
    source: AuditSource.Web,
    reason: null,
    correlationId: `cor-${log.id}`,
    isRollbackAvailable: false,
    changedByEmail: undefined,
    ...log,
    actionLabel,
    riskLevel,
    impact,
    impactLevel,
    hasDiff: !!(log.diff && log.diff.length),
  } as AuditLog;
};

const diff = (
  rows: Array<[string, string, string | null, string | null, AuditLogDiff['changeType']]>
): AuditLogDiff[] =>
  rows.map(([fieldName, displayName, oldValue, newValue, changeType], i) => ({
    fieldName,
    displayName,
    oldValue,
    newValue,
    changeType,
    sortOrder: i,
    dataType: 'string',
  }));

/** Today + recent timestamps for a realistic timeline. */
const today = (h: number, m: number, offsetDays = 0) => {
  const d = new Date();
  d.setDate(d.getDate() - offsetDays);
  d.setHours(h, m, 0, 0);
  return d.toISOString();
};

// ─── Mock Audit Logs (rich, intelligence-enriched) ────────────────────────────

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  build({
    id: 'a1',
    action: CalendarAuditAction.CalendarCreated,
    entityName: 'Academic Calendar 2026-2027',
    entityType: 'AcademicCalendar',
    changedByName: 'Parth Ghusar',
    changedByRole: 'Admin',
    changedByUserId: 'usr-admin-001',
    changedByEmail: 'parth@shikshamitra.in',
    timestamp: today(6, 19),
    reason: 'Calendar initial creation for CBSE English medium.',
    source: AuditSource.Web,
    metadata: {
      ipAddress: '192.168.1.24',
      device: 'Windows Desktop',
      browser: 'Chrome 124',
      operatingSystem: 'Windows 11',
      sessionId: 'sess-8a91',
      requestPath: '/api/academic/calendars',
      httpMethod: 'POST',
      apiVersion: 'v1',
    },
    diff: diff([
      ['academicYear', 'Academic Year', null, '2026-2027', 'added'],
      ['board', 'Board', null, 'CBSE', 'added'],
      ['medium', 'Medium', null, 'English', 'added'],
      ['workingDays', 'Working Days', null, '220', 'added'],
      ['holidays', 'Holidays', null, '18', 'added'],
      ['events', 'Events', null, '12', 'added'],
    ]),
    relatedRecords: [
      { type: 'Holiday', name: 'Diwali Vacation' },
      { type: 'Event', name: 'Annual Day' },
    ],
  }),

  build({
    id: 'a2',
    action: CalendarAuditAction.DayAdded,
    entityName: 'Holiday: Independence Day',
    entityType: 'Holiday',
    changedByName: 'Parth Ghusar',
    changedByRole: 'Admin',
    changedByUserId: 'usr-admin-001',
    timestamp: today(6, 45),
    reason: 'National holiday added per government calendar.',
    source: AuditSource.Web,
    metadata: {
      ipAddress: '192.168.1.24',
      device: 'Windows Desktop',
      browser: 'Chrome 124',
      sessionId: 'sess-8a91',
    },
    diff: diff([
      ['date', 'Date', null, '2026-08-15', 'added'],
      ['dayType', 'Day Type', null, 'Holiday', 'added'],
      ['title', 'Title', null, 'Independence Day', 'added'],
    ]),
    approvalTrail: [
      {
        step: 'Requested by Admin',
        actor: 'Parth Ghusar',
        actorRole: 'Admin',
        timestamp: today(6, 45),
        status: 'done',
      },
      { step: 'Auto Approved', timestamp: today(6, 45), status: 'done' },
    ],
  }),

  build({
    id: 'a3',
    action: CalendarAuditAction.CalendarPublished,
    entityName: 'Academic Calendar 2026-2027',
    entityType: 'AcademicCalendar',
    changedByName: 'Priya Nair',
    changedByRole: 'Principal',
    changedByUserId: 'usr-principal-001',
    changedByEmail: 'priya@shikshamitra.in',
    timestamp: today(7, 10),
    reason: 'Calendar reviewed and approved for publication.',
    source: AuditSource.Web,
    approvalStatus: AuditApprovalStatus.Approved,
    riskLevel: AuditRiskLevel.High,
    metadata: {
      ipAddress: '10.0.0.12',
      device: 'MacBook Pro',
      browser: 'Safari 17',
      operatingSystem: 'macOS Sonoma',
      sessionId: 'sess-pn-22',
    },
    diff: diff([['status', 'Status', 'Draft', 'Published', 'updated']]),
    approvalTrail: [
      {
        step: 'Requested by Academic Admin',
        actor: 'Parth Ghusar',
        actorRole: 'Admin',
        timestamp: today(7, 5),
        status: 'done',
      },
      { step: 'Pending Principal Approval', timestamp: today(7, 6), status: 'done' },
      {
        step: 'Approved by Principal',
        actor: 'Priya Nair',
        actorRole: 'Principal',
        timestamp: today(7, 10),
        status: 'done',
      },
      { step: 'Applied by System', timestamp: today(7, 10), status: 'done' },
    ],
    reviewNotes: [
      {
        id: 'rn-1',
        note: 'Approved after verifying all holidays are aligned with government calendar.',
        createdBy: 'Priya Nair',
        createdByRole: 'Principal',
        createdAt: today(7, 9),
      },
    ],
    isRollbackAvailable: true,
  }),

  build({
    id: 'a4',
    action: CalendarAuditAction.DayUpdated,
    entityName: 'Holiday: Diwali Vacation',
    entityType: 'Holiday',
    changedByName: 'Parth Ghusar',
    changedByRole: 'Admin',
    changedByUserId: 'usr-admin-001',
    timestamp: today(9, 32, 1),
    reason: 'Updated Diwali dates after government confirmed local holidays.',
    source: AuditSource.Web,
    riskLevel: AuditRiskLevel.Medium,
    metadata: {
      ipAddress: '192.168.1.24',
      device: 'Windows Desktop',
      browser: 'Chrome 124',
      sessionId: 'sess-8a92',
    },
    diff: diff([
      ['date', 'Holiday Date', '2026-11-12', '2026-11-13', 'updated'],
      ['title', 'Holiday Name', 'Diwali', 'Diwali Vacation', 'updated'],
      ['workingDay', 'Working Day', 'Yes', 'No', 'updated'],
    ]),
  }),

  build({
    id: 'a5',
    action: CalendarAuditAction.EmergencyClosureDeclared,
    entityName: 'Emergency Closure: Heavy Rain',
    entityType: 'EmergencyClosure',
    changedByName: 'Priya Nair',
    changedByRole: 'Principal',
    changedByUserId: 'usr-principal-001',
    timestamp: today(5, 45, 2),
    reason: 'Heavy rainfall and local flooding warning issued by municipality.',
    source: AuditSource.Mobile,
    riskLevel: AuditRiskLevel.Critical,
    approvalStatus: AuditApprovalStatus.PendingApproval,
    metadata: {
      ipAddress: '103.21.58.10',
      device: 'iPhone 15',
      browser: 'Safari Mobile',
      operatingSystem: 'iOS 17',
      sessionId: 'sess-pn-mob',
    },
    diff: diff([
      ['date', 'Date', null, '2026-07-04', 'added'],
      ['title', 'Title', null, 'Emergency Closure — Flooding', 'added'],
      ['appliesToAll', 'Applies To Entire School', null, 'Yes', 'added'],
    ]),
    approvalTrail: [
      {
        step: 'Change Requested by Principal',
        actor: 'Priya Nair',
        actorRole: 'Principal',
        timestamp: today(5, 45, 2),
        status: 'done',
      },
      { step: 'Pending Super Admin Approval', status: 'pending' },
    ],
  }),

  build({
    id: 'a6',
    action: CalendarAuditAction.DayDeleted,
    entityName: 'Holiday: Founders Day',
    entityType: 'Holiday',
    changedByName: 'Anjali Mehta',
    changedByRole: 'Academic Admin',
    changedByUserId: 'usr-admin-002',
    timestamp: today(11, 12, 3),
    reason: null,
    source: AuditSource.API,
    riskLevel: AuditRiskLevel.High,
    metadata: {
      ipAddress: '172.16.0.8',
      device: 'Server',
      browser: 'Postman',
      operatingSystem: 'Linux',
      sessionId: 'sess-api-1',
      requestPath: '/api/academic/calendar-days/h-9876',
      httpMethod: 'DELETE',
    },
    diff: diff([
      ['date', 'Date', '2026-09-01', null, 'removed'],
      ['title', 'Title', 'Founders Day', null, 'removed'],
    ]),
  }),

  build({
    id: 'a7',
    action: CalendarAuditAction.OverrideApplied,
    entityName: 'Setting: Working Day Rule',
    entityType: 'Setting',
    changedByName: 'System',
    changedByRole: 'System',
    changedByUserId: 'usr-system',
    timestamp: today(2, 0, 4),
    reason: 'Auto override applied during weekend rule recalculation.',
    source: AuditSource.SystemJob,
    riskLevel: AuditRiskLevel.Medium,
    metadata: {
      device: 'Background Worker',
      operatingSystem: 'Linux',
      requestPath: '/jobs/working-day-recompute',
    },
    diff: diff([['weekendRule', 'Weekend Rule', 'SundayOnly', 'AlternateSaturday', 'updated']]),
  }),

  build({
    id: 'a8',
    action: CalendarAuditAction.ImpactResolved,
    entityName: 'Timetable: Grade 8-A',
    entityType: 'Timetable',
    changedByName: 'Rajesh Sharma',
    changedByRole: 'Teacher',
    changedByUserId: 'usr-teacher-005',
    timestamp: today(16, 30, 5),
    reason: 'Rescheduled lecture to compensate for missed session.',
    source: AuditSource.Web,
    riskLevel: AuditRiskLevel.Low,
    metadata: {
      ipAddress: '192.168.1.55',
      device: 'Android Tablet',
      browser: 'Chrome 124',
      sessionId: 'sess-rs-1',
    },
    diff: diff([
      ['status', 'Status', 'Pending', 'Resolved', 'updated'],
      ['resolutionNote', 'Resolution Note', null, 'Rescheduled to Saturday', 'added'],
    ]),
  }),
];

/** Mock summary used by the KPI cards. */
export const MOCK_SUMMARY = {
  totalAuditEvents: 128,
  changesThisWeek: 24,
  changesLastWeek: 16,
  criticalChanges: 3,
  mostActiveUser: {
    userId: 'usr-admin-001',
    name: 'Parth Ghusar',
    role: 'Admin',
    actionCount: 12,
  },
  lastSyncedAt: new Date().toISOString(),
};

/** Mock analytics aggregations for the analytics view. */
export const buildMockAnalytics = (logs: AuditLog[]) => {
  const byAction = new Map<string, number>();
  const byRisk = new Map<AuditRiskLevel, number>();
  const byUser = new Map<string, { name: string; role: string; count: number }>();
  const byEntity = new Map<string, number>();

  logs.forEach((l) => {
    byAction.set(l.actionLabel, (byAction.get(l.actionLabel) ?? 0) + 1);
    byRisk.set(l.riskLevel, (byRisk.get(l.riskLevel) ?? 0) + 1);
    const u = byUser.get(l.changedByUserId) ?? {
      name: l.changedByName,
      role: l.changedByRole,
      count: 0,
    };
    u.count += 1;
    byUser.set(l.changedByUserId, u);
    byEntity.set(l.entityName, (byEntity.get(l.entityName) ?? 0) + 1);
  });

  return {
    actionDistribution: Array.from(byAction.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count),
    riskDistribution: Array.from(byRisk.entries()).map(([level, count]) => ({ level, count })),
    topUsers: Array.from(byUser.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    topEntities: Array.from(byEntity.entries())
      .map(([label, count]) => ({ label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    criticalCount: logs.filter((l) => l.riskLevel === AuditRiskLevel.Critical).length,
    highRiskCount: logs.filter((l) => l.riskLevel >= AuditRiskLevel.High).length,
    pendingApprovalCount: logs.filter(
      (l) => l.approvalStatus === AuditApprovalStatus.PendingApproval
    ).length,
    suspiciousAlerts: [
      {
        id: 'sa-1',
        severity: 'warning' as const,
        title: 'Rapid consecutive changes',
        message: 'Parth Ghusar made 6 changes within 5 minutes on the published calendar.',
        suggestedAction: 'Review user permissions and verify the changes.',
      },
      {
        id: 'sa-2',
        severity: 'error' as const,
        title: 'Reason missing for sensitive action',
        message: 'Holiday removal (Founders Day) was performed without a reason.',
        suggestedAction: 'Ask the user to add a reason and review the deletion.',
      },
    ],
  };
};
