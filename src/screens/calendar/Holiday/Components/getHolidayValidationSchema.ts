import dayjs from 'dayjs';
import * as Yup from 'yup';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

const formatDate = (value: dayjs.Dayjs | null) =>
  value && value.isValid() ? value.format('DD/MM/YYYY') : '-';

export const holidayValidationSchema = (currentYear: any) => {
  const academicStart = currentYear?.startDate ? dayjs(currentYear.startDate) : null;
  const academicEnd = currentYear?.endDate ? dayjs(currentYear.endDate) : null;

  return Yup.object().shape({
    holidayName: Yup.string().required('Holiday Name is required'),
    holidayTypeId: Yup.string().required('Holiday Type is required'),
    startDate: Yup.mixed()
      .required('Start Date is required')
      .test(
        'is-valid-dayjs',
        'Start Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        () => `Start Date must be on or after ${formatDate(academicStart)}`,
        (value) =>
          !academicStart ||
          !academicStart.isValid() ||
          (value && dayjs(value as any).isSameOrAfter(academicStart, 'day'))
      )
      .test(
        'max-date',
        () => `Start Date must be on or before ${formatDate(academicEnd)}`,
        (value) =>
          !academicEnd ||
          !academicEnd.isValid() ||
          (value && dayjs(value as any).isSameOrBefore(academicEnd, 'day'))
      ),

    endDate: Yup.mixed()
      .required('End Date is required')
      .test(
        'is-valid-dayjs',
        'End Date must be a valid date',
        (value) => value && dayjs(value as any).isValid()
      )
      // eslint-disable-next-line func-names
      .test('is-after-start-date', 'End Date cannot be before Start Date', function (value) {
        const { startDate } = this.parent;
        if (!value || !startDate) return true;
        return dayjs(value as any).isSameOrAfter(dayjs(startDate));
      })
      .test(
        'min-date',
        () => `End Date must be on or after ${formatDate(academicStart)}`,
        (value) =>
          !academicStart ||
          !academicStart.isValid() ||
          (value && dayjs(value as any).isSameOrAfter(academicStart, 'day'))
      )
      .test(
        'max-date',
        () => `End Date must be on or before ${formatDate(academicEnd)}`,
        (value) =>
          !academicEnd ||
          !academicEnd.isValid() ||
          (value && dayjs(value as any).isSameOrBefore(academicEnd, 'day'))
      ),
  });
};
