// Interface for form values (currently unused - can be removed if not needed)
interface FormikValue {
  resourceTitle: string;
  typeOfResource: string;
  attachedCourse: string;
  accessPermision: string;
  description: string;
  courseAndSubject: string;
  dateUploaded: string;
}

export interface IResourceData {
  id: number; // Unique identifier for the resource
  resourceTitle: string; // Title of the learning resource
  typeOfResource: string; // Type of resource (document, audio, video, etc.)
  className: string; // Class/grade the resource is intended for
  subject: string; // Subject area of the resource
  dateUploaded: string; // Date when the resource was uploaded
  description: string; // Detailed description of the resource
  status: string; // Publication status (Publish/Unpublish)
}

// Interface for props used in CreateLearningResources component
export interface ICreateLearningResourcesProps {
  onSave: (values: IResourceData) => void;
  onClose: () => void;
  data: IResourceData | null;
  isEdit: boolean;
  currentClass: string;
  currentSubject: string;
}

// Interface defining the props for the LearningResourceCard component
export interface ILearningResourceCardProps {
  resourceTitle: string;
  resourceType: string;
  className: string;
  subject: string;
  dateUploaded: string;
}
