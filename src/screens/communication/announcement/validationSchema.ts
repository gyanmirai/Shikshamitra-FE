import * as Yup from 'yup';

export const validationSchema = Yup.object({
  title: Yup.string()
    .required('Title is required')
    .min(3, 'Title must be at least 3 characters long'),

  description: Yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters long'),

  status: Yup.string().required('Status is required'),

  audience: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one audience must be selected')
    .required('Audience is required'),

  organization: Yup.array()
    .of(Yup.string())
    .min(1, 'At least one organization must be selected')
    .required('Organization is required'),

  publishDate: Yup.date()
    .nullable()
    .when('isScheduled', (isScheduled, schema) =>
      isScheduled
        ? schema
            .required('Schedule Date & Time is required')
            .min(new Date(), 'Schedule date must be in the future')
        : schema
    ),

  expiryDate: Yup.date()
    .nullable()
    .min(Yup.ref('publishDate'), 'Expiry date must be after the publish date')
    .typeError('Invalid date format')
    .required('Expiry date is required'),

  category: Yup.string().required('Category is required'),

  importance_level: Yup.string().required('Importance level is required'),

  link: Yup.string().url('Enter a valid URL').optional(),

  notification_preferences: Yup.array()
    .of(Yup.string())
    .min(1, 'Select at least one notification preference')
    .required('Notification preferences are required'),

  isScheduled: Yup.boolean(),
});

export const classWiseValidationSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  audience: Yup.array().min(1, 'At least one audience is required'),
  className: Yup.array().min(1, 'At least one class must be selected'),
  division: Yup.array().min(1, 'At least one division must be selected'),
  category: Yup.string().required('Category is required'),
  importance_level: Yup.string().required('Importance level is required'),
  link: Yup.string().url('Must be a valid URL').nullable(),
  notification_preferences: Yup.array(),
  isScheduled: Yup.boolean(),

  publishDate: Yup.date()
    .nullable()
    .when('isScheduled', (isScheduled, schema) =>
      isScheduled
        ? schema
            .required('Schedule Date & Time is required')
            .min(new Date(), 'Schedule Date & Time must be in the future')
        : schema.nullable()
    ),

  expiryDate: Yup.date()
    .nullable()
    .min(Yup.ref('publishDate'), 'Expiry Date must be after Schedule Date & Time')
    .required('Expiry Date is required'),

  status: Yup.string().oneOf(['Published', 'Draft'], 'Invalid status'),
});
