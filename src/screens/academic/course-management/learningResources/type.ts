export interface IResourceData {
  id: string; // Unique identifier for the resource
  resourceTitle: string; // Title of the learning resource
  chapter?: string;
  className: string; // Class/grade the resource is intended for
  subject: string; // Subject area of the resource
  dateUploaded: string; // Date when the resource was uploaded
  document: File | string; // File object representing the uploaded document;
}

// Interface for props used in CreateLearningResources component
export interface ICreateLearningResourcesProps {
  onSave: (values: IResourceData) => void | Promise<void>;
  onClose: (e: any, isSubmit: boolean) => void;
  data: IResourceData | null;
  isEdit: boolean;
  isSaving?: boolean;
}

// Interface defining the props for the LearningResourceCard component
export interface ILearningResourceCardProps {
  resourceTitle: string;
  resourceType: string;
  className: string;
  subject: string;
  dateUploaded: string;
}

// Type definitions
export interface IChapter {
  id: string;
  name: string;
  documents: File[];
}

export interface ISubject {
  id: string;
  name: string;
  documents?: File[];
  chapters?: IChapter[];
  subjectColor: string;
}

export interface IClassData {
  id: string;
  name: string;
  subjects: ISubject[];
}
