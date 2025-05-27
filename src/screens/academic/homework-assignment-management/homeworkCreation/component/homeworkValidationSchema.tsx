import * as Yup from 'yup';

export const homeworkValidationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  class: Yup.string().required('Class is required'),
  division: Yup.array()
    .of(Yup.string().required('Division is required'))
    .min(1, 'At least one division is required'),
  subjects: Yup.array()
    .of(Yup.string().required('Subject is required'))
    .min(1, 'At least one subject is required'),
  chapters: Yup.array().of(Yup.string()),

  homeworkType: Yup.string().required('Homework type is required'),
  submissionType: Yup.string().required('Submission type is required'),
  dueDate: Yup.date().nullable().required('Due date is required'),
  dueTime: Yup.date().nullable().required('Due time is required'),

  attachments: Yup.array(),
  createdBy: Yup.string(),

  status: Yup.string().oneOf(['draft', 'publish']),

  isDailyTask: Yup.boolean(),
  endDate: Yup.date().nullable(),

  parentAcknowledgement: Yup.boolean(),
  isRecurring: Yup.boolean(),
  recurringFrequency: Yup.string(),

  isScheduled: Yup.boolean(),
  scheduleDate: Yup.date().nullable(),

  todaysDate: Yup.date().required(),
});
