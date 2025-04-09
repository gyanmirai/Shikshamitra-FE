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

export interface TResourceData {
  id: number; // Unique identifier for the resource
  resourceTitle: string; // Title of the learning resource
  typeOfResource: string; // Type of resource (document, audio, video, etc.)
  className: string; // Class/grade the resource is intended for
  subject: string; // Subject area of the resource
  dateUploaded: string; // Date when the resource was uploaded
  description: string; // Detailed description of the resource
  status: string; // Publication status (Publish/Unpublish)
}
