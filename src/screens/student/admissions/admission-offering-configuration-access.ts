import type { AdmissionOffering } from 'src/redux/student/admissions/admission-offerings-api';

type OfferingSetup = Pick<
  AdmissionOffering,
  | 'isActive'
  | 'applicationCount'
  | 'inquiryCount'
  | 'hasConfigurationUsage'
  | 'canEditConfiguration'
>;

export function getOfferingConfigurationAccess(offering: OfferingSetup) {
  const hasUsage =
    offering.hasConfigurationUsage === true ||
    offering.applicationCount > 0 ||
    (offering.inquiryCount ?? 0) > 0;
  const usageKnown =
    typeof offering.inquiryCount === 'number' &&
    typeof offering.hasConfigurationUsage === 'boolean';
  const locked =
    offering.isActive || hasUsage || !usageKnown || offering.canEditConfiguration !== true;
  return {
    hasUsage,
    locked,
    canDeactivateToEdit: offering.isActive && usageKnown && !hasUsage,
    helpText: hasUsage
      ? 'Workflow and forms are locked after the first inquiry or application. Deactivating this offering will not unlock the setup.'
      : !usageKnown
        ? 'Setup changes are unavailable. Refresh the offering to check its latest usage and editing status.'
        : offering.isActive
          ? 'Deactivate this unused offering before changing its workflow or forms. Validate the updated setup before activating it again.'
          : locked
            ? 'Setup changes are unavailable. Refresh the offering to check its latest usage and editing status.'
            : 'Choose a published workflow and inquiry form. The registration form comes from the workflow’s Form stage.',
  };
}
