import React from 'react';
import { useFormik } from 'formik';
import { LoadingButton } from '@mui/lab';
import { GlobalIcons } from 'src/utils/icons';
import { Box, TextField, DialogActions } from '@mui/material';
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
  onSend,
  isSending = false,
}) => {
  const formik = useFormik({
    initialValues: {
      communicationChannel: ['InApp'],
      message: '',
      subject: '',
    },

    onSubmit: async (values) => {
      if (onSend) {
        try {
          await onSend(values);
        } catch {
          return;
        }
        return;
      }

      onClose();
    },
  });

  const CHANNEL_OPTIONS = [
    { value: 'InApp', label: 'In-App' },
    { value: 'Email', label: 'Email' },
    { value: 'Sms', label: 'SMS (coming soon)' },
    { value: 'WhatsApp', label: 'WhatsApp (coming soon)' },
  ];

  const placeHolderOptions = [
    { value: '[Student Name]', label: 'Student Name' },
    { value: '[Parent Name]', label: 'Parent Name' },
  ];

  return (
    <CustomDialog maxWidth="md" title="Send Instant Notification" handleClose={onClose} open={open}>
      <Scrollbar sx={{ bgcolor: 'background.neutral', p: 3, height: '400px' }}>
        <Box p={2}>
          <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} gap={2} mt={2} mb={2}>
            <CustomSelect
              label="Select Communication Channels"
              options={CHANNEL_OPTIONS}
              onChange={(e) => formik.setFieldValue('communicationChannel', e)}
              value={formik.values.communicationChannel}
              multiple
              formControlProps={{ sx: { width: '100%', mt: 2 } }}
            />
            <TextField
              size="small"
              label="Subject"
              value={formik.values.subject}
              onChange={(event) => formik.setFieldValue('subject', event.target.value)}
              sx={{ width: '100%', mt: 2 }}
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
        <LoadingButton
          startIcon={<Iconify icon={GlobalIcons.sendNotification} />}
          size="small"
          variant="contained"
          loading={isSending}
          disabled={isSending}
          onClick={() => {
            formik.handleSubmit();
          }}
        >
          Send
        </LoadingButton>
      </DialogActions>
    </CustomDialog>
  );
};

export default SendInstantNotificationDialog;
