import * as Yup from 'yup';

export const admissionOfferingIdentitySchema = Yup.object({
  campusId: Yup.string().nullable().optional(),
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  stageId: Yup.string().required('Stage is required'),
  standardId: Yup.string().required('Standard is required'),
});

export const admissionOfferingSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(128, 'Offering name cannot exceed 128 characters')
    .required('Offering name is required'),
  track: Yup.number().oneOf([0, 1, 2, 3]).required('Admission track is required'),
  entryMode: Yup.number()
    .oneOf([0, 1, 2])
    .required('Entry mode is required')
    .test(
      'rte-direct-registration',
      'RTE admission must start with registration',
      function validate(value) {
        return this.parent.track !== 1 || value === 1;
      }
    ),
  campusId: Yup.string().nullable().optional(),
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  stageId: Yup.string().required('Stage is required'),
  standardId: Yup.string().required('Standard is required'),
  code: Yup.string()
    .trim()
    .max(64, 'Offering code cannot exceed 64 characters')
    .required('Offering code is required'),
  workflowDefinitionId: Yup.string().nullable().optional(),
  inquiryFormDefinitionId: Yup.string().nullable().optional(),
  applicationFormDefinitionId: Yup.string().nullable().optional(),
  isActive: Yup.boolean().required(),
});
