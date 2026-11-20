export const academicReportIdPattern = /^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i;

export const academicReportPaths = {
  download: (jobId: string) => `/api/academic-reports/${encodeURIComponent(jobId)}/download`,
  recovery: (jobId: string) => `/academic/report-exports/${encodeURIComponent(jobId)}`,
};
