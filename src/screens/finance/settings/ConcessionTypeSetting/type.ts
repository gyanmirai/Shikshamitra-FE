import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IConcessionDocument {
  id?: number | string; // optional (for editing / backend reference)
  documentName: string;
  documentSize: number | string; // e.g. "5mb"
  acceptedFormat: string[]; // e.g. [{label: 'Image', value: 1}, {label: 'PDF', value: 2}]
}

export interface IConcessionTypeForm {
  concessionName: string;
  concessionType: string;
  amount?: number; // required if type = "fixed"
  percentage?: number; // required if type = "percentage"
  applicableFeeHeads: string[]; // selected fee heads
  documentRequired: boolean;
  documents?: IConcessionDocument[]; // only if documentRequired = true
  description?: string;
}

export interface IConcessionTableProps {
  data: IConcessionTypeForm[];
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
