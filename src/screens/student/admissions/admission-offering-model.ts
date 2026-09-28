import type { Dayjs } from 'dayjs';
import type { AdmissionOfferingWriteInput } from 'src/redux/student/admissions/admission-offerings-api';

import dayjs from 'dayjs';
import { datePickerToDateTimeOffset } from 'src/utils/dateConvertor';

export type AdmissionOfferingFormValues = Omit<
  AdmissionOfferingWriteInput,
  'openDate' | 'closeDate'
> & {
  openDate: Dayjs | null;
  closeDate: Dayjs | null;
};

export const isAdmissionOfferingConfigurationIncomplete = (
  values: Pick<
    AdmissionOfferingFormValues,
    | 'entryMode'
    | 'workflowDefinitionId'
    | 'inquiryFormDefinitionId'
    | 'applicationFormDefinitionId'
    | 'inquiryIntakeProfileId'
    | 'counsellorAssignmentProfileId'
  >
) =>
  !values.workflowDefinitionId ||
  (values.entryMode !== 1 && !values.inquiryFormDefinitionId) ||
  !values.applicationFormDefinitionId ||
  (values.entryMode !== 1 && !values.inquiryIntakeProfileId) ||
  !values.counsellorAssignmentProfileId;

export const availabilityLabels = [
  'Configuration incomplete',
  'Not open yet',
  'Open',
  'Closed',
  'Inactive',
] as const;

export const availabilityColors = ['warning', 'info', 'success', 'default', 'default'] as const;
export const admissionTrackLabels = ['General', 'RTE', 'Management', 'Staff'] as const;
export const admissionEntryModeLabels = ['Inquiry first', 'Direct registration', 'Inquiry or direct'] as const;

export const getOfferingInitialValues = (
  offering?: {
    name?: string | null;
    campusId?: string | null;
    boardId: string;
    mediumId: string;
    stageId: string;
    standardId: string;
    code: string;
    track?: AdmissionOfferingFormValues['track'];
    entryMode?: AdmissionOfferingFormValues['entryMode'];
    useCycleDates: boolean;
    openDate?: string | null;
    closeDate?: string | null;
    workflowDefinitionId?: string | null;
    inquiryFormDefinitionId?: string | null;
    applicationFormDefinitionId?: string | null;
    inquiryIntakeProfileId?: string | null;
    counsellorAssignmentProfileId?: string | null;
    isActive: boolean;
  } | null
): AdmissionOfferingFormValues => ({
  name: offering?.name?.trim() || offering?.code || '',
  campusId: offering?.campusId ?? null,
  boardId: offering?.boardId ?? '',
  mediumId: offering?.mediumId ?? '',
  stageId: offering?.stageId ?? '',
  standardId: offering?.standardId ?? '',
  code: offering?.code ?? '',
  track: offering?.track ?? 0,
  entryMode: offering?.entryMode ?? 0,
  useCycleDates: offering?.useCycleDates ?? true,
  openDate: offering?.openDate ? dayjs(offering.openDate) : null,
  closeDate: offering?.closeDate ? dayjs(offering.closeDate) : null,
  workflowDefinitionId: offering?.workflowDefinitionId ?? null,
  inquiryFormDefinitionId: offering?.inquiryFormDefinitionId ?? null,
  applicationFormDefinitionId: offering?.applicationFormDefinitionId ?? null,
  inquiryIntakeProfileId: offering?.inquiryIntakeProfileId ?? null,
  counsellorAssignmentProfileId: offering?.counsellorAssignmentProfileId ?? null,
  isActive: offering?.isActive ?? false,
});

export const toOfferingWriteInput = (
  values: AdmissionOfferingFormValues
): AdmissionOfferingWriteInput => ({
  ...values,
  openDate: values.useCycleDates ? null : datePickerToDateTimeOffset(values.openDate),
  closeDate: values.useCycleDates ? null : datePickerToDateTimeOffset(values.closeDate),
});

export const getAdmissionApiError = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null) return fallback;
  const response = error as {
    data?: { error?: { code?: string; message?: string; details?: string }; detail?: string };
  };
  const code = response.data?.error?.code ?? '';
  const messages: Record<string, string> = {
    'Admissions.OfferingDuplicate':
      'An offering already exists for this cycle, class, and admission track.',
    'Admissions.Offering.ConcurrencyConflict':
      'This offering was changed by another user. Refresh and try again.',
    'Admissions.Offering.HasApplications':
      'This offering has applications and cannot be deleted. Deactivate it instead.',
    'Admissions.Offering.ConfigurationIncomplete':
      'Complete the required workflow, forms, intake profiles, and dates before activation.',
    'Admissions.Offering.HierarchyOutOfScope':
      'You do not have access to configure the selected academic hierarchy.',
    'Admissions.Offering.StateCommandRequired':
      'Use the Activate or Deactivate action to change offering status.',
    'Admissions.Offering.CampusInvalid':
      'The selected campus is missing or inactive. Choose an active campus or clear the campus selection.',
  };
  return (
    messages[code] ??
    response.data?.error?.message ??
    response.data?.detail ??
    response.data?.error?.details ??
    fallback
  );
};
