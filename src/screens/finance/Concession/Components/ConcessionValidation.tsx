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
    concessionTypeIds: Yup.array().min(1, 'Select at least one concession type'),
  }),
  // Step 2 – Fee Heads
  Yup.object({
    selectedFeeHeads: Yup.mixed().test(
      'at-least-one-fee-head',
      'Select at least one fee head for each selected concession type',
      function validateFeeHeads(value: any) {
        // Access concessionTypeIds from parent
        const { concessionTypeIds } = this.parent as any;
        if (!concessionTypeIds || concessionTypeIds.length === 0) return true; // Let step 1 validation handle this

        // Check if every selected concession type has at least one fee head
        return concessionTypeIds.every((id: string) => value && value[id] && value[id].length > 0);
      }
    ),
  }),
  // Step 3 – Value Entry (no strict validation, handled inline)
  Yup.object({}),
  // Step 4 – Document Upload
  Yup.object({}),
  // Step 5 – Review & Submit
  Yup.object({}),
];
