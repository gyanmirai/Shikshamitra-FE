export interface IResourceType {
  id: number;
  name: string;
}

export interface ILearningResourceTypeFormProps {
  data?: IResourceType | null;
  onClose: (e: any, isSubmit: boolean) => void;
  isEdit?: boolean;
}
