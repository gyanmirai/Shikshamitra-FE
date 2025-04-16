export interface IResourceType {
  id: number;
  name: string;
}

export interface ILearningResourceTypeFormProps {
  data?: IResourceType | null;
  onClose: () => void;
  isEdit?: boolean;
}
