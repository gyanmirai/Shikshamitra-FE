import type { StructureRecord, StructureCandidate } from 'src/redux/finance/feeStructureWorkspace';

import { structureCandidate } from './feeStructureModel';

/** New identities belong to the server; preserve monetary values, pinned versions and overrides. */
export function copyStructureCandidate(source: StructureRecord, name: string): StructureCandidate {
  const { concurrencyStamp, ...candidate } = structureCandidate(source);
  return {
    ...candidate,
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
