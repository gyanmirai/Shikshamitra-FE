export interface IFeeCategory {
  id: string;
  name: string;
  description?: string;
}
export interface IFeeCategoryTableProps {
  onAddFeeCategory: any;
  editData: IFeeCategory | null;
  open: boolean;
  setOpenDialog: (value: boolean) => void;
  setEditData: (value: IFeeCategory | null) => void;
}

export interface IFeeCategoryFormProps {
  open: any;
  onClose: (e: any, isSubmit?: boolean) => void;
  editData: IFeeCategory | null;
}
