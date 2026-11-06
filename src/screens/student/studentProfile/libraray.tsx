import { libraryPaths, libraryPermissions } from 'src/constants/library-menus';

import { StudentRelatedUnavailable } from './student-related-unavailable';

import type { StudentTabsComponentType } from '.';

export default function Library({ tabs }: StudentTabsComponentType) {
  return (
    <StudentRelatedUnavailable
      title="Library"
      message="Student library records are unavailable here."
      onOverview={tabs ? () => tabs.setValue('overview') : undefined}
      destination={{
        href: libraryPaths.issueReturn,
        label: 'Open library issue and return',
        permission: libraryPermissions.issueReturn,
      }}
    />
  );
}
