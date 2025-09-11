import type { Dayjs } from 'dayjs';

export interface ISchoolWiseAnnouncement {
  id: string;
  title: string;
  description: string;
  audience: string[];
  startDate: Dayjs | string | null;
  endDate: Dayjs | string | null;
  createdBy: string;
  cratedOn: Dayjs | string | null;
  status: number;
  type: string;
  attachment: File;
  importance_level?: string;
  link: string;
  active?: number;
  notification_preferences: string[];
  isAllowAcknoledgement: boolean;
  viewedBy?: number;
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
  initialValues?: ISchoolWiseAnnouncement | null;
  isEdit?: boolean;
  onClose: (e: any, isSubmit: boolean) => void;
}

export interface SchoolWiseAnnouncementTableProps {
  data: ISchoolWiseAnnouncement[];
  onEdit: (announcement: ISchoolWiseAnnouncement) => void;
  onDelete: (announcementId: string) => void;
  onView: (announcement: ISchoolWiseAnnouncement) => void;
  onPublish: (announcement: ISchoolWiseAnnouncement) => void;
}

export interface IClassWiseAnnouncement {
  id: string;
  title: string;
  description: string;
  audience: string[]; // same as school-wise
  organizations: string[]; // newly added
  classes: string[]; // newly added
  divisions: string[]; // newly added
  startDate: Dayjs | string | null;
  endDate: Dayjs | string | null;
  createdBy: string;
  cratedOn: Dayjs | string | null;
  status: number;
  type: string;
  attachment: File | null;
  importance_level?: string;
  link: string;
  active?: number;
  notification_preferences: string[];
  isAllowAcknoledgement: boolean;
  viewedBy?: number;
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
  onSubmit: (values: IClassWiseAnnouncement) => void;
  initialValues?: IClassWiseAnnouncement | null;
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

export interface ISchoolWiseAnnouncementTableProps {
  data: ISchoolWiseAnnouncement[];
  onEdit: (row: ISchoolWiseAnnouncement) => void;
  handleSwitchChange: (row: ISchoolWiseAnnouncement) => void;
  onDelete: (id: string) => void;
  onView: (row: ISchoolWiseAnnouncement) => void;
  onPublish: (row: ISchoolWiseAnnouncement) => void;
}

export interface IClassWiseAnnouncementTableProps {
  data: IClassWiseAnnouncement[];
  onEdit: (row: IClassWiseAnnouncement) => void;
  handleSwitchChange: (row: IClassWiseAnnouncement) => void;
  onDelete: (id: string) => void;
  onView: (row: IClassWiseAnnouncement) => void;
  onPublish: (row: IClassWiseAnnouncement) => void;
}
