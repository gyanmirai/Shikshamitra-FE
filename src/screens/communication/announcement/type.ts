import type { Dayjs } from 'dayjs';

export interface ISchoolWiseAnnouncement {
  id: string;
  title: string;
  description: string;
  audience: string[];
  organization: string[];
  publishDate: Dayjs | string | null;
  expiryDate: Dayjs | string | null;
  status: string;
  category: string;
  importance_level: string;
  link: string;
  notification_preferences: string[];
  isScheduled: boolean;
}

/**
 * Interface representing the form values for an announcement
 * @property {string} title - The title of the announcement
 * @property {string} description - The detailed description of the announcement
 * @property {string} status - Current status of the announcement
 * @property {string[]} audience - Array of selected audience groups
 * @property {string[]} organization - Array of selected organizations
 * @property {Dayjs | null} publishDate - Date when the announcement should be published
 * @property {Dayjs | null} expiryDate - Date when the announcement should expire
 * @property {string} category - Category of the announcement
 * @property {string} importance_level - Priority level of the announcement
 * @property {string} link - Optional URL associated with the announcement
 * @property {string[]} notification_preferences - Selected notification methods
 * @property {boolean} isScheduled - Whether the announcement is scheduled for later
 */
export interface ISchoolWiseAnnouncementFormValues {
  id: string;
  title: string;
  description: string;
  status: string;
  audience: string[];
  organization: string[];
  publishDate: Dayjs | string | null;
  expiryDate: Dayjs | string | null;
  category: string;
  importance_level: string;
  link: string;
  notification_preferences: string[];
  isScheduled: boolean;
}

/**
 * Props interface for the AnnouncementForm component
 * @property {function} onSubmit - Handler function called when form is submitted
 * @property {AnnouncementFormValues | null} initialValues - Initial values for the form, optional
 * @property {boolean} isEdit - Flag indicating if form is in edit mode
 */
export interface ISchoolWiseAnnouncementFormProps {
  onSubmit: (values: ISchoolWiseAnnouncement) => void;
  initialValues?: ISchoolWiseAnnouncement | null;
  isEdit?: boolean;
}

export interface SchoolWiseAnnouncementTableProps {
  data: ISchoolWiseAnnouncement[];
  onEdit: (announcement: ISchoolWiseAnnouncement) => void;
  onDelete: (announcementId: string) => void;
  onView: (announcement: ISchoolWiseAnnouncement) => void;
  onPublish: (announcement: ISchoolWiseAnnouncement) => void;
}

export interface IClassAnnouncement {
  id: string;
  title: string;
  description: string;
  audience: string[];
  publishDate: Dayjs | string | null;
  expiryDate: Dayjs | string | null;
  className: string[];
  division: string[];
  status: string;
  category: string;
  importance_level: string;
  link: string;
  notification_preferences: string[];
  isScheduled: boolean;
}

export interface IClassWiseAnnouncementFormValues {
  title: string;
  description: string;
  audience: string[];
  publishDate: Dayjs | null;
  expiryDate: Dayjs | null;
  className: string[];
  division: string[];
  status: string;
  category: string;
  importance_level: string;
  link: string;
  notification_preferences: string[];
  isScheduled: boolean;
}

export interface IClassWiseAnnouncementFormProps {
  onSubmit: (values: IClassAnnouncement) => void;
  initialValues?: IClassAnnouncement | null;
  isEdit?: boolean;
}

export interface IClassWiseAnnouncementFormikValues {
  title: string;
  description: string;
  audience: string[];
  publishDate: Dayjs | null;
  expiryDate: Dayjs | null;
  className: string[];
  division: string[];
  status: string;
  category: string;
  importance_level: string;
  link: string;
  notification_preferences: string[];
  isScheduled: boolean;
}

export interface IClassWiseAnnouncementTableProps {
  data: IClassAnnouncement[];
  onEdit: (announcement: IClassAnnouncement) => void;
  onDelete: (announcementId: string) => void;
  onView: (announcement: IClassAnnouncement) => void;
  onRequestPublish: (announcement: IClassAnnouncement) => void;
}
