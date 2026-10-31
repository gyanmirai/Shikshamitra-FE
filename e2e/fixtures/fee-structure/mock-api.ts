// Browser fixture only. These responses never enter the Next.js application.
import type { StructureRecord, StructureCopyPolicy } from 'src/redux/finance/feeStructureWorkspace';

import { useState } from 'react';

export const useGetStructureContextQuery = 'context';
export const usePreviewStructureMutation = 'preview';
export const copyMode = new URLSearchParams(window.location.search).get('copyPolicy') ?? 'current';
let copyCurrentVersion = ['stale', 'race'].includes(copyMode) ? 2 : 1;
export const copyFixtureStatus = { attempts: 0, created: 0 };
export function useGetStructureCopyPoliciesQuery({ sourceId }: any) {
  const [version, setVersion] = useState(copyCurrentVersion);
  const source = Object.values(fixtureClassRecords)
    .flat()
    .find((item) => item.id === sourceId);
  const currentData: StructureCopyPolicy[] | undefined = source
    ? (['collection', 'concession', 'refund'] as const).flatMap((family) => {
        if (!source[`${family}PolicyId`]) return [];
        const number = family === 'refund' ? version : 1;
        const unavailable = family === 'refund' && copyMode === 'unavailable';
        return [
          {
            family,
            policyId: source[`${family}PolicyId`],
            policyName: `School ${family[0].toUpperCase()}${family.slice(1)}`,
            sourceVersionId: source[`${family}PolicyVersionId`],
            sourceVersionNumber: 1,
            currentVersionId: unavailable ? null : `${family}-v${number}`,
            currentVersionNumber: unavailable ? null : number,
            error: unavailable
              ? 'This policy is inactive. Activate it before copying this structure.'
              : null,
          },
        ];
      })
    : undefined;
  return {
    currentData,
    isFetching: false,
    isError: false,
    refetch: () => setVersion(copyCurrentVersion),
  };
}
export function useSaveStructureDraftMutation() {
  return [
    (args: any) => ({
      unwrap: async () => {
        await new Promise((resolve) => setTimeout(resolve, 300));
        copyFixtureStatus.attempts++;
        if (copyMode === 'race' && copyFixtureStatus.attempts === 1) copyCurrentVersion = 3;
        if (args.standardFeeStructures.refundPolicyVersionId !== `refund-v${copyCurrentVersion}`) {
          window.dispatchEvent(new Event('copy-fixture-state'));
          throw {
            data: {
              error: {
                data: {
                  Errors: [
                    `Refund Policy "School Refund": selected snapshot v${args.standardFeeStructures.refundPolicyVersionId?.split('v').at(-1)}; current active version v${copyCurrentVersion}. Refresh and select the current policy version before copying or attaching it.`,
                  ],
                },
              },
            },
          };
        }
        const existing = Object.values(fixtureClassRecords)
          .flat()
          .find((item) => item.id === args.requestId);
        if (existing) return existing;
        const record = {
          ...structuredClone(args.standardFeeStructures),
          id: args.requestId,
          status: 1,
          revisionRootId: args.requestId,
          revisionNumber: 1,
          concurrencyStamp: 'copied-stamp',
          creationTime: '2026-10-22T10:30:00Z',
        };
        fixtureClassRecords[args.standardId] ??= [];
        fixtureClassRecords[args.standardId].push(record);
        copyFixtureStatus.created++;
        window.dispatchEvent(new Event('copy-fixture-state'));
        return record;
      },
    }),
    { isLoading: false },
  ] as const;
}

export function useGetStructureCopySourcesQuery({ classes }: any) {
  return {
    currentData: classes.flatMap((item: any) =>
      (fixtureClassRecords[item.id] ?? []).map((structure) => ({
        standardId: item.id,
        className: item.name,
        structure,
      }))
    ),
    isLoading: false,
    isFetching: false,
    isError: false,
    refetch: () => {},
  };
}
export const usePublishStructureMutation = 'publish';
export const useReviseStructureMutation = 'revision';
export const useDeleteClassWiseFeeStructureMutation = 'delete';
const installments = [
  {
    sourcePaymentTermInstallmentId: 'first',
    sequence: 1,
    name: 'First term',
    coverageStartDate: '2026-04-01',
    coverageEndDate: '2026-09-30',
    demandDate: '2026-04-10',
    dueDate: '2026-04-10',
    allocationPercentage: 50,
  },
  {
    sourcePaymentTermInstallmentId: 'second',
    sequence: 2,
    name: 'Second term',
    coverageStartDate: '2026-10-01',
    coverageEndDate: '2027-03-31',
    demandDate: '2026-10-10',
    dueDate: '2026-10-10',
    allocationPercentage: 50,
  },
];
const settings = {
  academicYearId: 'year',
  academicYearName: '2026–27',
  className: 'Class 5',
  boardId: 'board',
  startDate: '2026-04-01',
  endDate: '2027-03-31',
  heads: [
    { id: 'tuition', name: 'Tuition Fee', categoryName: 'Academic', isConcessionApplied: true },
    {
      id: 'transport',
      name: 'Transport Fee',
      categoryName: 'Transport',
      isConcessionApplied: false,
    },
    {
      id: 'admission',
      name: 'Admission Fee',
      categoryName: 'Academic',
      isConcessionApplied: false,
    },
    {
      id: 'activity-academic',
      name: 'Activity Fee',
      categoryName: 'Academic',
      isConcessionApplied: false,
    },
    {
      id: 'activity-transport',
      name: 'Activity Fee',
      categoryName: 'Transport',
      isConcessionApplied: false,
    },
  ],
  terms: [
    {
      id: 'annual',
      isDefault: true,
      versionId: 'annual-v2',
      name: 'Two terms',
      versionNumber: 2,
      isCurrent: true,
      demandGenerationRule: 'OnDueDate',
      installments,
    },
  ],
  policies: ['collection', 'concession', 'refund'].flatMap((family) =>
    [true, false].map((isDefault) => ({
      id: isDefault ? family : `${family}-alternate`,
      versionId: isDefault ? `${family}-v1` : `${family}-alternate-v2`,
      family,
      name: `${family[0].toUpperCase()}${family.slice(1)} ${isDefault ? 'Policy' : 'Alternate Policy'}`,
      versionNumber: isDefault ? 1 : 2,
      isCurrent: true,
      isDefault,
    }))
  ),
  permissions: Object.fromEntries(
    [
      'add',
      'edit',
      'delete',
      'publish',
      'collection',
      'concession',
      'refund',
      'collectionRead',
      'concessionRead',
      'refundRead',
      'headsRead',
      'termsRead',
    ].map((key) => [key, true])
  ),
};
export const readyFixture = {
  id: 'saved',
  name: 'Class 5 Annual Fees',
  status: 1,
  revisionRootId: 'saved',
  revisionNumber: 1,
  concurrencyStamp: 'stamp',
  creationTime: '2026-09-09T10:30:00Z',
  saveAsDraft: true,
  collectionPolicyId: 'collection',
  collectionPolicyVersionId: 'collection-v1',
  concessionPolicyId: 'concession',
  concessionPolicyVersionId: 'concession-v1',
  refundPolicyId: 'refund',
  refundPolicyVersionId: 'refund-v1',
  concessionFeeHeadScope: 'EntireFeeStructure' as const,
  concessionApplicableFeeHeadIds: ['tuition'],
  feeHeads: [
    {
      id: 'line',
      feeHeadId: 'tuition',
      feeHeadName: 'Tuition Fee',
      amount: 24000,
      isOneTime: false,
      isOptional: false,
      payableMonth: 0,
      payableYear: 0,
      paymentTermId: 'annual',
      paymentTermVersionId: 'annual-v2',
      paymentTermName: 'Two terms',
      paymentTermVersionNumber: 2,
      scheduleMode: 'Inherited' as const,
      installmentOverrides: [],
    },
  ],
} satisfies StructureRecord;
export const pinnedPolicyFixture = {
  ...readyFixture,
  collectionPolicyId: 'collection-alternate',
  collectionPolicyVersionId: 'collection-alternate-v2',
  refundPolicyId: null,
  refundPolicyVersionId: null,
} satisfies StructureRecord;
export const fixtureClassRecords: Record<string, any[]> = {
  class: [readyFixture, { ...readyFixture, id: 'second', name: 'Class 5 Activity Fees' }],
  other: [{ ...readyFixture, id: 'class-six-fees', name: 'Class 6 Annual Fees' }],
};
export const incompleteHeadsFixture = {
  ...readyFixture,
  feeHeads: [
    {
      ...readyFixture.feeHeads[0],
      amount: null,
      paymentTermId: null,
      paymentTermVersionId: null,
      paymentTermName: undefined,
    },
    {
      ...readyFixture.feeHeads[0],
      id: 'transport-line',
      feeHeadId: 'transport',
      feeHeadName: 'Transport Fee',
      amount: 2500,
      paymentTermId: null,
      paymentTermVersionId: null,
      paymentTermName: undefined,
    },
  ],
} satisfies StructureRecord;
let saved: any = readyFixture;
const preview = (candidate: any) => {
  const errors = [
    !candidate.collectionPolicyId && 'Select an active collection policy.',
    !candidate.feeHeads.length && 'Add at least one Fee Head before publishing.',
    candidate.feeHeads.some((head: any) => !head.paymentTermId) &&
      'Select a published Payment Term for each Fee Head.',
  ].filter(Boolean);
  return {
    candidate,
    isReady: !errors.length,
    errors,
    warnings: new URLSearchParams(window.location.search).has('warnings')
      ? ['Review refund coverage for this fee structure.']
      : [],
    coverage: candidate.feeHeads.map((head: any) => ({
      feeHeadId: head.feeHeadId,
      name: head.feeHeadName,
      collection: 'Late fee applies',
      concession: head.feeHeadId === 'tuition' ? 'Eligible on approval' : 'Not eligible',
      refund: 'Policy eligible',
      accounting: 'Ready',
    })),
    schedules: candidate.feeHeads
      .filter((head: any) => head.paymentTermId)
      .map((head: any) => ({
        feeHeadId: head.feeHeadId,
        feeHeadName: head.feeHeadName,
        paymentTermName: 'Two terms',
        versionNumber: 2,
        annualAmount: head.amount,
        installments: installments.map((line) => ({
          ...line,
          calculatedAmount: head.isVariable ? null : head.amount / 2,
        })),
      })),
    policyLabels: Object.fromEntries(
      settings.policies
        .filter((policy) => policy.id === candidate[`${policy.family}PolicyId`])
        .map((policy) => [policy.family, `${policy.name} · v${policy.versionNumber}`])
    ),
  };
};
export default function useFixtureApi({ type, currentQueryAndMutation: action }: any): any {
  const [loading, setLoading] = useState(false);
  if (type === 'query')
    return {
      data: settings,
      isLoading: false,
      isFetching: false,
      isError: false,
      refetch: () => {},
    };
  return [
    (args: any) => ({
      unwrap: async () => {
        setLoading(true);
        try {
          if (action === 'preview') return preview(args.standardFeeStructures);
          if (action === 'save' || action === useSaveStructureDraftMutation) {
            saved = {
              ...structuredClone(args.standardFeeStructures),
              id: 'saved',
              status: 1,
              revisionNumber: 1,
              revisionRootId: 'saved',
              creationTime: '2026-09-09T10:30:00Z',
              concurrencyStamp: 'stamp',
            };
            return saved;
          }
          if (action === 'publish') {
            saved = { ...saved, status: 0, publicationReview: preview(saved) };
            return saved;
          }
          return saved;
        } finally {
          setLoading(false);
        }
      },
    }),
    { isLoading: loading },
  ];
}

const policyCatalogItems = settings.policies.map((policy) => ({
  id: policy.id,
  currentVersionId: policy.versionId,
  description: 'Policy coverage in the isolated component verification fixture.',
  enableLateFee: true,
  enableWaiver: true,
  lateFeeApplyOnFeeHeads: ['tuition'],
  waiverApplyOnFeeHeads: ['tuition'],
  feeHeadScope: 'SelectedFeeHeads',
  applicableFeeHeadIds: ['tuition'],
  feeHeadRules: [{ feeHeadId: 'tuition', ruleType: 'Daily', roundingMode: 'Currency' }],
}));
const catalog = {
  items: policyCatalogItems,
  ready: true,
  loading: false,
  error: false,
  retry: () => {},
};
export function useFixtureLookups(_scope: any, _enabled: any, scheduleLine: any) {
  return {
    settings,
    context: { isLoading: false, isFetching: false, isError: false, refetch: () => {} },
    heads: { isFetching: false, isError: false, refetch: () => {} },
    terms: catalog,
    catalogs: { collection: catalog, concession: catalog, refund: catalog },
    scheduleTerm: settings.terms.find(
      (term) => term.versionId === scheduleLine?.paymentTermVersionId
    ),
    termDetail: { isFetching: false, isError: false },
  };
}
