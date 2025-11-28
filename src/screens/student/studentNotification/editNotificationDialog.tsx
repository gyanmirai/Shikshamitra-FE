import { Editor } from 'src/components/editor';
import React, { useState, useEffect } from 'react';
import { Scrollbar } from 'src/components/scrollbar';
import CustomSelect from 'src/components/custom-select';
import CancelButton from 'src/components/cancel-button';
import SubmitButton from 'src/components/submit-button';
import { BackPopUpChecked } from 'src/components/back-popup-check/BackPopUpCheck';
import { Box, Grid, Switch, Typography, DialogActions, FormControlLabel } from '@mui/material';

import type {
  IRecipient,
  INotificationData,
  IEditNotificationDialogProps,
} from './editNotificationDialogInterface';

const CHANNEL_OPTIONS = [
  { value: 'In-App', label: 'In-App' },
  { value: 'WhatsApp', label: 'WhatsApp' },
  { value: 'Email', label: 'Email' },
  { value: 'Message', label: 'Message' },
];

const EditNotificationDialog: React.FC<IEditNotificationDialogProps> = ({
  onClose,
  data,
  isFromView,
}) => {
  const [notification, setNotification] = useState<INotificationData>(data);

  useEffect(() => {
    setNotification(data);
  }, [data]);

  const updateRecipient = (name: string, key: keyof IRecipient, value: any) => {
    if (!isFromView) {
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
    <BackPopUpChecked initialValues={data} currentValues={notification}>
      <Box display="flex" flexDirection="column" height="100%">
        <Scrollbar
          sx={{
            p: 2,
            flex: 1,
            '& .simplebar-wrapper': {
              display: 'flex',
              flexDirection: 'column',
            },
          }}
        >
          <Box display="flex" gap={2} alignItems="center" justifyContent="space-between">
            <Box display="flex" flexDirection="column" mt={1}>
              <Typography variant="body2" color="text.secondary">
                Event Name
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {notification.event || '-'}
              </Typography>
            </Box>

            <Box display="flex" flexDirection="column" mt={1}>
              <Typography variant="body2" color="text.secondary">
                Trigger Condition
              </Typography>
              <Typography variant="body1" fontWeight="medium">
                {notification.triggerCondition || '-'}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {notification.recipient.map((recipient) => (
              // <Box key={recipient.name} p={2} border="1px solid #ddd" borderRadius="8px">
              <Grid
                size={{ md: 6 }}
                key={recipient.name}
                p={2}
                borderRadius="8px"
                boxShadow="var(--shadows-8)"
              >
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle2">
                    {recipient.name.charAt(0).toUpperCase() + recipient.name.slice(1)}{' '}
                  </Typography>

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
                    label={`Notification For ${recipient.name}`}
                  />
                </Box>
                <Box display="flex" gap={2} mt={2} mb={2}>
                  <CustomSelect
                    label="Communication Channels"
                    options={CHANNEL_OPTIONS}
                    onChange={(val) => updateRecipient(recipient.name, 'communicationChannel', val)}
                    value={recipient.communicationChannel}
                    multiple
                    formControlProps={{ sx: { width: '100%', mt: 2 } }}
                    disabled={isFromView}
                  />
                </Box>

                <Editor
                  mentionable
                  mentionItems={
                    recipient.placeHolderOptions?.map((item: any) => ({
                      id: item.value,
                      label: item.label,
                    })) ?? []
                  }
                  value={recipient.message}
                  onChange={(value) => updateRecipient(recipient.name, 'message', value)}
                  placeholder="Message"
                  editable={!isFromView}
                  error={false}
                />
              </Grid>
            ))}
          </Grid>
        </Scrollbar>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            justifyContent: 'flex-end',
            background: 'transparent',
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
    </BackPopUpChecked>
  );
};

export default EditNotificationDialog;
