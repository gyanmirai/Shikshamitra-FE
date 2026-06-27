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
  dueDate: Yup.mixed().nullable().required('Due date is required'),
  startDate: Yup.mixed().nullable(),
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

    installments: Yup.array().of(installmentSchema).min(1, 'At least one installment is required'),

    // Billing schedule — only required when billing schedule is enabled
    demandGenerationRule: Yup.mixed<DemandGenerationRule>()
      .oneOf(
        ['Immediately', 'XDaysBeforeDue', 'OnDueDate', 'Manual'] as const,
        'Invalid demand rule'
      )
      .when('enableBillingSchedule', {
        is: true,
        then: (schema) => schema.required('Demand generation rule is required'),
        otherwise: (schema) => schema.notRequired(),
      }),

    demandOffsetDays: Yup.number()
      .nullable()
      .when(['enableBillingSchedule', 'demandGenerationRule'], {
        is: (enabled: boolean, rule: DemandGenerationRule) => enabled && rule === 'XDaysBeforeDue',
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

    // Partial payment — min amount/percentage only validated when partial is enabled
    minPartialAmount: Yup.number()
      .nullable()
      .when('allowPartialInstallment', {
        is: true,
        then: (schema) => schema.min(0, 'Must be ≥ 0'),
        otherwise: (schema) => schema.nullable(),
      }),

    minPartialPercentage: Yup.number()
      .nullable()
      .when('allowPartialInstallment', {
        is: true,
        then: (schema) => schema.min(0).max(100, 'Must be between 0 and 100'),
        otherwise: (schema) => schema.nullable(),
      }),
  });
