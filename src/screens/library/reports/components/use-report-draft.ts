import type { RootState } from 'src/redux/store';
import type {
  LibraryReportOptions,
  LibraryReportPreview,
} from 'src/redux/library/library-adapters';

import { toast } from 'sonner';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { parseApiProblemDetail } from 'src/utils/api-problem-details';
import { buildLibraryReportRequestPayload } from 'src/redux/library/library-adapters';
import {
  usePreviewLibraryReportMutation,
  useCreateLibraryReportExportMutation,
} from 'src/redux/library/reports-api';

import { loanAsOfDate } from '../../circulation/loan-read-query';
import { useLibraryReportExportAccess } from '../hooks/useLibraryReportExportAccess';

import type { ReportDraftValues, LibraryReportIdentity } from './report-draft-types';

export function useReportDraft(report: LibraryReportIdentity, options?: LibraryReportOptions) {
  const currentYear = useSelector((state: RootState) => state.globalState.currentYear);
  const academicYearId = (currentYear as { id?: string })?.id;
  const [result, setResult] = useState<{
    requestKey: string;
    preview: LibraryReportPreview;
  } | null>(null);
  const [values, setValues] = useState<ReportDraftValues>({
    format: options?.formats[0]?.id || 'excel',
    search: '',
    fromDate: '',
    toDate: '',
    asOfDate: '',
    copyStatus: '',
    issueStatus: '',
    chargeStatus: '',
    top: report.id.includes('Popular') ? '10' : '',
  });
  const [previewReport, previewState] = usePreviewLibraryReportMutation();
  const [createExport, exportState] = useCreateLibraryReportExportMutation();
  const canExport = useLibraryReportExportAccess();
  const busy = previewState.isLoading || exportState.isLoading;
  const invalid =
    [values.fromDate, values.toDate, values.asOfDate].some(
      (value) => value && !loanAsOfDate(value)
    ) || Boolean(values.fromDate && values.toDate && values.toDate < values.fromDate);
  const request = buildLibraryReportRequestPayload({
    ...values,
    reportType: report.id,
    academicYearId,
    page: 1,
    pageSize: 50,
  });
  const requestKey = JSON.stringify(request);
  const onChange = (field: keyof ReportDraftValues, value: string) =>
    setValues((current) => ({ ...current, [field]: value }));
  const onPreview = async () => {
    if (!academicYearId || invalid || busy) return;
    setResult(null);
    try {
      const preview = await previewReport(request).unwrap();
      setResult({ requestKey, preview });
    } catch (error) {
      toast.error(parseApiProblemDetail(error).detail);
    }
  };
  const onExport = async () => {
    if (!canExport || !academicYearId || invalid || busy) return;
    try {
      await createExport(request).unwrap();
      toast.success('Report queued.');
    } catch (error) {
      toast.error(parseApiProblemDetail(error).detail);
    }
  };
  return {
    academicYearId,
    values,
    preview: result?.requestKey === requestKey ? result.preview : null,
    canExport,
    busy,
    invalid,
    onChange,
    onPreview,
    onExport,
    previewState,
    exportState,
  };
}
