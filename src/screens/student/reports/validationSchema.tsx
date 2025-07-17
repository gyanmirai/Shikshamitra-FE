import dayjs from 'dayjs';
import * as Yup from 'yup';

export const getValidationSchema = (showField: string[]) => {
  const shape: Record<string, any> = {};

  if (showField.includes('report')) {
    shape.report = Yup.string().required('Report is required');
  }

  if (showField.includes('department')) {
    shape.department = Yup.string().required('Department is required');
  }

  if (showField.includes('status')) {
    shape.status = Yup.string().required('Status is required');
  }

  if (showField.includes('organization')) {
    shape.organization = Yup.string().required('Organization is required');
  }

  if (showField.includes('classes')) {
    shape.classes = Yup.array()
      .min(1, 'At least one class is required')
      .required('Class is required');
  }

  if (showField.includes('divisions')) {
    shape.divisions = Yup.array()
      .min(1, 'At least one division is required')
      .required('Division is required');
  }

  if (showField.includes('fromRollNo')) {
    shape.fromRollNo = Yup.string().required('From Roll No is required');
  }

  if (showField.includes('toRollNo')) {
    shape.toRollNo = Yup.string().required('To Roll No is required');
  }

  if (showField.includes('month')) {
    shape.month = Yup.array()
      .min(1, 'At least one month is required')
      .required('Month is required');
  }

  if (showField.includes('category')) {
    shape.category = Yup.array()
      .min(1, 'At least one category is required')
      .required('Category is required');
  }

  if (showField.includes('fromDate')) {
    shape.fromDate = Yup.mixed().test(
      'is-valid-dayjs',
      'From Date is required',
      (value) => value && dayjs(value as any).isValid()
    );
  }

  if (showField.includes('toDate')) {
    shape.toDate = Yup.mixed().test(
      'is-valid-dayjs',
      'To Date is required',
      (value) => value && dayjs(value as any).isValid()
    );
  }

  if (showField.includes('gender')) {
    shape.gender = Yup.array()
      .min(1, 'At least one gender is required')
      .required('Gender is required');
  }

  if (showField.includes('age')) {
    shape.age = Yup.string().required('Age is required');
  }

  if (showField.includes('religion')) {
    shape.religion = Yup.array()
      .min(1, 'At least one religion is required')
      .required('Religion is required');
  }

  return Yup.object().shape(shape);
};
