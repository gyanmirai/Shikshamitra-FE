import type { Dayjs } from 'dayjs';
import type { ReactNode } from 'react';

import type { IImportanceLevel } from '../settings/importance-level/type';
import type { IAnnouncementType } from '../settings/announcement-type/components/type';

export interface IAudience {
  name: ReactNode;
  color: string | undefined;
  value: string;
  label: string;
}

export interface ISchoolWiseAnnouncement {
  id: string;
  title: string;
  description: string;
  audience: IAudience[];
  startDate: Dayjs | string | null;
  endDate: Dayjs | string | null;
  createdBy: string;
  createdOn: Dayjs | string | null;
  status: number;
  type: IAnnouncementType[];
  durationUnit?: string;
  duration: string | number;
  attachment: File | null | string[];
  importance_level?: IImportanceLevel;
  link: string;
  active?: number;
  notification_preferences: string[];
  isAllowAcknoledgement: boolean;
  viewedBy?: number;
}

/**
 * Interface representing the form values for an announcement
 */
export interface ISchoolWiseAnnouncementFormValues {
  title: string;
  description: string;
  type: IAnnouncementType[];
  audience: IAudience[];
  importance_level: IImportanceLevel | null;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
  duration: number | string;
  durationUnit: string;
  notification_preferences: string[];
  isAllowAcknoledgement: boolean;
  attachment: any; // Using any for file input initially, usually File | null
  status?: string;
}

/**
 * Props interface for the AnnouncementForm component
 */
export interface ISchoolWiseAnnouncementFormProps {
  initialValues: ISchoolWiseAnnouncement | null;
  isEdit?: boolean;
  onClose: (data: any, isSubmit: boolean) => void;
}

export interface ISchoolWiseAnnouncementTableProps {
  data: ISchoolWiseAnnouncement[];
  isLoading: boolean;
  setOpen: (value: boolean) => void;
  onEdit: (row: ISchoolWiseAnnouncement) => void;
  handleSwitchChange: (row: ISchoolWiseAnnouncement) => void;
  onRemove: (row: ISchoolWiseAnnouncement) => void;
  onDelete: (row: ISchoolWiseAnnouncement) => void;
  onView: (row: ISchoolWiseAnnouncement) => void;
  onPublish: (row: ISchoolWiseAnnouncement) => void;
}
