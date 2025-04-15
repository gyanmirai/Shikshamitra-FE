export interface TType {
  id: number;
  name: string;
}

export interface IAddCategoryProps {
  open?: boolean;
  onClose?: () => void;
  onSubmit: (values: TType) => void;
  data: TType | null;
  isEdit: boolean;
}
