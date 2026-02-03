import React from 'react';
import { Stack } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

import SchoolWiseAnnouncementDetailCard from './SchoolWiseAnnouncementDetails2';
import SchoolWiseAnnouncementDetailsInfoCard from './SchoolWiseAnnouncementDetailsInfoCard';

import type { ISchoolWiseAnnouncement } from '../../type';

const SchoolManagementViewDetails = ({
  announcement,
}: {
  announcement: ISchoolWiseAnnouncement | null;
}) => (
  <Scrollbar sx={{ maxHeight: 600, p: 2 }}>
    <Stack spacing={3}>
      <SchoolWiseAnnouncementDetailsInfoCard announcement={announcement} />
      <SchoolWiseAnnouncementDetailCard announcement={announcement} />
    </Stack>
  </Scrollbar>
);

export default SchoolManagementViewDetails;
