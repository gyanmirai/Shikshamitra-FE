import dayjs from 'dayjs';
import * as Yup from 'yup';

import { parseAcademicYearDateForPicker } from './academic-year-date-utils';

import type { AcademicYearRecord } from './academic-setup-model';

export type AcademicYearFormValues = {
  startDate: dayjs.Dayjs;
  endDate: dayjs.Dayjs;
};

export const getAcademicYearInitialValues = (
  editData: AcademicYearRecord | null
): AcademicYearFormValues => ({
  startDate: editData?.startDate
    ? parseAcademicYearDateForPicker(editData.startDate)
    : dayjs().month(5).date(1).startOf('day'),
  endDate: editData?.endDate
    ? parseAcademicYearDateForPicker(editData.endDate)
    : dayjs().add(1, 'year').month(2).date(31).startOf('day'),
});

export const buildAcademicYearName = (startDate: dayjs.Dayjs, endDate: dayjs.Dayjs) =>
  `${startDate.format('YYYY')}-${endDate.format('YYYY')}`;

export const academicYearValidationSchema = Yup.object({
  startDate: Yup.date()
    .nullable()
    .required('Start date is required.')
    .typeError('Start date is required.'),
  endDate: Yup.date()
    .nullable()
    .required('End date is required.')
    .typeError('End date is required.')
    .test('end-after-start', 'End date must be after the start date.', (endDate, context) => {
      const { startDate } = context.parent;
      return !startDate || !endDate || dayjs(endDate).isAfter(dayjs(startDate));
    })
    .test(
      'next-year',
      'End date must be in the year immediately after the start date.',
      (endDate, context) => {
        const { startDate } = context.parent;
        return !startDate || !endDate || dayjs(endDate).year() - dayjs(startDate).year() === 1;
      }
    ),
});
