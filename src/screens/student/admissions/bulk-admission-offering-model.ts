import type { Dayjs } from 'dayjs';
import type { Standards } from 'src/types/school';
import type {
  AdmissionTrack,
  AdmissionEntryMode,
  BulkAdmissionOfferingInput,
} from 'src/redux/student/admissions/admission-offerings-api';

import * as Yup from 'yup';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';

export type BulkOfferingValues = {
  track: AdmissionTrack;
  entryMode: AdmissionEntryMode;
  campusId: string | null;
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
  inquiryIntakeProfileId: string;
  counsellorAssignmentProfileId: string;
  isActive: boolean;
};

export const bulkOfferingInitialValues: BulkOfferingValues = {
  track: 0,
  entryMode: 0,
  campusId: null,
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
  inquiryIntakeProfileId: '',
  counsellorAssignmentProfileId: '',
  isActive: false,
};

export const bulkOfferingSelectionSchema = Yup.object({
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  stageId: Yup.string().required('School level is required'),
  standardIds: Yup.array()
    .of(Yup.string().required())
    .min(1, 'Select at least one standard')
    .required(),
});

export const bulkOfferingSchema = Yup.object({
  track: Yup.number().oneOf([0, 1, 2, 3]).required(),
  entryMode: Yup.number().oneOf([0, 1, 2]).required(),
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
  workflowDefinitionId: Yup.string().when('isActive', {
    is: true,
    then: (schema) => schema.required('Workflow is required for activation'),
  }),
  inquiryFormDefinitionId: Yup.string().when(['isActive', 'entryMode'], {
    is: (isActive: boolean, entryMode: number) => isActive && entryMode !== 1,
    then: (schema) => schema.required('Inquiry form is required for activation'),
  }),
  applicationFormDefinitionId: Yup.string().when('isActive', {
    is: true,
    then: (schema) => schema.required('Application form is required for activation'),
  }),
  inquiryIntakeProfileId: Yup.string().when(['isActive', 'entryMode'], {
    is: (isActive: boolean, entryMode: number) => isActive && entryMode !== 1,
    then: (schema) => schema.required('Inquiry setup is required for activation'),
  }),
  counsellorAssignmentProfileId: Yup.string().when('isActive', {
    is: true,
    then: (schema) => schema.required('Counsellor assignment is required for activation'),
  }),
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
  track: values.track,
  entryMode: values.entryMode,
  campusId: values.campusId,
  boardId: values.boardId,
  mediumId: values.mediumId,
  stageId: values.stageId,
  useCycleDates: values.useCycleDates,
  openDate: values.useCycleDates ? null : datePickerToDateTimeOffset(values.openDate),
  closeDate: values.useCycleDates ? null : datePickerToDateTimeOffset(values.closeDate),
  workflowDefinitionId: values.workflowDefinitionId,
  inquiryFormDefinitionId: values.inquiryFormDefinitionId,
  applicationFormDefinitionId: values.applicationFormDefinitionId,
  inquiryIntakeProfileId: values.inquiryIntakeProfileId || null,
  counsellorAssignmentProfileId: values.counsellorAssignmentProfileId || null,
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
