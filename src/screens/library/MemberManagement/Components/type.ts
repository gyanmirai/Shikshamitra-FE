export interface IMember {
  id: string;
  role: string;
  name: string;
  currentIssue: number;
  overdueReturn: number;
  memberStatus: 'Active' | 'Inactive';
}

export interface IMemberTableProps {
  data?: IMember[];
  onView?: (member: IMember) => void;
  onEdit?: (member: IMember) => void;
  onDelete?: (member: IMember) => void;
  onMakeReservation?: (member: IMember) => void;
  onChangeStatus?: (member: IMember) => void;
}

export interface IMemberPayload {
  role: string;
  class: string;
  division: string;
  student: string;
}

export interface IMemberFormProps {
  open: boolean;
  onClose: (event: any, isSubmit?: boolean) => void;
  editData?: any;
}

export interface IChangeStatusPayload {
  status: string;
  remarks: string;
}

export interface IChangeStatusFormProps {
  open: boolean;
  onClose: (event: any, isSubmit?: boolean) => void;
  selectedMember?: any;
}

export interface IMakeReservationPayload {
  bookCategory: string;
  bookTitle: string;
  requestedDate: Date;
}

export interface IMakeReservationFormProps {
  open: boolean;
  onClose: (event: any, isSubmit?: boolean) => void;
  selectedMember?: any;
}
