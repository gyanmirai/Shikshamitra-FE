import type { Dayjs } from 'dayjs';

export interface IHoliday {
  id: string;
  holidayName: string; // Holiday Name (e.g., Independence Day 2025)
  holidayType: string; // Type (e.g., National Holiday, Festival, School Holiday)
  importanceLevel: 'Normal' | 'High' | 'Low'; // Importance Level
  startDate: Dayjs | string | null; // Start Date
  endDate: Dayjs | string | null; // End Date
  description: string; // Description / Message Body
  attachment?: File | null; // File Uploads (circular, poster, pdf, etc.)

  // Audience selection
  organizations: string[]; // Organization(s) (e.g., All, specific org IDs)
  audience: string[]; // Target Audience (Students, Parents, Teachers, etc.)

  createdBy: string;
  createdOn: Dayjs | string | null;
  status: number; // Draft / Published / Archived
}

export interface IHolidayTableProps {
  data: IHoliday[];
  onEdit: (holiday: IHoliday) => void;
  onDelete: (id: string) => void;
  onPublish: (holiday: IHoliday) => void;
}

export interface IHolidayFormProps {
  initialValues: IHoliday | null;
  onClose: (e: any, isSubmit: boolean) => void;
  isEdit?: boolean;
}
