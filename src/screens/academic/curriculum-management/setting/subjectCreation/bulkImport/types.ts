export interface SubjectImportValues {
  name: string;
  displayName: string;
  category: string;
  color: string;
  icon: string;
  status: string;
  sortOrder: string;
  description: string;
}

export interface SubjectImportRow extends SubjectImportValues {
  rowNumber: number;
  issues: string[];
}

export interface SubjectImportResult {
  rows: SubjectImportRow[];
  fileError?: string;
}

export interface SubjectImportFormValues {
  file: File | null;
  rows: SubjectImportRow[];
}
