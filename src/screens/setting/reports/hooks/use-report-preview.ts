import { useState, useEffect } from 'react';
import { useInstituteReportPreviewMutation } from 'src/redux/InstituteSetup/instituteReportsApi';

import type { ReportPreview, InstituteReportRequest } from '../types';

export function useReportPreview(request: InstituteReportRequest) {
  const [pagination, setPagination] = useState({ page: 0, size: 25 });
  const [preview, setPreview] = useState<ReportPreview>();
  const [attempt, setAttempt] = useState(0);
  const [load, result] = useInstituteReportPreviewMutation();
  const { page, size } = pagination;

  useEffect(() => {
    let active = true;
    const call = load({ ...request, page: page + 1, pageSize: size });
    call.then((response) => {
      if (active && response.data) setPreview(response.data);
    });
    return () => {
      active = false;
      call.abort();
    };
  }, [load, request, page, size, attempt]);

  return {
    preview,
    page,
    size,
    loading: result.isUninitialized || result.isLoading,
    error: result.isError ? result.error : undefined,
    setPagination,
    retry: () => setAttempt((value) => value + 1),
  };
}
