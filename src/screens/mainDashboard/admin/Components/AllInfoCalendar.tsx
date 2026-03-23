import React from 'react';
import { Card } from '@mui/material';
import CommonCalender from 'src/components/calender';

import { DashboardWidgetWrapper } from '../../component/dashboard-widget-wrapper';

const AllInfoCalendar = () => (
  <Card sx={{ height: '100%' }}>
    <DashboardWidgetWrapper title="Events and Holidays">
      <CommonCalender
        data={[]}
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
    </DashboardWidgetWrapper>
  </Card>
);

export default AllInfoCalendar;
