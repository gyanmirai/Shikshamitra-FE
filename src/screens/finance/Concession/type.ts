import type { IViewConcessionRequestProps } from '../concession-admin/type';

export interface IConcession {
  id?: string;
  board: string;
  medium: string;
  className: string;
  division: string;
  studentName: string;
  studentId: string;
  concessionName?: string;
  concessionTypeIds: string[];
  documents: any[];
  reason: string;
  feeHead: string;
  documentStatus?: number;
  status?: number; // e.g., Pending / Approved / Rejected
  documentRequired?: boolean;
  concessions: {
    concessionType: string;
    applicableFeeHeads: string[];
    amount?: number;
    percentage?: number;
    documents: any[];
  }[];
}

export interface IStudentInfo {
  id?: string;
  studentName: string;
  rollNo: string;
  sibling?: string;
  contactNo: string;
  classDivision: string;
  parentNaforme: string; // typo? maybe parentName?
  grNo: string;
  parentName: string;
  applicableFeeHeads: string[];
  documentRequired: boolean;
  email: string;
  avatarUrl?: string;
  boardMedium?: string;
  concessionType?: string;
  reason?: string;
  status?: number;
  totalConcession: number;
  concession?: IConcession;
  concessions: {
    concessionType: string;
    applicableFeeHeads: string[];
    amount?: number;
    percentage?: number;
    documents: any[];
  }[];
  amount?: number; // required if type = "fixed"
  percentage?: number;
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
  selectedConcession?: IStudentInfo | null;
}
