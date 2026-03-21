import React from 'react';
import { Box } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

import ViewMeetingDetail from './meeting-details/ViewMeetingDetail';
import ViewMeetingMode from './meeting-details/ViewMeetingModeDetails';
import ViewMeetingDescription from './meeting-details/ViewMeetingDescrption';

import type { IMeeting } from './type';

const MeetingDetails = ({ meeting }: { meeting: IMeeting | null }) => (
  <Box>
    <Scrollbar sx={{ height: '400px' }}>
      <ViewMeetingDetail meeting={meeting} />
      <ViewMeetingDescription meeting={meeting} />
      <ViewMeetingMode meeting={meeting} />
    </Scrollbar>
  </Box>
);

export default MeetingDetails;
