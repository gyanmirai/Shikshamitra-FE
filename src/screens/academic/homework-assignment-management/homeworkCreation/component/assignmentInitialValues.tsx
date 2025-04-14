import dayjs from 'dayjs';

import type { IHomeworkAssignment } from '../type';

export const assignmentInitialValues: IHomeworkAssignment = {
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
  todaysDate: dayjs(dayjs().format('DD-MM-YYYY')),
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
  rubricRequired: false,
  rubric: '',
  isScheduled: false,
};
