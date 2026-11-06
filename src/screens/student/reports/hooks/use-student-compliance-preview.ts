import type { RecordsReportInput } from 'src/redux/student/records/student-record-reports-api';

import { useRef, useState } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import {
  useCreateRecordsReportMutation,
  useGetRecordsReportPreviewQuery,
} from 'src/redux/student/records/student-record-reports-api';

import { getStudentReportError } from '../utils/compliance-report-model';

export function useStudentCompliancePreview(
  request: RecordsReportInput,
  canGenerate: boolean,
  onGenerated: () => void
) {
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(25);
  const preview = useGetRecordsReportPreviewQuery(
    { ...request, skipCount: page * size, maxResultCount: size },
    { refetchOnMountOrArgChange: true }
  );
  const [create, creating] = useCreateRecordsReportMutation();
  const clientKey = useRef(crypto.randomUUID());
  const pending = useRef(false);
  const queue = async () => {
    if (
      pending.current ||
      !canGenerate ||
      !preview.currentData ||
      preview.isError ||
      preview.isFetching
    )
      return;
    pending.current = true;
    try {
      await create({
        ...request,
        skipCount: 0,
        maxResultCount: 100,
        clientKey: clientKey.current,
      }).unwrap();
      shikshaMitraToast.success({
        message: 'Excel report queued. Download it from Generated Reports when ready.',
      });
      onGenerated();
    } catch (error) {
      shikshaMitraToast.error({
        message: getStudentReportError(
          error,
          'The report could not be queued. Your scope has been kept; retry when ready.'
        ),
      });
    } finally {
      pending.current = false;
    }
  };
  return { preview, page, setPage, size, setSize, creating, queue };
}
