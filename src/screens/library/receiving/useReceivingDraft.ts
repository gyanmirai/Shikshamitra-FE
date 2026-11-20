import type {
  StockReceipt,
  ReceivingInput,
  ReceiveCommand,
  ReceivingPreview,
} from 'src/redux/library/receiving-types';

import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useFormik, setNestedObjectValues } from 'formik';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  usePreviewReceivingMutation,
  useReceiveLibraryStockMutation,
} from 'src/redux/library/receiving-api';

import { useReceivingAccess } from './useReceivingAccess';
import { useCommandAttempt } from '../circulation/useCommandAttempt';
import {
  receivingSchema,
  buildReceivingInput,
  receivingFingerprint,
  createReceivingValues,
} from './receiving-form';

export function useReceivingDraft() {
  const access = useReceivingAccess();
  const [initialValues] = useState(createReceivingValues);
  const [operationId, setOperationId] = useState(() => crypto.randomUUID());
  const formik = useFormik({
    initialValues,
    validationSchema: receivingSchema,
    onSubmit: () => undefined,
  });
  const [previewRequest] = usePreviewReceivingMutation();
  const [receiveRequest] = useReceiveLibraryStockMutation();
  const [review, setReview] = useState<{
    key: string;
    body: ReceivingInput;
    result: ReceivingPreview;
  } | null>(null);
  const [saved, setSaved] = useState<StockReceipt | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inFlight = useRef(false);
  const currentKey = `${operationId}:${receivingFingerprint(formik.values)}`;
  const latestKey = useRef(currentKey);
  latestKey.current = currentKey;
  const attempt = useCommandAttempt<Omit<ReceiveCommand, 'idempotencyKey'>>();
  const retry = attempt.retry(currentKey);
  const previewResult = review?.key === currentKey ? review.result : null;
  const canReceive =
    access.canReceive &&
    !saved &&
    !busy &&
    Boolean(
      retry ||
      (!attempt.conflict &&
        previewResult?.canReceive &&
        previewResult.revision &&
        !previewResult.errors.length)
    );

  const preview = async () => {
    if (inFlight.current || !access.canReceive || retry || saved) return;
    const errors = await formik.validateForm();
    await formik.setTouched(setNestedObjectValues(errors, true), false);
    if (Object.keys(errors).length) return;
    const body = buildReceivingInput(formik.values);
    const key = currentKey;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const result = await previewRequest(body).unwrap();
      if (latestKey.current === key) {
        setReview({ key, body, result });
        attempt.reviewed();
      }
    } catch (cause) {
      if (latestKey.current === key)
        setError(
          parseApiProblemDetail(cause).detail ||
            'Could not preview this receipt. Your draft is retained.'
        );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  const startAnother = () => {
    if (!saved || busy || !access.canReceive) return;
    setOperationId(crypto.randomUUID());
    setSaved(null);
    setReview(null);
    setError('');
    attempt.reviewed();
    formik.resetForm({ values: createReceivingValues() });
  };
  const receive = async () => {
    if (inFlight.current || !canReceive || saved) return;
    const key = currentKey;
    const command =
      retry || attempt.prepare(key, { receipt: review!.body, revision: previewResult!.revision! });
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const receipt = await receiveRequest(command).unwrap();
      setSaved(receipt);
      shikshaMitraToast.success({ message: 'Stock receipt confirmed.' });
      formik.resetForm({ values: formik.values });
    } catch (cause) {
      const problem = parseApiProblemDetail(cause);
      const stockChanged = problem.errorCode === 'Library:Receiving:010084';
      attempt.failed(key, stockChanged ? { status: 409 } : cause);
      setError(
        stockChanged
          ? 'Stock changed after this preview. Preview again before receiving copies.'
          : problem.detail ||
              'The receipt could not be confirmed. Your draft and submission attempt are retained.'
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };
  return {
    formik,
    previewResult,
    saved,
    busy,
    error,
    preview,
    receive,
    startAnother,
    canReceive,
    uncertain: !saved && Boolean(retry),
    conflict: attempt.conflict,
    access,
  };
}
