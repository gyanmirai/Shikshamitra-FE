import * as Yup from 'yup';

export const getValidationSchema = (view: string) =>
  Yup.object().shape({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    class: Yup.string().required('Class is required'),
    division: Yup.array().min(1, 'At least one division is required'),
    subjects: Yup.array().min(1, 'At least one subject is required'),
    submissionType: Yup.string().required('Submission type is required'),

    // Homework-specific validations
    ...(view === 'homework' && {
      homeworkType: Yup.string().required('Homework type is required'),
      chapters: Yup.array().min(1, 'At least one chapter is required'),
      dueDate: Yup.date()
        .nullable()
        .when('isDailyTask', {
          is: false,
          then: (schema) => schema.required('Due Date is required'),
        }),
      dueTime: Yup.string()
        .nullable()
        .when('isDailyTask', {
          is: false,
          then: (schema) => schema.required('Due Time is required'),
        }),
      dayOfSubmission: Yup.string().when('isDailyTask', {
        is: true,
        then: (schema) => schema.required('Day of submission is required'),
      }),
      endDate: Yup.date()
        .nullable()
        .when('isDailyTask', {
          is: true,
          then: (schema) => schema.required('End Date is required'),
        }),
      assignmentType: Yup.mixed().test(
        'is-homework-view',
        'You are trying to submit an assignment form in homework view',
        () => false
      ),
    }),

    // Assignment-specific validations
    ...(view === 'assignment' && {
      assignmentType: Yup.string().required('Assignment type is required'),
      rubricRequired: Yup.boolean(),
      rubric: Yup.string().when('rubricRequired', {
        is: true,
        then: (schema) => schema.required('Rubric details are required'),
      }),
      homeworkType: Yup.mixed().test(
        'is-assignment-view',
        'You are trying to submit a homework form in assignment view',
        () => false
      ),
    }),

    // Shared scheduled field
    isScheduled: Yup.boolean(),
    scheduleDate: Yup.date()
      .nullable()
      .when('isScheduled', {
        is: true,
        then: (schema) => schema.required('Schedule Date is required'),
      }),
  });
