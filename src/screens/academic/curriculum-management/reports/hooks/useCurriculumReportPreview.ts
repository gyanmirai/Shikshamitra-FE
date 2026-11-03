import type { RootState } from 'src/redux/store';
import type { AcademicReportExportJobResponse } from 'src/redux/academicAPI/AcademicReportApi';

import { useSelector } from 'react-redux';
import { useRef, useState, useEffect } from 'react';
import { shikshaMitraToast } from 'src/components/toast';
import { useLazyGetAcademicReportExportJobQuery } from 'src/redux/academicAPI/AcademicReportApi';

import type { AcademicReportRequestDto } from '../CurriculumReportPreview.types';

function normalizeRequestObject(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Invalid report parameters');
  return Object.fromEntries(
    Object.entries(value).map(([key, field]) => [key.charAt(0).toLowerCase() + key.slice(1), field])
  );
}

function parseSavedRequest(job: AcademicReportExportJobResponse): AcademicReportRequestDto {
  const request = normalizeRequestObject(JSON.parse(job.requestJson || 'null'));
  if (request.reportType !== job.reportType || job.isDynamic)
    throw new Error('Invalid report type');
  return {
    ...request,
    filters: normalizeRequestObject(request.filters),
  } as AcademicReportRequestDto;
}

interface PreviewSelection {
  account: string;
  request: AcademicReportRequestDto;
  title: string;
  exportJobId: string | null;
}

export function useCurriculumReportPreview() {
  const account = useSelector(
    (state: RootState) =>
      `${state.auth?.sessionContext?.tenantId ?? ''}:${state.auth?.user?.sub ?? ''}`
  );
  const [getDetails] = useLazyGetAcademicReportExportJobQuery();
  const [selection, setSelection] = useState<PreviewSelection | null>(null);
  const [loading, setLoading] = useState<{ account: string; jobId: string } | null>(null);
  const generation = useRef(0);
  const currentAccount = useRef(account);
  currentAccount.current = account;

  useEffect(() => {
    generation.current += 1;
    setSelection(null);
    setLoading(null);
    return () => {
      generation.current += 1;
    };
  }, [account]);

  const closePreview = () => {
    generation.current += 1;
    setSelection(null);
    setLoading(null);
  };

  const handleView = async (row: AcademicReportExportJobResponse) => {
    generation.current += 1;
    const version = generation.current;
    const isCurrent = () => generation.current === version && currentAccount.current === account;
    setSelection(null);
    setLoading({ account, jobId: row.id });
    try {
      const job = await getDetails({ jobId: row.id }, false).unwrap();
      if (!isCurrent()) return;
      let request: AcademicReportRequestDto;
      try {
        if (job.id !== row.id) throw new Error('Invalid report identifier');
        request = parseSavedRequest(job);
      } catch {
        shikshaMitraToast.error({ message: 'Failed to parse report parameters.' });
        return;
      }
      setSelection({
        account,
        request,
        title: job.reportType,
        exportJobId:
          job.status === 'Completed' && job.format?.toLowerCase() === 'pdf' ? job.id : null,
      });
    } catch {
      if (isCurrent())
        shikshaMitraToast.error({ message: 'Failed to load report parameters. Please try again.' });
    } finally {
      if (isCurrent()) setLoading(null);
    }
  };

  return {
    selection: selection?.account === account ? selection : null,
    loadingJobId: loading?.account === account ? loading.jobId : null,
    handleView,
    closePreview,
  };
}
