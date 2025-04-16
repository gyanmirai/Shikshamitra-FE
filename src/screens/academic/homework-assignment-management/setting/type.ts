export interface IHomeworkAssignmentType {
  id: number;
  name: string;
}

export interface IAddCategoryProps {
  open?: boolean;
  onClose?: () => void;
  onSubmit: (values: IHomeworkAssignmentType) => void;
  data: IHomeworkAssignmentType | null;
  isEdit: boolean;
}
