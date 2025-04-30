import * as Yup from 'yup';

export const incidentValidationSchema = Yup.object().shape({
  hostelName: Yup.string().required('Hostel name is required'),
  floor: Yup.string().required('Floor is required').min(0, 'Floor must be 0 or above'),
  students: Yup.array()
    .of(Yup.string().required('Student name is required'))
    .min(1, 'At least one student must be selected'),
  incidentDate: Yup.date().nullable().required('Incident date is required'),
  incidentTime: Yup.date().nullable().required('Incident time is required'),
  description: Yup.string().required('Description is required'),
  incidentType: Yup.string().required('Incident type is required'),
});
