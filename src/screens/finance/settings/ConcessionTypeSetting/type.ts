import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export enum ConcessionBasedOn {
  Fixed = 0,
  Percentage = 1,
}

export enum ConcessionDocumentFormat {
  Pdf = 0,
  Jpeg = 1,
  Png = 2,
  Doc = 3,
  Docx = 4,
  Xls = 5,
}

export const ConcessionDocumentFormatArray = [
  { label: 'PDF', value: ConcessionDocumentFormat.Pdf },
  { label: 'JPEG', value: ConcessionDocumentFormat.Jpeg },
  { label: 'PNG', value: ConcessionDocumentFormat.Png },
  { label: 'DOC', value: ConcessionDocumentFormat.Doc },
  { label: 'DOCX', value: ConcessionDocumentFormat.Docx },
  { label: 'XLS', value: ConcessionDocumentFormat.Xls },
];

export interface IConcessionDocument {
  id?: number | string; // optional (for editing / backend reference)
  documentName: string;
  documentSize: number | string; // bytes
  acceptedFormat: number[]; // e.g. [0, 1]
}

export interface IConcessionTypeForm {
  id?: string; // for editing
  name: string;
  documentRequired: boolean;
  documents?: IConcessionDocument[]; // only if documentRequired = true
  description?: string;
}

export interface IConcessionTableProps {
  data: IConcessionTypeForm[];
  isLoading: boolean;
  addConcessionType: UseBooleanReturn;
  setEditData: (row: IConcessionTypeForm | null) => void;
  onEdit?: (row: IConcessionTypeForm) => void;
  onView?: (row: IConcessionTypeForm) => void;
  onDelete?: (row: IConcessionTypeForm) => void;
}

export interface IConcessionTypeFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IConcessionTypeForm | null;
}
