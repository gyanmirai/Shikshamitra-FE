import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getCurriculumValidationSchema = (showField: string[], currentYear: any) => {
  const shape: Record<string, any> = {};

  // Report
  if (showField.includes('report')) {
    shape.report = Yup.string().required('Report is required');
  }

  // Department
  if (showField.includes('department')) {
    shape.department = Yup.string().required('Department is required');
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

  // Subjects
  if (showField.includes('subjects')) {
    shape.subjects = Yup.array()
      .min(1, 'At least one subject is required')
      .required('Subject is required');
  }

  // Revision Status
  // if (showField.includes('revisionStatus')) {
  //   shape.revisionStatus = Yup.string().required('Revision Status is required');
  // }

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
      .test('is-after-start-date', 'To Date cannot be before From Date', function (value) {
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
