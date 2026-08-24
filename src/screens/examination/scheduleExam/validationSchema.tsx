import dayjs from 'dayjs';
import * as yup from 'yup';

interface ScheduledSlot {
  subjectId: string;
  electiveGroupId?: string;
  examDate: any;
  startTime: any;
  endTime: any;
}

const isSameElectiveGroup = (a?: string, b?: string) => !!a && !!b && a === b;

const hasValue = (value: any) => value !== undefined && value !== null && value !== '';

const hasAnyScheduleValue = (subject?: any) =>
  Boolean(
    subject &&
    (hasValue(subject.examDate) ||
      hasValue(subject.startTime) ||
      hasValue(subject.endTime) ||
      hasValue(subject.totalMarks) ||
      hasValue(subject.passingMarks) ||
      hasValue(subject.gradeScalingId))
  );

const hasCompleteSchedule = (subject?: any) =>
  Boolean(
    subject &&
    subject.examDate &&
    subject.startTime &&
    subject.endTime &&
    hasValue(subject.totalMarks) &&
    hasValue(subject.passingMarks)
  );

const getParentElectiveGroup = (context: any) =>
  (context.options as any).from?.find(
    (f: any) => f.value?.electiveGroupId && f.value?.schedulingMode === 'separate'
  );

const shouldRequireScheduleField = (context: any) => {
  const subject = context.parent || {};
  if (subject.isExamSelectionDisabled) return false;
  if (subject.electiveGroupId && subject.schedulingMode === 'separate') return false;

  const parentElectiveGroup = getParentElectiveGroup(context);
  if (parentElectiveGroup) {
    return hasAnyScheduleValue(subject);
  }

  return true;
};

const getRootSubjects = (context: any) => {
  const fromArray = context.options?.from || [];
  const rootContext = fromArray.find((f: any) => f.value && 'examName' in f.value);
  return rootContext?.value?.subjects || [];
};

const flattenSlots = (rootSubjects: any[]): ScheduledSlot[] => {
  const allSlots: ScheduledSlot[] = [];
  rootSubjects.forEach((sub: any) => {
    if (sub?.electiveGroupId && sub?.schedulingMode === 'separate') {
      (sub.subjects || []).forEach((nested: any) => {
        if (nested?.subjectId && !nested?.isExamSelectionDisabled) {
          allSlots.push({
            subjectId: nested.subjectId,
            electiveGroupId: sub.electiveGroupId,
            examDate: nested.examDate,
            startTime: nested.startTime,
            endTime: nested.endTime,
          });
        }
      });
    } else if (sub?.subjectId) {
      allSlots.push({
        subjectId: sub.subjectId,
        electiveGroupId: sub.electiveGroupId || undefined,
        examDate: sub.examDate,
        startTime: sub.startTime,
        endTime: sub.endTime,
      });
    }
  });
  return allSlots;
};

const slotsOverlap = (a: ScheduledSlot, b: ScheduledSlot) => {
  if (!a.examDate || !b.examDate || !a.startTime || !a.endTime || !b.startTime || !b.endTime) {
    return false;
  }
  const dateA = dayjs(a.examDate).format('YYYY-MM-DD');
  const dateB = dayjs(b.examDate).format('YYYY-MM-DD');
  if (dateA !== dateB) return false;

  const tStartA = dayjs(a.startTime);
  const tEndA = dayjs(a.endTime);
  const tStartB = dayjs(b.startTime);
  const tEndB = dayjs(b.endTime);

  const startA = dayjs(a.examDate)
    .hour(tStartA.hour())
    .minute(tStartA.minute())
    .second(0)
    .millisecond(0);
  const endA = dayjs(a.examDate).hour(tEndA.hour()).minute(tEndA.minute()).second(0).millisecond(0);
  const startB = dayjs(b.examDate)
    .hour(tStartB.hour())
    .minute(tStartB.minute())
    .second(0)
    .millisecond(0);
  const endB = dayjs(b.examDate).hour(tEndB.hour()).minute(tEndB.minute()).second(0).millisecond(0);

  return startA.isBefore(endB) && endA.isAfter(startB);
};

const scheduleFieldsSchema = {
  examDate: yup
    .mixed()
    .nullable()
    .test('is-valid-date', 'Exam date is required', function (value) {
      if (!shouldRequireScheduleField(this)) return true;
      if (!value) return false;
      if (!dayjs(value as any).isValid()) return false;
      return dayjs(value as any).isSameOrAfter(dayjs().startOf('day'));
    }),
  startTime: yup
    .mixed()
    .nullable()
    .test('is-valid-time', 'Start time is required', function (value) {
      if (!shouldRequireScheduleField(this)) return true;
      return !!(value && dayjs(value as any).isValid());
    })
    .test('not-in-past-for-today', 'Start time cannot be in the past for today', function (value) {
      const { examDate } = this.parent || {};
      if (!shouldRequireScheduleField(this)) return true;
      if (!value || !examDate) return true;
      const isToday = dayjs(examDate as any).isSame(dayjs(), 'day');
      if (!isToday) return true;
      const startDateTime = dayjs(examDate as any)
        .hour(dayjs(value as any).hour())
        .minute(dayjs(value as any).minute());
      return !startDateTime.isBefore(dayjs());
    })
    .test('no-time-conflict', 'Time conflicts with another subject', function (value) {
      const {
        examDate,
        endTime,
        subjectId,
        electiveGroupId,
        schedulingMode,
        isExamSelectionDisabled,
      } = this.parent || {};
      if (isExamSelectionDisabled) return true;
      if (electiveGroupId && schedulingMode === 'separate') return true;
      if (getParentElectiveGroup(this) && !hasAnyScheduleValue(this.parent)) return true;
      const rootSubjects = getRootSubjects(this);
      if (!value || !examDate || !endTime || !rootSubjects || !subjectId) return true;

      const parentGroup = (this.options as any).from?.find(
        (f: any) => f.value && f.value.electiveGroupId
      );
      const currentGroupId = parentGroup?.value?.electiveGroupId || electiveGroupId;

      const currentSlot = {
        subjectId,
        electiveGroupId: currentGroupId,
        examDate,
        startTime: value,
        endTime,
      };

      const allSlots = flattenSlots(rootSubjects);

      const conflicting = allSlots.find((other) => {
        if (other.subjectId === subjectId) return false;
        if (!slotsOverlap(currentSlot, other)) return false;
        return !isSameElectiveGroup(currentGroupId, other.electiveGroupId);
      });

      if (conflicting) {
        if (!currentGroupId || !conflicting.electiveGroupId) {
          return this.createError({
            message: !currentGroupId
              ? 'Core subject cannot overlap with other exams'
              : 'Conflicts with a Core subject exam',
          });
        }
        return this.createError({
          message: 'Conflicts with another elective group exam',
        });
      }
      return true;
    }),
  endTime: yup
    .mixed()
    .nullable()
    .test('is-valid-dayjs', 'End time is required', function (value) {
      if (!shouldRequireScheduleField(this)) return true;
      return !!(value && dayjs(value as any).isValid());
    })
    .test('is-after-start', 'End time must be after start time', function (value) {
      const { startTime } = this.parent || {};
      if (!shouldRequireScheduleField(this)) return true;
      if (!value || !startTime) return true;
      const dummyDate = dayjs('2000-01-01');
      const start = dayjs(startTime as any);
      const end = dayjs(value as any);
      const dStart = dummyDate.hour(start.hour()).minute(start.minute()).second(0).millisecond(0);
      const dEnd = dummyDate.hour(end.hour()).minute(end.minute()).second(0).millisecond(0);
      return dEnd.isAfter(dStart);
    })
    .test('minimum-duration', 'Exam duration must be at least 30 minutes', function (value) {
      const { startTime } = this.parent || {};
      if (!shouldRequireScheduleField(this)) return true;
      if (!value || !startTime) return true;
      const dummyDate = dayjs('2000-01-01');
      const start = dayjs(startTime as any);
      const end = dayjs(value as any);
      const dStart = dummyDate.hour(start.hour()).minute(start.minute()).second(0).millisecond(0);
      const dEnd = dummyDate.hour(end.hour()).minute(end.minute()).second(0).millisecond(0);
      return dEnd.diff(dStart, 'minute') >= 30;
    }),
  totalMarks: yup
    .mixed()
    .nullable()
    .test('total-marks-valid', 'Total Marks is required', function (value) {
      if (!shouldRequireScheduleField(this)) return true;
      if (value === '' || value === undefined || value === null) return false;
      const n = Number(value);
      if (Number.isNaN(n)) return this.createError({ message: 'Must be a number' });
      if (n < 1) return this.createError({ message: 'Total marks must be at least 1' });
      if (n > 1000) return this.createError({ message: 'Total marks cannot exceed 1000' });
      if (!Number.isInteger(n))
        return this.createError({ message: 'Total marks must be a whole number' });
      return true;
    }),
  passingMarks: yup
    .mixed()
    .nullable()
    .test('passing-marks-valid', 'Passing Marks is required', function (value) {
      const { totalMarks } = this.parent || {};
      if (!shouldRequireScheduleField(this)) return true;
      if (value === '' || value === undefined || value === null) return false;
      const n = Number(value);
      if (Number.isNaN(n)) return this.createError({ message: 'Must be a number' });
      if (n < 1) return this.createError({ message: 'Passing marks must be at least 1' });
      if (!Number.isInteger(n))
        return this.createError({ message: 'Passing marks must be a whole number' });
      if (totalMarks && n > Number(totalMarks)) {
        return this.createError({ message: 'Passing marks cannot exceed total marks' });
      }
      return true;
    }),
  gradeScalingId: yup
    .mixed()
    .nullable()
    .test('grade-scale-required', 'Grade Scale is required', function (value) {
      if (!shouldRequireScheduleField(this)) return true;
      return !!value;
    }),
  notes: yup.string().nullable().max(100, 'Notes cannot exceed 100 characters'),
};

export const validationSchema = [
  // Step 0: Select Exam Type
  yup.object().shape({
    examType: yup.string().required('Exam Type is required'),
    examName: yup
      .string()
      .max(100, 'Exam Name cannot exceed 100 characters')
      .required('Exam Name is required'),
    className: yup.string().required('Class is required'),
    gradingScaleId: yup.mixed().required('Grading Scale is required'),
    divisions: yup.array().min(1, 'At least one division is required'),
    subjects: yup
      .array()
      .required('Subjects is required')
      .min(1, 'At least one subject is required'),
  }),

  // Step 1: Exam Details
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

          // Schedule fields at the top level
          ...scheduleFieldsSchema,

          // If separate-mode elective group, validate nested subjects array recursively
          subjects: yup.array().when('schedulingMode', {
            is: 'separate',
            then: (schema) =>
              schema
                .of(
                  yup.object().shape({
                    subjectId: yup.string().required('ID is required'),
                    subjectName: yup.string().required('Subject name is required'),
                    ...scheduleFieldsSchema,
                  })
                )
                .test(
                  'at-least-one-elective-scheduled',
                  'Schedule at least one subject in this elective group',
                  (value) =>
                    (value ?? []).some(
                      (subject: any) =>
                        !subject?.isExamSelectionDisabled && hasCompleteSchedule(subject)
                    )
                ),
            otherwise: (schema) => schema.nullable().notRequired(),
          }),
        })
      )
      .required('At least one subject is required'),
  }),

  // Step 2: Room assignment validation
  yup.object().shape({
    roomDetails: yup
      .mixed()
      .test('room-assignment-validation', 'Room is required', function (roomDetails) {
        const values = this.parent as any;
        if (!values?.isRoomAssign) return true;
        const roomDetailsMap = (roomDetails ?? {}) as any;

        const selectedDivisionIds: string[] = (values?.divisions ?? []).filter(
          (id: string) => id !== 'all'
        );
        const allSubjects: any[] = values?.subjects ?? [];

        // Flatten active scheduled subjects
        const activeSubjects: Array<{
          subjectId: string;
          subjectName: string;
          examDate: any;
          startTime: any;
          endTime: any;
        }> = [];

        allSubjects.forEach((subject) => {
          if (subject?.electiveGroupId && Array.isArray(subject?.subjects)) {
            subject.subjects.forEach((nested: any) => {
              if (!nested?.isExamSelectionDisabled && hasCompleteSchedule(nested) && nested?.subjectId) {
                activeSubjects.push({
                  subjectId: nested.subjectId,
                  subjectName: nested.subjectName || nested.name || 'Elective Subject',
                  examDate: nested.examDate,
                  startTime: nested.startTime,
                  endTime: nested.endTime,
                });
              }
            });
          } else if (subject?.subjectId && hasCompleteSchedule(subject)) {
            activeSubjects.push({
              subjectId: subject.subjectId,
              subjectName: subject.subjectName || 'Subject',
              examDate: subject.examDate,
              startTime: subject.startTime,
              endTime: subject.endTime,
            });
          }
        });

        const validationErrors: yup.ValidationError[] = [];

        // Required field validation for all divisions & subjects
        activeSubjects.forEach((sub) => {
          selectedDivisionIds.forEach((divisionId) => {
            const roomIds = roomDetailsMap?.[sub.subjectId]?.[divisionId]?.roomIds;
            const path = `roomDetails.${sub.subjectId}.${divisionId}.roomIds`;

            if (!Array.isArray(roomIds) || roomIds.length === 0) {
              validationErrors.push(
                new yup.ValidationError('Room is required', roomIds, path)
              );
            }
          });
        });

        if (validationErrors.length > 0) {
          throw new yup.ValidationError(validationErrors);
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
