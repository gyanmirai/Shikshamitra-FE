export interface IAssignmentType {
  assignmentTypeName: string;
}

export interface IAssignmentTypeFormProps {
  open: { value: boolean; onFalse: () => void };
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IAssignmentType | null;
}

export interface IAssignmentTypeTableProps {
  data: IAssignmentType[];
  onEdit: (data: IAssignmentType) => void;
  onDelete: (data: IAssignmentType) => void;
}
