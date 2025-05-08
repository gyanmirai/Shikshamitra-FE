export interface IResourceStatusFormValues {
  resourceStatusName: string;
  resourceStatusDescription: string;
}

export interface IAddResourceSubCategoryDialogProps {
  isEdit: boolean;
  data: IResourceStatusFormValues | null;
}
