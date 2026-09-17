import dayjs from 'dayjs';
import * as Yup from 'yup';

interface AcademicYearRange {
  startDate?: string;
  endDate?: string;
}

export const getBulkChapterValidationSchema = (currentYear?: AcademicYearRange) => {
  const chapterSchema = Yup.object({
    chapterNo: Yup.number()
      .typeError('Chapter Number must be a number')
      .required('Chapter Number is required')
      .positive('Chapter Number must be positive'),
    chapterName: Yup.string()
      .trim()
      .required('Chapter Name is required')
      .typeError('minimum 3 character required')
      .min(3, 'minimum 3 character required'),
    startDate: Yup.mixed()
      .nullable()
      .required('Start Date is required')
      .test(
        'is-valid-dayjs',
        'Expected Start Date for all Division must be a valid date',
        (value) => !value || dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        () =>
          currentYear?.startDate
            ? `Start Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')} (academic year start)`
            : 'Start Date is before academic year start',
        (value) =>
          !value ||
          !currentYear?.startDate ||
          !dayjs(value as any).isBefore(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        () =>
          currentYear?.endDate
            ? `Start Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')} (academic year end)`
            : 'Start Date is after academic year end',
        (value) =>
          !value ||
          !currentYear?.endDate ||
          !dayjs(value as any).isAfter(dayjs(currentYear.endDate), 'day')
      )
      .test(
        'no-past-date',
        'Start Date cannot be in the past',
        (value) => !value || !dayjs(value as any).isBefore(dayjs(), 'day')
      ),
    endDate: Yup.mixed()
      .nullable()
      .required('End Date is required')
      .test(
        'is-valid-dayjs',
        'Expected End Date for all Division must be a valid date',
        (value) => !value || dayjs(value as any).isValid()
      )
      // eslint-disable-next-line func-names
      .test('is-after-start-date', 'End Date cannot be before Start Date', function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return !dayjs(value as any).isBefore(dayjs(startDate), 'day');
      })
      .test(
        'no-past-date',
        'End Date cannot be in the past',
        (value) => !value || !dayjs(value as any).isBefore(dayjs(), 'day')
      )
      .test(
        'min-date',
        () =>
          currentYear?.startDate
            ? `End Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')} (academic year start)`
            : 'End Date is before academic year start',
        (value) =>
          !value ||
          !currentYear?.startDate ||
          !dayjs(value as any).isBefore(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        () =>
          currentYear?.endDate
            ? `End Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')} (academic year end)`
            : 'End Date is after academic year end',
        (value) =>
          !value ||
          !currentYear?.endDate ||
          !dayjs(value as any).isAfter(dayjs(currentYear.endDate), 'day')
      ),
  });

  return Yup.object({
    chapters: Yup.array().of(chapterSchema).min(1, 'Add at least one chapter before saving'),
  });
};
