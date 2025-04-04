import * as Yup from 'yup';

// Validation schema for form fields using Yup

export const validationSchema = Yup.object().shape({
  report: Yup.string().required('Report is required'), // Report field validation
  teacher: Yup.string().required('Teacher is Required'), // Teacher field validation
  className: Yup.string().required('Class is required'), // Class field validation
  division: Yup.string().required('Division is Required'), // Division field validation
  subject: Yup.string().required('Subject is required'), // Subject field validation
  startDate: Yup.string().required('Startdate is required'), // Start date field validation
  endDate: Yup.string().required('EndDate Type is required'), // End date field validation
});
