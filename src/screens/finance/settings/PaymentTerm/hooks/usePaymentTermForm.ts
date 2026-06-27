'use client';

import type { FormikTouched } from 'formik';
import type { RootState } from 'src/redux/store';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useSelector } from 'react-redux';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { shikshaMitraToast } from 'src/components/toast';
import { useGetBoardsQuery } from 'src/redux/board/boardApi';
import { useMemo, useState, useEffect, useCallback } from 'react';
import useQueryAndMutation from 'src/redux/customQueryAndMutation';
import { useGetFinancePoliciesQuery } from 'src/redux/finance/financePolicy';
import {
  useCreatePaymentTermMutation,
  useUpdatePaymentTermMutation,
} from 'src/redux/finance/paymentTerm';

import { getInitialPaymentTermData } from '../Components/PaymentTermInitialValues';
import { paymentTermValidationSchema } from '../Components/PaymentTermValidationSchema';

import type { IInstallment, IPaymentTerm } from '../type';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

// ---------------------------------------------------------------------------
// Public board shape — eliminates `any` throughout consumers
// ---------------------------------------------------------------------------
export interface IBoard {
  id: string;
  name: string;
  academicYearId: string;
}

// ---------------------------------------------------------------------------
// Late-fee policy shape — eliminates `any` throughout consumers
// ---------------------------------------------------------------------------
export interface ILateFeePolicy {
  id: string;
  policyName: string;
}

// ---------------------------------------------------------------------------
// Computed publish-readiness checks shared between the sidebar and footer
// ---------------------------------------------------------------------------
export interface IPaymentTermChecks {
  boardValid: boolean;
  nameValid: boolean;
  hasInstallments: boolean;
  allDueDates: boolean;
  allNames: boolean;
  uniqueNames: boolean;
  datesSequential: boolean;
  demandSet: boolean;
  demandOffsetValid: boolean;
  isReadyToPublish: boolean;
}

// ---------------------------------------------------------------------------
// Full return contract exposed to consuming components
// ---------------------------------------------------------------------------
export interface UsePaymentTermFormReturn {
  formik: ReturnType<typeof useFormik<IPaymentTerm>>;
  boards: IBoard[];
  lateFeePolicies: ILateFeePolicy[];
  checks: IPaymentTermChecks;
  demandLabel: string;
  isSavingDraft: boolean;
  isPublishing: boolean;
  codeManuallyEdited: boolean;
  setCodeManuallyEdited: (v: boolean) => void;
  handleSaveDraft: () => Promise<void>;
  handlePublish: () => Promise<void>;
  addInstallment: () => void;
  removeInstallment: (index: number) => void;
  duplicateInstallment: (index: number) => void;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function usePaymentTermForm(
  editData: IPaymentTerm | null,
  onClose: (e?: React.SyntheticEvent | null, isSubmit?: boolean) => void
): UsePaymentTermFormReturn {
  const { currentYear } = useSelector((state: RootState) => state.globalState);

  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [codeManuallyEdited, setCodeManuallyEdited] = useState(false);

  // ── Data queries ──────────────────────────────────────────────────────────
  const { data: lateFeePoliciesData } = useGetFinancePoliciesQuery({ policyType: 'late-fee' });
  const lateFeePolicies = useMemo(
    () => (lateFeePoliciesData?.items || []) as ILateFeePolicy[],
    [lateFeePoliciesData?.items]
  );

  const { data: boardData } = useGetBoardsQuery('');

  /**
   * Memoization Justification:
   * Filters the full board list by academicYearId on every render. Without memoization,
   * a new array reference is created every render cycle, causing downstream Select and
   * GeneralInfoSection to re-render even when board data hasn't changed.
   * Profiling signal: boardData updates infrequently; currentYear.id only changes on
   * year-switcher action — both are stable across form interactions.
   */
  const boards = useMemo<IBoard[]>(() => {
    if (!boardData?.items || !currentYear?.id) return [];
    return boardData.items.filter((b: IBoard) => b.academicYearId === currentYear.id);
  }, [boardData?.items, currentYear?.id]);

  // ── Mutations ─────────────────────────────────────────────────────────────
  const [createTerm] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useCreatePaymentTermMutation,
  });
  const [updateTerm] = useQueryAndMutation({
    type: 'mutation',
    currentQueryAndMutation: useUpdatePaymentTermMutation,
  });

  // ── Formik ────────────────────────────────────────────────────────────────
  const formik = useFormik<IPaymentTerm>({
    initialValues: getInitialPaymentTermData(editData, currentYear?.id),
    validationSchema: paymentTermValidationSchema(currentYear),
    enableReinitialize: true,
    onSubmit: async () => {},
  });

  // ── Reset manual-edit flag when switching create ↔ edit ──────────────────
  useEffect(() => {
    setCodeManuallyEdited(Boolean(editData?.paymentTermCode));
  }, [editData]);

  // ── Auto-generate code from name ──────────────────────────────────────────
  useEffect(() => {
    if (!codeManuallyEdited && formik.values.paymentTermName) {
      const slug = formik.values.paymentTermName
        .toUpperCase()
        .replace(/\s+/g, '-')
        .replace(/[^A-Z0-9-]/g, '')
        .slice(0, 16);
      formik.setFieldValue('paymentTermCode', `PT-${slug}`);
    }
    // formik.setFieldValue is stable; no suppression needed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.paymentTermName, codeManuallyEdited]);

  // ── Build API payload ─────────────────────────────────────────────────────
  const buildPayload = useCallback(
    (values: IPaymentTerm, overrideStatus?: string) => ({
      ...values,
      boardName: boards.find((b) => b.id === values.boardId)?.name ?? '',
      academicYearId: currentYear?.id ?? values.academicYearId,
      ...(overrideStatus ? { status: overrideStatus as IPaymentTerm['status'] } : {}),
      installments: values.installments.map((inst) => ({
        ...inst,
        startDate: inst.startDate ? dayjs(inst.startDate as string).toISOString() : null,
        dueDate: inst.dueDate ? dayjs(inst.dueDate as string).toISOString() : null,
        reminderDate: inst.reminderDate ? dayjs(inst.reminderDate as string).toISOString() : null,
      })),
    }),
    [boards, currentYear?.id]
  );

  // ── Submit to API ─────────────────────────────────────────────────────────
  const submitToAPI = useCallback(
    async (overrideStatus?: string) => {
      const payload = buildPayload(formik.values, overrideStatus);

      if (editData?.id) {
        if (editData.isUsedInDownstream) {
          const suffix = Date.now().toString().slice(-3);
          await createTerm({
            ...payload,
            paymentTermName: `${payload.paymentTermName} (V${suffix})`,
            paymentTermCode: `${payload.paymentTermCode}-V${suffix}`,
          });
          shikshaMitraToast.success({
            message: 'Payment term is in use. Saved as a new version.',
          });
        } else {
          await updateTerm({ id: editData.id, body: payload });
          shikshaMitraToast.success({
            message: `"${payload.paymentTermName}" updated successfully.`,
          });
        }
      } else {
        await createTerm(payload);
        shikshaMitraToast.success({
          message: `"${payload.paymentTermName}" created successfully.`,
        });
      }
      onClose(null, true);
    },
    [buildPayload, createTerm, editData, formik.values, onClose, updateTerm]
  );

  // ── Save Draft ────────────────────────────────────────────────────────────
  /**
   * Memoization Justification:
   * handleSaveDraft is passed as a prop to the memoized FormFooter component.
   * Without useCallback, a new function reference is created on every render,
   * defeating React.memo on FormFooter and causing unnecessary re-renders during
   * fast form typing.
   */
  const handleSaveDraft = useCallback(async () => {
    if (!formik.values.paymentTermName?.trim() || !formik.values.boardId) {
      formik.setFieldTouched('paymentTermName', true);
      formik.setFieldTouched('boardId', true);
      shikshaMitraToast.error({
        message: 'Board and Payment Term Name are required to save draft.',
      });
      return;
    }
    setIsSavingDraft(true);
    try {
      await submitToAPI();
    } catch {
      shikshaMitraToast.error({ message: 'Failed to save draft.' });
    } finally {
      setIsSavingDraft(false);
    }
  }, [formik, submitToAPI]);

  // ── Publish ───────────────────────────────────────────────────────────────
  /**
   * Memoization Justification:
   * handlePublish is passed as a prop to the memoized FormFooter component.
   * Same rationale as handleSaveDraft — prevents FormFooter re-renders during
   * form-field interactions unrelated to submission state.
   */
  const handlePublish = useCallback(async () => {
    const errors = await formik.validateForm();
    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      const instTouched = formik.values.installments.map(() => ({
        installmentName: true,
        dueDate: true,
        startDate: true,
        gracePeriod: true,
      }));
      formik.setTouched({
        boardId: true,
        paymentTermName: true,
        status: true,
        demandGenerationRule: true,
        demandOffsetDays: true,
        installments: instTouched,
      } as FormikTouched<IPaymentTerm>);
      shikshaMitraToast.error({ message: 'Fix all errors before publishing.' });
      return;
    }
    setIsPublishing(true);
    try {
      await submitToAPI('Active');
    } catch {
      shikshaMitraToast.error({ message: 'Failed to publish.' });
    } finally {
      setIsPublishing(false);
    }
  }, [formik, submitToAPI]);

  // ── Installment CRUD ──────────────────────────────────────────────────────
  /**
   * Memoization Justification:
   * addInstallment is passed as a prop to InstallmentSection (which wraps the
   * empty-state button and the "Add Another" button). Without useCallback, the
   * prop changes reference every render, preventing effective React.memo bailout
   * on InstallmentSection during typing in unrelated fields.
   */
  const addInstallment = useCallback(() => {
    const seq = formik.values.installments.length + 1;
    const newInst: IInstallment = {
      installmentName: `Installment ${seq}`,
      sequence: seq,
      startDate: null,
      endDate: null,
      dueDate: null,
      description: '',
      reminderDate: null,
      gracePeriod: 0,
      lateFeePolicyId: '',
      allowPartialOverride: false,
      demandEnabled: true,
      reminderEnabled: true,
    };
    formik.setFieldValue('installments', [...formik.values.installments, newInst]);
  }, [formik]);

  /**
   * Memoization Justification:
   * removeInstallment is passed as a prop to each InstallmentCard within the
   * list. A stable reference avoids re-rendering all cards when one field
   * changes in the parent form.
   */
  const removeInstallment = useCallback(
    (index: number) => {
      const updated = formik.values.installments
        .filter((_, i) => i !== index)
        .map((inst, i) => ({ ...inst, sequence: i + 1 }));
      formik.setFieldValue('installments', updated);
    },
    [formik]
  );

  /**
   * Memoization Justification:
   * duplicateInstallment follows the same pattern as removeInstallment — passed
   * as a prop to InstallmentCard components in a list, requiring reference
   * stability to allow React.memo to be effective.
   */
  const duplicateInstallment = useCallback(
    (index: number) => {
      const src = formik.values.installments[index];
      const seq = formik.values.installments.length + 1;
      formik.setFieldValue('installments', [
        ...formik.values.installments,
        {
          ...src,
          id: undefined,
          installmentName: `${src.installmentName} (Copy)`,
          sequence: seq,
          startDate: null,
          dueDate: null,
        },
      ]);
    },
    [formik]
  );

  // ── Live validation checks (used by sidebar & footer) ────────────────────
  /**
   * Memoization Justification:
   * checks iterates the entire installments array on every keystroke (O(n)
   * per render). It also produces an object — a new reference every time —
   * which would cascade re-renders to both SummaryPanel and FormFooter.
   * useMemo gates re-computation to changes in formik.values only, preventing
   * redundant work during unrelated state updates (e.g. isSavingDraft flip).
   */
  const checks = useMemo<IPaymentTermChecks>(() => {
    const v = formik.values;
    const boardValid = Boolean(v.boardId);
    const nameValid = v.paymentTermName.trim().length >= 3;
    const hasInstallments = v.installments.length >= 1;
    const allDueDates = hasInstallments && v.installments.every((i) => Boolean(i.dueDate));
    const allNames = v.installments.every((i) => i.installmentName.trim().length > 0);
    const nameSet = new Set(v.installments.map((i) => i.installmentName.toLowerCase().trim()));
    const uniqueNames = v.installments.length === nameSet.size;

    let datesSequential = true;
    if (v.installments.length > 1) {
      const sorted = [...v.installments].sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      // eslint-disable-next-line no-plusplus
      for (let i = 1; i < sorted.length; i++) {
        if (sorted[i - 1].dueDate && sorted[i].dueDate) {
          if (!dayjs(sorted[i].dueDate as string).isAfter(dayjs(sorted[i - 1].dueDate as string))) {
            datesSequential = false;
            break;
          }
        }
      }
    }

    const demandSet = !v.enableBillingSchedule || Boolean(v.demandGenerationRule);
    const demandOffsetValid =
      !v.enableBillingSchedule ||
      v.demandGenerationRule !== 'XDaysBeforeDue' ||
      (v.demandOffsetDays !== null && v.demandOffsetDays >= 1);

    const isReadyToPublish =
      boardValid &&
      nameValid &&
      hasInstallments &&
      allDueDates &&
      allNames &&
      uniqueNames &&
      datesSequential &&
      demandSet &&
      demandOffsetValid;

    return {
      boardValid,
      nameValid,
      hasInstallments,
      allDueDates,
      allNames,
      uniqueNames,
      datesSequential,
      demandSet,
      demandOffsetValid,
      isReadyToPublish,
    };
  }, [formik.values]);

  // ── Demand label for the summary sidebar ──────────────────────────────────
  /**
   * Memoization Justification:
   * demandLabel is a derived string consumed by SummaryPanel. Without memoization,
   * the string is reconstructed on every render of the parent; the useMemo narrows
   * recomputation to changes in the three relevant form values only, preventing
   * SummaryPanel from re-rendering when unrelated fields (e.g. description) change.
   */
  const demandLabel = useMemo<string>(() => {
    if (!formik.values.enableBillingSchedule) return 'Disabled';
    const r = formik.values.demandGenerationRule;
    if (!r) return '—';
    if (r === 'XDaysBeforeDue') {
      return `${formik.values.demandOffsetDays ?? '?'} days before due`;
    }
    const map: Record<string, string> = {
      Immediately: 'Immediately',
      OnDueDate: 'On due date',
      Manual: 'Manual',
    };
    return map[r] ?? r;
  }, [
    formik.values.enableBillingSchedule,
    formik.values.demandGenerationRule,
    formik.values.demandOffsetDays,
  ]);

  return {
    formik,
    boards,
    lateFeePolicies,
    checks,
    demandLabel,
    isSavingDraft,
    isPublishing,
    codeManuallyEdited,
    setCodeManuallyEdited,
    handleSaveDraft,
    handlePublish,
    addInstallment,
    removeInstallment,
    duplicateInstallment,
  };
}
