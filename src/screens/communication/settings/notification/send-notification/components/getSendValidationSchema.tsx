import * as yup from 'yup';

export const notificationValidationSchema = [
  // Step 1: Audience + Members
  yup.object().shape({
    audience: yup.object().shape({
      educationMediumStageId: yup
        .array()
        .of(yup.string())
        .min(1, 'At least one Organization is required'),
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
