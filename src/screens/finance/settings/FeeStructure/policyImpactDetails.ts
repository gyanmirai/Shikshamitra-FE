import type { PolicyFamily } from 'src/redux/finance/feeStructureWorkspace';

import { formatNumber } from 'src/utils/formate_number';
import { formatFinancePolicyVersionValue } from 'src/screens/finance/policies/components/version/finance-policy-version-formatters';

import type { PolicyImpactRow, ImpactPolicyData } from './policyImpactModel';

type PolicySnapshot = Record<string, unknown>;

const read = (snapshot: PolicySnapshot, key: string) =>
  snapshot[key] ?? snapshot[key.charAt(0).toUpperCase() + key.slice(1)];

const number = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value) ? value : undefined;

const inr = (value: unknown) =>
  typeof value === 'number' && Number.isFinite(value)
    ? formatNumber(value, 'INR', { fractionDigits: Number.isInteger(value) ? 0 : 2 })
    : undefined;

export function policyImpactSnapshotCoverage(
  family: PolicyFamily,
  policy: PolicySnapshot,
  id: string,
  currentVersionId: string
): ImpactPolicyData | undefined {
  const identity = { id, currentVersionId };
  if (family === 'proration') {
    const rules = read(policy, 'rules');
    if (!Array.isArray(rules)) return undefined;
    const prorationFeeHeadIds = rules.flatMap((rule) => {
      const feeHeadId = rule && typeof rule === 'object' ? read(rule, 'feeHeadId') : null;
      return typeof feeHeadId === 'string' ? [feeHeadId] : [];
    });
    return { ...identity, prorationFeeHeadIds };
  }
  if (family === 'refund') {
    const scope = read(policy, 'feeHeadScope');
    const ids = read(policy, 'applicableFeeHeadIds');
    if (scope === 'AllFeeHeads' || scope === 0)
      return { ...identity, feeHeadScope: 'AllFeeHeads', applicableFeeHeadIds: [] };
    if ((scope === 'SelectedFeeHeads' || scope === 1) && Array.isArray(ids))
      return { ...identity, feeHeadScope: 'SelectedFeeHeads', applicableFeeHeadIds: ids };
  }
  if (family === 'collection') {
    const enableLateFee = read(policy, 'enableLateFee');
    const applyLateFeeToAllFeeHeads = read(policy, 'applyLateFeeToAllFeeHeads') === true;
    const ids = read(policy, 'lateFeeApplyOnFeeHeads');
    if (typeof enableLateFee === 'boolean' && (applyLateFeeToAllFeeHeads || Array.isArray(ids)))
      return {
        ...identity,
        enableLateFee,
        applyLateFeeToAllFeeHeads,
        lateFeeApplyOnFeeHeads: Array.isArray(ids) ? ids : [],
      };
  }
  return undefined;
}

export function policyImpactRowsWithOverrides(
  family: PolicyFamily,
  rows: PolicyImpactRow[] | undefined,
  policy?: PolicySnapshot
) {
  if (!rows || family !== 'collection' || !policy || read(policy, 'applyLateFeeToAllFeeHeads'))
    return rows;
  const overrides = read(policy, 'feeHeadOverrides');
  if (!Array.isArray(overrides)) return rows;
  return rows.map((row) => {
    if (row.treatment !== 'Late fee applies') return row;
    const override = overrides.find(
      (entry) => entry && typeof entry === 'object' && read(entry, 'feeHeadId') === row.id
    );
    if (!override) return row;
    const mode = read(override, 'overrideMode');
    if (mode === 'NoLateFee' || mode === 1) return { ...row, treatment: 'No late fee override' };
    if ((mode === 'CustomRule' || mode === 2) && read(override, 'lateFeeRule'))
      return { ...row, treatment: 'Custom late fee' };
    return row;
  });
}

export function policyImpactRuleFields(family: PolicyFamily, policy: PolicySnapshot) {
  if (family === 'refund') {
    const amountMode = read(policy, 'amountMode');
    const percentage = number(read(policy, 'percentageValue'));
    const fixedAmount = inr(read(policy, 'fixedAmount'));
    const deductionType = read(policy, 'deductionType');
    const deductionPercent = number(read(policy, 'deductionValue'));
    const partial = read(policy, 'allowPartialRefund');
    const amount =
      (amountMode === 'Percentage' || amountMode === 3) && percentage !== undefined
        ? `${percentage}% of the eligible amount`
        : (amountMode === 'FixedAmount' || amountMode === 2) && fixedAmount
          ? fixedAmount
          : amountMode != null
            ? formatFinancePolicyVersionValue('amountMode', amountMode).text
            : undefined;
    const deduction =
      (deductionType === 'Percentage' || deductionType === 2) && deductionPercent !== undefined
        ? `${deductionPercent}% deduction`
        : deductionType === 'FixedAmount' || deductionType === 1
          ? inr(read(policy, 'deductionValue'))
          : deductionType === 'None' || deductionType === 0
            ? 'No deduction'
            : undefined;
    return [
      { label: 'Refund amount rule', value: amount },
      { label: 'Deduction', value: deduction },
      { label: 'Maximum deduction', value: inr(read(policy, 'maximumDeduction')) },
      { label: 'Maximum per request', value: inr(read(policy, 'maximumPerRequest')) },
      { label: 'Maximum per student per year', value: inr(read(policy, 'maximumPerStudentYear')) },
      {
        label: 'Partial refunds',
        value: typeof partial === 'boolean' ? (partial ? 'Allowed' : 'Disabled') : undefined,
      },
    ].filter(({ value }) => value !== undefined);
  }
  if (family !== 'collection' || read(policy, 'enableLateFee') !== true) return [];
  const graceDays = number(read(policy, 'gracePeriodDays'));
  const cutoffDays = number(read(policy, 'maximumChargingDays'));
  const type = read(policy, 'lateFeeType');
  const typeLabel = typeof type === 'string' ? type.replace(/([a-z])([A-Z])/g, '$1 $2') : undefined;
  const rateField = {
    Flat: 'flatAmount',
    PerDay: 'amountPerDay',
    PerWeek: 'amountPerWeek',
    PerMonth: 'amountPerMonth',
  };
  const rate =
    typeof type === 'string' && Object.hasOwn(rateField, type)
      ? inr(read(policy, rateField[type as keyof typeof rateField]))
      : undefined;
  const percentage = number(read(policy, 'percentage'));
  const standardRule =
    rate && typeLabel
      ? `${typeLabel} · ${rate}`
      : (type === 'Percentage' || type === 'Compound') && percentage !== undefined
        ? `${typeLabel} · ${percentage}%`
        : typeLabel;
  return [
    { label: 'Standard late-fee calculation', value: standardRule },
    {
      label: 'Grace period',
      value: graceDays === undefined ? undefined : `${graceDays} calendar days`,
    },
    { label: 'Standard maximum late fee', value: inr(read(policy, 'maximumLateFeeAmount')) },
    {
      label: 'Standard charging cut-off',
      value: cutoffDays === undefined ? undefined : `${cutoffDays} days`,
    },
  ].filter(({ value }) => value !== undefined);
}
