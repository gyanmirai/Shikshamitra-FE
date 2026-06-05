type OrganizationOptionLike = {
  id: string;
  name?: string;
  label?: string;
};

export const shouldClearSelectedOrganization = (
  selectedMediumStageId: string,
  organizationOptions: OrganizationOptionLike[],
  organizationOptionsLoading: boolean
) =>
  Boolean(
    selectedMediumStageId &&
    !organizationOptionsLoading &&
    !organizationOptions.some((org) => org.id === selectedMediumStageId)
  );

export const resolveLeaveRequestDetailLabels = ({
  detail,
  editData,
  organizationName,
  currentYearName,
}: {
  detail: any;
  editData: any;
  organizationName?: string;
  currentYearName?: string;
}) => ({
  academicYearLabel:
    detail?.academicYearName ||
    detail?.academicYear?.name ||
    detail?.academicYear ||
    editData?.academicYearName ||
    editData?.academicYear?.name ||
    currentYearName ||
    '-',
  organizationLabel:
    detail?.mediumStageName ||
    detail?.organizationName ||
    organizationName ||
    editData?.organization ||
    editData?.employee?.educationMediumStage?.name ||
    '-',
});
