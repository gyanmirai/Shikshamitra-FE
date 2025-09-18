import type { UseBooleanReturn } from 'src/hooks/use-boolean';

// type.ts
export interface IDeliveryChannel {
  deliveryChannel: string;
  description?: string;
  createdBy: string;
  createdDate: string;
}

export interface IDeliveryChannelTableProps {
  data: IDeliveryChannel[];
  onAddDeliveryChannel: UseBooleanReturn;
  setEditData: (val: IDeliveryChannel | null) => void;
  onDelete: (row: IDeliveryChannel) => void;
  onEdit: (row: IDeliveryChannel) => void;
}

export interface IDeliveryChannelFormProps {
  open: { value: boolean; onTrue: () => void; onFalse: () => void };
  onClose: (event: any, isSubmit?: boolean) => void;
  editData?: IDeliveryChannel | null;
}
