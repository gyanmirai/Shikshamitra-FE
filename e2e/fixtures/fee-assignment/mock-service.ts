import type {
  AssignmentCommit,
  AssignmentPolicy,
  AssignmentRequest,
  AssignmentPreview,
  AssignmentCandidate,
} from 'src/redux/finance/studentFeeAssignment';

import { createApi } from '@reduxjs/toolkit/query/react';
import {
  classType,
  financeModuleType,
  financePolicyType,
  studentAdmissionType,
} from 'src/redux/tagTypes';

const policyOptions: AssignmentPolicy[] = [
  {
    family: 'collection',
    policyId: 'collection',
    versionId: 'collection-v2',
    name: 'School collection policy',
    version: 2,
    source: 'FeeStructure',
    headTreatment: {
      tuition: 'No penalty assessed on assignment.',
      transport: 'No penalty assessed on assignment.',
    },
  },
  {
    family: 'collection',
    policyId: 'alternate',
    versionId: 'alternate-v1',
    name: 'Extended grace collection',
    version: 1,
    headTreatment: {},
  },
  {
    family: 'concession',
    policyId: 'merit',
    versionId: 'merit-v1',
    name: 'Merit concession',
    version: 1,
    headTreatment: {},
  },
  {
    family: 'refund',
    policyId: 'refund',
    versionId: 'refund-v1',
    name: 'School refund policy',
    version: 1,
    headTreatment: {},
  },
  {
    family: 'proration',
    policyId: 'proration',
    versionId: 'proration-v1',
    name: 'Daily service proration',
    version: 1,
    headTreatment: {},
  },
];
const stamps = new Map<string, number>();

export const candidate: AssignmentCandidate = {
  policies: policyOptions.filter((p) => p.versionId !== 'alternate-v1'),
  id: 'structure',
  name: 'Class 5 fees 2026–27',
  revisionNumber: 2,
  academicYearId: 'year',
  standardId: 'class',
  total: 16000,
  heads: [
    {
      feeHeadId: 'tuition',
      feeHeadName: 'Tuition',
      isOptional: false,
      isOneTime: false,
      included: true,
      configuredAmount: 12000,
      effectiveAmount: 12000,
      amountBasis: 'AnnualTotal',
      obligation: 12000,
      verification: 'Configured academic year',
    },
    {
      feeHeadId: 'transport',
      feeHeadName: 'Transport',
      isOptional: true,
      isOneTime: false,
      included: false,
      configuredAmount: 4000,
      effectiveAmount: 4000,
      amountBasis: 'AnnualTotal',
      obligation: 0,
      supportsTransportSource: true,
      verification: 'Configured academic year',
    },
  ],
};
// Keep existing fixed fixtures stable; opt into variable pricing for browser checks.
if (new URLSearchParams(window.location.search).has('variableFees')) {
  candidate.heads[1] = {
    ...candidate.heads[1],
    isVariable: true,
    configuredAmount: null,
    effectiveAmount: null,
    supportsTransportSource: false,
  };
  candidate.heads.push({
    ...candidate.heads[0],
    feeHeadId: 'hostel',
    feeHeadName: 'Hostel',
    isVariable: true,
    configuredAmount: null,
    effectiveAmount: null,
  });
}
const saved = new Map<string, AssignmentCommit>();
function preview(input: AssignmentRequest): AssignmentPreview {
  const heads = candidate.heads.map((head) => {
    const included = !head.isOptional || input.selectedOptionalFeeHeadIds.includes(head.feeHeadId);
    const effectiveAmount = head.isVariable
      ? input.variableFeeHeads?.find((h) => h.feeHeadId === head.feeHeadId)?.amount
      : (input.feeHeadDetails.find((h) => h.feeHeadId === head.feeHeadId)?.amount ??
        head.configuredAmount);
    if (included && effectiveAmount == null) throw new Error('Included head requires an amount');
    return {
      ...head,
      included,
      effectiveAmount: included ? (effectiveAmount ?? null) : null,
      obligation: included ? effectiveAmount! : 0,
      zeroAmountReason: input.variableFeeHeads?.find((h) => h.feeHeadId === head.feeHeadId)
        ?.zeroAmountReason,
      paymentTermName: 'Two installments',
      paymentTermVersionNumber: 3,
      servicePeriod: input.servicePeriods.find((p) => p.feeHeadId === head.feeHeadId) ?? {
        feeHeadId: head.feeHeadId,
        source: 'AcademicYear' as const,
        startDate: '2026-04-01T00:00:00Z',
        endDate: '2027-03-31T00:00:00Z',
      },
    };
  });
  const lines = heads
    .filter((h) => h.included)
    .flatMap((h) =>
      [60, 40].map((share, i) => ({
        feeHeadId: h.feeHeadId,
        feeHeadName: h.feeHeadName,
        installmentLabel: `Installment ${i + 1}`,
        sequence: i + 1,
        dueDate: i === 0 ? '2026-04-10' : '2026-10-10',
        demandDate: i === 0 ? '2026-04-01' : '2026-10-01',
        allocationPercentage: share,
        scheduledAmount: (h.effectiveAmount! * share) / 100,
        proratedAmount: (h.obligation * share) / 100,
        paidAmount: 0,
        outstandingAmount: (h.obligation * share) / 100,
      }))
    );
  return {
    studentId: input.studentId,
    academicYearId: 'year',
    structureId: candidate.id,
    structureName: candidate.name,
    revisionNumber: 2,
    currency: 'INR',
    scheduledTotal: lines.reduce((sum, l) => sum + l.scheduledAmount, 0),
    proratedTotal: lines.reduce((sum, l) => sum + l.proratedAmount, 0),
    reductionTotal: 0,
    overrideReason: input.overrideReason,
    previewToken: `fixture-${input.studentId}`,
    heads,
    lines,
    warnings: ['Synthetic preview: calculation accuracy is covered by backend tests.'],
    policyOverrideReason: input.policyOverrideReason,
    policies: (candidate.policies ?? []).flatMap((defaultPolicy) => {
      const selection = input.policies?.find((p) => p.family === defaultPolicy.family);
      const selected = selection
        ? policyOptions.find((p) => p.versionId === selection.versionId)
        : defaultPolicy;
      return selected
        ? [
            {
              ...selected,
              source:
                selected.versionId === defaultPolicy.versionId ? 'FeeStructure' : 'StudentOverride',
            },
          ]
        : [];
    }),
  };
}
function commit(input: AssignmentRequest): AssignmentCommit {
  if (saved.has(input.studentId))
    return { ...saved.get(input.studentId)!, outcome: 'AlreadyAssigned' };
  const result: AssignmentCommit = {
    assignmentId: `assignment-${input.studentId}`,
    outcome: 'Assigned',
    assignment: preview(input),
  };
  saved.set(input.studentId, result);
  return result;
}
// Opt into saved evidence so drawer checks do not depend on completing a new assignment.
if (new URLSearchParams(window.location.search).has('assignedView')) {
  commit({
    studentId: 'student-one',
    academicYearId: 'year',
    standardFeeStructureId: candidate.id,
    selectedOptionalFeeHeadIds: [],
    servicePeriods: [],
    feeHeadDetails: [],
  });
}
export const api = createApi({
  reducerPath: 'api',
  tagTypes: [
    ...Object.values(financeModuleType),
    ...Object.values(financePolicyType),
    ...Object.values(studentAdmissionType),
    ...Object.values(classType),
  ],
  baseQuery: async (args: { url: string; body?: any; params?: any }) => {
    if (args.url.endsWith('/policy-options')) return { data: policyOptions };
    if (args.url.endsWith('/policies')) {
      const id = args.url.split('/').at(-2)!;
      const assigned = saved.get(id);
      if (!assigned) return { error: { status: 404, data: {} } };
      const stamp = stamps.get(id) ?? 0;
      if (args.body.concurrencyStamp !== String(stamp))
        return { error: { status: 409, data: { code: 'Finance:Assignment:StalePreview' } } };
      assigned.assignment.originalPolicies ??= assigned.assignment.policies;
      assigned.assignment.policies = args.body.policies.flatMap(
        (selection: { versionId: string | null }) => {
          const policy = policyOptions.find((p) => p.versionId === selection.versionId);
          return policy ? [{ ...policy, source: 'StudentOverride' }] : [];
        }
      );
      assigned.assignment.policyOverrideReason = args.body.reason;
      stamps.set(id, stamp + 1);
      return {
        data: {
          assignment: assigned.assignment,
          warnings: [],
          concurrencyStamp: String(stamp + 1),
        },
      };
    }
    if (args.url.includes('/student/')) {
      const id = args.url.split('/').at(-1)!;
      return {
        data: {
          assignment: saved.get(id)?.assignment,
          warnings: [],
          concurrencyStamp: String(stamps.get(id) ?? 0),
        },
      };
    }
    if (args.url.endsWith('/standards'))
      return {
        data: [{ id: 'class', name: 'Class 5', divisions: [{ id: 'division', name: 'A' }] }],
      };
    if (args.url.endsWith('/students')) {
      if (new URLSearchParams(window.location.search).has('studentColumns')) {
        const params = args.params ?? {};
        let items = Array.from({ length: 25 }, (_, index) => ({
          enrollmentId: `columns-${index}`,
          studentId: `columns-${index}`,
          studentName:
            ['Aarav Jay Shah', 'Meera Rao', 'Riya Patel'][index % 3] +
            (index > 2 ? ` ${index}` : ''),
          grNumber: `GR-${1001 + index}`,
          rollNumber: index === 24 ? null : index + 1,
          standardDivision: `Class 5 - ${index % 2 ? 'B' : 'A'}`,
          className: 'Class 5',
          divisionName: index % 2 ? 'B' : 'A',
          boardName: 'CBSE',
          mediumName: 'English',
          stageName: 'Primary',
          isActive: index !== 23,
          isFeeStructureAssigned: index % 4 === 0,
        }));
        if (params.divisionId) items = items.filter((row) => row.divisionName === 'A');
        const search = String(params.search ?? '').toLowerCase();
        items = items.filter((row) =>
          [row.studentName, row.grNumber, row.rollNumber].some((value) =>
            String(value ?? '')
              .toLowerCase()
              .includes(search)
          )
        );
        const valueFor = (row: (typeof items)[number], column: string): string | number | null => {
          if (column === 'isActive' || column === 'isFeeStructureAssigned')
            return row[column] ? 0 : 1;
          return row[column as keyof typeof row] as string | number | null;
        };
        const filters = JSON.parse(params.filters ?? '[]') as {
          column: string;
          type: string;
          value: any;
        }[];
        for (const column of new Set(filters.map((filter) => filter.column))) {
          items = items.filter((row) =>
            filters
              .filter((filter) => filter.column === column)
              .some((filter) => {
                const value = valueFor(row, column);
                if (value == null) return false;
                const text = String(value).toLowerCase();
                const target = String(filter.value).toLowerCase();
                switch (filter.type) {
                  case 'contains':
                    return text.includes(target);
                  case 'startsWith':
                    return text.startsWith(target);
                  case 'endsWith':
                    return text.endsWith(target);
                  case 'greaterThan':
                    return Number(value) > Number(filter.value);
                  case 'lessThan':
                    return Number(value) < Number(filter.value);
                  case 'between':
                    return (
                      Number(value) >= Number(filter.value.min) &&
                      Number(value) <= Number(filter.value.max)
                    );
                  default:
                    return text === target;
                }
              })
          );
        }
        const sort = params.sortBy ?? 'studentName';
        items.sort((a, b) => {
          const left = valueFor(a, sort),
            right = valueFor(b, sort);
          const comparison =
            left == null
              ? -1
              : right == null
                ? 1
                : typeof left === 'number' && typeof right === 'number'
                  ? left - right
                  : String(left).localeCompare(String(right));
          return (
            comparison * (params.sortOrder === 'desc' ? -1 : 1) ||
            a.enrollmentId.localeCompare(b.enrollmentId)
          );
        });
        return {
          data: {
            totalCount: items.length,
            items: items.slice(
              params.skipCount ?? 0,
              (params.skipCount ?? 0) + (params.maxResultCount ?? 10)
            ),
          },
        };
      }
      return {
        data: {
          totalCount: 2,
          items: [
            {
              enrollmentId: 'one',
              studentId: 'student-one',
              studentName: 'Aarav Shah',
              grNumber: 'GR-1001',
              rollNumber: 1,
              standardDivision: 'Class 5 - A',
              className: 'Class 5',
              divisionName: 'A',
              boardName: 'CBSE',
              mediumName: 'English',
              stageName: 'Primary',
              isActive: true,
              isFeeStructureAssigned: saved.has('student-one'),
            },
            {
              enrollmentId: 'two',
              studentId: 'student-two',
              studentName: 'Meera Rao',
              grNumber: 'GR-1002',
              rollNumber: 2,
              standardDivision: 'Class 5 - A',
              className: 'Class 5',
              divisionName: 'A',
              boardName: 'CBSE',
              mediumName: 'English',
              stageName: 'Primary',
              isActive: true,
              isFeeStructureAssigned: saved.has('student-two'),
            },
          ],
        },
      };
    }
    if (args.url.endsWith('/candidates')) return { data: [candidate] };
    if (args.url.endsWith('/transport-sources'))
      return {
        data: [
          {
            id: 'route',
            label: 'Transport service from 01 Aug 2026',
            startDate: '2026-08-01',
            endDate: '2027-03-31',
          },
        ],
      };
    if (args.url.endsWith('/preview-bulk'))
      return {
        data: {
          results: args.body.items.map((input: AssignmentRequest) => ({
            studentId: input.studentId,
            preview: preview(input),
          })),
        },
      };
    if (args.url.endsWith('/preview')) return { data: preview(args.body) };
    if (args.url.endsWith('/assign-bulk'))
      return {
        data: {
          successCount: args.body.items.length,
          alreadyAssignedCount: 0,
          failedCount: 0,
          skippedCount: 0,
          results: args.body.items.map((input: AssignmentRequest) => ({
            studentId: input.studentId,
            outcome: 'Assigned',
            result: commit(input),
          })),
        },
      };
    if (args.url.endsWith('/assign')) return { data: commit(args.body) };
    return { data: { assignment: saved.get('student-one')?.assignment, warnings: [] } };
  },
  endpoints: () => ({}),
});
