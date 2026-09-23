import type { StructurePreview, StructureSettings } from 'src/redux/finance/feeStructureWorkspace';

import { it, expect } from 'vitest';

import { policyImpactRows } from './policyImpactModel';
import { structureCandidate } from './feeStructureModel';

const candidate = structureCandidate({
  collectionPolicyId: 'collection',
  collectionPolicyVersionId: 'v1',
  concessionPolicyId: 'concession',
  concessionPolicyVersionId: 'v1',
  refundPolicyId: 'refund',
  refundPolicyVersionId: 'v1',
  prorationPolicyId: 'proration',
  prorationPolicyVersionId: 'v1',
  concessionFeeHeadScope: 'SelectedFeeHeads',
  concessionApplicableFeeHeadIds: ['tuition'],
  feeHeads: ['tuition', 'bus'].map((feeHeadId) => ({
    feeHeadId,
    feeHeadName: feeHeadId,
    amount: 100,
    isOneTime: false,
    isOptional: false,
    payableMonth: 0,
    payableYear: 0,
    paymentTermId: null,
    paymentTermVersionId: null,
    scheduleMode: 'Inherited',
    installmentOverrides: [],
  })),
});
const settings: StructureSettings = {
  academicYearId: 'year',
  academicYearName: '2026',
  className: 'Class 5',
  boardId: 'board',
  startDate: '',
  endDate: '',
  policies: [],
  terms: [],
  permissions: {},
  heads: [
    { id: 'tuition', name: 'Tuition', categoryName: '', isConcessionApplied: true },
    { id: 'bus', name: 'Bus', categoryName: '', isConcessionApplied: false },
  ],
};

it('inherits waiver coverage from late-fee heads and never adds policy-only heads', () => {
  const rows = policyImpactRows('collection', candidate, settings, {
    id: 'collection',
    currentVersionId: 'v1',
    enableLateFee: true,
    enableWaiver: true,
    lateFeeApplyOnFeeHeads: ['tuition', 'other'],
  });
  expect(rows?.map((row) => row.treatment)).toEqual([
    'Late fee applies; waiver eligible',
    'No late fee',
  ]);
  expect(rows).toHaveLength(2);
});

it('updates concession coverage from the unsaved selected scope and head capability', () => {
  const data = { id: 'concession', currentVersionId: 'v1' };
  expect(
    policyImpactRows('concession', candidate, settings, data)?.map((row) => row.treatment)
  ).toEqual(['Eligible on approval', 'Not eligible']);
  expect(
    policyImpactRows(
      'concession',
      { ...candidate, concessionApplicableFeeHeadIds: ['bus'] },
      settings,
      data
    )?.map((row) => row.treatment)
  ).toEqual(['Not eligible', 'Not eligible']);
});

it('shows selected refund heads and full-charge fallback without computing amounts', () => {
  expect(
    policyImpactRows('refund', candidate, settings, {
      id: 'refund',
      currentVersionId: 'v1',
      feeHeadScope: 'SelectedFeeHeads',
      applicableFeeHeadIds: ['bus'],
    })?.map((row) => row.treatment)
  ).toEqual(['Excluded', 'Policy eligible']);
  expect(
    policyImpactRows('proration', candidate, settings, {
      id: 'proration',
      currentVersionId: 'v1',
      feeHeadRules: [{ feeHeadId: 'bus', ruleType: 'Daily', roundingMode: 'Currency' }],
    })?.map((row) => row.treatment)
  ).toEqual(['Full charge', 'Daily']);
});

it('never interprets missing data or a newer version as no coverage', () => {
  expect(
    policyImpactRows('collection', candidate, settings, {
      id: 'collection',
      currentVersionId: 'v1',
    })
  ).toBeUndefined();
  expect(
    policyImpactRows('concession', candidate, settings, {
      id: 'concession',
      currentVersionId: 'v2',
    })
  ).toBeUndefined();
  expect(
    policyImpactRows(
      'concession',
      candidate,
      { ...settings, heads: [] },
      { id: 'concession', currentVersionId: 'v1' }
    )
  ).toBeUndefined();
});

it('uses saved publication evidence even when the current master differs', () => {
  const review: StructurePreview = {
    candidate,
    isReady: true,
    errors: [],
    warnings: [],
    schedules: [],
    coverage: [
      {
        feeHeadId: 'tuition',
        name: 'Historical tuition',
        collection: '',
        concession: 'Eligible on approval',
        proration: '',
        refund: '',
        accounting: '',
      },
    ],
  };
  expect(
    policyImpactRows(
      'concession',
      candidate,
      settings,
      { id: 'concession', currentVersionId: 'v2' },
      review,
      true
    )
  ).toEqual([{ id: 'tuition', name: 'Historical tuition', treatment: 'Eligible on approval' }]);
  expect(
    policyImpactRows(
      'concession',
      candidate,
      settings,
      { id: 'concession', currentVersionId: 'v1' },
      undefined,
      true
    )
  ).toBeUndefined();
});
