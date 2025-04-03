import type { THomeworkAssignment } from '../type';

export const assignmentInitialValues: THomeworkAssignment = {
  title: '',
  description: '',
  class: '',
  division: [],
  subjects: [],
  submissionType: '',
  dueDate: null,
  dueTime: null,
  attachments: [],
  createdBy: '', // Would typically be auto-populated from logged-in user
  status: 'draft',
  // Optional fields
  chapters: [],
  homeworkType: '',
  isDailyTask: false,
  parentAcknowledgement: false,
  isRecurring: false,
  recurringFrequency: '',
  scheduleDate: null,
  assignmentType: '',
  evaluationCriteria: '',
  assignedResources: '',
  rubric: '',
  isScheduled: false,
};
