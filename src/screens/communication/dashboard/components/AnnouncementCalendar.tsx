import React from 'react';
import CommonCalender from 'src/components/calender';
import CalendarViewDialog from 'src/screens/calendar/calendar-view/components/ViewDialog';

import communicationData from '../../../../../communicationData.json';

const AnnouncementCalendar = () => (
  <>
    <CommonCalender
      data={communicationData?.schoolWiseAnnouncementData}
      showCalendarToolbar
      onDateClick={(e) => {
        // handleEventClick(e);
      }}
      // Drawer filter removed; inline controls used instead
      showCalendarFilter={false}
      containerProps={{
        sx: {
          flexGrow: 1,
          '--Paper-shadow': 'var(--shadows-0)',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '0',
        },
      }}
      canReset={false}
      nowIndicator
    />
    <CalendarViewDialog open={false} data={null} onClose={() => {}} />
  </>
);

export default AnnouncementCalendar;
