'use client';

/**
 * useProrationPolicyForm
 *
 * Custom hook that manages all state for the Proration Policy create/edit drawer:
 *  - Fetches all active fee heads from the API
 *  - Builds the initial feeHeadRules[] array (one entry per fee head)
 *  - Formik + Yup validation
 *  - Create / Update mutations via the shared Finance Policy API
 *  - Unsaved-changes dialog
 *  - Computed validation checks for the summary panel
 */

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import { useMemo, useEffect } from 'react';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import {
  useCreateFinancePolicyMutation,
  useUpdateFinancePolicyMutation,
} from 'src/redux/finance/financePolicy';

import type {
  IFinancePolicyRow,
  IProrationFeeHeadRule,
  IProrationPolicyFormValues,
} from '../types/finance-policy.types';

// ─── Default fee heads (shown when API returns nothing — safe fallback) ────────

const DEFAULT_FEE_HEADS: { id: string; name: string; feeType: 'Recurring' | 'OneTime' }[] = [
  { id: 'tuition', name: 'Tuition Fee', feeType: 'Recurring' },
  { id: 'hostel', name: 'Hostel Fee', feeType: 'Recurring' },
  { id: 'transport', name: 'Transport Fee', feeType: 'Recurring' },
  { id: 'library', name: 'Library Fee', feeType: 'Recurring' },
  { id: 'examination', name: 'Examination Fee', feeType: 'OneTime' },
  { id: 'sports', name: 'Sports Fee', feeType: 'Recurring' },
  { id: 'lab', name: 'Lab Fee', feeType: 'Recurring' },
  { id: 'development', name: 'Development Fee', feeType: 'OneTime' },
  { id: 'admission', name: 'Admission Fee', feeType: 'OneTime' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Builds the feeHeadRules array from a list of fee heads.
 * When editing, it merges existing rules (preserving settings) with the
 * full fee head list (adds missing heads, removes stale ones).
 */
function buildFeeHeadRules(
  feeHeads: { id: string; name: string; feeType?: 'Recurring' | 'OneTime' }[],
  existingRules: IProrationFeeHeadRule[] = []
): IProrationFeeHeadRule[] {
  const rulesMap = new Map<string, IProrationFeeHeadRule>(
    existingRules.map((r) => [r.feeHeadId, r])
  );

  return feeHeads.map((head) => {
    const existing = rulesMap.get(head.id);
    if (existing) {
      return { ...existing, feeHeadName: head.name };
    }
    return {
      feeHeadId: head.id,
      feeHeadName: head.name,
      // Default all API heads to Recurring; override if the API provides feeType
      feeType: (head as any).feeType ?? 'Recurring',
      prorationApplicable: false,
      ruleType: null,
      configuration: {},
    };
  });
}

/**
 * Build initial form values for create vs. edit mode.
 */
function getInitialValues(
  editData: IFinancePolicyRow | null | undefined,
  academicYearId: string,
  feeHeads: { id: string; name: string; feeType?: 'Recurring' | 'OneTime' }[]
): IProrationPolicyFormValues {
  const d = editData as any;
  const existingRules: IProrationFeeHeadRule[] = d?.feeHeadRules ?? [];

  return {
    policyName: d?.policyName ?? '',
    policyCode: d?.policyCode ?? '',
    description: d?.description ?? '',
    status: d?.status ?? 'Active',
    academicYearId: d?.academicYearId ?? academicYearId ?? '',
    effectiveFrom: d?.effectiveFrom ?? null,
    effectiveTo: d?.effectiveTo ?? null,
    isDefault: d?.isDefault ?? false,
    policyType: 'proration',
    feeHeadRules: buildFeeHeadRules(feeHeads, existingRules),
  };
}

// ─── Validation Schema ────────────────────────────────────────────────────────

const configSchema = Yup.object({
  // Daily Proration fields
  minimumChargeDays: Yup.number()
    .nullable()
    .integer('Must be a whole number')
    .positive('Must be a positive number'),

  // Monthly Proration fields
  cutOffDay: Yup.number()
    .nullable()
    .integer('Must be a whole number')
    .min(1, 'Must be between 1 and 31')
    .max(31, 'Must be between 1 and 31'),
});

const feeHeadRuleSchema = Yup.object({
  prorationApplicable: Yup.boolean(),
  ruleType: Yup.string()
    .nullable()
    .when('prorationApplicable', {
      is: true,
      then: (s) => s.required('Rule is required when proration is enabled'),
    }),
  configuration: configSchema,
});

const validationSchema = Yup.object({
  policyName: Yup.string()
    .trim()
    .required('Policy name is required')
    .min(3, 'Must be at least 3 characters')
    .max(100, 'Cannot exceed 100 characters'),
  description: Yup.string().nullable().max(500, 'Cannot exceed 500 characters'),
  feeHeadRules: Yup.array()
    .of(feeHeadRuleSchema)
    .test(
      'at-least-one-recurring-enabled',
      'At least one Recurring fee head must have Proration Applicable enabled',
      (rules) =>
        !!(rules ?? []).some(
          (r: any) => r.feeType === 'Recurring' && r.prorationApplicable === true
        )
    ),
});

// ─── Hook ─────────────────────────────────────────────────────────────────────

interface UseProrationPolicyFormOptions {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

export function useProrationPolicyForm({
  open,
  onClose,
  editData,
  academicYearId = '',
}: UseProrationPolicyFormOptions) {
  const { currentYear } = useSelector((state: RootState) => state.globalState);
  const unsavedChangesDialog = useBoolean();

  // ─── Fee Heads ───────────────────────────────────────────────────────────
  const { data: feeHeadsData } = useGetFeeHeadsQuery({}, { skip: !open });

  const feeHeads: { id: string; name: string; feeType?: 'Recurring' | 'OneTime' }[] =
    useMemo(() => {
      const items = (feeHeadsData as any)?.data ?? (feeHeadsData as any)?.items ?? [];
      return items.length > 0 ? items : DEFAULT_FEE_HEADS;
    }, [feeHeadsData]);

  // ─── API Mutations ───────────────────────────────────────────────────────
  const [createPolicy, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateFinancePolicyMutation,
  });
  const [updatePolicy, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFinancePolicyMutation,
  });
  const isSaving = isCreating || isUpdating;

  // ─── Formik ──────────────────────────────────────────────────────────────
  const formik = useFormik<IProrationPolicyFormValues>({
    initialValues: getInitialValues(editData, academicYearId || currentYear?.id || '', feeHeads),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = { ...values, policyType: 'proration' };
        if (editData?.id) {
          await updatePolicy({ id: editData.id, body: payload });
          shikshaMitraToast.success({ message: `Policy "${values.policyName}" updated.` });
        } else {
          await createPolicy(payload);
          shikshaMitraToast.success({ message: `Policy "${values.policyName}" created.` });
        }
        resetForm();
        onClose();
      } catch {
        shikshaMitraToast.error({ message: 'Failed to save policy.' });
      }
    },
  });

  /**
   * When fee heads load (or change), rebuild feeHeadRules keeping
   * any existing configuration the user has already entered.
   */
  useEffect(() => {
    if (feeHeads.length === 0) return;
    const rebuilt = buildFeeHeadRules(feeHeads, formik.values.feeHeadRules);
    // Only update if the IDs differ to avoid infinite loop
    const currentIds = formik.values.feeHeadRules.map((r) => r.feeHeadId).join(',');
    const rebuiltIds = rebuilt.map((r) => r.feeHeadId).join(',');
    if (currentIds !== rebuiltIds) {
      formik.setFieldValue('feeHeadRules', rebuilt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [feeHeads]);

  // ─── Close Handler ───────────────────────────────────────────────────────
  const handleCloseAttempt = () => {
    if (formik.dirty) {
      unsavedChangesDialog.onTrue();
    } else {
      onClose();
    }
  };

  // ─── Submit ──────────────────────────────────────────────────────────────
  const handleCustomSubmit = (targetStatus: 'Active' | 'Inactive') => {
    formik.setFieldValue('status', targetStatus);
    setTimeout(() => formik.handleSubmit(), 0);
  };

  // ─── Validation Checks (for summary panel) ───────────────────────────────
  const checks = useMemo(() => {
    const { values } = formik;

    const generalValid = !!values.policyName && values.policyName.trim().length >= 3;

    const rules = values.feeHeadRules ?? [];
    const recurringEnabledRules = rules.filter(
      (r) => r.feeType === 'Recurring' && r.prorationApplicable
    );
    const recurringEnabledCount = recurringEnabledRules.length;

    // Ensure all enabled heads have a rule selected
    const configuredCount = recurringEnabledRules.filter((r) => !!r.ruleType).length;

    const feeHeadsValid = recurringEnabledCount > 0;
    const allConfigured = configuredCount === recurringEnabledCount && recurringEnabledCount > 0;

    const isReadyToPublish = generalValid && feeHeadsValid && allConfigured;

    return {
      generalValid,
      feeHeadsValid,
      configuredCount,
      recurringEnabledCount,
      isReadyToPublish,
    };
  }, [formik]);

  return {
    formik,
    feeHeads,
    isSaving,
    unsavedChangesDialog,
    checks,
    handleCloseAttempt,
    handleCustomSubmit,
  };
}
