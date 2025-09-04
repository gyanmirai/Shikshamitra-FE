import type { IViewConcessionRequestProps } from '../ConcessionAdmin/type';

export interface IConcession {
  board: string;
  medium: string;
  className: string;
  division: string;
  studentName: string;
  concessionType: string;
  reason: string;
  feeHead: string;
  documentStatus?: number;
  documents: IConcessionDocument[];
  status?: number; // e.g., Pending / Approved / Rejected
}

export interface IStudentInfo {
  studentName: string;
  rollNo: string;
  sibling?: string;
  contactNo: string;
  classDivision: string;
  parentNaforme: string; // typo? maybe parentName?
  grNo: string;
  parentName: string;
  email: string;
  avatarUrl?: string;
  boardMedium?: string;
  concessionType?: string;
  reason?: string;
  status?: number;
  totalConcession: number;
  concessions?: IConcession[]; // 👈 multiple concessions
}

export interface IConcessionDocument {
  id: string | number;
  name: string;
  acceptedFormat: string;
  status: 'Uploaded' | 'Pending' | 'Rejected';
  file?: File | null;
}

export interface IConcessionFormValues {
  studentName: string;
  concessionType: string;
  reason: string;
  documents: IConcessionDocument[];
}

export interface IConcessionFormProps {
  open: boolean;
  onClose: (data?: any, refresh?: boolean) => void;
  student: IStudentInfo;
  editData?: IConcession;
}

export interface IStudentTableProps {
  data: IStudentInfo[];
  onRequestConcession: (student: IStudentInfo) => void;
}

export interface IStudentAdminTableProps {
  data: IViewConcessionRequestProps[];
  onViewConcession: (student: IViewConcessionRequestProps) => void;
}

export interface IReasonApprovalFormProps {
  onClose: (e: any, isSubmit: boolean) => void;
  mode: string;
}
