import type { RecordRefundPayoutInput } from 'src/redux/finance/RefundManagement/feeRefundManage';

import dayjs from 'dayjs';
import { useFormik } from 'formik';
import { useRef, useState, useEffect } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { isCollectionOutcomeUncertain } from 'src/screens/finance/FeeCollection/FeeCollectionComponent/feeCollectionContext';
import {
  useRejectFeeRefundMutation,
  useApproveFeeRefundMutation,
  useRecordRefundPayoutMutation,
  useReturnRefundPayoutMutation,
} from 'src/redux/finance/RefundManagement/feeRefundManage';

import { financeRefundActionSchema } from './finance-refund-action-schema';

import type {
  FinanceRefundAction,
  FinanceRefundRecord,
  FinanceRefundActionValues,
} from './finance-refund-action-types';

export function useFinanceRefundAction({
  row,
  action,
  disabled,
  onComplete,
  onBusyChange,
  onDirtyChange,
}: {
  row: FinanceRefundRecord;
  action: FinanceRefundAction;
  disabled: boolean;
  onComplete: () => void;
  onBusyChange: (busy: boolean) => void;
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const [approve, approval] = useApproveFeeRefundMutation();
  const [reject, rejection] = useRejectFeeRefundMutation();
  const [payout, payment] = useRecordRefundPayoutMutation();
  const [returnPayment, returned] = useReturnRefundPayoutMutation();
  const [error, setError] = useState('');
  const [uncertain, setUncertain] = useState(false);
  const frozenPayout = useRef<RecordRefundPayoutInput | null>(null);
  const inFlight = useRef(false);
  const method = row.refundMethod || '';
  const working =
    approval.isLoading || rejection.isLoading || payment.isLoading || returned.isLoading;
  const formik = useFormik<FinanceRefundActionValues>({
    initialValues: {
      expenseCategoryId: row.expenseCategoryId || row.defaultExpenseCategoryId || '',
      bankAccountId: row.payingBankAccountId || row.defaultPayingBankAccountId || '',
      externalReference: '',
      paymentDate: '',
      reason: '',
      evidenceReference: '',
    },
    validationSchema: financeRefundActionSchema(action, method),
    onSubmit: async (values) => {
      if (disabled || inFlight.current || (uncertain && action !== 'recordPayout')) return;
      inFlight.current = true;
      setError('');
      try {
        if (action === 'approve')
          await approve({
            id: row.id,
            method,
            expenseCategoryId: values.expenseCategoryId,
            ...(method !== 'Cash' && { bankAccountId: values.bankAccountId }),
          }).unwrap();
        else if (action === 'reject')
          await reject({ id: row.id, notes: values.reason.trim() }).unwrap();
        else if (action === 'returnPayout') {
          const settlement = row.settlements?.filter(
            (item) => item.status === 1 && item.method !== 'Cash'
          );
          if (settlement?.length !== 1)
            throw new Error('Select a single confirmed original noncash payout for return.');
          await returnPayment({
            id: row.id,
            settlementId: settlement[0].id,
            reason: values.reason.trim(),
            evidenceReference: values.evidenceReference.trim(),
          }).unwrap();
        } else {
          frozenPayout.current ??= {
            idempotencyKey: crypto.randomUUID(),
            method,
            amount: row.approvedAmount,
            paymentDate: dayjs(values.paymentDate).toISOString(),
            expenseCategoryId: values.expenseCategoryId,
            ...(method !== 'Cash' && {
              bankAccountId: values.bankAccountId,
              externalReference: values.externalReference.trim(),
            }),
          };
          await payout({ id: row.id, body: frozenPayout.current }).unwrap();
        }
        setUncertain(false);
        frozenPayout.current = null;
        formik.resetForm();
        onComplete();
      } catch (failure) {
        setUncertain(isCollectionOutcomeUncertain(failure));
        setError(parseApiProblemDetail(failure).detail);
        if (!isCollectionOutcomeUncertain(failure)) frozenPayout.current = null;
      } finally {
        inFlight.current = false;
      }
    },
  });
  useEffect(() => {
    onBusyChange(working || uncertain);
    return () => onBusyChange(false);
  }, [working, uncertain, onBusyChange]);
  useEffect(() => {
    onDirtyChange?.(formik.dirty);
    return () => onDirtyChange?.(false);
  }, [formik.dirty, onDirtyChange]);
  return { formik, error, uncertain, working, locked: disabled || working || uncertain };
}
