export const schoolDocumentActions = {
  view: 'InstituteSetup.SchoolDocuments.View',
  add: 'InstituteSetup.SchoolDocuments.Add',
  delete: 'InstituteSetup.SchoolDocuments.Delete',
} as const;

export const documentCategories = [
  { value: 0, label: 'Government Approval' },
  { value: 1, label: 'Permission / NOC' },
  { value: 2, label: 'Board Affiliation' },
  { value: 3, label: 'Registration' },
  { value: 4, label: 'Other' },
];

export interface SchoolDocumentFile {
  id: string;
  fileName: string;
  contentType: string;
  size: number;
}

export interface SchoolDocument {
  id: string;
  name: string;
  category: number;
  notes: string | null;
  uploadedBy: string;
  creationTime: string;
  concurrencyStamp: string;
  files: SchoolDocumentFile[];
}

export interface DocumentFormValues {
  name: string;
  category: number | '';
  notes: string;
  retainedFiles: SchoolDocumentFile[];
  files: File[];
}

export interface DocumentListParams {
  skipCount: number;
  maxResultCount: number;
  search?: string;
  category?: number;
  sorting?: string;
}

export interface DocumentPermissions {
  ready: boolean;
  canView: boolean;
  canAdd: boolean;
  canDelete: boolean;
}
