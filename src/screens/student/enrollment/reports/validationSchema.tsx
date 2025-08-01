import type { Dayjs } from 'dayjs';

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

  if (showField.includes('class')) {
    shape.class = Yup.array()
      .of(Yup.string())
      .min(1, 'At least one class must be selected')
      .required('Class is required');
  }

  if (showField.includes('fromInquiryNumber')) {
    shape.fromInquiryNumber = Yup.string().required('From Inquiry No is required');
  }

  if (showField.includes('toInquiryNumber')) {
    shape.toInquiryNumber = Yup.string().required('To Inquiry No is required');
  }

  if (showField.includes('fromDate')) {
    shape.fromDate = Yup.mixed<Dayjs>()
      .nullable()
      .required('From Date is required')
      .test('is-valid-dayjs', 'From Date is invalid', (value) =>
        value ? dayjs(value).isValid() : false
      );
  }

  if (showField.includes('toDate')) {
    shape.toDate = Yup.mixed<Dayjs>()
      .nullable()
      .required('To Date is required')
      .test('is-valid-dayjs', 'To Date is invalid', (value) =>
        value ? dayjs(value).isValid() : false
      );
  }

  if (showField.includes('gender')) {
    shape.gender = Yup.string().required('Gender is required');
  }

  if (showField.includes('inquiryStatus')) {
    shape.inquiryStatus = Yup.string().required('Inquiry Status is required');
  }

  if (showField.includes('enrollmentNo')) {
    shape.enrollmentNo = Yup.number()
      .typeError('Enrollment No must be a number')
      .required('Enrollment No is required');
  }

  if (showField.includes('enrollmentDate')) {
     shape.enrollmentDate = Yup.date()
       .nullable()
       .required('Enrollment Date is required')
       .typeError('Enrollment Date is invalid');
  }
  if (showField.includes('name')) {
    shape.name = Yup.string().required('Name is required');
  }

  if (showField.includes('dob')) {
    shape.dob = Yup.mixed<Dayjs>()
      .nullable()
      .required('Date of Birth is required')
      .test('is-valid-dayjs', 'Date of Birth is invalid', (value) =>
        value ? dayjs(value).isValid() : false
      );
  }

  if (showField.includes('religion')) {
    shape.religion = Yup.string().required('Religion is required');
  }

  if (showField.includes('cast')) {
    shape.cast = Yup.string().required('Caste is required');
  }

  if (showField.includes('inquiryPreference')) {
    shape.inquiryPreference = Yup.string().required('Inquiry Preference is required');
  }

  if (showField.includes('previousSchoolName')) {
    shape.previousSchoolName = Yup.string().required('Previous School Name is required');
  }

  if (showField.includes('contactNo')) {
    shape.contactNo = Yup.number()
      .typeError('Contact No must be a number')
      .required('Contact No is required');
  }

  if (showField.includes('primaryContactNo')) {
    shape.primaryContactNo = Yup.number()
      .typeError('Primary Contact No must be a number')
      .required('Primary Contact No is required');
  }

  if (showField.includes('secondaryContactNo')) {
    shape.secondaryContactNo = Yup.number()
      .typeError('Secondary Contact No must be a number')
      .required('Secondary Contact No is required');
  }

  if (showField.includes('email')) {
    shape.email = Yup.string().email('Invalid email').required('Email is required');
  }

  if (showField.includes('studentCount')) {
    shape.studentCount = Yup.number()
      .typeError('Student Count must be a number')
      .required('Student Count is required');
  }

  if (showField.includes('classAdmitted')) {
    shape.classAdmitted = Yup.string().required('Class Admitted is required');
  }

  if (showField.includes('lastClassPassed')) {
    shape.lastClassPassed = Yup.string().required('Last Class Passed is required');
  }

  if (showField.includes('admissionDate')) {
    shape.admissionDate = Yup.mixed<Dayjs>()
      .nullable()
      .required('Admission Date is required')
      .test('is-valid-dayjs', 'Admission Date is invalid', (value) =>
        value ? dayjs(value).isValid() : false
      );
  }

  if (showField.includes('pincode')) {
    shape.pincode = Yup.number()
      .typeError('Pincode must be a number')
      .required('Pincode is required');
  }

  if (showField.includes('cityArea')) {
    shape.cityArea = Yup.string().required('City Area is required');
  }

  if (showField.includes('studentName')) {
    shape.studentName = Yup.string().required('Student Name is required');
  }

  if (showField.includes('age')) {
    shape.age = Yup.number().typeError('Age must be a number').required('Age is required');
  }

  if (showField.includes('section')) {
    shape.section = Yup.string().required('Section is required');
  }

  if (showField.includes('noOfBoys')) {
    shape.noOfBoys = Yup.number()
      .typeError('No. of Boys must be a number')
      .required('No. of Boys is required');
  }

  if (showField.includes('noOfGirls')) {
    shape.noOfGirls = Yup.number()
      .typeError('No. of Girls must be a number')
      .required('No. of Girls is required');
  }

  if (showField.includes('totalStudent')) {
    shape.totalStudent = Yup.number()
      .typeError('Total Student must be a number')
      .required('Total Student is required');
  }

  if (showField.includes('month')) {
    shape.month = Yup.string().required('Month is required');
  }

  if (showField.includes('numberOfNewAdmission')) {
    shape.numberOfNewAdmission = Yup.number()
      .typeError('Number of New Admissions must be a number')
      .required('Number of New Admissions is required');
  }

  if (showField.includes('withdrawals')) {
    shape.withdrawals = Yup.number()
      .typeError('Withdrawals must be a number')
      .required('Withdrawals is required');
  }

  if (showField.includes('netIncrease')) {
    shape.netIncrease = Yup.number()
      .typeError('Net Increase must be a number')
      .required('Net Increase is required');
  }

  if (showField.includes('totalStudents')) {
    shape.totalStudents = Yup.number()
      .typeError('Total Students must be a number')
      .required('Total Students is required');
  }

  if (showField.includes('totalEnrollments')) {
    shape.totalEnrollments = Yup.number()
      .typeError('Total Enrollments must be a number')
      .required('Total Enrollments is required');
  }

  if (showField.includes('newAdmissions')) {
    shape.newAdmissions = Yup.number()
      .typeError('New Admissions must be a number')
      .required('New Admissions is required');
  }

  if (showField.includes('retentionRate')) {
    shape.retentionRate = Yup.string().required('Retention Rate is required');
  }

  return Yup.object().shape(shape);
};
