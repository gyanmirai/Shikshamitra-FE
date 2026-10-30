import { financeNameSchema } from 'src/utils/finance-name';
import { getAllocationSummary, ALLOCATION_TOTAL_ERROR } from '../allocationValidation';
import dayjs from 'dayjs';
import * as Yup from 'yup';

import type { PaymentTermStatus, DemandGenerationRule } from '../type';
import type { IPaymentTerm } from '../type';
import { getInvoiceDateError, getInvoiceOffsetLimit } from '../invoiceScheduleValidation';

// ---------------------------------------------------------------------------
// Shared shape for a single installment
// ---------------------------------------------------------------------------
const installmentSchema = Yup.object().shape({
  sequence: Yup.number().min(0, 'Sequence must be non-negative').required('Sequence is required'),
  installmentName: financeNameSchema('Installment Name')
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
  demandEnabled: Yup.boolean().required(),
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

    paymentTermName: financeNameSchema('Payment term name')
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

    isDefaultTerm: Yup.boolean().test(
      'default-requires-active',
      'Only an Active payment term can be the default',
      function validateDefaultStatus(isDefault) {
        return !isDefault || this.parent.status === 'Active';
      }
    ),

    invoiceCreationEnabled: Yup.boolean().required(),

    installments: Yup.array()
      .of(installmentSchema)
      .min(1, 'At least one installment is required')
      .test('allocation-total', ALLOCATION_TOTAL_ERROR, (items) => {
        if (!items?.length) return true;
        return getAllocationSummary(items).valid;
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
        'valid-invoice-dates',
        'Invoice dates must be between the installment start and payment due date',
        function (items) {
          const values = this.parent as IPaymentTerm;
          const board = boards.find((item) => item.id === values.boardId);
          const errors = (items ?? []).flatMap((item, index) => {
            const message = getInvoiceDateError(
              values,
              item as IPaymentTerm['installments'][number],
              board?.startDate
            );
            return message
              ? [this.createError({ path: `${this.path}[${index}].demandDate`, message })]
              : [];
          });
          return errors.length ? new Yup.ValidationError(errors) : true;
        }
      ),

    demandGenerationRule: Yup.mixed<DemandGenerationRule>()
      .oneOf(
        ['OnInstallmentStartDate', 'XDaysBeforeDue', 'OnDueDate', 'SpecificDate'] as const,
        'Invalid invoice date rule'
      )
      .required('Demand generation rule is required'),

    demandOffsetDays: Yup.number()
      .nullable()
      .when('demandGenerationRule', {
        is: (rule: DemandGenerationRule) => rule === 'XDaysBeforeDue',
        then: (schema) =>
          schema
            .integer('Days before due must be a whole number')
            .min(1, 'Offset days must be at least 1')
            .max(365, 'Days before due cannot exceed 365')
            .required('Offset days is required for X Days before due')
            .test('max-invoice-offset', function (offset) {
              const values = this.parent as IPaymentTerm;
              if (offset == null) return true;
              const board = boards.find((item) => item.id === values.boardId);
              const limit = getInvoiceOffsetLimit(values, board?.startDate);
              return (
                !limit ||
                offset <= limit.days ||
                this.createError({
                  message: `Max ${Math.max(0, limit.days)} days for ${limit.name || 'this installment'}; invoice date cannot be before the installment start`,
                })
              );
            }),
        otherwise: (schema) => schema.nullable(),
      }),
  });
