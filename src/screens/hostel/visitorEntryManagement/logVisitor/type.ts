import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IVisitorData {
  visitorName: string;
  idProof: string;
  aadharNumber: string;
  contactNo: string; // e.g., "250/500"
  visingWhome: string;
  entryTime: string | Dayjs | null;
  exitTime: string | Dayjs | null;
  reasonForVisit: string;
  status: string;
}

export interface IVisitorDataTableProps {
  openDialog: boolean;
  setOpenDialog: (value: boolean) => void;
  editData?: IVisitorData | null;
  setEditData: (value: IVisitorData | null) => void;
  data: IVisitorData[];
  onDelete: (data: IVisitorData) => void;
  onEdit: (data: IVisitorData) => void;
  onAddVisitor: UseBooleanReturn;
  onMarkOut: (data: IVisitorData) => void;
  onMarkIn: (data: IVisitorData) => void;
}

export interface IVisitorFormProps {
  open: UseBooleanReturn;
  onClose: () => void;
  editData?: IVisitorData | null;
}
