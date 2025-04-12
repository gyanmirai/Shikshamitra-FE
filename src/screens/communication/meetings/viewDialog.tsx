'use client';

import { Button, DialogActions, DialogContent } from '@mui/material';

import CustomDialog from 'src/components/customDialog';

import MeetingDetails from './meetingDetails';

import type { IViewMeetingDialogProps } from './type';

const ViewMeetingDialog: React.FC<IViewMeetingDialogProps> = ({
  open,
  onClose,
  meeting,
}: IViewMeetingDialogProps) => (
  <CustomDialog title="Meeting Details" open={open} handleClose={onClose} maxWidth="md">
    <DialogContent>
      <MeetingDetails meeting={meeting} onClose={onClose} />
    </DialogContent>
    <DialogActions>
      <Button onClick={onClose} variant="outlined">
        Close
      </Button>
    </DialogActions>
  </CustomDialog>
);

export default ViewMeetingDialog;
