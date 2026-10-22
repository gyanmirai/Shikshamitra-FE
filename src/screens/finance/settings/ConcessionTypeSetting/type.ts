import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export enum ConcessionBasedOn {
  Fixed = 0,
  Percentage = 1,
}

export enum ConcessionDocumentFormat {
  Jpg = 0,
  Jpeg = 1,
  Png = 2,
  Docx = 3,
  Pdf = 4,
  Xlsx = 5,
}

export const ConcessionDocumentFormatArray = [
  { label: 'JPG', value: ConcessionDocumentFormat.Jpg },
  { label: 'JPEG', value: ConcessionDocumentFormat.Jpeg },
  { label: 'PNG', value: ConcessionDocumentFormat.Png },
  { label: 'DOCX', value: ConcessionDocumentFormat.Docx },
  { label: 'PDF', value: ConcessionDocumentFormat.Pdf },
  { label: 'XLSX', value: ConcessionDocumentFormat.Xlsx },
];

export const DEFAULT_CONCESSION_DOCUMENT_SIZE_MB = 5;
export const DEFAULT_CONCESSION_DOCUMENT_FORMATS = [
  ConcessionDocumentFormat.Pdf,
  ConcessionDocumentFormat.Jpg,
  ConcessionDocumentFormat.Jpeg,
  ConcessionDocumentFormat.Png,
];

export interface IConcessionDocument {
  id?: number | string; // optional (for editing / backend reference)
  documentName: string;
  maxFileSizeMb: number | string;
  acceptedFormats: number[];
  isRequired: boolean;
}

export interface IConcessionTypeForm {
  id?: string; // for editing
  name: string;
  documents?: IConcessionDocument[];
  description?: string;
  isUsedInDownstream?: boolean; // for downstream usage warning
  isActive?: boolean;
  deactivationReason?: string | null;
  canDelete?: boolean;
  usageCount?: number;
  concurrencyStamp?: string;
}

export interface IConcessionTableProps {
  archived: boolean;
  canView: boolean;
  canEdit: boolean;
  canChangeStatus: boolean;
  canDelete: boolean;
  canAdd?: boolean;
  data: IConcessionTypeForm[];
  isLoading: boolean;
  addConcessionType: UseBooleanReturn;
  setEditData: (row: IConcessionTypeForm | null) => void;
  onEdit?: (row: IConcessionTypeForm) => void;
  onView?: (row: IConcessionTypeForm) => void;
  onVersionHistory?: (row: IConcessionTypeForm) => void;
  onDelete?: (row: IConcessionTypeForm) => void;
  totalCount?: number;
  page?: number;
  rowsPerPage?: number;
  searchTerm?: string;
  onServerPagination?: (page: number, rowsPerPage: number) => void;
  onServerSearch?: (searchTerm: string) => void;
}

export interface IConcessionTypeFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IConcessionTypeForm | null;
}
