import React, { useState, useEffect } from 'react';

import {
  Box,
  Grid,
  Card,
  Button,
  Switch,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

import CustomSelect from 'src/components/custom-select';

import CustomPlaceholderInput from './textfiled-for-message-with-placeholder';

interface Recipient {
  name: string;
  message: string;
  communicationChannel: string[];
  placeHolder: string[];
  division?: string;
  standard?: string;
  placeHolderOptions?: any;
  isEnable: boolean;
}

interface NotificationData {
  id: string;
  event: string;
  triggerCondition: string;
  recipient: Recipient[];
  communicationChannel: string[];
}

interface EditNotificationDialogProps {
  onClose: () => void;
  data: NotificationData;
  isFromView?: boolean;
}

const CHANNEL_OPTIONS = [
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Email', label: 'Email' },
  { value: 'Message', label: 'Message' },
];

const ALL_RECIPIENT_OPTIONS = [
  { value: 'parent', label: 'Parent' },
  { value: 'counselor', label: 'Counselor' },
  { value: 'student', label: 'Student' },
];

const DIVISION_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'A', label: 'A' },
  { value: 'B', label: 'B' },
  { value: 'C', label: 'C' },
];

const STANDARD_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: '1', label: '1' },
  { value: '2', label: '2' },
  { value: '3', label: '3' },
];

const STUDENT_OPTIONS = [
  { value: 'student1', label: 'Student 1' },
  { value: 'student2', label: 'Student 2' },
  { value: 'student3', label: 'Student 3' },
];

const EditNotificationDialog: React.FC<EditNotificationDialogProps> = ({
  onClose,
  data,
  isFromView,
}) => {
  const [notification, setNotification] = useState<NotificationData>(data);

  useEffect(() => {
    setNotification(data);
  }, [data]);

  const updateRecipient = (name: string, key: keyof Recipient, value: any) => {
    if (!isFromView) {
      console.log('updateRecipient called with:', name, key, value);
      setNotification((prev) => ({
        ...prev,
        recipient: prev.recipient.map((r) => (r.name === name ? { ...r, [key]: value } : r)),
      }));
    }
  };

  const handleToggle = (name: string, isChecked: boolean) => {
    setNotification((prev) => ({
      ...prev,
      recipient: prev.recipient.map((r) => (r.name === name ? { ...r, isEnable: isChecked } : r)),
    }));
  };

  return (
    <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
      <Box p={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Box display="flex" gap={2} alignItems="center">
          <Box display="flex" flexDirection="row" gap={2} mt={1}>
            <Typography fontWeight="bold">Event Name:</Typography>
            <Typography>{notification.event}</Typography>
          </Box>
          <Box display="flex" flexDirection="row" gap={2} mt={1}>
            <Typography fontWeight="bold">Trigger Condition:</Typography>
            <Typography>{notification.triggerCondition}</Typography>
          </Box>
        </Box>

        {/* <Box display="flex" gap={2} mb={2} mt={2}>

                    <CustomSelect
                        label="Select Standard"
                        options={STANDARD_OPTIONS}
                        onChange={(val) => console.log(val)}
                        value=''
                        formControlProps={{ sx: { width: '50%' } }}
                        disabled={isFromView}
                    />
                    <CustomSelect
                        label="Select Division"
                        options={DIVISION_OPTIONS}
                        onChange={(val) => console.log(val)}
                        value=''
                        formControlProps={{ sx: { width: '50%' } }}
                        disabled={isFromView}
                    />
                    <CustomSelect
                        label="Select Student"
                        options={STUDENT_OPTIONS}
                        onChange={(val) => console.log(val)}
                        value=''
                        formControlProps={{ sx: { width: '50%' } }}
                        disabled={isFromView}
                    />
                </Box> */}

        <Box display="flex" flexWrap="wrap" gap={4}>
          {notification.recipient.map((recipient) => {
            console.log('recipient', recipient);
            return (
              <Box
                key={recipient.name}
                width="49%"
                mt={3}
                p={2}
                border="1px solid #ddd"
                borderRadius="8px"
              >
                <Grid item xl={6}>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Box display="flex" gap={2} alignItems="center">
                      <Typography variant="subtitle1">
                        {recipient.name.charAt(0).toUpperCase() + recipient.name.slice(1)}{' '}
                        Notification
                      </Typography>
                    </Box>

                    <FormControlLabel
                      disabled={isFromView}
                      control={
                        <Switch
                          disabled={isFromView}
                          checked={recipient.isEnable}
                          onChange={(e) => handleToggle(recipient.name, e.target.checked)}
                          name={`On Notification For ${recipient.name}`}
                        />
                      }
                      label={`On Notification For ${recipient.name}`}
                    />

                    {/* <Button  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />} color="error" onClick={() => removeRecipient(recipient.name)} /> */}
                  </Box>
                  <Box display="flex" gap={2} mt={2} mb={2}>
                    <CustomSelect
                      label="Select Communication Channels"
                      options={CHANNEL_OPTIONS}
                      onChange={(val) =>
                        updateRecipient(recipient.name, 'communicationChannel', val)
                      }
                      value={recipient.communicationChannel}
                      multiple
                      formControlProps={{ sx: { width: '100%', mt: 2 } }}
                      disabled={isFromView}
                    />
                  </Box>

                  <CustomPlaceholderInput
                    isFromView={isFromView ?? false}
                    value={recipient.message}
                    onChange={(newValue: string) =>
                      updateRecipient(recipient.name, 'message', newValue)
                    }
                    placeholderOptions={recipient.placeHolderOptions ?? []}
                  />
                </Grid>
              </Box>
            );
          })}
        </Box>

        <DialogActions
          sx={{
            flexGrow: '1',
            display: 'flex',
            alignItems: 'end',
          }}
        >
          <Button size="small" variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button size="small" disabled={isFromView} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Box>
    </Card>
  );
};

export default EditNotificationDialog;
