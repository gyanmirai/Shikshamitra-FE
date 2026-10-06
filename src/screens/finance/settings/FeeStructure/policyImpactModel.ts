import type {
  IRefundPolicy,
  ICollectionPolicy,
} from 'src/screens/finance/policies/types/finance-policy.types';
import type {
  PolicyFamily,
  StructurePreview,
  StructureSettings,
  StructureCandidate,
} from 'src/redux/finance/feeStructureWorkspace';

// Presentation only: projects already-loaded relationships, never calculates money.
export type ImpactPolicyData = Partial<
  Pick<
    ICollectionPolicy,
    | 'id'
    | 'currentVersionId'
    | 'description'
    | 'enableLateFee'
    | 'lateFeeApplyOnFeeHeads'
  > &
    Pick<IRefundPolicy, 'feeHeadScope' | 'applicableFeeHeadIds'>
>;

export interface PolicyImpactRow {
  id: string;
  name: string;
  treatment: string;
}

export function policyImpactRows(
  family: PolicyFamily,
  candidate: StructureCandidate,
  settings: StructureSettings,
  policy?: ImpactPolicyData,
  review?: StructurePreview,
  locked = false
): PolicyImpactRow[] | undefined {
  const version = candidate[`${family}PolicyVersionId`];
  if (!version) return undefined;

  // Saved publication evidence takes precedence over today's mutable catalogs.
  if (review && review.candidate[`${family}PolicyVersionId`] === version) {
    return review.coverage.map((row) => ({
      id: row.feeHeadId,
      name: row.name,
      treatment: row[family],
    }));
  }
  if (
    locked ||
    policy?.id !== candidate[`${family}PolicyId`] ||
    policy?.currentVersionId !== version
  )
    return undefined;

  if (
    family === 'collection' &&
    (typeof policy.enableLateFee !== 'boolean' || !Array.isArray(policy.lateFeeApplyOnFeeHeads))
  )
    return undefined;
  if (
    family === 'refund' &&
    ((policy.feeHeadScope !== 'AllFeeHeads' && policy.feeHeadScope !== 'SelectedFeeHeads') ||
      !Array.isArray(policy.applicableFeeHeadIds))
  )
    return undefined;
  if (
    family === 'concession' &&
    candidate.feeHeads.some(
      (line) =>
        typeof settings.heads.find((head) => head.id === line.feeHeadId)?.isConcessionApplied !==
        'boolean'
    )
  )
    return undefined;

  return candidate.feeHeads.map((line) => {
    const head = settings.heads.find((item) => item.id === line.feeHeadId);
    let treatment: string;
    switch (family) {
      case 'collection': {
        const late =
          policy.enableLateFee && policy.lateFeeApplyOnFeeHeads?.includes(line.feeHeadId);
        treatment = late ? 'Late fee applies' : 'No late fee';
        break;
      }
      case 'concession':
        treatment =
          head?.isConcessionApplied &&
          (candidate.concessionFeeHeadScope === 'EntireFeeStructure' ||
            candidate.concessionApplicableFeeHeadIds.includes(line.feeHeadId))
            ? 'Eligible on approval'
            : 'Not eligible';
        break;
      default:
        treatment =
          policy.feeHeadScope === 'AllFeeHeads' ||
          policy.applicableFeeHeadIds?.includes(line.feeHeadId)
            ? 'Policy eligible'
            : 'Excluded';
    }
    return {
      id: line.feeHeadId,
      name: line.feeHeadName || head?.name || 'Fee head name unavailable',
      treatment,
    };
  });
}
