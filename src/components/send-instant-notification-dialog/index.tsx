import React from 'react';
import { useFormik } from 'formik';

import { Box, Button, DialogActions } from '@mui/material';

import CustomPlaceholderInput from 'src/screens/student/studentNotification/textfiled-for-message-with-placeholder';

import { Scrollbar } from '../scrollbar';
import CustomDialog from '../customDialog';
import CustomSelect from '../custom-select';

interface SendInstantNotificationDialogProps {
  open: boolean;
  onClose: () => void;
  data: any;
  userList: any;
}

const SendInstantNotificationDialog: React.FC<SendInstantNotificationDialogProps> = ({
  open,
  onClose,
  data,
  userList,
}) => {
  console.log(userList, 'userList');

  const formik = useFormik({
    initialValues: {
      communicationChannel: [],
      message: '',
    },

    onSubmit: async (values) => {
      onClose();
      console.log(values);
    },
  });

  const CHANNEL_OPTIONS = [
    { value: 'WhatsApp', label: 'WhatsApp' },
    { value: 'Email', label: 'Email' },
    { value: 'Message', label: 'Message' },
  ];

  const placeHolderOptions = [
    { value: '[Student Name]', label: 'Student Name' },
    { value: '[Parent Name]', label: 'Parent Name' },
  ];

  return (
    <CustomDialog maxWidth="md" title="Send Instant Notification" handleClose={onClose} open={open}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: '400px' }}>
        <Box p={2}>
          <Box display="flex" gap={2} mt={2} mb={2}>
            <CustomSelect
              label="Select Communication Channels"
              options={CHANNEL_OPTIONS}
              onChange={(e) => formik.setFieldValue('communicationChannel', e)}
              value={formik.values.communicationChannel}
              multiple
              formControlProps={{ sx: { width: '100%', mt: 2 } }}
            />
          </Box>

          <CustomPlaceholderInput
            value={formik.values.message}
            onChange={(e) => formik.setFieldValue('message', e)}
            placeholderOptions={placeHolderOptions}
          />
        </Box>
      </Scrollbar>
      <DialogActions>
        <Button
          size="small"
          variant="contained"
          onClick={() => {
            formik.handleSubmit();
          }}
        >
          Send
        </Button>
      </DialogActions>
    </CustomDialog>
  );
};

export default SendInstantNotificationDialog;
