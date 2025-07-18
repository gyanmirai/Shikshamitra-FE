export interface IStudentDocument {
  id: string;
  documentName: string;
  isRequired: boolean;
  documentSize: number;
  documentTypes: { label: string; value: number }[];
}

// types/slot.types.ts or within the same file

export interface ISlot {
  id?: string;
  slotName?: string | null;
  startDate?: string | Date | null;
  endDate?: string | Date | null;
  studentLimit?: number | null;
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
