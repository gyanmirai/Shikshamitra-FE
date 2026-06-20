import * as Yup from 'yup';

export const notificationTemplateValidationSchema = Yup.object().shape({
  templateName: Yup.string()
    .required('Template Name is required')
    .max(100, 'Template Name cannot exceed 100 characters'),

  targetRole: Yup.string().required('Target Role is required'),

  category: Yup.string()
    .required('Category is required')
    .max(80, 'Category cannot exceed 80 characters'),

  subject: Yup.string()
    .required('Subject is required')
    .max(150, 'Subject cannot exceed 150 characters'),

  message: Yup.string()
    .required('Message body is required')
    .max(1000, 'Message cannot exceed 1000 characters'),

  hashtags: Yup.array()
    .of(Yup.string().trim().max(30, 'Tag cannot exceed 30 characters'))
    .max(10, 'You can add up to 10 tags only'),

  languageCode: Yup.string().required('Language is required').max(12, 'Language code is too long'),

  channels: Yup.array().of(Yup.mixed()).min(1, 'At least one channel is required'),
});
