import type { IResourceVerifiedFormValues } from './audit-verifaction-interface';

export const initialResourceVerifiedFormValues = {
  resourceStatusAfterAudit: '',
  descriptionAfterResourceAudit: '',
};

export function getInitialResourceVerifiedFormValues(
  data: Partial<IResourceVerifiedFormValues> = {},
  isEdit = false
): IResourceVerifiedFormValues {
  return {
    resourceStatusAfterAudit: isEdit ? (data.resourceStatusAfterAudit ?? '') : '',
    descriptionAfterResourceAudit: isEdit ? (data.descriptionAfterResourceAudit ?? '') : '',
  };
}
