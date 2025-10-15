import React from 'react';
import { Box } from '@mui/material';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import {
  AnnouncementStatus,
  AnnouncementStatusColor,
} from 'src/enums/communication_announcement_status_type';

import SchoolWiseAnnouncementDetailCard from './SchoolWiseAnnouncementDetails2';
import SchoolWiseAnnouncementDetailsInfoCard from './SchoolWiseAnnouncementDetailsInfoCard';

import type { ISchoolWiseAnnouncement } from '../../type';

const SchoolManagementViewDetails = ({
  announcement,
}: {
  announcement: ISchoolWiseAnnouncement | null;
}) => (
  <Scrollbar sx={{ height: '400px', p: 2 }}>
    <Box
      sx={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', gap: 1, mb: 1 }}
    >
      <Label
        variant="soft"
        color={AnnouncementStatusColor[announcement?.status as AnnouncementStatus] as any}
      >
        {AnnouncementStatus[announcement?.status as AnnouncementStatus]}
      </Label>
    </Box>
    <SchoolWiseAnnouncementDetailsInfoCard announcement={announcement} />
    <SchoolWiseAnnouncementDetailCard announcement={announcement} />
  </Scrollbar>
);

export default SchoolManagementViewDetails;
