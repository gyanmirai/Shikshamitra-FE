import type { Dayjs } from 'dayjs';

export interface IHoliday {
  id: string;
  holidayName: string; // Holiday Name (e.g., Independence Day 2025)
  holidayTypeId: string; // Type (e.g., National Holiday, Festival, School Holiday)
  startDate: Dayjs | string | null; // Start Date
  endDate: Dayjs | string | null; // End Date
  description: string; // Description / Message Body
  attachment?: File | null; // File Uploads (circular, poster, pdf, etc.)
  audience: string[];
  createdBy: string;
  createdOn: Dayjs | string | null;
  status: number; // Draft / Published / Archived
}

export interface IHolidayTableProps {
  setOpen: (value: boolean) => void;
  data: IHoliday[];
  onEdit: (holiday: IHoliday) => void;
  onDelete: (holiday: IHoliday) => void;
  onPublish: (holiday: IHoliday) => void;
  isLoading: boolean;
}

export interface IHolidayFormProps {
  initialValues: IHoliday | null;
  onClose: (e: any, isSubmit: boolean) => void;
  isEdit?: boolean;
}
