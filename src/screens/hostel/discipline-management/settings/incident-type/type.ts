import type { UseBooleanReturn } from 'src/hooks/useBoolean';

export interface IIncidentType {
  incidentTypeName: string;
  description: string;
}

export interface IncidentTypeFormProps {
  dialog: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IIncidentType | null;
}
