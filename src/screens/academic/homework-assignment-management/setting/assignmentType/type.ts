export interface IAssignmentType {
  id?: string;
  assignmentTypeName: string;
  description?: string;
  defaultSubmissionType?: number;
  defaultMarks?: number;
  defaultDueDays?: number;
  evaluationRequired?: boolean;
  defaultEvaluationMethod?: number;
  status?: number;
  usageCount?: number;
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
