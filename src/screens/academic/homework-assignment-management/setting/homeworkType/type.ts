export interface IHomeworkType {
  id?: string;
  homeworkTypeName: string;
  description?: string;
  defaultSubmissionType?: number;
  defaultMarks?: number;
  defaultDueDays?: number;
  evaluationRequired?: boolean;
  defaultEvaluationMethod?: number;
  status?: number;
  usageCount?: number;
}

export interface IHomeworkTypeFormProps {
  open: { value: boolean; onFalse: () => void };
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IHomeworkType | null;
  existingTypes?: IHomeworkType[];
}

export interface IHomeworkTypeTableProps {
  isLoading: boolean;
  data: IHomeworkType[];
  onEdit: (data: IHomeworkType) => void;
  onDelete: (data: IHomeworkType) => void;
  onArchive: (data: IHomeworkType) => void;
  onRestore: (data: IHomeworkType) => void;
  canAdd?: boolean;
  canDelete?: boolean;
}
