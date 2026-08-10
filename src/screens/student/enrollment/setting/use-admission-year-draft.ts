import type {
  AdmissionCrmAdmissionYearSetupDto,
  UpdateAdmissionCrmAdmissionYearSetupDto,
} from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import { AdmissionCrmAdmissionYearSetupStatus } from 'src/redux/student/admissions-crm/setup-playbooks-contracts';

import {
  useGetAdmissionCrmAdmissionYearVersionsQuery,
  useUpdateAdmissionCrmAdmissionYearDraftMutation,
  useCreateAdmissionCrmAdmissionYearDraftMutation,
} from 'src/redux/student/admissions-crm/setup-playbooks-api';

const toUpdateBody = (
  setup: AdmissionCrmAdmissionYearSetupDto,
  patch: Partial<UpdateAdmissionCrmAdmissionYearSetupDto>
): UpdateAdmissionCrmAdmissionYearSetupDto => ({
  concurrencyStamp: setup.concurrencyStamp,
  inquiryOpenDate: setup.inquiryOpenDate,
  inquiryCloseDate: setup.inquiryCloseDate,
  registrationCloseDate: setup.registrationCloseDate,
  activationTargetDate: setup.activationTargetDate,
  entranceExamRequired: setup.entranceExamRequired,
  financeVerificationRequired: setup.financeVerificationRequired,
  placementTiming: setup.placementTiming,
  defaultOwnerUserId: setup.defaultOwnerUserId ?? null,
  targetStandardIds: [...setup.targetStandardIds],
  routeTypes: [...setup.routeTypes],
  stepOwners: { ...setup.stepOwners },
  ...patch,
});

export function useAdmissionYearDraft(academicYearId: string) {
  const versionsQuery = useGetAdmissionCrmAdmissionYearVersionsQuery({ academicYearId });
  const [createDraft, createState] = useCreateAdmissionCrmAdmissionYearDraftMutation();
  const [updateDraft, updateState] = useUpdateAdmissionCrmAdmissionYearDraftMutation();
  const versions = versionsQuery.data || [];
  const draft = versions.find(
    (version) => version.status === AdmissionCrmAdmissionYearSetupStatus.Draft
  );
  const published = versions.find(
    (version) => version.status === AdmissionCrmAdmissionYearSetupStatus.Published
  );

  const ensureDraft = async () => draft || createDraft({ academicYearId }).unwrap();

  const savePatch = async (
    patch: Partial<UpdateAdmissionCrmAdmissionYearSetupDto>,
    source?: AdmissionCrmAdmissionYearSetupDto
  ) => {
    const editable = source || draft || (await ensureDraft());
    return updateDraft({
      id: editable.id,
      body: toUpdateBody(editable, patch),
    }).unwrap();
  };

  return {
    versionsQuery,
    draft,
    published,
    effective: draft || published || null,
    ensureDraft,
    savePatch,
    isCreating: createState.isLoading,
    isSaving: updateState.isLoading,
  };
}
