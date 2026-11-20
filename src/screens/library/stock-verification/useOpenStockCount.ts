import type {
  OpenStockCount,
  StockCountInput,
  StockCountPreview,
} from 'src/redux/library/stock-verification-api';

import * as Yup from 'yup';
import { useFormik } from 'formik';
import { useRef, useState } from 'react';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useOpenStockCountMutation,
  usePreviewStockCountMutation,
  useGetStockCountOptionsQuery,
} from 'src/redux/library/stock-verification-api';

import { useCommandAttempt } from '../circulation/useCommandAttempt';
import { useStockVerificationAccess } from './useStockVerificationAccess';

type Values = { name: string; sectionId: string; shelfId: string; schoolDate: string };

const makeInput = (values: Values): StockCountInput => ({
  name: values.name.trim(),
  sectionId: values.sectionId || null,
  shelfId: values.shelfId || null,
  schoolDate: values.schoolDate || null,
});

export function useOpenStockCount(onOpened: (id: string) => void) {
  const access = useStockVerificationAccess();
  const locations = useGetStockCountOptionsQuery(undefined, {
    skip: !access.canOpen,
    refetchOnMountOrArgChange: true,
  });
  const [previewRequest, previewState] = usePreviewStockCountMutation();
  const [openRequest, openState] = useOpenStockCountMutation();
  const attempt = useCommandAttempt<Omit<OpenStockCount, 'idempotencyKey'>>();
  const [review, setReview] = useState<{ key: string; result: StockCountPreview }>();
  const [error, setError] = useState('');
  const [opened, setOpened] = useState(false);
  const latch = useRef(false);
  const formik = useFormik({
    initialValues: { name: '', sectionId: '', shelfId: '', schoolDate: '' },
    validationSchema: Yup.object({
      name: Yup.string().trim().required('Enter a count name.').max(160),
      sectionId: locations.data?.canCountWholeSchool
        ? Yup.string()
        : Yup.string().required('Choose a section.'),
      schoolDate: locations.data?.schoolDate
        ? Yup.string()
        : Yup.string().required('Choose the school date.'),
    }),
    onSubmit: async (values) => {
      if (latch.current || !access.canOpen || !locations.data || opened) return;
      const body = makeInput(values);
      const key = JSON.stringify(body);
      if (attempt.retry(key)) return;
      latch.current = true;
      setError('');
      setReview(undefined);
      try {
        const result = await previewRequest(body).unwrap();
        if (latestKey.current === key) {
          setReview({ key, result });
          attempt.reviewed();
        }
      } catch (cause) {
        if (latestKey.current === key)
          setError(parseApiProblemDetail(cause).detail || 'Could not preview the count.');
      } finally {
        latch.current = false;
      }
    },
  });
  const input = makeInput(formik.values);
  const key = JSON.stringify(input);
  const latestKey = useRef(key);
  latestKey.current = key;
  const preview = review?.key === key ? review.result : undefined;
  const retry = attempt.retry(key);
  const busy = previewState.isLoading || openState.isLoading;
  const canSubmit =
    access.canOpen && !busy && !opened && Boolean(retry || (preview && !attempt.conflict));

  const open = async () => {
    if (!canSubmit || latch.current) return;
    const command = retry || attempt.prepare(key, { count: input, revision: preview!.revision });
    setError('');
    latch.current = true;
    try {
      const result = await openRequest(command).unwrap();
      setOpened(true);
      formik.resetForm({ values: formik.values });
      onOpened(result.id);
    } catch (cause) {
      attempt.failed(key, cause);
      const problem = parseApiProblemDetail(cause);
      if (problem.errorCode === 'Library:InventoryVerification:010091') setReview(undefined);
      setError(problem.detail || 'The count could not be confirmed. Try the same request again.');
    } finally {
      latch.current = false;
    }
  };

  return {
    formik,
    locations,
    preview,
    busy,
    opened,
    error,
    canSubmit,
    open,
    retry,
    previewLoading: previewState.isLoading,
    openLoading: openState.isLoading,
  };
}
