import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';
import { useBoolean } from 'src/hooks/useBoolean';
import CustomDialog from 'src/components/custom-dialog';
import CustomSelect from 'src/components/custom-select';
import { CalendarView } from 'src/sections/calendar/view';
import { Box, Card, Button, Typography, CardContent } from '@mui/material';

const ScheduledMeetings = (props: TabComponentType) => {
  const dialog = useBoolean();
  return (
    <Box>
      <Box display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={dialog.onTrue}>
          Send Meeting Invitation
        </Button>
      </Box>
      <CalendarView />
      <CustomDialog open={dialog.value} handleClose={dialog.onFalse} title="Meeting Details">
        <Card>
          <CardContent sx={{ '& > *': { marginBottom: 2 } }}>
            <Typography variant="h6" color="primary">
              Student Name: XYZ
            </Typography>
            <Typography variant="subtitle1" color="secondary">
              Class: 09
            </Typography>
            <Typography variant="body1">Subject of the Meeting: Exam Performance</Typography>
            <CustomSelect
              options={[
                { label: 'In-Person', value: 'InPerson' },
                { label: 'Phone Call', value: 'PhoneCall' },
                { label: 'Video Call', value: 'VideoCall' },
              ]}
              value=""
              onChange={() => {}}
              label="Meeting mode"
              sx={{ marginY: 2 }}
            />
            <Typography
              variant="body2"
              sx={{ backgroundColor: '#f0f0f0', padding: 1, borderRadius: 1 }}
            >
              Notification: Meeting with <span style={{ color: '#1976d2' }}>[Teacher/Parent]</span>{' '}
              at <span style={{ color: '#d32f2f' }}>[11:00 PM]</span>
            </Typography>
          </CardContent>
        </Card>
      </CustomDialog>
    </Box>
  );
};
export default ScheduledMeetings;
