import type { Dayjs } from 'dayjs';
import type { Standards } from 'src/types/school';
import type { AdmissionCycle } from 'src/redux/student/admissions/admission-cycles-api';
import type {
  AdmissionTrack,
  AdmissionEntryMode,
  BulkAdmissionOfferingInput,
  AdmissionOfferingClassIdentity,
} from 'src/redux/student/admissions/admission-offerings-api';

import * as Yup from 'yup';

export type BulkOfferingValues = {
  admissionCycle: AdmissionCycle | null;
  track: AdmissionTrack;
  entryMode: AdmissionEntryMode;
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
  admissionCycle: null,
  track: 0,
  entryMode: 0,
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
  track: Yup.number().oneOf([0, 1, 2, 3]).required('Admission type is required'),
  entryMode: Yup.number()
    .oneOf([0, 1, 2])
    .required('Entry mode is required')
    .test('track-entry', 'RTE admission must start with registration', function validate(value) {
      return this.parent.track !== 1 || value === 1;
    })
    .test('general-entry', 'General admission must start with inquiry', function validate(value) {
      return this.parent.track !== 0 || value === 0;
    }),
  admissionCycle: Yup.mixed<AdmissionCycle>()
    .nullable()
    .required('Admission cycle is required')
    .test(
      'published-open',
      'Choose a published and open admission cycle',
      (cycle) => !cycle || (cycle.status === 1 && cycle.windowStatus === 1)
    ),
  boardId: Yup.string().required('Board is required'),
  mediumId: Yup.string().required('Medium is required'),
  standardIds: Yup.array()
    .of(Yup.string().required())
    .min(1, 'Select at least one class')
    .required(),
  workflowDefinitionId: Yup.string().when('isActive', {
    is: true,
    then: (schema) => schema.required('Workflow is required for activation'),
  }),
  inquiryIntakeProfileId: Yup.string(),
  inquiryFormDefinitionId: Yup.string().when(['isActive', 'entryMode'], {
    is: (isActive: boolean, entryMode: AdmissionEntryMode) => isActive && entryMode !== 1,
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

export const getConfiguredBulkClassIds = (
  standards: Standards[],
  identities: AdmissionOfferingClassIdentity[]
) =>
  standards
    .filter((standard) =>
      identities.some(
        (identity) =>
          identity.standardId === standard.id &&
          identity.stageId === standard.educationMediumStageId
      )
    )
    .map((standard) => standard.id);

const bulkOfferingItems = (
  selectedIds: string[],
  standards: Standards[],
  track: AdmissionTrack
) => {
  const prefix = ['ADM-', 'ADM-RTE-', 'ADM-MGMT-', 'ADM-STAFF-'][track];
  const suffixes = selectedIds.map((id) => codeSuffix(standards.find((item) => item.id === id)));
  return selectedIds.map((id, index) => {
    const suffix = suffixes[index];
    const needsIdentity =
      !suffix ||
      suffix.length > 64 - prefix.length ||
      suffixes.indexOf(suffix) !== suffixes.lastIndexOf(suffix);
    const identity = id.replace(/[^A-Za-z0-9]/g, '').slice(0, 32);
    return {
      standardId: id,
      code: needsIdentity
        ? `${prefix}${suffix.slice(0, 64 - prefix.length - identity.length - 1) || 'CLASS'}-${identity}`
        : `${prefix}${suffix}`,
    };
  });
};

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
  useCycleDates: true,
  openDate: null,
  closeDate: null,
  workflowDefinitionId: values.workflowDefinitionId || null,
  inquiryFormDefinitionId: values.entryMode === 1 ? null : values.inquiryFormDefinitionId || null,
  applicationFormDefinitionId: null,
  inquiryIntakeProfileId: values.entryMode === 1 ? null : values.inquiryIntakeProfileId || null,
  counsellorAssignmentProfileId: values.counsellorAssignmentProfileId || null,
  isActive: values.isActive,
  previewOnly,
  items: bulkOfferingItems(values.standardIds, standards, values.track),
});
