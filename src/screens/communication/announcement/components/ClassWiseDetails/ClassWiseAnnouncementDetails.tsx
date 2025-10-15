import React from 'react';
import { Box } from '@mui/material';
import { Label } from 'src/components/label';
import { Scrollbar } from 'src/components/scrollbar';
import {
  AnnouncementStatus,
  AnnouncementStatusColor,
} from 'src/enums/communication_announcement_status_type';

import ClassWiseAnnouncementDetailCard from './ClassWiseAnnoucementDetail2';
import ClassWiseAnnouncementDetailsInfoCard from './ClassWiseAnnouncementInfo';

import type { IClassWiseAnnouncement } from '../../type';

const ClassManagementViewDetails = ({
  announcement,
}: {
  announcement: IClassWiseAnnouncement | null;
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
    <ClassWiseAnnouncementDetailsInfoCard announcement={announcement} />
    <ClassWiseAnnouncementDetailCard announcement={announcement} />
  </Scrollbar>
);

export default ClassManagementViewDetails;
