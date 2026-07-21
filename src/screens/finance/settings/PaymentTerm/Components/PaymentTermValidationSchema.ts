import dayjs from 'dayjs';
import * as Yup from 'yup';

import type { PaymentTermStatus, InitialDemandStatus, DemandGenerationRule } from '../type';

// ---------------------------------------------------------------------------
// Shared shape for a single installment
// ---------------------------------------------------------------------------
const installmentSchema = Yup.object().shape({
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
  demandDate: Yup.mixed().nullable().required('Demand date is required'),
  dueDate: Yup.mixed()
    .nullable()
    .required('Due date is required')
    .test('demand-before-due', 'Demand date must be on or before due date', function (dueDate) {
      const { demandDate } = this.parent;
      if (!demandDate || !dueDate) return true;
      return !dayjs(demandDate as string).isAfter(dayjs(dueDate as string), 'day');
    }),
  allocationPercentage: Yup.number()
    .moreThan(0, 'Allocation percentage must be greater than 0')
    .max(100, 'Allocation percentage cannot exceed 100')
    .required('Allocation percentage is required'),
  gracePeriod: Yup.number().min(0, 'Grace days cannot be negative').nullable(),
});

// ---------------------------------------------------------------------------
// Root payment term schema — accepts the currentYear object so we can
// reference academicYearId in cross-field rules if needed in future.
// ---------------------------------------------------------------------------
export const paymentTermValidationSchema = (_currentYear?: { id?: string; name?: string } | null) =>
  Yup.object().shape({
    boardId: Yup.string().required('Board is required'),

    paymentTermName: Yup.string()
      .trim()
      .min(3, 'Name must be at least 3 characters')
      .max(100, 'Name must be at most 100 characters')
      .required('Payment term name is required'),

    paymentTermCode: Yup.string()
      .trim()
      .max(24, 'Code must be at most 24 characters')
      .matches(/^[A-Z0-9-]*$/, 'Code may only contain uppercase letters, digits, and hyphens'),

    description: Yup.string().max(500, 'Description must be at most 500 characters'),

    status: Yup.mixed<PaymentTermStatus>()
      .oneOf(['Active', 'Archived'] as const, 'Invalid status')
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
      }),

    demandGenerationRule: Yup.mixed<DemandGenerationRule>()
      .oneOf(
        ['Immediately', 'XDaysBeforeDue', 'OnDueDate', 'Manual'] as const,
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

    initialDemandStatus: Yup.mixed<InitialDemandStatus>().oneOf(
      ['Draft', 'Published'] as const,
      'Invalid demand status'
    ),
  });
