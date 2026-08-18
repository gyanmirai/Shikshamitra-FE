import type { Dayjs } from 'dayjs';
import type { Standards } from 'src/types/school';
import type { BulkAdmissionOfferingInput } from 'src/redux/student/admissions/admission-offerings-api';

import * as Yup from 'yup';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';

export type BulkOfferingValues = {
  boardId: string;
  mediumId: string;
  stageId: string;
  standardIds: string[];
  codePrefix: string;
  useCycleDates: boolean;
  openDate: Dayjs | null;
  closeDate: Dayjs | null;
  workflowDefinitionId: string;
  inquiryFormDefinitionId: string;
  applicationFormDefinitionId: string;
  isActive: boolean;
};

export const bulkOfferingInitialValues: BulkOfferingValues = {
  boardId: '',
  mediumId: '',
  stageId: '',
  standardIds: [],
  codePrefix: 'ADM',
  useCycleDates: true,
  openDate: null,
  closeDate: null,
  workflowDefinitionId: '',
  inquiryFormDefinitionId: '',
  applicationFormDefinitionId: '',
  isActive: true,
};

export const bulkOfferingSchema = Yup.object({
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  stageId: Yup.string().required('Stage is required'),
  standardIds: Yup.array()
    .of(Yup.string().required())
    .min(1, 'Select at least one standard')
    .required(),
  codePrefix: Yup.string().trim().required('Code prefix is required'),
  useCycleDates: Yup.boolean().required(),
  openDate: Yup.mixed<Dayjs>()
    .nullable()
    .when('useCycleDates', { is: false, then: (value) => value.required('Open date is required') }),
  closeDate: Yup.mixed<Dayjs>()
    .nullable()
    .when('useCycleDates', {
      is: false,
      then: (value) =>
        value
          .required('Close date is required')
          .test(
            'after-open',
            'Close date must be on or after the open date',
            function validate(closeDate) {
              const openDate = this.parent.openDate as Dayjs | null;
              return !closeDate || !openDate || !closeDate.isBefore(openDate, 'day');
            }
          ),
    }),
  workflowDefinitionId: Yup.string().required('Workflow is required'),
  inquiryFormDefinitionId: Yup.string().required('Inquiry form is required'),
  applicationFormDefinitionId: Yup.string().required('Application form is required'),
  isActive: Yup.boolean().required(),
});

const codeSuffix = (standard: Standards) =>
  standard.name
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const toBulkOfferingInput = (
  values: BulkOfferingValues,
  standards: Standards[],
  previewOnly: boolean
): BulkAdmissionOfferingInput => ({
  campusId: null,
  boardId: values.boardId,
  mediumId: values.mediumId,
  stageId: values.stageId,
  useCycleDates: values.useCycleDates,
  openDate: values.useCycleDates ? null : datePickerToDateTimeOffset(values.openDate),
  closeDate: values.useCycleDates ? null : datePickerToDateTimeOffset(values.closeDate),
  workflowDefinitionId: values.workflowDefinitionId,
  inquiryFormDefinitionId: values.inquiryFormDefinitionId,
  applicationFormDefinitionId: values.applicationFormDefinitionId,
  isActive: values.isActive,
  previewOnly,
  items: values.standardIds.map((id) => {
    const standard = standards.find((item) => item.id === id);
    return {
      standardId: id,
      code: `${values.codePrefix}-${standard ? codeSuffix(standard) : id.slice(0, 8)}`,
    };
  }),
});
