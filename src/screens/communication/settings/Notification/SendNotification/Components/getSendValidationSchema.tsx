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
    members: yup
      .array()
      .of(
        yup.object().shape({
          id: yup.string(),
          isSelect: yup.boolean(),
        })
      )
      .test('at-least-one-selected', 'At least one member must be selected', (members) => {
        if (!Array.isArray(members)) return false;
        return members.some((member) => member?.isSelect === true);
      }),
  }),

  // Step 2: Channels
  yup.object().shape({
    channels: yup.array().of(yup.string()).min(1, 'At least one channel is required'),
  }),

  // Step 3: Selected Template
  yup.object().shape({
    selectedTemplate: yup.object().shape({
      id: yup.string(),
      subject: yup.string().when('templateName', {
        is: (templateName: string) => !templateName,
        then: (schema) => schema.required('Subject is required'),
        otherwise: (schema) => schema,
      }),
      message: yup.string().when('templateName', {
        is: (templateName: string) => !templateName,
        then: (schema) => schema.required('Message is required'),
        otherwise: (schema) => schema,
      }),
      importance_level: yup.string().when('templateName', {
        is: (templateName: string) => !templateName,
        then: (schema) => schema.required('Importance level is required'),
        otherwise: (schema) => schema,
      }),
    }),
  }),
];
