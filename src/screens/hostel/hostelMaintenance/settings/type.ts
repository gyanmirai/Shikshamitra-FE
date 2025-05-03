import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IIncidentTypeSetting {
  incidentTypeName: string;
  description: string;
}

export interface IIncidentTypeFormProps {
  dialog: UseBooleanReturn;
  onClose: (_e?: any, isSubmit?: boolean) => void;
  editData?: IIncidentTypeSetting | null;
}
