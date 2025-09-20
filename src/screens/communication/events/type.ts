import type { Dayjs } from 'dayjs';

import type { IAudience } from '../announcement/type';

export interface IEvent {
  id: string;
  eventTitle: string;
  eventVenue: string;
  organization: string[];
  className: string[];
  eventStartDate: Dayjs | string | null;
  eventEndDate: Dayjs | string | null;
  eventType: string;
  audience: string[];
  description: string;
  eventOrganizer: string;
  eventBudget: string;
}

/**
 * Interface representing the form values for an event
 * @property {string} eventTitle - The title of the event
 * @property {string} eventVenue - The venue where the event will be held
 * @property {string[]} organization - Array of organizations involved in the event
 * @property {string[]} className - Array of class names participating in the event
 * @property {Dayjs | null} eventStartDate - Start date and time of the event
 * @property {Dayjs | null} eventEndDate - End date and time of the event
 * @property {string} eventType - Type or category of the event
 * @property {string[]} audience - Array of target audience groups for the event
 * @property {string} description - Detailed description of the event
 * @property {string} eventOrganizer - Name of the event organizer
 * @property {string} eventBudget - Budget allocated for the event
 */
export interface IEventAnnouncement {
  id: string;
  title: string;
  description: string;
  audience: IAudience[];
  organizations: string[]; // newly added
  classes: string[]; // newly added
  divisions: string[]; // newly added
  startDate: Dayjs | string | null;
  endDate: Dayjs | string | null;
  createdBy: string;
  duration: number;
  createdOn: Dayjs | string | null; // fixed typo
  status: number;
  type: string;
  attachment: File | null;
  importance_level?: string;
  link: string;
  active?: number;
  eventMode: 'offline' | 'online'; // fixed union type
  onlineLink?: string; // for online events
  venue?: string; // for offline events

  isRecurring: boolean;
  repeatFrequency?: string; // e.g., Daily, Weekly, Monthly
  meetingDate: string | Dayjs | null;
  meetingTime: string | Dayjs | null;
  repeatUntil?: string | Dayjs | number;
  day?: string; // e.g., Monday, Tuesday
}

/**
 * Props interface for the AddEvent component
 * @property {function} onSubmit - Callback function to handle form submission
 * @property {EventFormValues | null} initialValues - Initial values for the form fields
 * @property {boolean} isEdit - Flag indicating if the form is in edit mode
 */
export interface IAddEventProps {
  initialValues?: IEventAnnouncement | null;
  onClose: (e: any, isSubmit: boolean) => void;

  isEdit?: boolean;
}

export interface IEventDetailsCardProps {
  event: IEvent;
}

export interface IUpcomingEventsTableProps {
  data: IEvent[];
  onEdit: (event: IEvent) => void;
  onDelete: (id: string) => void;
  onView: (id: string) => void;
}
