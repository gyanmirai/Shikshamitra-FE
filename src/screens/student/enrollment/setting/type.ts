export interface IStudentDocument {
  id: string;
  name: string;
  isRequired: boolean;
  maxSizeMB: number;
  acceptedFormats: { label: string; value: number }[];
}

// types/slot.types.ts or within the same file

export interface ISlot {
  id?: string;
  slotName?: string | null;
  startTime?: string | Date | null;
  endTime?: string | Date | null;
  studentLimit?: number | null;
  duration?: number | null; // Duration in minutes
  roomNo?: string | null;
  creationTime?: string | Date | null;
}

export interface IExamType {
  id: string;
  examType: string;
}

export interface IInquiryPreference {
  id: string;
  preferenceName: string;
}

export interface IRegistrationAmount {
  id: string;
  amount: number;
}
