import dayjs from 'dayjs';
import * as yup from 'yup';

export const validationSchema = [
  // Step 0: Select Exam Type
  yup.object().shape({
    examType: yup.string().required('Exam Type is required'),
    examName: yup.string().required('Exam Name is required'),
    className: yup.string().required('Class is required'),
    divisions: yup.array().min(1, 'At least one division is required'),
    subjects: yup
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
          subjectId: yup.string().required('ID is required'),
          subjectName: yup.string().required('Subject name is required'),
          subjectColor: yup
            .string()
            .required('Subject color is required')
            .matches(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
          examDate: yup
            .mixed()
            .nullable()
            .test(
              'is-valid-date',
              'Exam date is required',
              // eslint-disable-next-line func-names
              function (value) {
                // Elective groups in separate mode store schedules per-subject; skip group-level check
                const { electiveGroupId, schedulingMode } = this.parent;
                if (electiveGroupId && schedulingMode === 'separate') return true;
                if (!value) return false;
                if (!dayjs(value as any).isValid()) return false;
                return dayjs(value as any).isSameOrAfter(dayjs().startOf('day'));
              }
            ),
          startTime: yup
            .mixed()
            .nullable()
            .test(
              'is-valid-time',
              'Start time is required',
              // eslint-disable-next-line func-names
              function (value) {
                const { electiveGroupId, schedulingMode } = this.parent;
                if (electiveGroupId && schedulingMode === 'separate') return true;
                return !!(value && dayjs(value as any).isValid());
              }
            )
            .test(
              'no-time-conflict',
              'Time conflicts with another subject on the same date',
              // eslint-disable-next-line func-names
              function (value) {
                const { examDate, electiveGroupId, schedulingMode } = this.parent;
                if (electiveGroupId && schedulingMode === 'separate') return true;

                const allSubjects = (this.options as any).from?.[1]?.value?.subjects || [];
                if (!value || !examDate || !allSubjects) return true;

                const currentDate = dayjs(examDate as any).format('YYYY-MM-DD');
                const currentStart = dayjs(value as any);
                const currentPath = this.path;
                const currentIndex = parseInt(currentPath.match(/\[(\d+)\]/)?.[1] || '0', 10);

                for (let i = 0; i < allSubjects.length; i += 1) {
                  if (i === currentIndex) return true;
                  const otherSubject = allSubjects[i];
                  if (!otherSubject?.examDate || !otherSubject?.startTime) return true;
                  const otherDate = dayjs(otherSubject.examDate as any).format('YYYY-MM-DD');
                  const otherStart = dayjs(otherSubject.startTime as any);
                  if (currentDate === otherDate && currentStart.isSame(otherStart)) return false;
                }
                return true;
              }
            ),
          endTime: yup
            .mixed()
            .nullable()
            .test(
              'is-valid-dayjs',
              'End time is required',
              // eslint-disable-next-line func-names
              function (value) {
                const { electiveGroupId, schedulingMode } = this.parent;
                if (electiveGroupId && schedulingMode === 'separate') return true;
                return !!(value && dayjs(value as any).isValid());
              }
            )
            // eslint-disable-next-line func-names
            .test('is-after-start', 'End time must be after start time', function (value) {
              const { startTime, electiveGroupId, schedulingMode } = this.parent;
              if (electiveGroupId && schedulingMode === 'separate') return true;
              if (!value || !startTime) return true;
              return dayjs(value as any).isAfter(dayjs(startTime as any));
            })
            .test(
              'minimum-duration',
              'Exam duration must be at least 30 minutes',
              // eslint-disable-next-line func-names
              function (value) {
                const { startTime, electiveGroupId, schedulingMode } = this.parent;
                if (electiveGroupId && schedulingMode === 'separate') return true;
                if (!value || !startTime) return true;
                return dayjs(value as any).diff(dayjs(startTime as any), 'minute') >= 30;
              }
            ),
          totalMarks: yup
            .mixed()
            .nullable()
            .test(
              'total-marks-valid',
              'Total Marks is required',
              // eslint-disable-next-line func-names
              function (value) {
                const { electiveGroupId, schedulingMode } = this.parent;
                if (electiveGroupId && schedulingMode === 'separate') return true;
                if (value === '' || value === undefined || value === null) return false;
                const n = Number(value);
                if (Number.isNaN(n)) return this.createError({ message: 'Must be a number' });
                if (n < 1) return this.createError({ message: 'Total marks must be at least 1' });
                if (n > 1000)
                  return this.createError({ message: 'Total marks cannot exceed 1000' });
                if (!Number.isInteger(n))
                  return this.createError({ message: 'Total marks must be a whole number' });
                return true;
              }
            ),
          passingMarks: yup
            .mixed()
            .nullable()
            .test(
              'passing-marks-valid',
              'Passing Marks is required',
              // eslint-disable-next-line func-names
              function (value) {
                const { electiveGroupId, schedulingMode, totalMarks } = this.parent;
                if (electiveGroupId && schedulingMode === 'separate') return true;
                if (value === '' || value === undefined || value === null) return false;
                const n = Number(value);
                if (Number.isNaN(n)) return this.createError({ message: 'Must be a number' });
                if (n < 1) return this.createError({ message: 'Passing marks must be at least 1' });
                if (!Number.isInteger(n))
                  return this.createError({ message: 'Passing marks must be a whole number' });
                if (totalMarks && n > Number(totalMarks))
                  return this.createError({
                    message: 'Passing marks cannot exceed total marks',
                  });
                return true;
              }
            ),
        })
      )
      .required('At least one subject is required')
      .test('Fill the second field details', (value) => {
        if (!value || value.length === 0) return true;
        return value.every((div: any) => {
          // For separate-mode elective groups: validate each individual subject
          if (div.electiveGroupId && div.schedulingMode === 'separate') {
            return (div.subjects || []).every(
              (s: any) => s.examDate && s.startTime && s.endTime && s.totalMarks && s.passingMarks
            );
          }
          return div.examDate && div.startTime && div.endTime && div.totalMarks && div.passingMarks;
        });
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
