/** Finance-owned calculation output; Student screens never choose rules or calculate totals. */
export type FeeProrationResult = {
  policyId?: string;
  policyVersionId?: string;
  policyName: string;
  policyVersion: number;
  joiningDate: string;
  chargeStartDate: string;
  chargeEndDate: string;
  scheduledAmount: number;
  admissionReduction: number;
  withdrawalCredit: number;
  payableAmount: number;
  excessPaidAmount: number;
  explanations: string[];
};
