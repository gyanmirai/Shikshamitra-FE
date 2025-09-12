export interface IFeeCategory {
  id: string;
  feeCategoryName: string;
  description?: string;
}
export interface IFeeCategoryTableProps {
  data: IFeeCategory[];
  onAddFeeCategory: any;
  editData: IFeeCategory | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IFeeCategory | null) => void;
  onDelete: (data: IFeeCategory) => void;
  onEdit: (data: IFeeCategory) => void;
}

export interface IFeeCategoryFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IFeeCategory | null;
}
