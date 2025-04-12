export interface IAnnouncementImportant {
  id: number;
  importantLevel: string;
  importantLevelDesc: string;
  status: string;
}

export interface IAnnoucementCategory {
  id: number;
  categoryName: string;
  categoryDescription: string;
  status: string;
}

export interface ISettingEvent {
  id: number;
  eventType: string;
  eventTypeDesc: string;
  status: string;
}

/**
 * Props interface for the EventForm component
 * @interface EventFormProps
 * @property {function} onSubmit - Callback function to handle form submission with event data
 * @property {TEvent | null} [data] - Optional existing event data for editing
 * @property {boolean} [isEdit] - Optional flag to indicate if form is in edit mode
 */
export interface IEventFormProps {
  onSubmit: (values: ISettingEvent) => void;
  data?: ISettingEvent | null;
  isEdit?: boolean;
}

/**
 * Props interface for the CategoryForm component
 * @interface CategoryFormProps
 * @property {function} onSubmit - Callback function to handle form submission with form values
 * @property {any} [data] - Optional data object containing existing category information for editing
 * @property {boolean} [isEdit] - Optional flag indicating if the form is in edit mode
 */

export interface ICategoryFormProps {
  onSubmit: (values: any) => void;
  data?: any | null;
  isEdit?: boolean;
}

/**
 * Props interface for the ImportantForm component
 * @interface IImportantFormProps
 * @property {function} onSubmit - Callback function to handle form submission with form values
 * @property {any | null} [data] - Optional data object containing existing form values for editing
 * @property {boolean} [isEdit] - Optional flag indicating if the form is in edit mode
 */
export interface IImportantFormProps {
  onSubmit: (values: any) => void;
  data?: any | null;
  isEdit?: boolean;
}
