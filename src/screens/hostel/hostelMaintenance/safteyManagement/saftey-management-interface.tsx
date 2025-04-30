import type { Dayjs } from 'dayjs';

export interface IAddSafteyManagement {
  incidentTitle: string;
  incidentType: string;
  incidentDate: Dayjs | null;
  incidentTime: Dayjs | null;
  incidentUrgency: string;
  incidentDescription: string;
  incidentReportedBy: string;
}

export interface IReportSafteyManagemtFormProps {
  isEdit: boolean;
  data: IAddSafteyManagement | null;
  onClose: () => void;
}

export interface IReportSafteyManagementTableProps {
  onClick: (data: IAddSafteyManagement, eventName: string) => void;
}
