import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';

import SchoolWiseAnnouncementDetailCard from './SchoolWiseAnnouncementDetails2';
import SchoolWiseAnnouncementDetailsInfoCard from './SchoolWiseAnnouncementDetailsInfoCard';

import type { ISchoolWiseAnnouncement } from '../../type';

const SchoolManagementViewDetails = ({
  announcement,
}: {
  announcement: ISchoolWiseAnnouncement | null;
}) => (
  <Scrollbar sx={{ height: '400px', p: 2 }}>
    <SchoolWiseAnnouncementDetailsInfoCard announcement={announcement} />
    <SchoolWiseAnnouncementDetailCard announcement={announcement} />
  </Scrollbar>
);

export default SchoolManagementViewDetails;
