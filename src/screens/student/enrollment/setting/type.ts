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
  startDateTime?: string | Date | null;
  endDateTime?: string | Date | null;
  studentLimit?: number | null;
  duration?: number | null; // Duration in minutes
  roomNo?: string | null;
  roomId?: string | null;
  creationTime?: string | Date | null;
  buildingId?: string | null;
  floorId?: string | null;
}

export interface IExamType {
  id: string;
  examType: string;
}

export interface IInquiryPreference {
  id: string;
  preferenceName: string;
  description?: string | null;
  displayOrder: number;
  isActive: boolean;
  deactivationReason?: string | null;
  assignedStudentsCount: number;
  canDelete: boolean;
}

export interface IRegistrationAmount {
  id: string;
  amount: number;
}
