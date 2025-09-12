import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IChargeData {
  id: string;
  category: string;
  class: string;
  divisions: string[];
  students: number; // total count
  studentList?: {
    id: string;
    name: string;
    division: string;
    rollNo?: string; // Added for table
    grNo?: string; // Added for table
  }[]; // optional detailed list
  amount: number;
  priority: number;
  dueDate: string; // ISO or formatted string (e.g. "2025-08-31")
  status?: number; // number enum
  description: string;
  academicYear: string;
  board: string;
  medium: string;
  additionalNotes?: string;

  // Added missing properties for RequestorInfoCard
  requestorName?: string;
  department?: string;
  requestedOn?: string;
}

export interface IChargeFormProps {
  open: UseBooleanReturn;
  onClose: (event?: any, reason?: boolean) => void;
  editData?: IChargeData | null; // Data to be edited
  isEdit?: boolean; // Flag to indicate if form is in edit mode
}

export interface ViewChargeProps {
  charge: IChargeData | null; // Made nullable for consistency
  isActionShow?: boolean;
}

export interface RequestorInfoProps {
  charge: IChargeData | null;
}
