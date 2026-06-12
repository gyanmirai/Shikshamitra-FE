export interface IAssignmentType {
  id?: string;
  assignmentTypeName: string;
}

export interface IAssignmentTypeFormProps {
  open: { value: boolean; onFalse: () => void };
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IAssignmentType | null;
  existingTypes?: IAssignmentType[];
}

export interface IAssignmentTypeTableProps {
  isLoading: boolean;
  data: IAssignmentType[];
  onEdit: (data: IAssignmentType) => void;
  onDelete: (data: IAssignmentType) => void;
  canAdd?: boolean;
  canDelete?: boolean;
}
