import type { Dayjs } from 'dayjs';
import type { Standards } from 'src/types/school';
import type { BulkAdmissionOfferingInput } from 'src/redux/student/admissions/admission-offerings-api';

import * as Yup from 'yup';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';

export type BulkOfferingValues = {
  campusId: string | null;
  boardId: string;
  mediumId: string;
  standardIds: string[];
  useCycleDates: boolean;
  openDate: Dayjs | null;
  closeDate: Dayjs | null;
  workflowDefinitionId: string;
  inquiryFormDefinitionId: string;
  inquiryIntakeProfileId: string;
  counsellorAssignmentProfileId: string;
  isActive: boolean;
};

export const bulkOfferingInitialValues: BulkOfferingValues = {
  campusId: null,
  boardId: '',
  mediumId: '',
  standardIds: [],
  useCycleDates: true,
  openDate: null,
  closeDate: null,
  workflowDefinitionId: '',
  inquiryFormDefinitionId: '',
  inquiryIntakeProfileId: '',
  counsellorAssignmentProfileId: '',
  isActive: false,
};

export const bulkOfferingSelectionSchema = Yup.object({
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  standardIds: Yup.array()
    .of(Yup.string().required())
    .min(1, 'Select at least one class')
    .required(),
});

export const bulkOfferingSchema = Yup.object({
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  standardIds: Yup.array()
    .of(Yup.string().required())
    .min(1, 'Select at least one class')
    .required(),
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
  inquiryIntakeProfileId: Yup.string(),
  inquiryFormDefinitionId: Yup.string().when('isActive', {
    is: true,
    then: (schema) => schema.required('Inquiry form is required for activation'),
  }),
  counsellorAssignmentProfileId: Yup.string(),
  isActive: Yup.boolean().required(),
});

const codeSuffix = (standard: Standards | undefined) =>
  (standard?.name ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export const selectBulkClasses = (selectedIds: string[], standards: Standards[]) => ({
  standardIds: [...new Set(selectedIds)].filter((id) => standards.some((item) => item.id === id)),
});

const bulkOfferingItems = (selectedIds: string[], standards: Standards[]) => {
  const suffixes = selectedIds.map((id) => codeSuffix(standards.find((item) => item.id === id)));
  return selectedIds.map((id, index) => {
    const suffix = suffixes[index];
    const needsIdentity =
      !suffix || suffix.length > 60 || suffixes.indexOf(suffix) !== suffixes.lastIndexOf(suffix);
    const identity = id.replace(/[^A-Za-z0-9]/g, '').slice(0, 32);
    return {
      standardId: id,
      code: needsIdentity ? `ADM-${suffix.slice(0, 27) || 'CLASS'}-${identity}` : `ADM-${suffix}`,
    };
  });
};

export const toBulkOfferingInput = (
  values: BulkOfferingValues,
  standards: Standards[],
  previewOnly: boolean
): BulkAdmissionOfferingInput => ({
  track: 0,
  entryMode: 0,
  campusId: values.campusId,
  boardId: values.boardId,
  mediumId: values.mediumId,
  useCycleDates: values.useCycleDates,
  openDate: values.useCycleDates ? null : datePickerToDateTimeOffset(values.openDate),
  closeDate: values.useCycleDates ? null : datePickerToDateTimeOffset(values.closeDate),
  workflowDefinitionId: values.workflowDefinitionId,
  inquiryFormDefinitionId: values.inquiryFormDefinitionId || null,
  applicationFormDefinitionId: null,
  inquiryIntakeProfileId: values.inquiryIntakeProfileId || null,
  counsellorAssignmentProfileId: values.counsellorAssignmentProfileId || null,
  isActive: values.isActive,
  previewOnly,
  items: bulkOfferingItems(values.standardIds, standards),
});
