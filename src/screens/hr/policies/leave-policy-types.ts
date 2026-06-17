export type LeavePaidType = 'Paid' | 'Unpaid';
export type LeaveEntitlementMode = 'Limited' | 'Unlimited';
export type LeaveAccrualPolicyType = 'Monthly' | 'Yearly';

export type ILeavePolicyRule = {
  id?: string;
  paidType: LeavePaidType | string;
  entitlementMode?: LeaveEntitlementMode | string;
  accrualPolicyType?: LeaveAccrualPolicyType | string;
  leaveCount?: number | null;
  isUnlimited?: boolean;
  carryForward?: boolean;
  carryForwardLimit?: number | null;
  encashmentAllowed?: boolean;
  encashmentTiming?: string | null;
  requiresApproval?: boolean;
  minNoticeDays?: number | null;
  maxDaysPerRequest?: number | null;
  allowHalfDay?: boolean;
  attachmentRequiredAfterDays?: number | null;
  allowNegativeBalance?: boolean;
  isActive?: boolean;
};

export type ILeavePolicy = {
  id?: string;
  academicYearId?: string;
  policyTitle?: string;
  title?: string;
  name?: string;
  status?: string;
  effectiveFrom?: string | Date | null;
  effectiveTo?: string | Date | null;
  isDefault?: boolean;
  description?: string | null;
  ruleCount?: number;
  rules?: ILeavePolicyRule[];
  isDeleted?: boolean;
  isActive?: boolean;
  deletionTime?: string | null;
  creationTime?: string | null;
  lastModificationTime?: string | null;
};
