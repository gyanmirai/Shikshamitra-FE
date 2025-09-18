import dayjs from 'dayjs';
import * as Yup from 'yup';

export const holidayValidationSchema = (currentYear: any) =>
  Yup.object().shape({
    holidayName: Yup.string().required('Holiday Name is required'),
    holidayType: Yup.string().required('Holiday Type is required'),
    importanceLevel: Yup.string().required('Importance Level is required'),
    startDate: Yup.mixed()
      .required('Start Date is required')
      .test(
        'is-valid-dayjs',
        'Start Date must be a valid date',
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
      .required('End Date is required')
      .test(
        'is-valid-dayjs',
        'End Date must be a valid date',
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
    description: Yup.string().required('Description is required'),
    organizations: Yup.array().min(1, 'Select at least one organization'),
    classes: Yup.array().min(1, 'At least one class must be selected'),

    audience: Yup.array().min(1, 'Select at least one audience group'),
  });
