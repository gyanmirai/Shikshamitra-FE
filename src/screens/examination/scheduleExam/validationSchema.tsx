import * as yup from 'yup';

export const validationSchema = [
  // Step 0: Select Exam Type
  yup.object().shape({
    examType: yup.string().required('Exam Type is required'),
    examName: yup.string().required('Exam Name is required'),
    className: yup.string().required('Class is required'),
    divisions: yup.array().min(1, 'At least one division is required'),
    subjects: yup.array().min(1, 'At least one subject is required'),
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
        'Subjects cannot have the same start and end time',
        function (subjects) {
          if (!subjects) return true;

          const seenKeys = new Set<string>();
          const hasDuplicate = subjects.some((sub) => {
            if (!sub.startTime || !sub.endTime) return false;

            const key = `${new Date(sub.startTime).getTime()}-${new Date(sub.endTime).getTime()}`;

            if (seenKeys.has(key)) return true;
            seenKeys.add(key);
            return false;
          });

          return hasDuplicate
            ? this.createError({
                message: 'Subjects cannot have the same start and end time',
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
