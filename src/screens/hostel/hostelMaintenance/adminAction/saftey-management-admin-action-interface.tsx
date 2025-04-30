import type { Dayjs } from 'dayjs';

import type { IAddSafteyManagement } from '../safteyManagement/saftey-management-interface';

export interface IAssignedToMaintenanceWarden {
  wardenName: string;
  assignedDeadline: Dayjs | null;
  updateStatus: string;
  notes: string;
}

export interface IMaintenceIncidentAssignedToWardenDialogProps {
  isEdit: boolean;
  data: IAssignedToMaintenanceWarden;
  selectedItem: IAddSafteyManagement;
  onClose: () => void;
}

export interface IMaintenceIncidentResolvedDialogProps {
  selectedItem: IAddSafteyManagement;
  onClose: () => void;
}

export interface IMaintenceIncidentResolvedDialogFormValues {
  notes: string;
}
