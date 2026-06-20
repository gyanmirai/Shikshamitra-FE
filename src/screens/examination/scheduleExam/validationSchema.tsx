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
              'not-in-past-for-today',
              'Start time cannot be in the past for today',
              // eslint-disable-next-line func-names
              function (value) {
                const { examDate, electiveGroupId, schedulingMode } = this.parent;
                if (electiveGroupId && schedulingMode === 'separate') return true;
                if (!value || !examDate) return true;

                const isToday = dayjs(examDate as any).isSame(dayjs(), 'day');
                if (!isToday) return true;

                const startDateTime = dayjs(examDate as any)
                  .hour(dayjs(value as any).hour())
                  .minute(dayjs(value as any).minute());
                return !startDateTime.isBefore(dayjs());
              }
            )
            .test(
              'no-time-conflict',
              'Time conflicts with another subject on the same date',
              // eslint-disable-next-line func-names
              function (value) {
                const { examDate, endTime, electiveGroupId, schedulingMode } = this.parent;
                if (electiveGroupId && schedulingMode === 'separate') return true;

                const allSubjects = (this.options as any).from?.[1]?.value?.subjects || [];
                if (!value || !examDate || !endTime || !allSubjects) return true;

                const currentDate = dayjs(examDate as any).format('YYYY-MM-DD');
                const tStart = dayjs(value as any);
                const tEnd = dayjs(endTime as any);
                const currentStart = dayjs(examDate as any)
                  .hour(tStart.hour())
                  .minute(tStart.minute())
                  .second(0)
                  .millisecond(0);
                const currentEnd = dayjs(examDate as any)
                  .hour(tEnd.hour())
                  .minute(tEnd.minute())
                  .second(0)
                  .millisecond(0);
                const currentIndex = parseInt(this.path.match(/\[(\d+)\]/)?.[1] || '0', 10);

                const conflicting = allSubjects
                  .filter((other: any, i: number) => {
                    if (
                      i === currentIndex ||
                      !other?.examDate ||
                      !other?.startTime ||
                      !other?.endTime
                    )
                      return false;
                    const otherDateStr = dayjs(other.examDate as any).format('YYYY-MM-DD');
                    if (otherDateStr !== currentDate) return false;

                    const oStart = dayjs(other.startTime as any);
                    const oEnd = dayjs(other.endTime as any);
                    const otherStart = dayjs(other.examDate as any)
                      .hour(oStart.hour())
                      .minute(oStart.minute())
                      .second(0)
                      .millisecond(0);
                    const otherEnd = dayjs(other.examDate as any)
                      .hour(oEnd.hour())
                      .minute(oEnd.minute())
                      .second(0)
                      .millisecond(0);

                    return currentStart.isBefore(otherEnd) && currentEnd.isAfter(otherStart);
                  })
                  .find(
                    (other: any) =>
                      !electiveGroupId ||
                      !other.electiveGroupId ||
                      electiveGroupId !== other.electiveGroupId
                  );

                // Core subjects cannot overlap with ANY exam; electives only with same group
                if (conflicting) {
                  if (!electiveGroupId || !conflicting.electiveGroupId) {
                    return this.createError({
                      message: !electiveGroupId
                        ? 'Core subject cannot overlap with other exams'
                        : 'Conflicts with a Core subject exam',
                    });
                  }
                  if (electiveGroupId !== conflicting.electiveGroupId) {
                    return this.createError({
                      message: 'Conflicts with another elective group exam',
                    });
                  }
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
              const dummyDate = dayjs('2000-01-01');
              const start = dayjs(startTime as any);
              const end = dayjs(value as any);
              const dStart = dummyDate
                .hour(start.hour())
                .minute(start.minute())
                .second(0)
                .millisecond(0);
              const dEnd = dummyDate.hour(end.hour()).minute(end.minute()).second(0).millisecond(0);
              return dEnd.isAfter(dStart);
            })
            .test(
              'minimum-duration',
              'Exam duration must be at least 30 minutes',
              // eslint-disable-next-line func-names
              function (value) {
                const { startTime, electiveGroupId, schedulingMode } = this.parent;
                if (electiveGroupId && schedulingMode === 'separate') return true;
                if (!value || !startTime) return true;
                const dummyDate = dayjs('2000-01-01');
                const start = dayjs(startTime as any);
                const end = dayjs(value as any);
                const dStart = dummyDate
                  .hour(start.hour())
                  .minute(start.minute())
                  .second(0)
                  .millisecond(0);
                const dEnd = dummyDate
                  .hour(end.hour())
                  .minute(end.minute())
                  .second(0)
                  .millisecond(0);
                return dEnd.diff(dStart, 'minute') >= 30;
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
          gradeScalingId: yup
            .mixed()
            .nullable()
            .test(
              'grade-scale-required',
              'Grade Scale is required',
              // eslint-disable-next-line func-names
              function (value) {
                const { electiveGroupId, schedulingMode } = this.parent;
                if (electiveGroupId && schedulingMode === 'separate') return true;
                return !!value;
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
              (s: any) =>
                s.examDate &&
                s.startTime &&
                s.endTime &&
                s.totalMarks &&
                s.passingMarks &&
                s.gradeScalingId
            );
          }
          return (
            div.examDate &&
            div.startTime &&
            div.endTime &&
            div.totalMarks &&
            div.passingMarks &&
            div.gradeScalingId
          );
        });
      }),
  }),

  // Step 2: Room assignment validation
  yup.object().shape({
    roomDetails: yup
      .mixed()
      .test('room-assignment-required', 'Room is required', function (roomDetails) {
        const values = this.parent as any;
        if (!values?.isRoomAssign) return true;
        const roomDetailsMap = (roomDetails ?? {}) as any;

        const selectedDivisionIds: string[] = (values?.divisions ?? []).filter(
          (id: string) => id !== 'all'
        );
        const allSubjects: any[] = values?.subjects ?? [];
        let firstMissingPath: string | null = null;

        const hasMissingRoom = allSubjects.some((subject) => {
          // Elective group: validate each nested subject separately (roomDetails keyed by subjectId)
          if (subject?.electiveGroupId && Array.isArray(subject?.subjects)) {
            return subject.subjects.some((nested: any) => {
              const nestedSubjectId = nested?.subjectId;
              if (!nestedSubjectId) return false;

              return selectedDivisionIds.some((divisionId) => {
                const roomIds = roomDetailsMap?.[nestedSubjectId]?.[divisionId]?.roomIds ?? [];
                const isMissing = !Array.isArray(roomIds) || roomIds.length === 0;
                if (isMissing && !firstMissingPath) {
                  firstMissingPath = `roomDetails.${nestedSubjectId}.${divisionId}.roomIds`;
                }
                return isMissing;
              });
            });
          }

          const subjectId = subject?.subjectId;
          if (!subjectId) return false;

          return selectedDivisionIds.some((divisionId) => {
            const roomIds = roomDetailsMap?.[subjectId]?.[divisionId]?.roomIds ?? [];
            const isMissing = !Array.isArray(roomIds) || roomIds.length === 0;
            if (isMissing && !firstMissingPath) {
              firstMissingPath = `roomDetails.${subjectId}.${divisionId}.roomIds`;
            }
            return isMissing;
          });
        });

        if (hasMissingRoom && firstMissingPath) {
          return this.createError({
            path: firstMissingPath,
            message: 'Room is required',
          });
        }

        return true;
      }),
  }),

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
