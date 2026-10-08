import { useCallback } from 'react';
import dayjs from 'dayjs';

export const usage = {
  paymentTermId: 'monthly',
  feeHeadCount: 2,
  feeStructureCount: 2,
  classCount: 2,
  assignments: [
    {
      classId: 'class3',
      className: 'Class 3',
      feeStructureId: 'fs1',
      feeStructureName: 'FS 1',
      feeHeadId: 'school',
      feeHeadName: 'School Fees',
      versionId: 'v1',
      versionNumber: 1,
    },
    {
      classId: 'class5',
      className: 'Class 5',
      feeStructureId: 'fs2',
      feeStructureName: 'FS 2',
      feeHeadId: 'transport',
      feeHeadName: 'Transport Fees',
      versionId: 'v2',
      versionNumber: 2,
    },
  ],
};
export const impact = {
  currentDefaultId: 'half-yearly',
  currentDefaultName: 'Half-Yearly',
  currentDefaultVersionNumber: 2,
  currentDefaultUsage: usage,
  replacesExistingDefault: true,
  assignmentNote:
    'Existing fee structures keep their assigned term. The new default applies only to new fee head assignments.',
};
export const detail = {
  id: 'monthly',
  academicYearId: 'year',
  boardId: 'board',
  name: 'monthly',
  code: 'PT-MONTHLY',
  status: 'Active',
  isDefault: false,
  isUsedInFeeStructures: true,
  canDirectEdit: false,
  currentVersionId: 'v1',
  holidayShiftingMethod: 'None',
  demandGenerationRule: 'OnDueDate',
  initialDemandStatus: 'Published',
  versions: [
    {
      id: 'v1',
      versionNumber: 1,
      status: 'Published',
      holidayShiftingMethod: 'None',
      demandGenerationRule: 'OnDueDate',
      installments: [
        {
          id: 'inst',
          sequence: 1,
          name: 'Annual',
          coverageStartDate: '2026-06-01',
          coverageEndDate: '2027-05-31',
          dueDate: '2027-05-31',
          demandDate: '2027-05-31',
          allocationPercentage: 100,
          demandEnabled: true,
        },
      ],
    },
  ],
};
const boardsResult = {
  data: {
    items: [
      {
        id: 'board',
        name: 'CBSE',
        academicYearId: 'year',
        startDate: '2026-06-01',
        endDate: '2027-05-31',
      },
    ],
  },
};
export const useGetBoardsQuery = () => boardsResult;
export const useGetPaymentTermUsageQuery = () => ({ currentData: usage });
export const useGetPaymentTermDefaultImpactQuery = () => ({
  currentData: impact,
  isFetching: false,
  isError: false,
});
export const useLazyGetPaymentTermDefaultImpactQuery = () => [
  useCallback(() => ({ unwrap: async () => impact }), []),
];
export const useLazyGetPaymentTermByIdQuery = () => [
  useCallback(() => ({ unwrap: async () => detail }), []),
  { isFetching: false },
];
const mutation = () => [
  useCallback(
    (input: unknown) => ({
      unwrap: async () => {
        (window as any).paymentTermWrites = [...((window as any).paymentTermWrites ?? []), input];
        return detail;
      },
    }),
    []
  ),
  { isLoading: false, isError: false },
];
export const useCreateRevisionMutation = mutation;
export const useCreatePaymentTermMutation = mutation;
export const useUpdatePaymentTermDraftMutation = mutation;
export const usePreviewPaymentTermTemplateMutation = () => [
  useCallback(
    (input: any) => ({
      unwrap: async () => {
        const start = dayjs('2026-06-01');
        const end = dayjs('2027-05-31');
        const count =
          input.templateKind === 'Annual'
            ? 1
            : input.templateKind === 'HalfYearly'
              ? 2
              : input.templateKind === 'Quarterly'
                ? 4
                : input.templateKind === 'Monthly'
                  ? 12
                  : input.customInstallmentCount;
        const baseMonths = Math.floor(12 / count);
        const remainder = 12 % count;
        let month = 0;
        const installments = Array.from({ length: count }, (_, index) => {
          const coverageStart =
            count <= 12
              ? start.add(month, 'month')
              : start.add(Math.floor((365 * index) / count), 'day');
          month += baseMonths + (index < remainder ? 1 : 0);
          const coverageEnd =
            count <= 12
              ? start.add(month, 'month').subtract(1, 'day')
              : start.add(Math.floor((365 * (index + 1)) / count) - 1, 'day');
          const candidateDue = coverageStart.add(input.dueDaysAfterCoverageStart ?? 0, 'day');
          const due =
            input.dueDateRule === 'CoverageStart'
              ? coverageStart
              : input.dueDateRule === 'CoverageEnd'
                ? coverageEnd
                : candidateDue.isAfter(coverageEnd)
                  ? coverageEnd
                  : candidateDue;
          const invoice =
            input.demandGenerationRule === 'SpecificDate'
              ? dayjs(input.specificDemandDates?.[index])
              : input.demandGenerationRule === 'XDaysBeforeDue'
                ? due.subtract(input.demandOffsetDays, 'day')
                : input.demandGenerationRule === 'OnDueDate'
                  ? due
                  : coverageStart;
          if (
            !invoice.isValid() ||
            invoice.isBefore(coverageStart, 'day') ||
            invoice.isAfter(due, 'day')
          )
            throw {
              data: {
                error: { message: 'Invoice date must be between installment start and due date.' },
              },
            };
          const allocation = Math.floor(10000 / count) / 100;
          return {
            sequence: index + 1,
            name: `Installment ${index + 1}`,
            coverageStartDate: coverageStart.format('YYYY-MM-DD'),
            coverageEndDate: coverageEnd.format('YYYY-MM-DD'),
            dueDate: due.format('YYYY-MM-DD'),
            demandDate: invoice.format('YYYY-MM-DD'),
            allocationPercentage: index === count - 1 ? 100 - allocation * index : allocation,
            demandEnabled: true,
            reminderEnabled: false,
          };
        });
        return {
          templateKind: input.templateKind,
          boardStartDate: start.format('YYYY-MM-DD'),
          boardEndDate: end.format('YYYY-MM-DD'),
          installmentCount: count,
          installments,
        };
      },
    }),
    []
  ),
  { isLoading: false },
];
