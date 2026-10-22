import type { Dayjs } from 'dayjs';
import type { AdmissionOfferingWriteInput } from 'src/redux/student/admissions/admission-offerings-api';

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
) => !values.workflowDefinitionId || (values.entryMode !== 1 && !values.inquiryFormDefinitionId);

export const availabilityLabels = [
  'Configuration incomplete',
  'Not open yet',
  'Open',
  'Closed',
  'Inactive',
] as const;

export const availabilityColors = ['warning', 'info', 'success', 'default', 'default'] as const;
export const admissionTrackLabels = ['General', 'RTE', 'Management', 'Staff'] as const;
export const admissionEntryModeLabels = [
  'Inquiry first',
  'Direct registration',
  'Inquiry or direct',
] as const;

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
    applicationCount?: number;
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
  useCycleDates: true,
  openDate: null,
  closeDate: null,
  workflowDefinitionId: offering?.workflowDefinitionId ?? null,
  inquiryFormDefinitionId: offering?.inquiryFormDefinitionId ?? null,
  applicationFormDefinitionId: offering?.applicationFormDefinitionId ?? null,
  inquiryIntakeProfileId: null,
  counsellorAssignmentProfileId: null,
  isActive: offering?.isActive ?? false,
});

export const toOfferingWriteInput = (
  values: AdmissionOfferingFormValues
): AdmissionOfferingWriteInput => ({
  ...values,
  useCycleDates: true,
  openDate: null,
  closeDate: null,
});

export const getAdmissionApiError = (error: unknown, fallback: string): string => {
  if (typeof error !== 'object' || error === null) return fallback;
  const response = error as {
    data?: {
      errorCode?: string;
      error?: {
        code?: string;
        message?: string;
        details?: string;
        data?: { ValidationMessages?: unknown; ValidationErrors?: unknown };
      };
      data?: { ValidationMessages?: unknown; ValidationErrors?: unknown };
      detail?: string;
    };
  };
  const code = response.data?.errorCode ?? response.data?.error?.code ?? '';
  if (code === 'Admissions.Offering.ConfigurationIncomplete') {
    const validationData = response.data?.data ?? response.data?.error?.data;
    const messages = Array.isArray(validationData?.ValidationMessages)
      ? [
          ...new Set(
            validationData.ValidationMessages.filter(
              (item): item is string => typeof item === 'string' && Boolean(item.trim())
            )
          ),
        ]
      : [];
    if (messages.length) return messages.join(' ');

    const codes = validationData?.ValidationErrors;
    if (Array.isArray(codes) && codes.includes('CounsellorAssignmentProfileInvalid')) {
      return 'The counsellor assignment profile needs an active counsellor with access to this class. If a fallback manager is set, they also need access. Update the profile or staff access, then try again.';
    }
  }
  const messages: Record<string, string> = {
    'Admissions.OfferingDuplicate':
      'An offering already exists for this cycle, class, and admission track.',
    'Admissions.Offering.ConcurrencyConflict':
      'This offering was changed by another user. Refresh and try again.',
    'Admissions.Offering.HasApplications':
      'This offering has applications and cannot be deleted. Deactivate it instead.',
    'Admissions.Offering.ConfigurationIncomplete':
      'Complete the required workflow, forms, and dates before activation.',
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
