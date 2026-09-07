import dayjs from 'dayjs';
import * as Yup from 'yup';

import type { PaymentTermStatus, DemandGenerationRule } from '../type';

// ---------------------------------------------------------------------------
// Shared shape for a single installment
// ---------------------------------------------------------------------------
const installmentSchema = Yup.object().shape({
  sequence: Yup.number().min(0, 'Sequence must be non-negative').required('Sequence is required'),
  installmentName: Yup.string()
    .trim()
    .min(1, 'Installment name is required')
    .required('Installment name is required'),
  startDate: Yup.mixed().nullable().required('Start date is required'),
  endDate: Yup.mixed()
    .nullable()
    .required('End date is required')
    .test('end-after-start', 'End date must be on or after start date', function (endDate) {
      const { startDate } = this.parent;
      if (!startDate || !endDate) return true;
      return !dayjs(endDate as string).isBefore(dayjs(startDate as string), 'day');
    }),
  demandDate: Yup.mixed().nullable(),
  dueDate: Yup.mixed()
    .nullable()
    .required('Due date is required')
    .test('due-within-period', 'Due date must be on or after start date', function (dueDate) {
      const { startDate } = this.parent;
      if (!startDate || !dueDate) return true;
      return !dayjs(dueDate as string).isBefore(dayjs(startDate as string), 'day');
    }),
  allocationPercentage: Yup.number()
    .moreThan(0, 'Allocation percentage must be greater than 0')
    .max(100, 'Allocation percentage cannot exceed 100')
    .required('Allocation percentage is required'),
  gracePeriod: Yup.number().min(0, 'Grace days cannot be negative').nullable(),
});

// ---------------------------------------------------------------------------
// Root payment term schema — board dates are the authoritative schedule window.
// ---------------------------------------------------------------------------
export const paymentTermValidationSchema = (
  boards: Array<{ id: string; startDate: string; endDate: string }> = []
) =>
  Yup.object().shape({
    boardId: Yup.string().required('Board is required'),

    paymentTermName: Yup.string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must be at most 100 characters')
      .required('Payment term name is required'),

    paymentTermCode: Yup.string()
      .trim()
      .min(3, 'Code must be at least 3 characters')
      .max(24, 'Code must be at most 24 characters')
      .matches(/^[A-Z0-9-]+$/, 'Code may only contain uppercase letters, digits, and hyphens')
      .required('Payment term code is required'),

    description: Yup.string().max(500, 'Description must be at most 500 characters'),

    status: Yup.mixed<PaymentTermStatus>()
      .oneOf(['Draft', 'Active'] as const, 'Status must be Draft or Active')
      .required('Status is required'),

    installments: Yup.array()
      .of(installmentSchema)
      .min(1, 'At least one installment is required')
      .test('allocation-total', 'Percentage allocations must total 100%', (items) => {
        if (!items?.length) return true;
        const total = items.reduce((sum, i) => sum + (Number(i?.allocationPercentage) || 0), 0);
        return Math.abs(total - 100) <= 0.01;
      })
      .test('due-dates-sequential', 'Due dates must be in chronological order', (items) => {
        if (!items?.length) return true;
        const sorted = [...items].sort((a, b) => (a?.sequence ?? 0) - (b?.sequence ?? 0));
        for (let i = 1; i < sorted.length; i += 1) {
          const prev = sorted[i - 1]?.dueDate;
          const curr = sorted[i]?.dueDate;
          if (!dayjs(curr as string).isAfter(dayjs(prev as string), 'day')) return false;
        }
        return true;
      })
      .test('unique-names', 'Installment names must be unique', (items) => {
        if (!items?.length) return true;
        const names = items.map((item) => item?.installmentName?.trim().toLowerCase());
        return new Set(names).size === names.length;
      })
      .test('coverage-not-overlapping', 'Installment periods must not overlap', (items) => {
        if (!items?.length) return true;
        const sorted = [...items].sort((a, b) => (a?.sequence ?? 0) - (b?.sequence ?? 0));
        for (let i = 1; i < sorted.length; i += 1) {
          const previousEnd = sorted[i - 1]?.endDate;
          const currentStart = sorted[i]?.startDate;
          if (
            previousEnd &&
            currentStart &&
            !dayjs(currentStart as string).isAfter(dayjs(previousEnd as string), 'day')
          ) {
            return false;
          }
        }
        return true;
      })
      .test(
        'within-board-period',
        'Installment periods must be within the selected board period',
        function (items) {
          if (!items?.length) return true;
          const selectedBoard = boards.find((item) => item.id === this.parent.boardId);
          if (!selectedBoard?.startDate || !selectedBoard?.endDate) return true;
          const boardStart = dayjs(selectedBoard.startDate);
          const boardEnd = dayjs(selectedBoard.endDate);
          return items.every((item) => {
            if (!item?.startDate || !item?.endDate || !item?.dueDate) return true;
            return (
              !dayjs(item.startDate as string).isBefore(boardStart, 'day') &&
              !dayjs(item.endDate as string).isAfter(boardEnd, 'day') &&
              !dayjs(item.dueDate as string).isBefore(boardStart, 'day') &&
              !dayjs(item.dueDate as string).isAfter(boardEnd, 'day')
            );
          });
        }
      )
      .test(
        'specific-demand-dates',
        'A bill generation date on or before the due date is required for every installment',
        function (items) {
          if (this.parent.demandGenerationRule !== 'SpecificDate') return true;
          return items?.every((item) => {
            if (!item?.demandDate || !item?.dueDate) return false;
            return !dayjs(item.demandDate as string).isAfter(dayjs(item.dueDate as string), 'day');
          });
        }
      ),

    demandGenerationRule: Yup.mixed<DemandGenerationRule>()
      .oneOf(
        ['OnInstallmentStartDate', 'XDaysBeforeDue', 'OnDueDate', 'SpecificDate'] as const,
        'Invalid demand rule'
      )
      .required('Demand generation rule is required'),

    demandOffsetDays: Yup.number()
      .nullable()
      .when('demandGenerationRule', {
        is: (rule: DemandGenerationRule) => rule === 'XDaysBeforeDue',
        then: (schema) =>
          schema
            .min(1, 'Offset days must be at least 1')
            .required('Offset days is required for X Days before due'),
        otherwise: (schema) => schema.nullable(),
      }),
  });
