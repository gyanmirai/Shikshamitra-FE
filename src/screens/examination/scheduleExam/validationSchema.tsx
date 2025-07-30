import dayjs from 'dayjs';
import * as yup from 'yup';

export const validationSchema = [
  // Step 0: Select Exam Type
  yup.object().shape({
    examType: yup.string().required('Exam Type is required'),
    examName: yup.string().required('Exam Name is required'),
    className: yup.string().required('Class is required'),
    divisions: yup.array().min(1, 'At least one division is required'),
    selectedSubjects: yup
      .array()
      .required('Subjects is required')
      .min(1, 'At least one subject is required'),
  }),

  // Step 1: Exam Details - Enhanced validation
  yup.object().shape({
    subjects: yup
      .array()
      .of(
        yup.object().shape({
          id: yup.number().required('ID is required'),
          subjectName: yup.string().required('Subject name is required'),
          subjectColor: yup
            .string()
            .required('Subject color is required')
            .matches(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
          examDate: yup
            .mixed()
            .test(
              'is-valid-date',
              'Exam date is required',
              (value) => value && dayjs(value as any).isValid()
            )
            .test('is-future-date', 'Exam date cannot be in the past', (value) => {
              if (!value) return true;
              return dayjs(value as any).isSameOrAfter(dayjs().startOf('day'));
            })
            .required('Exam date is required'),
          startTime: yup
            .mixed()
            .test(
              'is-valid-time',
              'Start time is required',
              (value) => value && dayjs(value as any).isValid()
            )
            .required('Start time is required')
            .test(
              'no-time-conflict',
              'Time conflicts with another subject on the same date',
              function (value) {
                const { examDate } = this.parent;
                const allSubjects = (this.options as any).from?.[1]?.value?.subjects || []; // Get all subjects from the form root with type assertion

                if (!value || !examDate || !allSubjects) return true;

                const currentDate = dayjs(examDate as any).format('YYYY-MM-DD');
                const currentStart = dayjs(value as any);
                const currentPath = this.path; // e.g., "subjects[0].startTime"
                const currentIndex = parseInt(currentPath.match(/\[(\d+)\]/)?.[1] || '0', 10);

                // Check against other subjects
                for (let i = 0; i < allSubjects.length; i += 1) {
                  if (i === currentIndex) {
                    return true; // Skip validation for current subject
                  }

                  const otherSubject = allSubjects[i];
                  if (!otherSubject?.examDate || !otherSubject?.startTime) {
                    return true;
                  }

                  const otherDate = dayjs(otherSubject.examDate as any).format('YYYY-MM-DD');
                  const otherStart = dayjs(otherSubject.startTime as any);

                  // Check for same date and same start time
                  if (currentDate === otherDate && currentStart.isSame(otherStart)) {
                    return false;
                  }
                }
                return true;
              }
            ),
          endTime: yup
            .mixed()
            .test(
              'is-valid-dayjs',
              'End time is required',
              (value) => value && dayjs(value as any).isValid()
            )
            .required('End time is required')
            .test('is-after-start', 'End time must be after start time', function (value) {
              const { startTime } = this.parent;
              if (!value || !startTime) return true;

              const startDateTime = dayjs(startTime as any);
              const endDateTime = dayjs(value as any);

              return endDateTime.isAfter(startDateTime);
            })
            .test(
              'minimum-duration',
              'Exam duration must be at least 30 minutes',
              function (value) {
                const { startTime } = this.parent;
                if (!value || !startTime) return true;

                const startDateTime = dayjs(startTime as any);
                const endDateTime = dayjs(value as any);
                const diffMinutes = endDateTime.diff(startDateTime, 'minute');

                return diffMinutes >= 30;
              }
            ),
          totalMarks: yup
            .number()
            .required('Total Marks is required')
            .min(1, 'Total marks must be at least 1')
            .max(1000, 'Total marks cannot exceed 1000')
            .integer('Total marks must be a whole number')
            .typeError('Must be a number'),
          passingMarks: yup
            .number()
            .required('Passing Marks is required')
            .min(1, 'Passing marks must be at least 1')
            .integer('Passing marks must be a whole number')
            .typeError('Must be a number')
            .test('not-exceed-total', 'Passing marks cannot exceed total marks', function (value) {
              const { totalMarks } = this.parent;
              if (!value || !totalMarks) return true;
              return value <= totalMarks;
            }),
        })
      )
      .required('At least one subject is required')
      .test('Fill the second field details', (value) => {
        if (!value || value.length === 0) return true;
        return value.every(
          (div) =>
            div.examDate && div.startTime && div.endTime && div.totalMarks && div.passingMarks
        );
      }),
  }),

  // Step 2: Additional validation (if needed)
  yup.object().shape({}),

  // Step 3: Assign Teacher & Review
  yup.object().shape({}),
];

// Helper function to validate with context
export const validateSubjectsWithContext = (subjects: any, currentIndex = null) => {
  const schema = validationSchema[1]; // Step 1 schema

  return schema.validate(
    { subjects },
    {
      abortEarly: false,
      context: {
        subjects,
        currentIndex,
      },
    }
  );
};
