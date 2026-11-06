import { transportPaths, transportPermissions } from 'src/constants/transport-menu';

import { StudentRelatedUnavailable } from './student-related-unavailable';

import type { StudentTabsComponentType } from '.';

export default function StudentTransportProfile({ tabs }: StudentTabsComponentType) {
  return (
    <StudentRelatedUnavailable
      title="Transportation"
      message="Student transport records are unavailable here."
      onOverview={tabs ? () => tabs.setValue('overview') : undefined}
      destination={{
        href: transportPaths.applicationManagement,
        label: 'Open transport applications',
        permission: transportPermissions.applicationManagement,
      }}
    />
  );
}
