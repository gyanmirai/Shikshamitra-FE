'use client';

import type { RootState } from 'src/redux/store';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useBoolean } from 'src/hooks/use-boolean';
import { shikshaMitraToast } from 'src/components/toast';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import {
  useCreateConcessionPolicyMutation,
  useUpdateConcessionPolicyMutation,
} from 'src/redux/finance/concessionPolicy';

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
    policyType: 'concession',
    valueSource: d?.valueSource || 'RequestEnteredWithinLimits',
    calculationMethod: d?.calculationMethod || 'Percentage',
    percentageValue: d?.percentageValue ?? null,
    fixedAmount: d?.fixedAmount ?? null,
    maximumPercentage: d?.maximumPercentage ?? null,
		maximumFixedAmount: d?.maximumFixedAmount ?? null,
    roundOff: d?.roundingMethod || d?.roundOff || 'None',
    applyOn: d?.applyOn || 'AllOutstanding',
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
    .when(['calculationMethod', 'valueSource'], {
      is: (method: string, source: string) =>
        method === 'Percentage' && source === 'PolicyFixed',
      then: (s) =>
        s.required('Percentage is required').min(0, 'Must be ≥ 0').max(100, 'Cannot exceed 100%'),
    }),
  fixedAmount: Yup.number()
    .nullable()
    .when(['calculationMethod', 'valueSource'], {
      is: (method: string, source: string) =>
        method === 'FixedAmount' && source === 'PolicyFixed',
      then: (s) => s.required('Fixed amount is required').min(0, 'Must be ≥ 0'),
    }),
  applyOn: Yup.string().required('Apply on is required'),
  maximumPercentage: Yup.number().nullable().min(0.01).max(100).when(['calculationMethod', 'valueSource'], {
		is: (method: string, source: string) => method === 'Percentage' && source === 'RequestEnteredWithinLimits',
		then: (schema) => schema.required('Maximum percentage is required'),
	}),
	maximumFixedAmount: Yup.number().nullable().min(0.01).when(['calculationMethod', 'valueSource'], {
		is: (method: string, source: string) => method === 'FixedAmount' && source === 'RequestEnteredWithinLimits',
		then: (schema) => schema.required('Maximum fixed amount is required'),
	}),
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

  // ─── API Mutations ────────────────────────────────────────────────────────
  const [createPolicy, { isLoading: isCreating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreateConcessionPolicyMutation,
  });
  const [updatePolicy, { isLoading: isUpdating }] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdateConcessionPolicyMutation,
  });
  const isSaving = isCreating || isUpdating;

  // ─── Formik ───────────────────────────────────────────────────────────────
  const formik = useFormik<IConcessionPolicyFormValues>({
    initialValues: getInitialValues(editData, academicYearId || currentYear?.id || ''),
    validationSchema,
    enableReinitialize: true,
    onSubmit: async (values, { resetForm }) => {
      try {
        const payload = {
          academicYearId: values.academicYearId,
          policyName: values.policyName,
          policyCode: values.policyCode || null,
          description: values.description,
          status: values.status,
          valueSource: values.valueSource,
          calculationMethod: values.calculationMethod,
          percentageValue: values.valueSource === 'PolicyFixed' ? values.percentageValue : null,
          fixedAmount: values.valueSource === 'PolicyFixed' ? values.fixedAmount : null,
          maximumPercentage: values.maximumPercentage,
			maximumFixedAmount: values.maximumFixedAmount,
          applyOn: values.applyOn,
          roundingMethod: values.roundOff,
        };
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
    const calcValid = !!values.calculationMethod &&
		(values.valueSource === 'RequestEnteredWithinLimits'
			? (values.calculationMethod === 'Percentage' && (values.maximumPercentage ?? 0) > 0) ||
			  (values.calculationMethod === 'FixedAmount' && (values.maximumFixedAmount ?? 0) > 0)
			: values.calculationMethod === 'FullWaiver' ||
        (values.calculationMethod === 'Percentage' &&
          values.percentageValue !== null &&
          values.percentageValue > 0) ||
        (values.calculationMethod === 'FixedAmount' &&
          values.fixedAmount !== null &&
          values.fixedAmount > 0));
    const applicationValid = !!values.applyOn;

    const isReadyToPublish = generalValid && calcValid && applicationValid;

    return {
      generalValid,
      calcValid,
      applicationValid,

      isReadyToPublish,
    };
  }, [formik]);

  // ─── Live Simulation ───────────────────────────────────────────────────────
  const simulation = useMemo(() => {
    const { values } = formik;
    const pending = Math.max(0, simFeeAmount - simAlreadyPaid);

    let concessionAmount = 0;
		const simulatedValue = values.valueSource === 'PolicyFixed'
			? values.calculationMethod === 'Percentage' ? values.percentageValue : values.fixedAmount
			: values.calculationMethod === 'Percentage' ? values.maximumPercentage : values.maximumFixedAmount;
		if (values.calculationMethod === 'Percentage' && simulatedValue) {
			concessionAmount = (pending * simulatedValue) / 100;
		} else if (values.calculationMethod === 'FixedAmount' && simulatedValue) {
			concessionAmount = simulatedValue;
    } else if (values.calculationMethod === 'FullWaiver') {
      concessionAmount = pending + simAlreadyPaid;
    }

    const newOutstanding = Math.max(0, pending - concessionAmount);

    return {
      concessionAmount: Math.round(concessionAmount),
      refundRequired: 0,
      newOutstanding: Math.round(newOutstanding),
      lateFeeImpact: simLateFee,
    };
  }, [formik, simFeeAmount, simAlreadyPaid, simLateFee]);

  return {
    formik,
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
