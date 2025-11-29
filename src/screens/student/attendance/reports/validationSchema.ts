import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getValidationSchema = (showField: string[]) => {
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

  // Roll No
  if (showField.includes('rollNo')) {
    shape.rollNo = Yup.string().required('Roll No is required');
  }

  // Attendance Type
  if (showField.includes('attendanceType')) {
    shape.attendanceType = Yup.string().required('Attendance Type is required');
  }

  // Gender
  if (showField.includes('gender')) {
    shape.gender = Yup.array()
      .min(1, 'At least one gender is required')
      .required('Gender is required');
  }

  // From Date
  if (showField.includes('fromDate')) {
    shape.fromDate = Yup.mixed()
      .test(
        'is-valid-dayjs',
        'From Date is required',
        (value) => value && dayjs(value as any).isValid()
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
      .test('is-after-start-date', 'To Date cannot be before From Date', function (value) {
        const { fromDate } = this.parent;
        if (!value || !fromDate) return true;
        return dayjs(value as any).isSameOrAfter(dayjs(fromDate));
      })
      .required('To Date is required');
  }

  return Yup.object().shape(shape);
};
