import * as Yup from 'yup';

export const safetyManagementValidationSchema = Yup.object().shape({
  incidentTitle: Yup.string().required('Incident Title is required'),
  incidentType: Yup.string().required('Incident Type is required'),
  incidentDate: Yup.date().nullable().required('Incident Date is required'),
  incidentTime: Yup.date().nullable().required('Incident Time is required'),
  incidentUrgency: Yup.string().required('Urgency level is required'),
  incidentDescription: Yup.string().required('Description is required'),
  incidentReportedBy: Yup.string().required('Reported By is required'),
});
