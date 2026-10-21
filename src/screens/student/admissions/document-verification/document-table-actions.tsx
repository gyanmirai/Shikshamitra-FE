import type { AdmissionDocumentRequirement } from 'src/redux/student/admissions/admission-document-types';

import { GlobalIcons } from 'src/utils/icons';

import { DocumentFileControl } from './document-file-control';

import type { useDocumentPermissions } from './use-document-permissions';

export function DocumentTableActions({
  requirement,
  permissions,
  onView,
}: {
  requirement: AdmissionDocumentRequirement;
  permissions: ReturnType<typeof useDocumentPermissions>;
  onView?: () => void;
}) {
  return (
    <DocumentFileControl
      label={`View document for ${requirement.name}`}
      icon={GlobalIcons.eye}
      disabled={!permissions.view || !onView}
      reason={
        !permissions.view
          ? 'Document access permission is required.'
          : 'Document details are unavailable.'
      }
      onClick={onView}
    />
  );
}
