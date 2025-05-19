import * as Yup from 'yup';

export const securityReportsValidationSchema = Yup.object().shape({
  report: Yup.string().required('Report is required'),

  startDate: Yup.string().required('Startdate is required'),
  endDate: Yup.string().required('EndDate Type is required'),
});
