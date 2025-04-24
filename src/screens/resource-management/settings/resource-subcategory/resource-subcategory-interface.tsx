export interface IResourceSubCategoryFormValues {
  categoryName: string;
  subCategoryName: string;
}

export interface IAddResourceSubCategoryDialogProps {
  isEdit: boolean;
  data: IResourceSubCategoryFormValues;
}
