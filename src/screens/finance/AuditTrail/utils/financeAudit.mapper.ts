import type { FinanceAuditEvent } from 'src/redux/finance/audit/financeAuditApi';

import { FinanceAuditAction, FinanceAuditSubModule } from 'src/enums/financeAudit.enum';
import {
  formatFinancePolicyVersionValue,
  policyVersionValuesEqual,
} from '../../policies/components/version/finance-policy-version-formatters';

import type { FinanceAuditLog } from '../types/financeAudit.types';

const SUB_MODULE_CODE_MAP: Record<string, FinanceAuditSubModule | string> = {
  collections: FinanceAuditSubModule.COLLECTIONS,
  charges: FinanceAuditSubModule.CHARGES,
  refunds: FinanceAuditSubModule.REFUNDS,
  invoice_receipts: FinanceAuditSubModule.INVOICE_RECEIPTS,
  concessions: FinanceAuditSubModule.CONCESSIONS,
  reconciliation: FinanceAuditSubModule.RECONCILIATION,
  income_tracking: FinanceAuditSubModule.INCOME_TRACKING,
  expense_tracking: FinanceAuditSubModule.EXPENSE_TRACKING,
  adjustments: FinanceAuditSubModule.ADJUSTMENTS,
};

const ACTION_MAP: Record<string, FinanceAuditAction | string> = {
  payment: FinanceAuditAction.PAYMENT,
  create: FinanceAuditAction.CREATE,
  update: FinanceAuditAction.UPDATE,
  delete: FinanceAuditAction.DELETE,
  approve: FinanceAuditAction.APPROVE,
  reject: FinanceAuditAction.REJECT,
  refund: FinanceAuditAction.REFUND,
  adjustment: FinanceAuditAction.ADJUSTMENT,
  generate_receipt: FinanceAuditAction.GENERATE_RECEIPT,
  add_charge: FinanceAuditAction.ADD_CHARGE,
  remove_charge: FinanceAuditAction.REMOVE_CHARGE,
};

function foldChangedFields(changedFields: FinanceAuditEvent['changedFields']): {
  beforeData: Record<string, unknown>;
  afterData: Record<string, unknown>;
} {
  const beforeData: Record<string, unknown> = {};
  const afterData: Record<string, unknown> = {};
  changedFields.forEach((f) => {
    const key = f.field;
    if (key.replace(/[\s_-]/g, '').toLowerCase() === 'applyon') {
      if (policyVersionValuesEqual(key, f.oldValue, f.newValue)) return;
      if (f.oldValue != null && f.oldValue !== '')
        beforeData[key] = formatFinancePolicyVersionValue(key, f.oldValue).text;
      if (f.newValue != null && f.newValue !== '')
        afterData[key] = formatFinancePolicyVersionValue(key, f.newValue).text;
      return;
    }
    if (f.oldValue != null && f.oldValue !== '') beforeData[key] = f.oldValue;
    if (f.newValue != null && f.newValue !== '') afterData[key] = f.newValue;
  });
  return { beforeData, afterData };
}

export function mapSubModuleCodeToFilterValue(code: string): string {
  const mapped = SUB_MODULE_CODE_MAP[code?.toLowerCase()];
  return typeof mapped === 'string' ? mapped : code;
}

export function mapSubModuleFilterToApiCode(subModule: string): string | undefined {
  if (!subModule || subModule === 'All Modules') return undefined;
  const entry = Object.entries(SUB_MODULE_CODE_MAP).find(([, v]) => v === subModule);
  return entry?.[0];
}

export function mapActionFilterToApiCode(action: string): string | undefined {
  if (!action || action === 'All Actions') return undefined;
  const entry = Object.entries(ACTION_MAP).find(([, v]) => v === action);
  return entry?.[0] ?? action.toLowerCase();
}

export function mapFinanceAuditEventDtoToLog(dto: FinanceAuditEvent): FinanceAuditLog {
  const { beforeData, afterData } = foldChangedFields(dto.changedFields ?? []);
  const subModule =
    SUB_MODULE_CODE_MAP[dto.subModuleCode?.toLowerCase()] ??
    dto.subModuleDisplayName ??
    dto.subModuleCode;
  const action =
    ACTION_MAP[dto.action?.toLowerCase()] ?? dto.actionLabel ?? dto.action?.toUpperCase();

  return {
    id: dto.id,
    subModule,
    action,
    description: dto.summary,
    studentName: dto.studentNameSnapshot ?? undefined,
    studentId: dto.studentId ?? undefined,
    studentGrNo: dto.studentGrNoSnapshot ?? undefined,
    studentRollNo: dto.studentRollNoSnapshot ?? undefined,
    performedBy: dto.actorDisplayName || dto.actorNameSnapshot || 'System',
    performedByRole: dto.performedByRoleSnapshot ?? undefined,
    beforeData: Object.keys(beforeData).length ? beforeData : undefined,
    afterData: Object.keys(afterData).length ? afterData : undefined,
    createdAt: dto.occurredAt,
    createdAtDisplay: dto.occurredAtDisplay || undefined,
    remarks: dto.reason ?? undefined,
    entityType: dto.entityType,
    entityId: dto.entityId,
    correlationId: dto.correlationId ?? undefined,
    academicYearId: dto.academicYearId ?? undefined,
    contextJson: dto.contextJson ?? undefined,
  };
}

export function mapFinanceAuditEventsToLogs(events: FinanceAuditEvent[]): FinanceAuditLog[] {
  return events.map(mapFinanceAuditEventDtoToLog);
}
