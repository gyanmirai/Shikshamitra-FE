// ─── Audit Intelligence Types ─────────────────────────────────────────────────

import type { CalendarAuditAction } from 'src/enums/academic-calendar';

/** Risk level assigned to an audit event. */
export enum AuditRiskLevel {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4,
}

/** Impact magnitude for an audit event. */
export enum AuditImpactLevel {
  None = 0,
  Minor = 1,
  Academic = 2,
  High = 3,
}

/** Source/channel that produced an audit event. */
export enum AuditSource {
  Web = 1,
  Mobile = 2,
  API = 3,
  BulkUpload = 4,
  SystemJob = 5,
}

/** Approval lifecycle state for sensitive changes. */
export enum AuditApprovalStatus {
  NotRequired = 0,
  PendingApproval = 1,
  Approved = 2,
  Rejected = 3,
  AutoApproved = 4,
}

/** Diff change categories. */
export type AuditDiffChangeType = 'added' | 'updated' | 'removed' | 'unchanged';

/** A single field-level change inside an audit log. */
export interface AuditLogDiff {
  fieldName: string;
  displayName: string;
  oldValue: string | null;
  newValue: string | null;
  changeType: AuditDiffChangeType;
  dataType?: 'string' | 'number' | 'date' | 'boolean';
  sortOrder?: number;
}

/** Quantified academic impact for a change. */
export interface AuditLogImpact {
  workingDaysAffected?: number;
  holidaysAffected?: number;
  eventsAffected?: number;
  timetablesAffected?: number;
  lecturesAffected?: number;
  examsAffected?: number;
  assignmentsAffected?: number;
  studentsAffected?: number;
  staffAffected?: number;
  transportRoutesAffected?: number;
  hostelActivitiesAffected?: number;
  notificationsTriggered?: boolean;
  impactSummary?: string;
}

/** Technical metadata captured for the action. */
export interface AuditLogMetadata {
  ipAddress?: string;
  device?: string;
  browser?: string;
  operatingSystem?: string;
  sessionId?: string;
  userAgent?: string;
  requestPath?: string;
  httpMethod?: string;
  apiVersion?: string;
}

/** Approval trail entry for sensitive changes. */
export interface AuditLogApprovalStep {
  step: string;
  actor?: string;
  actorRole?: string;
  timestamp?: string;
  note?: string;
  status: 'done' | 'pending' | 'rejected';
}

/** Review note attached to an audit log. */
export interface AuditReviewNote {
  id: string;
  note: string;
  createdBy: string;
  createdByRole?: string;
  createdAt: string;
}

/** Related entity cross-reference. */
export interface AuditRelatedRecord {
  type: string;
  name: string;
  href?: string;
}

/** The core audit log record (front-end model). */
export interface AuditLog {
  id: string;
  module: string;
  subModule?: string;
  entityType?: string | null;
  entityId?: string;
  entityName?: string | null;
  action: CalendarAuditAction;
  actionLabel: string;
  reason?: string | null;
  riskLevel?: AuditRiskLevel;
  riskReason?: string;
  impactLevel?: AuditImpactLevel;
  impact?: AuditLogImpact;
  approvalStatus?: AuditApprovalStatus;
  source?: AuditSource;
  changedByUserId: string;
  changedByName?: string | null;
  changedByRole?: string | null;
  changedByEmail?: string;
  timestamp: string;
  createdAt?: string;
  correlationId?: string;
  bulkOperationId?: string;
  hasDiff: boolean;
  isRollbackAvailable?: boolean;
  diff?: AuditLogDiff[];
  metadata?: AuditLogMetadata;
  approvalTrail?: AuditLogApprovalStep[];
  reviewNotes?: AuditReviewNote[];
  relatedRecords?: AuditRelatedRecord[];
}

/** Summary KPI payload. */
export interface AuditSummary {
  totalAuditEvents: number;
  changesThisWeek: number;
  changesLastWeek?: number;
  criticalChanges: number;
  mostActiveUser?: {
    userId: string;
    name: string;
    role?: string;
    actionCount: number;
  };
  lastSyncedAt?: string;
}

/** Smart filter state shared across views. */
export interface AuditFilterState {
  search: string;
  action: string;
  changedByUserId: string;
  changedByRole: string;
  impactLevel: string;
  source: string;
  entityType: string;
  entityId: string;
  hasDiff: string;
  reasonAvailable: string;
  approvalStatus: string;
  dateRange: 'today' | 'yesterday' | 'last7' | 'last30' | 'thisMonth' | 'custom' | '';
  fromDate?: string;
  toDate?: string;
}

/** Saved filter preset. */
export interface SavedAuditFilter {
  id: string;
  name: string;
  filters: AuditFilterState;
}

/** AI generated explanation payload (mock contract). */
export interface AuditAIExplanation {
  text: string;
  riskLevel?: AuditRiskLevel;
  riskReason?: string;
  suggestedActions?: string[];
}

/** Result of natural-language search conversion. */
export interface AuditAISearchResult {
  filters: Partial<AuditFilterState>;
  explanation: string;
}

export type AuditView = 'table' | 'timeline' | 'analytics';
