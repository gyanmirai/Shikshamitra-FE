import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getTimetableValidationSchema = (showField: string[], currentYear: any) => {
  const shape: Record<string, any> = {};

  // Report
  if (showField.includes('report')) {
    shape.report = Yup.string().required('Report is required');
  }

  // Organization
  if (showField.includes('organization')) {
    shape.organization = Yup.string().required('Organization is required');
  }

  // Classes
  if (showField.includes('classes')) {
    shape.classes = Yup.array()
      .min(1, 'At least one class is required')
      .required('Class is required');
  }

  // Divisions
  if (showField.includes('divisions')) {
    shape.divisions = Yup.array()
      .min(1, 'At least one division is required')
      .required('Division is required');
  }

  // Teacher
  if (showField.includes('teacher')) {
    shape.teacher = Yup.string().required('Teacher is required');
  }

  // Room No
  if (showField.includes('roomNo')) {
    shape.roomNo = Yup.string().required('Room No is required');
  }

  // Subject
  if (showField.includes('subject')) {
    shape.subject = Yup.string().required('Subject is required');
  }

  // From Date
  if (showField.includes('fromDate')) {
    shape.fromDate = Yup.mixed()
      .test(
        'is-valid-dayjs',
        'From Date is required',
        (value) => value && dayjs(value as any).isValid()
      )
      .test(
        'min-date',
        (value) =>
          `From Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `From Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      )
      .required('From Date is required');
  }

  // To Date
  if (showField.includes('toDate')) {
    shape.toDate = Yup.mixed()
      .test(
        'is-valid-dayjs',
        'To Date is required',
        (value) => value && dayjs(value as any).isValid()
      )
      // eslint-disable-next-line func-names
      .test('is-after-from-date', 'To Date cannot be before From Date', function (value) {
        const { fromDate } = this.parent;
        if (!value || !fromDate) return true;
        return dayjs(value as any).isSameOrAfter(dayjs(fromDate));
      })
      .test(
        'min-date',
        (value) =>
          `To Date must be on or after ${dayjs(currentYear.startDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrAfter(dayjs(currentYear.startDate), 'day')
      )
      .test(
        'max-date',
        (value) =>
          `To Date must be on or before ${dayjs(currentYear.endDate).format('DD/MM/YYYY')}`,
        (value) => value && dayjs(value as any).isSameOrBefore(dayjs(currentYear.endDate), 'day')
      )
      .required('To Date is required');
  }

  return Yup.object().shape(shape);
};
