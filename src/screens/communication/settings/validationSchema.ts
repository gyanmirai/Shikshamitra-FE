import * as Yup from 'yup';

export const announcementImpValidationSchema = Yup.object().shape({
  importantLevel: Yup.string().required('Importance level is required'),
  importantLevelDesc: Yup.string().required('Description is required'),
});
export const announcementCatValidationSchema = Yup.object().shape({
  categoryName: Yup.string().required('Category name is required'),
  categoryDescription: Yup.string().required('Description is required'),
});
export const eventTypeValidationSchema = Yup.object().shape({
  eventType: Yup.string().required('Event type is required'),
  eventTypeDesc: Yup.string().required('Description is required'),
});
