import type { AuditLog, AuditFilterState } from '../types/auditLogs.types';

export function matchesAuditFilters(log: AuditLog, filters: AuditFilterState, now = new Date()) {
  const search = filters.search.trim().toLowerCase();
  const text = [
    log.actionLabel,
    log.entityName,
    log.entityType,
    log.changedByName,
    log.changedByRole,
    log.reason,
    log.metadata?.ipAddress,
    log.metadata?.device,
    log.metadata?.browser,
    ...(log.diff?.map((field) => field.fieldName) ?? []),
  ]
    .join(' ')
    .toLowerCase();
  if (search && !text.includes(search)) return false;
  if (filters.action && String(log.action) !== filters.action) return false;
  if (filters.entityType && log.entityType !== filters.entityType) return false;
  if (
    filters.changedByRole &&
    log.changedByRole?.toLowerCase() !== filters.changedByRole.toLowerCase()
  )
    return false;
  if (filters.changedByUserId && log.changedByUserId !== filters.changedByUserId) return false;
  if (filters.impactLevel && String(log.impactLevel) !== filters.impactLevel) return false;
  if (filters.hasDiff && log.hasDiff !== (filters.hasDiff === 'true')) return false;
  if (
    filters.reasonAvailable &&
    Boolean(log.reason?.trim()) !== (filters.reasonAvailable === 'true')
  )
    return false;
  if (filters.approvalStatus && String(log.approvalStatus) !== filters.approvalStatus) return false;
  if (filters.entityId && log.entityId !== filters.entityId.trim()) return false;
  if (!filters.dateRange) return true;

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  switch (filters.dateRange) {
    case 'yesterday':
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
      break;
    case 'last7':
      start.setDate(start.getDate() - 6);
      break;
    case 'last30':
      start.setDate(start.getDate() - 29);
      break;
    case 'thisMonth':
      start.setDate(1);
      break;
    case 'custom': {
      if (!filters.fromDate || !filters.toDate) return false;
      const from = new Date(`${filters.fromDate}T00:00:00`);
      const to = new Date(`${filters.toDate}T00:00:00`);
      to.setDate(to.getDate() + 1);
      const timestamp = new Date(log.timestamp);
      return timestamp >= from && timestamp < to;
    }
    default:
      break;
  }
  const timestamp = new Date(log.timestamp);
  return timestamp >= start && timestamp < end;
}
