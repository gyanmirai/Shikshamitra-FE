import * as Yup from 'yup';

// Validation Schema
export const hostelRoomValidationSchema = Yup.object({
  ruleName: Yup.string().required('Rule Name is required'),
  ruleDescription: Yup.string().required('Rule Description is required'),
});
