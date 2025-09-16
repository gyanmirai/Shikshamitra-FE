import type { Dayjs } from 'dayjs';

export interface IMeeting {
  id: number;
  title: string;
  status: number;

  // Newly added
  type: string; // e.g., General, Parent-Teacher, Staff, etc.
  importance_level: string; // e.g., High, Medium, Low
  description: string;
  attachment?: string[]; // list of file URLs or IDs

  // Audience & Participants
  audience: string[];
  organizations: string[];
  classes: string[];
  divisions: string[];
  students: string[];
  startDate: string | Dayjs | null;
  endDate: string | Dayjs | null;
  // Meeting details
  meetingDate: string | Dayjs | null;
  meetingTime: string | Dayjs | null;
  meetingAgenda: string;
  link: string;
  meetingType: string;
  classRoom: string;
  isRecurring: boolean;
  day?: string;
  repeatFrequency?: string;
  mode?: string;
  repeatUntil?: string | Dayjs | number;
}

export interface IMeetingDetailsProps {
  meeting: IMeeting | null;
  onClose: () => void;
}

export interface IViewMeetingDialogProps {
  open: boolean;
  onClose: () => void;
  meeting: IMeeting | null;
}

/**
 * Props interface for AddNewMeeting component
 * @interface AddNewMeetingProps
 * @property {function} onSubmit - Callback function to handle form submission
 * @property {any} [initialValues] - Optional initial values for the form
 * @property {boolean} [isEdit] - Optional flag to indicate if form is in edit mode
 */
export interface AddNewMeetingProps {
  initialValues?: any | null;
  isEdit?: boolean;
  onClose: (e: any, isSubmit: boolean) => void;
}
