import * as Yup from 'yup';
import { DayType } from 'src/enums/academic-calendar';

export const calendarValidationSchema = Yup.object().shape({
  academicYearId: Yup.string().required('Academic Year is required'),
  name: Yup.string()
    .min(3, 'Calendar name must be at least 3 characters')
    .required('Calendar name is required'),
  startDate: Yup.mixed().required('Start date is required'),
  endDate: Yup.mixed()
    .required('End date is required')
    .test('end-after-start', 'End date must be after start date', function (value) {
      const { startDate } = this.parent;
      if (!startDate || !value) return true;
      return new Date(value as string) > new Date(startDate as string);
    }),
});

export const calendarDayValidationSchema = (isPublished: boolean) =>
  Yup.object().shape({
    title: Yup.string().min(2, 'Title must be at least 2 characters').required('Title is required'),
    dayType: Yup.mixed().required('Day Type is required').notOneOf([''], 'Day Type is required'),
    date: Yup.mixed().required('Date is required'),
    endDate: Yup.mixed().when('dayType', {
      is: (v: any) => Number(v) === DayType.Vacation,
      then: (schema) => schema.required('End date is required for vacation'),
      otherwise: (schema) => schema.nullable(),
    }),
    holidayCategory: Yup.mixed().when('dayType', {
      is: (v: any) => Number(v) === DayType.Holiday,
      then: (schema) =>
        schema
          .required('Holiday Category is required')
          .notOneOf([''], 'Holiday Category is required'),
      otherwise: (schema) => schema.nullable(),
    }),
    startTime: Yup.string().when('dayType', {
      is: (v: any) => Number(v) === DayType.HalfDay,
      then: (schema) => schema.required('Start time is required for half day'),
      otherwise: (schema) => schema,
    }),
    endTime: Yup.string().when('dayType', {
      is: (v: any) => Number(v) === DayType.HalfDay,
      then: (schema) => schema.required('End time is required for half day'),
      otherwise: (schema) => schema,
    }),
    standardId: Yup.string().when('appliesToAll', {
      is: false,
      then: (schema) => schema.required('Standard is required when not applying to all'),
      otherwise: (schema) => schema,
    }),
    changeReason: isPublished
      ? Yup.string().required('Change reason is required for published calendar')
      : Yup.string(),
  });
