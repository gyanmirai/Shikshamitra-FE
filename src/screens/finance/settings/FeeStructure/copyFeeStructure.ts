import type {
  StructureRecord,
  StructureCandidate,
  StructureCopyPolicy,
} from 'src/redux/finance/feeStructureWorkspace';

import { structureCandidate } from './feeStructureModel';

/** Preserve schedules and money; a new copy explicitly selects each master's current policy snapshot. */
export function copyStructureCandidate(
  source: StructureRecord,
  name: string,
  policies: StructureCopyPolicy[]
): StructureCandidate {
  const { concurrencyStamp, ...candidate } = structureCandidate(source);
  (['collection', 'refund'] as const).forEach((family) => {
    const id = candidate[`${family}PolicyId`];
    if (!id) return;
    const policy = policies.find((item) => item.family === family && item.policyId === id);
    if (!policy?.currentVersionId || policy.error)
      throw new Error(
        `${family[0].toUpperCase()}${family.slice(1)} Policy: refresh and select an active current version before copying.`
      );
    candidate[`${family}PolicyVersionId`] = policy.currentVersionId;
  });
  return {
    ...candidate,
    // Structure-level concession attachments are retired; requests select their own policy.
    concessionPolicyId: null,
    concessionPolicyVersionId: null,
    concessionFeeHeadScope: 'EntireFeeStructure',
    concessionApplicableFeeHeadIds: [],
    name: name.trim(),
    feeHeads: candidate.feeHeads.map(({ id, ...line }) => line),
  };
}

export function availableCopyName(name: string, existingNames: string[]): string {
  const used = new Set(existingNames.map((item) => item.trim().toLocaleLowerCase()));
  const base = name.trim().slice(0, 256);
  if (!used.has(base.toLocaleLowerCase())) return base;
  let index = 1;
  let candidate: string;
  do {
    const suffix = index === 1 ? ' (copy)' : ` (copy ${index})`;
    candidate = `${base.slice(0, 256 - suffix.length)}${suffix}`;
    index += 1;
  } while (used.has(candidate.toLocaleLowerCase()));
  return candidate;
}
