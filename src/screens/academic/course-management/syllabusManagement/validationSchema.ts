import dayjs from 'dayjs';
import * as Yup from 'yup';

// let currentYear: number;

// Create a function to get current year from redux store
// export const getCurrentYear = (state: RootState): number => state.globalState.currentYear;

// Validation schema for form fields
export const getChapterValidationSchema = (currentYear: any) =>
  Yup.object({
    chapterNo: Yup.number().required('Chapter Number is required'),
    chapterName: Yup.string().required('Chapter Name is required'),
    startDate: Yup.mixed()
      .required('Chapter Start Date is required')
      .test(
        'is-valid-dayjs',
        'Chapter Start Date must be a valid date',
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
      ),

    endDate: Yup.mixed()
      .required('Chapter End Date is required')
      .test(
        'is-valid-dayjs',
        'Chapter End Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test('is-after-start-date', 'End Date cannot be before Start Date', function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return dayjs(value as any).isSameOrAfter(dayjs(startDate));
      })
      .test(
        'min-date',
        (value) =>
          `End Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `End Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      ),
  });
