import type { Dayjs } from 'dayjs';
import type { UseBooleanReturn } from 'src/hooks/use-boolean';

export interface IAssignment {
  title: string;
  description: string;
  class: string;
  division: string[];
  subjects: string[];
  submissionType: string;
  dueDate: Dayjs | null | string;
  attachments: File[];
  createdBy: string;
  status: string;
  assignmentType: string;
  rubricRequired: boolean;
  rubric: string;
  rubricAttachment: File[];
  isScheduled: boolean;
  scheduleDate: Dayjs | null | string;
  todaysDate: Dayjs | string;
}

export interface IAssignmentFormProps {
  dialog: UseBooleanReturn;
  onClose: (e: any, isSubmit: boolean) => void;
  editData: IAssignment | null;
}

export interface IAssignmentTableProps {
  data: IAssignment[];
  dialog: UseBooleanReturn;
  onSwitchToggle: (row: IAssignment) => void;
  onEdit: (row: IAssignment) => void;
  onDelete: (row: IAssignment) => void;
  onView: (row: IAssignment) => void;
}
