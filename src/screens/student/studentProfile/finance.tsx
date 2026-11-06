import { financePaths, financePermissions } from 'src/constants/finance-menu';

import { StudentRelatedUnavailable } from './student-related-unavailable';

import type { StudentTabsComponentType } from '.';

export default function Finance({ tabs }: StudentTabsComponentType) {
  return (
    <StudentRelatedUnavailable
      title="Finance"
      message="Student fee records are unavailable here."
      onOverview={tabs ? () => tabs.setValue('overview') : undefined}
      destination={{
        href: financePaths.fees.collections,
        label: 'Open fee collections',
        permission: financePermissions.fees.collections,
      }}
    />
  );
}
