import type { ICalendarEvent } from 'src/types/calendar';

import React from 'react';
import CommonCalender from 'src/components/calender';
import CustomDialog from 'src/components/customDialog';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: () => void;
  events: ICalendarEvent[];
};

export default function CelebrationsCalendarDialog({ open, onClose, events }: Props) {
  return (
    <CustomDialog
      paperProps={{
        sx: {
          height: '60vh',
        },
      }}
      maxWidth="xl"
      open={open}
      handleClose={onClose}
      title="Celebrations Calendar"
    >
      <CommonCalender
        data={events}
        showCalendarToolbar
        onDateClick={(e) => {
          //   handleEventClick(e);
        }}
        containerProps={{
          sx: {
            height: '100%',
          },
        }}
        canReset={false}
        nowIndicator
      />
    </CustomDialog>
  );
}
