import * as Yup from 'yup';

export const resourceIncidentValidationSchema = Yup.object().shape({
  resourceName: Yup.string().required('Resource Name is required'),
  typeOfIncident: Yup.string().required('Type of Incident is required'),
  dateOfIncident: Yup.date().nullable().required('Date of Incident is required'),
});
