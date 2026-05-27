export interface IHomeworkType {
  id?: string;
  homeworkTypeName: string;
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
}
