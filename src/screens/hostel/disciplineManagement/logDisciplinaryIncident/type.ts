import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IHostelIncident {
  hostelName: string;
  students: string[];
  incidentDate: Dayjs | string | null;
  incidentTime: Dayjs | string | null;
  description: string;
  emeregencyLevel: string;
  incidentType: string;
  documents?: File | null;
  status?: number;
}

export interface IHostelIncidentFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IHostelIncident | null;
}

export interface IHostelIncidentTableProps {
  data: IHostelIncident[];
  onAddIncident: UseBooleanReturn;
  editData?: IHostelIncident | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IHostelIncident | null) => void;
  onDelete: (data: IHostelIncident) => void;
  onEdit: (data: IHostelIncident) => void;
  onView: (data: IHostelIncident) => void;
}

export interface ITakeActionFormProps {
  open: UseBooleanReturn;
  onClose: () => void;
  editData?: IHostelIncident | null;
}
