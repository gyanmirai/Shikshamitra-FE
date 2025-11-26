import React from 'react';
import { useFormik } from 'formik';
import { GlobalIcons } from 'src/utils/icons';
import { Box, Button, DialogActions } from '@mui/material';
import CustomPlaceholderInput from 'src/screens/student/studentNotification/textfiledForMessageWithPlaceholder';

import { Scrollbar } from '../scrollbar';
import CustomDialog from '../customDialog';
import CustomSelect from '../custom-select';
import { Iconify } from '../iconify/iconify';

import type { ISendInstantNotificationDialogProps } from './send-instant-notification-interface';

const SendInstantNotificationDialog: React.FC<ISendInstantNotificationDialogProps> = ({
  open,
  onClose,
  data,
  userList,
}) => {
  const formik = useFormik({
    initialValues: {
      communicationChannel: [],
      message: '',
      template: '',
    },

    onSubmit: async (values) => {
      onClose();
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

  const templateOptions = [
    { value: 'template1', label: 'Template 1' },
    { value: 'template2', label: 'Template 2' },
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
            <CustomSelect
              label="Select Template"
              options={templateOptions}
              onChange={(e) => formik.setFieldValue('template', e)}
              value={formik.values.template}
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
          startIcon={<Iconify icon={GlobalIcons.sendNotification} />}
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
