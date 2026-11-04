import { useCallback, useState, useSyncExternalStore } from 'react';
import { FeeMonth } from 'src/enums/fee-collection-type';
import { AdjustmentStatusEnum } from 'src/screens/finance/adjustments/enums/adjustment.enum';
import type {
  FeeAdjustmentDetailDto,
  CreateFeeAdjustmentDto,
  ApplyFeeAdjustmentDto,
  GetFeeAdjustmentApplicationsInput,
} from 'src/screens/finance/adjustments/types/adjustmentApi.types';

let version = 0;
const listeners = new Set<() => void>();
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const snapshot = () => version;
const refresh = () => {
  version += 1;
  listeners.forEach((listener) => listener());
};
const useObserve = () => useSyncExternalStore(subscribe, snapshot, snapshot);
let actor = 'checker';
let readError = false;
let failSave = false;
export const setActor = (value: string) => {
  actor = value;
  refresh();
};
export const failNextSave = () => {
  failSave = true;
};
export const failNextRead = () => {
  readError = true;
  refresh();
};
const refetch = () => {
  readError = false;
  refresh();
};
export const classes = [
  { id: 'class-1', name: 'Class 1', divisions: [{ id: 'division-a', name: 'A' }] },
];
const students = {
  items: [{ studentId: 'student-aanya', firstName: 'Aanya', lastName: 'Example', grNo: 10260 }],
};
const eligibility = {
  studentId: 'student-aanya',
  academicYearId: 'year-2026',
  totalPaid: 5000,
  totalAdjustable: 1250,
  totalAlreadyAdjusted: 0,
  feeHeads: [
    {
      feeHeadId: 'tuition',
      feeHeadName: 'Tuition Fee',
      totalPaid: 5000,
      totalAdjustable: 1250,
      months: [
        {
          dueFeeId: 'source-june',
          month: FeeMonth.June,
          year: 2026,
          total: 5000,
          paid: 5000,
          refunded: 0,
          adjusted: 0,
          adjustable: 1000,
        },
        {
          dueFeeId: 'source-december',
          month: FeeMonth.December,
          year: 2026,
          total: 2500,
          paid: 2500,
          refunded: 0,
          adjusted: 0,
          adjustable: 250,
        },
      ],
    },
  ],
};
function record(
  id: string,
  status: AdjustmentStatusEnum,
  amount: number,
  applied = 0
): FeeAdjustmentDetailDto {
  return {
    id,
    voucherNumber: `ADJ-QA-${id}`,
    studentId: 'student-aanya',
    studentName: 'Aanya Example',
    studentGrNo: 10260,
    rollNo: '2',
    className: 'Class 1',
    divisionName: 'A',
    academicYearId: 'year-2026',
    adjustmentType: 0,
    adjustmentTypeName: 'Fee adjustment',
    reason: 'Correct the allocation between eligible student fee installments.',
    remarks: 'Correct the allocation between eligible student fee installments.',
    status,
    statusName: '',
    requestedAmount: amount,
    appliedAmount: applied,
    remainingAmount: amount - applied,
    requestedByUserId: 'maker',
    requestedByName: 'Creator',
    createdAt: '2026-11-03T09:00:00Z',
    sourceLines: [
      {
        dueFeeId: 'source-june',
        feeHeadId: 'tuition',
        feeHeadName: 'Tuition Fee',
        installmentLabel: 'June 2026',
        month: FeeMonth.June,
        year: 2026,
        paidAmount: 5000,
        adjustableAmount: 1000,
        requestedAmount: amount,
      },
    ],
    targetAllocations: [],
    ...(status === AdjustmentStatusEnum.Rejected
      ? {
          rejectionReason: 'The original request was duplicated.',
          processedByName: 'Reviewer',
          processedAt: '2026-11-03T10:00:00Z',
        }
      : {}),
  };
}
const records = [record('001', 0, 250), record('002', 2, 500, 200), record('003', 1, 100)];
const response = <T>(data: T | undefined, skip = false, error = false) => ({
  data: skip ? undefined : data,
  currentData: skip ? undefined : data,
  isLoading: false,
  isFetching: false,
  isUninitialized: skip,
  isError: error,
  error: error ? { data: { error: { message: 'Synthetic read failure.' } } } : undefined,
  refetch,
});
export function useGetAdjustmentEligibilityQuery(_: unknown, options?: { skip?: boolean }) {
  useObserve();
  return response(eligibility, options?.skip);
}
export function useGetRefundEligibilityQuery() {
  return response(undefined, true);
}
export function useGetClassByMediumQuery() {
  return response(classes);
}
const getClasses = () => ({ unwrap: async () => classes });
const getStudents = () => ({ unwrap: async () => students });
export function useLazyGetClassByMediumQuery() {
  return [getClasses, response(classes)] as const;
}
export function useLazyGetStudentsByDivisionQuery() {
  return [getStudents, response(students)] as const;
}
export function useGetFeeAdjustmentQuery(id: string, options?: { skip?: boolean }) {
  useObserve();
  return response(
    readError ? undefined : records.find((item) => item.id === id),
    options?.skip,
    readError
  );
}
const labels: Record<number, string> = {
  0: 'Pending',
  1: 'Rejected',
  2: 'Partially applied',
  3: 'Approved',
  4: 'Cancelled',
};
export function useGetAdjustmentApplicationsQuery(
  args: GetFeeAdjustmentApplicationsInput | null,
  options?: { skip?: boolean }
) {
  useObserve();
  let rows = records.filter((item) =>
    args?.completedOnly
      ? [2, 3].includes(item.status)
      : args?.status == null || item.status === args.status
  );
  const asRow = (item: FeeAdjustmentDetailDto) => ({
    ...item,
    grNumber: String(item.studentGrNo),
    rollNo: item.rollNo || '',
    standardName: item.className || '',
    requestedByName: item.requestedByName || '',
    statusName: labels[item.status],
  });
  if (args?.filter)
    rows = rows.filter((item) =>
      `${item.studentName} ${item.studentGrNo} ${item.voucherNumber} ${item.reason}`
        .toLowerCase()
        .includes(args.filter!.toLowerCase())
    );
  const filters = JSON.parse(args?.filters || '[]') as Array<{
    column: string;
    type: string;
    value: string;
  }>;
  rows = rows.filter((item) =>
    filters.every((filter) => {
      const value = (
        {
          studentName: `${item.studentName} (${item.studentGrNo})`,
          className: `${item.className} / ${item.divisionName}`,
          rollNumber: item.rollNo,
          requestedBy: item.requestedByName,
          status: labels[item.status],
          adjustmentAmount: item.requestedAmount,
          createdAt: item.createdAt,
        } as Record<string, unknown>
      )[filter.column];
      if (filter.type === 'greaterThan') return Number(value) > Number(filter.value);
      if (filter.type === 'lessThan') return Number(value) < Number(filter.value);
      if (filter.type === 'equals')
        return String(value).toLowerCase() === String(filter.value).toLowerCase();
      return String(value).toLowerCase().includes(String(filter.value).toLowerCase());
    })
  );
  const page = args?.page || 1,
    size = args?.pageSize || 10;
  return response(
    {
      items: rows.slice((page - 1) * size, page * size).map(asRow),
      totalCount: rows.length,
      currentPage: page,
      pageSize: size,
      pendingCount: records.filter((item) => item.status === 0).length,
      rejectedCount: records.filter((item) => item.status === 1).length,
      partiallyAppliedCount: records.filter((item) => item.status === 2).length,
      appliedCount: records.filter((item) => item.status === 3).length,
    },
    options?.skip || !args
  );
}
function useMutation<A, R>(handler: (args: A) => R) {
  const [isLoading, setLoading] = useState(false);
  const trigger = useCallback(
    (args: A) => {
      setLoading(true);
      const task = new Promise<R>((resolve, reject) =>
        window.setTimeout(() => {
          try {
            if (failSave) {
              failSave = false;
              throw new Error('Synthetic save failure. Please retry.');
            }
            resolve(handler(args));
            refresh();
          } catch (error) {
            reject(error);
          } finally {
            setLoading(false);
          }
        }, 500)
      );
      return { unwrap: () => task };
    },
    [handler]
  );
  return [trigger, { isLoading }] as const;
}
const create = ({ body }: { academicYearId: string; body: CreateFeeAdjustmentDto }) => {
  const item = record(
    String(records.length + 1).padStart(3, '0'),
    0,
    body.sourceLines.reduce((sum, line) => sum + line.amount, 0)
  );
  item.requestedByUserId = actor;
  item.requestedByName = actor === 'maker' ? 'Creator' : 'Reviewer';
  item.remarks = body.remarks;
  item.reason = body.reason || '';
  item.sourceLines = body.sourceLines.map((line) => ({
    ...item.sourceLines[0],
    dueFeeId: line.dueFeeId,
    requestedAmount: line.amount,
  }));
  records.unshift(item);
  return item;
};
const rejectRequest = ({ id, body }: { id: string; body: { message: string } }) => {
  const item = records.find((entry) => entry.id === id)!;
  if (item.requestedByUserId === actor)
    throw new Error('The requester cannot reject their own adjustment.');
  item.status = 1;
  item.rejectionReason = body.message;
  return item;
};
const applyRequest = ({ id, body }: { id: string; body: ApplyFeeAdjustmentDto }) => {
  const item = records.find((entry) => entry.id === id)!;
  if (item.requestedByUserId === actor)
    throw new Error('The requester cannot approve their own adjustment.');
  const amount = body.lines.reduce((sum, line) => sum + line.appliedAmount, 0);
  item.appliedAmount += amount;
  item.remainingAmount = Math.max(item.requestedAmount - item.appliedAmount, 0);
  item.status = item.remainingAmount > 0 ? 2 : 3;
  item.approverNotes = body.approvalNotes;
  item.processedByName = actor === 'checker' ? 'Reviewer' : 'Creator';
  item.processedAt = new Date().toISOString();
  item.targetAllocations.push(
    ...body.lines.map((line) => ({
      dueFeeId: line.dueFeeId,
      feeHeadId: line.feeHeadId,
      feeHeadName: 'Tuition Fee',
      installmentLabel: line.installmentLabel || '',
      month: FeeMonth.December,
      year: 2026,
      amount: line.appliedAmount,
      applyBatchNumber: 1,
      appliedOn: item.processedAt!,
    }))
  );
  return {
    totalAppliedAmount: item.appliedAmount,
    remainingAmount: item.remainingAmount,
    selectedInstallmentsCount: body.lines.length,
    lines: body.lines.map((line) => ({
      ...line,
      feeHeadName: 'Tuition Fee',
      originalPendingAmount: 1000,
      finalPendingAmount: 1000 - line.appliedAmount,
    })),
  };
};
export const useCreateFeeAdjustmentMutation = () => useMutation(create);
export const useRejectFeeAdjustmentMutation = () => useMutation(rejectRequest);
export const useApplyFeeAdjustmentMutation = () => useMutation(applyRequest);
const getContext = (id: string) => ({
  unwrap: async () => {
    const item = records.find((entry) => entry.id === id)!;
    return {
      remainingAmount: item.remainingAmount,
      pendingFees: ['December 2026', 'January 2027'].map((label, index) => ({
        installmentId: `target-${index}`,
        dueFeeId: `target-${index}`,
        feeHeadId: 'tuition',
        feeHeadName: 'Tuition Fee',
        installmentLabel: label,
        monthOrder: index,
        totalFees: 1000,
        paidAmount: 0,
        pendingAmount: 1000,
        maxApplicableAmount: Math.min(1000, item.remainingAmount),
      })),
    };
  },
});
export const useLazyGetAdjustmentApplyContextQuery = () =>
  [getContext, { isLoading: false, isFetching: false }] as const;
export default function useQueryAndMutation({ currentQueryAndMutation, params, options }: any) {
  return currentQueryAndMutation(params, options);
}
