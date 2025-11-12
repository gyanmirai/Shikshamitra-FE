import type {
  IRecipient,
  INotificationData,
  IEditNotificationDialogProps,
} from 'src/screens/student/studentNotification/editNotificationDialogInterface';

import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import CustomPlaceholderInput from 'src/screens/student/studentNotification/textfiledForMessageWithPlaceholder';
import {
  Box,
  Grid,
  Card,
  Switch,
  Typography,
  DialogActions,
  FormControlLabel,
} from '@mui/material';

const CHANNEL_OPTIONS = [
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Email', label: 'Email' },
  { value: 'Message', label: 'Message' },
];

const EditNotificationDialog: React.FC<IEditNotificationDialogProps> = ({
  onClose,
  data,
  isFromView,
}) => {
  // State to store notification data
  const [notification, setNotification] = useState<INotificationData>(data);

  // Update notification data when props data changes
  useEffect(() => {
    setNotification(data);
  }, [data]);

  // Update specific recipient property in notification data
  // name: recipient name to update
  // key: property key to update (e.g. 'isEnable', 'message')
  // value: new value for the property
  const updateRecipient = (name: string, key: keyof IRecipient, value: any) => {
    if (!isFromView) {
      console.log('updateRecipient called with:', name, key, value);
      setNotification((prev) => ({
        ...prev,
        recipient: prev.recipient.map((r) => (r.name === name ? { ...r, [key]: value } : r)),
      }));
    }
  };

  // Toggle enable/disable state for a recipient
  // name: recipient name to toggle
  // isChecked: new toggle state
  const handleToggle = (name: string, isChecked: boolean) => {
    setNotification((prev) => ({
      ...prev,
      recipient: prev.recipient.map((r) => (r.name === name ? { ...r, isEnable: isChecked } : r)),
    }));
  };

  return (
    <Card sx={{ height: '100%', boxShadow: 'var(--shadows-4)' }}>
      <Box p={3} sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Scrollbar sx={{ p: 2, height: '100%' }}>
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
                  <Grid size={{ xl: 6 }}>
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
        </Scrollbar>
        <DialogActions
          sx={{
            flexGrow: '1',
            display: 'flex',
            alignItems: 'end',
          }}
        >
          <CancelButton
            onClick={() => {
              onClose();
            }}
          />
          {!isFromView && <SubmitButton onClick={() => {}} />}
        </DialogActions>
      </Box>
    </Card>
  );
};

export default EditNotificationDialog;
