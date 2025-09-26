import * as Yup from 'yup';

export const announcementTypeValidationSchema = Yup.object().shape({
  announcementType: Yup.string().required('Announcement Type Name is required'),
  description: Yup.string().nullable(),
  color: Yup.string().required('Color is required'),
});
