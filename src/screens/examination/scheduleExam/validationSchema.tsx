import * as yup from 'yup';

export const validationSchema = [
  // Step 0: Select Exam Type
  yup.object().shape({
    examType: yup.string().required('Exam Type is required'),
    examName: yup.string().required('Exam Name is required'),
    className: yup.string().required('Class is required'),
    divisions: yup.array().min(1, 'At least one division is required'),
    // 👇 Only check for minimum one subject in Step 1, no .of() or .test()
    subjects: yup
      .array()
      .required('Subjects is required')
      .min(1, 'At least one subject is required'),
  }),

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
          examDate: yup.date().required('Exam date is required'),
          startTime: yup.date().required('Start time is required'),
          endTime: yup
            .date()
            .required('End time is required')
            .test('is-after-start', 'End time must be after start time', function (value) {
              const { startTime } = this.parent;
              return value && startTime ? new Date(value) > new Date(startTime) : true;
            }),
          totalMarks: yup
            .number()
            .required('Total Marks is required')
            .min(0, 'Total marks cannot be negative')
            .typeError('Must be a number'),
          passingMarks: yup
            .number()
            .required('Passing Marks is required')
            .min(0, 'Passing marks cannot be negative')
            .max(yup.ref('totalMarks'), 'Cannot exceed total marks')
            .typeError('Must be a number'),
        })
      )
      .test(
        'no-duplicate-time',
        'Subjects cannot have same date and start time',
        function (subjects) {
          if (!Array.isArray(subjects)) return true;

          const seen = new Set();

          const hasDuplicate = subjects.some((sub) => {
            if (!sub.examDate || !sub.startTime) return false;

            const date = new Date(sub.examDate).toISOString().split('T')[0];
            const time = new Date(sub.startTime).toTimeString().slice(0, 5);
            const key = `${date}-${time}`;

            if (seen.has(key)) return true;
            seen.add(key);
            return false;
          });

          return hasDuplicate
            ? this.createError({
                message: 'Subjects cannot have same date and start time',
                path: `subjects`,
              })
            : true;
        }
      ),
  }),

  yup.object().shape({}),

  // Step 2: Evaluation Criteria
  //   yup.object().shape({
  //     subjects: yup.array().of(
  //       yup.object().shape({
  //         examDate: yup.date().required('Exam date is required'),
  //         examTime: yup.string().required('Exam time is required'),
  //         examDuration: yup
  //           .number()
  //           .required('Exam duration is required')
  //           .positive('Duration must be positive'),
  //         totalMarks: yup
  //           .number()
  //           .required('Total marks required')
  //           .positive('Total marks must be positive'),
  //         passingMarks: yup
  //           .number()
  //           .required('Passing marks required')
  //           .min(0, 'Must be at least 0')
  //           .max(yup.ref('totalMarks'), 'Passing marks must be less than total'),
  //       })
  //     ),
  //   }),

  // Step 3: Assign Teacher & Review
  yup.object().shape({}),

  //   yup.object().shape({
  //     subjects: yup.array().of(
  //       yup.object().shape({
  //         invigilationTeacher: yup.string().required('Invigilation teacher is required'),
  //         teacher: yup.string().required('Subject teacher is required'),
  //       })
  //     ),
  //     description: yup.string().required('Description is required'),
  //   }),
];
