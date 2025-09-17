import React from 'react';
import { Box } from '@mui/material';
import { Scrollbar } from 'src/components/scrollbar';

import ViewMeetingDetail from './MeetingDetails/ViewMeetingDetail';
import ViewMeetingMode from './MeetingDetails/ViewMeetingModeDetails';
import ViewMeetingDescription from './MeetingDetails/ViewMeetingDescrption';

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
