import type { RootState } from 'src/redux/store';
import type {
  StockImportBatch,
  StockImportInput,
  StockImportCommand,
  StockImportPreview,
} from 'src/redux/library/stock-import-api';

import { useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { shikshaMitraToast } from 'src/components/toast';
import { useFormik, setNestedObjectValues } from 'formik';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import {
  useCommitStockImportMutation,
  useGetStockImportOptionsQuery,
  usePreviewStockImportMutation,
} from 'src/redux/library/stock-import-api';

import { useReceivingAccess } from '../useReceivingAccess';
import { useCommandAttempt } from '../../circulation/useCommandAttempt';
import { importSchema, readStockCsv, initialImportValues } from './stockImportForm';

export function useStockImportDraft() {
  const access = useReceivingAccess();
  const currentYear = useSelector(
    (state: RootState) => (state.globalState.currentYear as { id?: string })?.id
  );
  const formik = useFormik({
    initialValues: initialImportValues,
    validationSchema: importSchema,
    onSubmit: () => undefined,
  });
  const yearId = formik.values.academicYearId || currentYear || '';
  const options = useGetStockImportOptionsQuery(yearId, { skip: !yearId || !access.canReceive });
  const [previewRequest] = usePreviewStockImportMutation();
  const [commitRequest] = useCommitStockImportMutation();
  const [file, setFile] = useState<{ csv: string; name: string; id: string } | null>(null);
  const [review, setReview] = useState<{
    key: string;
    input: StockImportInput;
    result: StockImportPreview;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState<StockImportBatch | null>(null);
  const inFlight = useRef(false);
  const key = JSON.stringify([yearId, formik.values, file?.id]);
  const latestKey = useRef(key);
  latestKey.current = key;
  const attempt = useCommandAttempt<Omit<StockImportCommand, 'idempotencyKey'>>();
  const retry = attempt.retry(key);
  const reviewed = review?.key === key ? review : null;
  const canCommit =
    access.canReceive &&
    !saved &&
    !busy &&
    Boolean(
      retry || (!attempt.conflict && reviewed?.result.revision && !reviewed.result.errors.length)
    );

  const selectFile = async (upload: File | null) => {
    if (!upload || inFlight.current || saved || retry || !access.canReceive) return;
    inFlight.current = true;
    setBusy(true);
    setFile(null);
    setError('');
    try {
      setFile({ csv: await readStockCsv(upload), name: upload.name, id: crypto.randomUUID() });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not read the stock file.');
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const preview = async () => {
    if (inFlight.current || !access.canReceive || retry || saved) return;
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      const errors = await formik.validateForm();
      await formik.setTouched(setNestedObjectValues(errors, true), false);
      if (!file || !yearId) {
        setError('Choose an academic year and upload a CSV file.');
        return;
      }
      const { values } = formik;
      if (Object.keys(errors).length || values.source === null) return;
      const input: StockImportInput = {
        csv: file.csv,
        academicYearId: yearId,
        sectionId: values.sectionId,
        shelfId: values.shelfId,
        categoryId: values.categoryId || null,
        receivedOn: values.receivedOn,
        source: values.source,
        sourceName: values.sourceName.trim() || null,
        columnMap: Object.fromEntries(
          Object.entries(values.columnMap).filter(([, heading]) => heading.trim() !== '')
        ),
      };
      const result = await previewRequest(input).unwrap();
      if (latestKey.current === key) {
        setReview({ key, input, result });
        attempt.reviewed();
      }
    } catch (cause) {
      if (latestKey.current === key) {
        setReview(null);
        setError(
          parseApiProblemDetail(cause).detail ||
            'Could not preview this CSV. Your file is retained.'
        );
      }
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  const commit = async () => {
    if (inFlight.current || !canCommit) return;
    const command =
      retry ||
      attempt.prepare(key, { import: reviewed!.input, revision: reviewed!.result.revision! });
    inFlight.current = true;
    setBusy(true);
    setError('');
    try {
      setSaved(await commitRequest(command).unwrap());
      shikshaMitraToast.success({ message: 'Stock import confirmed.' });
    } catch (cause) {
      const problem = parseApiProblemDetail(cause);
      const changed = problem.errorCode === 'Library:Receiving:010095';
      attempt.failed(key, changed ? { status: 409 } : cause);
      if (changed) setReview(null);
      setError(
        changed
          ? 'School stock or settings changed. Preview the same file again before importing.'
          : problem.detail ||
              'The import could not be confirmed. Your file and submission attempt are retained.'
      );
    } finally {
      inFlight.current = false;
      setBusy(false);
    }
  };

  return {
    formik,
    options,
    yearId,
    fileName: file?.name,
    selectFile,
    preview,
    commit,
    canCommit,
    access,
    busy,
    saved,
    error,
    reviewed: reviewed?.result,
    uncertain: Boolean(retry) && !saved,
  };
}
