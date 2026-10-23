import { CalendarAuditAction } from 'src/enums/academic-calendar';

import { detectRiskLevel } from '../utils/auditRisk.utils';
import { estimateImpact } from '../utils/auditImpact.utils';
import { deriveImpactLevel } from '../utils/auditFormatters';
import {
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
