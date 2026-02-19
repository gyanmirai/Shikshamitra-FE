import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IChargeData {
  chargeId: string;
  chargeCategoryId: string;
  chargeCategoryName?: string;
  categoryName?: string;
  standardId: string;
  divisionId: string;
  grNo: number;
  studentId: string; // total count
  studentName?: string; // Student name for display in edit mode
  rollNo: number;
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
  purposeDescription: string;
  academicYear: string;
  boardId: string;
  educationMediumId: string;
  additionalNotes?: string;
  // Added missing properties for RequestorInfoCard
  requestorName?: string;
  department?: string;
  requestedOn?: string;
}

export interface ISingleCharge {
  id: string;
  category: string;
  class: string;
  division: string[];
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

export interface IStudentChargeData {
  id: string;
  studentName: string;
  rollNo?: string;
  grNo?: string;
  class: string;
  division: string;
  contactNo?: string;
  parentName?: string;
  email?: string;
  sibling?: string;
  academicYear: string;
  board: string;
  medium: string;
  // Each student can have multiple charges
  charges: ISingleCharge[];
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
