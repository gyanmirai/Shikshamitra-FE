import type {
  StructureCandidate,
  StructureSettings,
} from 'src/redux/finance/feeStructureWorkspace';

import { it, expect } from 'vitest';

import { policyImpactRows } from './policyImpactModel';

const candidate = {
  collectionPolicyId: 'policy',
  collectionPolicyVersionId: 'version',
  feeHeads: [{ feeHeadId: 'tuition' }, { feeHeadId: 'transport' }],
} as unknown as StructureCandidate;
const settings = { heads: [] } as unknown as StructureSettings;

it('covers every structure fee with a common late-fee rule and no selected heads', () => {
  const rows = policyImpactRows('collection', candidate, settings, {
    id: 'policy',
    currentVersionId: 'version',
    enableLateFee: true,
    applyLateFeeToAllFeeHeads: true,
    lateFeeApplyOnFeeHeads: [],
  });
  expect(rows?.map((row) => row.treatment)).toEqual(['Late fee applies', 'Late fee applies']);
});

it('preserves saved selected-head coverage for an unmarked legacy version', () => {
  const rows = policyImpactRows('collection', candidate, settings, {
    id: 'policy',
    currentVersionId: 'version',
    enableLateFee: true,
    lateFeeApplyOnFeeHeads: ['tuition'],
  });
  expect(rows?.map((row) => row.treatment)).toEqual(['Late fee applies', 'No late fee']);
});
