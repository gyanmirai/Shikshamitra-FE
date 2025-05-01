import type { Dayjs } from 'dayjs';

export interface ICreateEmergencyGatePassFormValue {
  personName: string;
  time: Dayjs | null;
  reason: string;
  emergencyFlag: string;
}

export interface ICreateEmergencyGatePassTableProps {
  onClick: (data: ICreateEmergencyGatePassFormValue, eventName: string) => void;
}

export interface ICreateEmergencyGatePassFormProps {
  isEdit: boolean;
  data: ICreateEmergencyGatePassFormValue | null;
  onClose: () => void;
}
