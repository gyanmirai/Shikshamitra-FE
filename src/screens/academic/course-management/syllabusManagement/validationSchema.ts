import dayjs from 'dayjs';
import * as Yup from 'yup';

// Validation schema for form fields
export const validationSchema = Yup.object({
  chapterNo: Yup.number().required('Chapter Number is required'),
  chapterName: Yup.string().required('Chapter Name is required'),
  startDate: Yup.mixed()
    .required('Chapter Start Date is required')
    .test(
      'is-valid-dayjs',
      'Chapter Start Date must be a valid date',
      (value) => value && dayjs(value as any).isValid()
    ),
  endDate: Yup.mixed()
    .test(
      'is-valid-dayjs',
      'Chapter End Date is required',
      (value) => value && dayjs(value as any).isValid()
    )
    .test('is-after-start-date', 'End Date cannot be before Start Date', function (value) {
      const { startDate } = this.parent;
      if (!value || !startDate) return true;
      return dayjs(value as any).isSameOrAfter(dayjs(startDate));
    })
    .required('Chapter End Date is required'),
});
