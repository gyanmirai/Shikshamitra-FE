export interface IHomeworkType {
  homeworkTypeName: string;
}

export interface IHomeworkTypeFormProps {
  open: { value: boolean; onFalse: () => void };
  onClose: (e: any, isSubmit: boolean) => void;
  editData?: IHomeworkType | null;
}

export interface IHomeworkTypeTableProps {
  data: IHomeworkType[];
  onEdit: (data: IHomeworkType) => void;
  onDelete: (data: IHomeworkType) => void;
}
