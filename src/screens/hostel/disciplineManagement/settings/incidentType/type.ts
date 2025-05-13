import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IIncidentType {
  incidentTypeName: string;
  description: string;
}

export interface IncidentTypeFormProps {
  dialog: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IIncidentType | null;
}
