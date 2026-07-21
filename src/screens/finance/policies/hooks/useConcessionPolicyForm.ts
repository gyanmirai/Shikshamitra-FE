'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFeeHeadsQuery } from 'src/redux/feeHeadManage/feeHeadManageApi';
import {
  useCreateFinancePolicyMutation,
  useUpdateFinancePolicyMutation,
} from 'src/redux/finance/financePolicy';

import type { IFinancePolicyRow, IConcessionPolicyFormValues } from '../types/finance-policy.types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const generatePolicyCode = (name: string) =>
  `CON-${name.toUpperCase().replace(/\s+/g, '-').slice(0, 12)}-${Date.now().toString().slice(-4)}`;

// ─── Initial Values ───────────────────────────────────────────────────────────

const getInitialValues = (
  editData: IFinancePolicyRow | null | undefined,
  academicYearId: string
): IConcessionPolicyFormValues => {
  const d = editData as any;
  return {
    policyName: d?.policyName || '',
    policyCode: d?.policyCode || '',
    description: d?.description || '',
    status: d?.status || 'Active',
    academicYearId: d?.academicYearId || academicYearId || '',
    effectiveFrom: d?.effectiveFrom || null,
    effectiveTo: d?.effectiveTo || null,
    isDefault: d?.isDefault || false,
    policyType: 'concession',

    // Card 1 – General
    concessionType: d?.concessionType || '',

    // Card 2 – Calculation Rules
    calculationMethod: d?.calculationMethod || 'Percentage',
    percentageValue: d?.percentageValue ?? null,
    fixedAmount: d?.fixedAmount ?? null,
    calculationBase: d?.calculationBase || 'OriginalFee',
    roundOff: d?.roundOff || 'None',
    minimumConcession: d?.minimumConcession ?? null,

    // Card 3 – Fee Heads
    feeHeadScope: d?.feeHeadScope || 'EntireFeeStructure',
    applicableFeeHeads: d?.applicableFeeHeads || [],

    // Card 4 – Application Behaviour
    applyOn: d?.applyOn || 'PendingFeesOnly',
    paidFeeAdjustment: d?.paidFeeAdjustment || null,
    pendingFeeHandling: d?.pendingFeeHandling || null,
    futureInstallmentStrategy: d?.futureInstallmentStrategy || null,
    walletHeadId: d?.walletHeadId || '',
  };
};

// ─── Validation Schema ────────────────────────────────────────────────────────

const validationSchema = Yup.object().shape({
  policyName: Yup.string()
    .trim()
    .required('Policy name is required')
    .min(3, 'Must be at least 3 characters')
    .max(100, 'Cannot exceed 100 characters'),
  description: Yup.string().max(500, 'Cannot exceed 500 characters').nullable(),
  calculationMethod: Yup.string().required('Calculation method is required'),
  percentageValue: Yup.number()
    .nullable()
    .when('calculationMethod', {
      is: 'Percentage',
      then: (s) =>
        s.required('Percentage is required').min(0, 'Must be ≥ 0').max(100, 'Cannot exceed 100%'),
    }),
  fixedAmount: Yup.number()
    .nullable()
    .when('calculationMethod', {
      is: 'FixedAmount',
      then: (s) => s.required('Fixed amount is required').min(0, 'Must be ≥ 0'),
    }),
  feeHeadScope: Yup.string().required(),
  applicableFeeHeads: Yup.array().when('feeHeadScope', {
    is: 'SelectedFeeHeads',
    then: (s) => s.min(1, 'Select at least one fee head'),
  }),
  applyOn: Yup.string().required('Apply on is required'),
});

// ─── Hook ────────────────────────────────────────────────────────────────────

interface UseConcessionPolicyFormOptions {
  open: boolean;
  onClose: () => void;
  editData?: IFinancePolicyRow | null;
  academicYearId?: string;
}

export function useConcessionPolicyForm({
  open,
  onClose,
  editData,
  academicYearId = '',
}: UseConcessionPolicyFormOptions) {
  const { currentYear, academicYears } = useSelector((state: RootState) => state.globalState);
  const unsavedChangesDialog = useBoolean();

  // ─── Simulation State ─────────────────────────────────────────────────────
  const [simFeeAmount, setSimFeeAmount] = useState(10000);
  const [simAlreadyPaid, setSimAlreadyPaid] = useState(0);
  const [simLateFee, setSimLateFee] = useState(0);

  // ─── Fee Heads ────────────────────────────────────────────────────────────
  const { data: feeHeadsData } = useGetFeeHeadsQuery('');
  const feeHeads: { id: string; name: string }[] = useMemo(
    () => (feeHeadsData as any)?.data || [],
    [feeHeadsData]
  );

  // ─── API Mutations ────────────────────────────────────────────────────────
  const [createPolicy, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateFinancePolicyMutation,
  });
  const [updatePolicy, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateFinancePolicyMutation,
  });
  const isSaving = isCreating || isUpdating;

  // ─── Formik ───────────────────────────────────────────────────────────────
  const formik = useFormik<IConcessionPolicyFormValues>({
    initialValues: getInitialValues(editData, academicYearId || currentYear?.id || ''),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = { ...values, policyType: 'concession' };
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

  // ─── Auto-generate Code ───────────────────────────────────────────────────
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(e);
    if (!editData && e.target.value.length >= 3) {
      formik.setFieldValue('policyCode', generatePolicyCode(e.target.value));
    }
  };

  // ─── Close Handler ─────────────────────────────────────────────────────────
  const handleCloseAttempt = () => {
    if (formik.dirty) {
      unsavedChangesDialog.onTrue();
    } else {
      onClose();
    }
  };

  // ─── Custom Submit (Draft / Publish) ──────────────────────────────────────
  const handleCustomSubmit = (targetStatus: 'Draft' | 'Active') => {
    formik.setFieldValue('status', targetStatus);
    setTimeout(() => formik.handleSubmit(), 0);
  };

  // ─── Validation Checks ─────────────────────────────────────────────────────
  const checks = useMemo(() => {
    const { values, errors } = formik;
    const generalValid = !!values.policyName && values.policyName.length >= 3;
    const calcValid =
      !!values.calculationMethod &&
      (values.calculationMethod === 'Manual' ||
        values.calculationMethod === 'FullWaiver' ||
        (values.calculationMethod === 'Percentage' &&
          values.percentageValue !== null &&
          values.percentageValue > 0) ||
        (values.calculationMethod === 'FixedAmount' &&
          values.fixedAmount !== null &&
          values.fixedAmount > 0));
    const feeHeadsValid =
      values.feeHeadScope === 'EntireFeeStructure' ||
      (values.feeHeadScope === 'SelectedFeeHeads' && values.applicableFeeHeads.length > 0);
    const applicationValid = !!values.applyOn;

    const isReadyToPublish = generalValid && calcValid && feeHeadsValid && applicationValid;

    return {
      generalValid,
      calcValid,
      feeHeadsValid,
      applicationValid,

      isReadyToPublish,
    };
  }, [formik]);

  // ─── Live Simulation ───────────────────────────────────────────────────────
  const simulation = useMemo(() => {
    const { values } = formik;
    const pending = Math.max(0, simFeeAmount - simAlreadyPaid);

    let concessionAmount = 0;
    if (values.calculationMethod === 'Percentage' && values.percentageValue) {
      const base =
        values.calculationBase === 'OutstandingAmount'
          ? pending
          : values.calculationBase === 'FeeHeadAmount'
            ? simFeeAmount
            : simFeeAmount;
      concessionAmount = (base * values.percentageValue) / 100;
    } else if (values.calculationMethod === 'FixedAmount' && values.fixedAmount) {
      concessionAmount = values.fixedAmount;
    } else if (values.calculationMethod === 'FullWaiver') {
      concessionAmount = pending + simAlreadyPaid;
    }

    // Apply minimum concession
    if (values.minimumConcession && concessionAmount < values.minimumConcession) {
      concessionAmount = values.minimumConcession;
    }

    const newOutstanding = Math.max(0, pending - concessionAmount);
    const refundRequired =
      simAlreadyPaid > 0 &&
      (values.applyOn === 'PaidFeesOnly' || values.applyOn === 'PaidAndPending')
        ? Math.min(simAlreadyPaid, concessionAmount)
        : 0;

    return {
      concessionAmount: Math.round(concessionAmount),
      refundRequired: Math.round(refundRequired),
      newOutstanding: Math.round(newOutstanding),
      lateFeeImpact: simLateFee,
    };
  }, [formik, simFeeAmount, simAlreadyPaid, simLateFee]);

  return {
    formik,
    feeHeads,
    academicYears: academicYears || [],
    isSaving,
    unsavedChangesDialog,
    checks,
    simulation,
    simFeeAmount,
    setSimFeeAmount,
    simAlreadyPaid,
    setSimAlreadyPaid,
    simLateFee,
    setSimLateFee,
    handleNameChange,
    handleCloseAttempt,
    handleCustomSubmit,
  };
}
