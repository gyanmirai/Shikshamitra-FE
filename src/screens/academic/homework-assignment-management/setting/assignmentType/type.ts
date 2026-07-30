import type { AssignmentTypeDto } from 'src/redux/academicAPI/HomeworkAssignmentApi/contracts';

export type IAssignmentType = AssignmentTypeDto;

export interface IAssignmentTypeFormProps {
  open: { value: boolean; onFalse: () => void };
  onClose: (event: unknown, isSubmit: boolean) => void;
  editData?: IAssignmentType | null;
  existingTypes?: IAssignmentType[];
}

export interface IAssignmentTypeTableProps {
  isLoading: boolean;
  data: IAssignmentType[];
  onEdit: (data: IAssignmentType) => void;
  onDelete: (data: IAssignmentType) => void;
  onArchive: (data: IAssignmentType) => void;
  onRestore: (data: IAssignmentType) => void;
  canAdd?: boolean;
  canDelete?: boolean;
}
