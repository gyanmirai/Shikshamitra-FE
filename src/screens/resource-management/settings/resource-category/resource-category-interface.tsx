export interface IResourceCategoryFormValues {
  categoryName: string;
}

export interface IAddResourceCategoryDialogProps {
  isEdit: boolean;
  data: IResourceCategoryFormValues | null;
}
