import * as yup from 'yup';

export const notificationValidationSchema = [
  // Step 1: Audience + Members
  yup.object().shape({
    audience: yup.object().shape({
      role: yup.string().required('Role is required'),
      classes: yup
        .array()
        .of(yup.string())
        .when('role', {
          is: (role: string) => role === '3a1c1c6b-79ab-63ab-ea1f-e7f639d54dad',
          then: (schema) => schema.min(1, 'At least one class is required'),
          otherwise: (schema) => schema,
        }),
      divisions: yup
        .array()
        .of(yup.string())
        .when('role', {
          is: (role: string) => role === '3a1c1c6b-79ab-63ab-ea1f-e7f639d54dad',
          then: (schema) => schema.min(1, 'At least one division is required'),
          otherwise: (schema) => schema,
        }),
    }),
  }),

  // Step 2: Channels
  yup.object().shape({
    channels: yup.array().of(yup.string()).min(1, 'At least one channel is required'),
  }),

  // Step 3: Selected Template
  yup.object().shape({
    selectedTemplate: yup.object().shape({
      id: yup.string().required('Template ID is required'),
      subject: yup.string().required('Subject is required'),
      message: yup.string().required('Message is required'),
    }),
  }),
];
