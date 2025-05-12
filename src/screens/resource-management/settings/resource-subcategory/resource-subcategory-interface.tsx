export interface IResourceSubCategoryFormValues {
  categoryName: string;
  subcategoryName: string[];
}

export interface IAddResourceSubCategoryDialogProps {
  isEdit: boolean;
  data: IResourceSubCategoryFormValues | null;
}
