import type { FinanceAuditAction, FinanceAuditSubModule } from 'src/enums/financeAudit.enum';

export interface FinanceAuditLog {
  id: string;
  subModule: FinanceAuditSubModule | string;
  action: FinanceAuditAction | string;
  description: string;
  studentName?: string;
  studentId?: string;
  studentGrNo?: string;
  studentRollNo?: string;
  performedBy: string;
  performedByRole?: string;
  performedByAvatar?: string;
  beforeData?: Record<string, any>;
  afterData?: Record<string, any>;
  createdAt: string;
  ipAddress?: string;
  device?: string;
  remarks?: string;
}

export interface AuditFilterValues {
  startDate: string | null;
  endDate: string | null;
  studentId: string;
  subModule: string;
  search: string;
}
