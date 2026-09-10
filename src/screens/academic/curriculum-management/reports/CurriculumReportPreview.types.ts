export interface AcademicReportRequestDto {
  reportType: string;
  format?: string | null;
  page?: number;
  pageSize?: number;
  filters?: {
    academicYearId?: string | null;
    classIds?: string[] | null;
    subjectIds?: string[] | null;
    statuses?: number[] | null;
    revisionRequired?: boolean | null;
  };
}

export interface PreviewColumn {
  id: string | null;
  label: string | null;
}

export interface PreviewData {
  reportType: string | null;
  totalCount: number;
  page: number;
  pageSize: number;
  columns: PreviewColumn[] | null;
  rows: Record<string, string>[] | null;
}
