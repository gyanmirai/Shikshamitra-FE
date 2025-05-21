import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IResourceType {
  id?: string;
  resourceTypeName: string;
}

export interface IResourceTypeFormProps {
  open: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IResourceType | null;
}

export interface IResourceTypeTableProps {
  data: IResourceType[];
  onAddResourceType: { onTrue: () => void };
  editData: IResourceType | null;
  open: boolean;
  setOpenDialog: (val: boolean) => void;
  setEditData: (val: IResourceType | null) => void;
  onDelete: (data: IResourceType) => void;
  onEdit: (data: IResourceType) => void;
}
