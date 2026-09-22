import type { Dayjs } from 'dayjs';

import * as Yup from 'yup';

export const admissionOfferingSchema = Yup.object({
  name: Yup.string()
    .trim()
    .max(128, 'Offering name cannot exceed 128 characters')
    .required('Offering name is required'),
  campusId: Yup.string().nullable().optional(),
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  stageId: Yup.string().required('Stage is required'),
  standardId: Yup.string().required('Standard is required'),
  code: Yup.string()
    .trim()
    .max(64, 'Offering code cannot exceed 64 characters')
    .required('Offering code is required'),
  useCycleDates: Yup.boolean().required(),
  openDate: Yup.mixed<Dayjs>()
    .nullable()
    .when('useCycleDates', {
      is: false,
      then: (schema) => schema.required('Open date is required'),
    }),
  closeDate: Yup.mixed<Dayjs>()
    .nullable()
    .when('useCycleDates', {
      is: false,
      then: (schema) =>
        schema
          .required('Close date is required')
          .test(
            'after-open',
            'Close date must be on or after the open date',
            function validate(value) {
              const openDate = this.parent.openDate as Dayjs | null;
              return !value || !openDate || !value.isBefore(openDate, 'day');
            }
          ),
    }),
  workflowDefinitionId: Yup.string().nullable().optional(),
  inquiryFormDefinitionId: Yup.string().nullable().optional(),
  applicationFormDefinitionId: Yup.string().nullable().optional(),
  isActive: Yup.boolean().required(),
});
