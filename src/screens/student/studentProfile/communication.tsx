import { StudentRelatedUnavailable } from './student-related-unavailable';

import type { StudentTabsComponentType } from '.';

export default function Communication({ tabs }: StudentTabsComponentType) {
  return (
    <StudentRelatedUnavailable
      title="Communications"
      message="Student announcements are unavailable here."
      onOverview={tabs ? () => tabs.setValue('overview') : undefined}
    />
  );
}
