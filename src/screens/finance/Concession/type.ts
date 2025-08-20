import type { IViewConcessionRequestProps } from '../ConcessionAdmin/type';

export interface IStudentInfo {
  studentName: string;
  rollNo: string;
  sibling?: string;
  contactNo: string;
  classDivision: string;
  grNo: string;
  parentName: string;
  email: string;
  avatarUrl?: string;
  boardMedium?: string;
  concessionType?: string;
  reason?: string;
  status?: number;
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
  editData?: IConcessionFormValues;
}

export interface IStudentTableProps {
  data: IStudentInfo[];
  onRequestConcession: (student: IStudentInfo) => void;
}

export interface IStudentAdminTableProps {
  data: IViewConcessionRequestProps[];
  onViewConcession: (student: IViewConcessionRequestProps) => void;
}
