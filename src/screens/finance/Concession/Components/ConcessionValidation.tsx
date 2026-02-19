import * as Yup from 'yup';

export const concessionStepValidations = [
  // Step 0 – Basic Details
  Yup.object({
    boardId: Yup.string().required('Board is required'),
    mediumId: Yup.string().required('Medium is required'),
    standardId: Yup.string().required('Class is required'),
    divisionId: Yup.string().required('Division is required'),
    studentId: Yup.string().required('Student is required'),
  }),
  // Step 1 – Concession Types
  Yup.object({
    concessionTypeIds: Yup.array().of(Yup.string()).min(1, 'Select at least one concession type'),
  }),
  // Step 2 – Fee Heads (no strict validation, optional per type)
  Yup.object({}),
  // Step 3 – Value Entry (no strict validation, handled inline)
  Yup.object({}),
];
