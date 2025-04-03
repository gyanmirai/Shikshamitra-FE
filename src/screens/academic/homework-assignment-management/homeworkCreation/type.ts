import type { Dayjs } from 'dayjs';

export interface THomeworkAssignment {
  title: string;
  description: string;
  class: string;
  division: string[];
  subjects: string[];
  submissionType: string;
  dueDate: Dayjs | null;
  dueTime: Dayjs | null;
  attachments: File[];
  createdBy: string;
  status: string;
  // Homework-Specific Fields
  chapters?: string[];
  homeworkType?: string;
  isDailyTask?: boolean;
  parentAcknowledgement?: boolean;
  isRecurring?: boolean;
  recurringFrequency?: string;
  todaysDate?: Dayjs | null;
  dayOfSubmission?: string;
  endDate?: Dayjs | null;
  scheduleDate?: Dayjs | null;
  // Assignment-Specific Fields
  assignmentType?: string;
  evaluationCriteria?: string;
  assignedResources?: string;
  rubricRequired?: boolean;
  rubric?: string;
  isScheduled: boolean;
}
