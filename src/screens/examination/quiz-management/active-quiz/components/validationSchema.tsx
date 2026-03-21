import dayjs from 'dayjs';
import * as yup from 'yup';

export const stepValidationSchemas = (currentYear: any) => [
  yup.object().shape({
    attemptsAllowed: yup.number(),
    quizStartDateTime: yup
      .mixed()
      .test(
        'is-valid-date',
        'Start Date/Time is required',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Start Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Start Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      )
      .required('Start Date/Time is required'),
    totalMarks: yup.number().required('Total Marks is required'),
    passingMarks: yup
      .number()
      .required('Passing Marks is required')
      .min(0, 'Passing Marks cannot be negative')
      .max(yup.ref('totalMarks'), 'Cannot exceed total marks'),
    quizTakenType: yup.string().required('Quiz Taken Type is Required'),
    quizEndDateTime: yup
      .mixed()
      .test(
        'is-valid-date',
        'End Date/Time is required',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `Start Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `Start Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      )
      .required('End Date/Time is required')
      // eslint-disable-next-line func-names
      .test('is-after-start', 'End date must be after start date', function (value) {
        const startDate = this.parent.quizStartDateTime;
        return dayjs(value as any).isAfter(dayjs(startDate));
      }),
    quizTitle: yup.string().required('Title is required'),
    className: yup.string().required('Class is required'),
    division: yup.array().of(yup.string()).min(1, 'At least one Division is required'),
    subject: yup.string().required('Subject is required'),
    chapter: yup.array().of(yup.string()).min(1, 'At least one Chapter is required'),
    quizDuration: yup.string().required('Duration is required'),
  }),
  yup.object().shape({
    questions: yup.array().when('isQuestionUpload', {
      is: false,
      then: (schema) => schema.min(1, 'At least one question is required'),
    }),
  }),
];
