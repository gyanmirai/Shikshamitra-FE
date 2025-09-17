import React from 'react';
import { Scrollbar } from 'src/components/scrollbar';

import ClassWiseAnnouncementDetailCard from './ClassWiseAnnoucementDetail2';
import ClassWiseAnnouncementDetailsInfoCard from './ClassWiseAnnouncementInfo';

import type { IClassWiseAnnouncement } from '../../type';

const ClassManagementViewDetails = ({
  announcement,
}: {
  announcement: IClassWiseAnnouncement | null;
}) => (
  <Scrollbar sx={{ height: '400px', p: 2 }}>
    <ClassWiseAnnouncementDetailsInfoCard announcement={announcement} />
    <ClassWiseAnnouncementDetailCard announcement={announcement} />
  </Scrollbar>
);

export default ClassManagementViewDetails;
