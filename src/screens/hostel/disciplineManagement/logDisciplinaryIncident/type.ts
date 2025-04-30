import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IHostelIncident {
  hostelName: string;
  floor: string;
  students: string[];
  incidentDate: Dayjs | string | null;
  incidentTime: Dayjs | string | null;
  description: string;
  incidentType: string;
  documents?: File | null;
}

export interface IHostelIncidentFormProps {
  open: UseBooleanReturn;
  onClose: () => void;
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
}
