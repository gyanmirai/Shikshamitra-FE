import React, { useState } from 'react';

import { Box, Tab, Tabs, Button, TextField, Typography } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { UploadBox } from 'src/components/upload/upload-box';

interface CommunicationChannelProps {
  mobileRecipients: any;
  emailRecipents: any;

  handleInputChange: (event: any) => void;
  forCustomAlerts: boolean;
}

const CommunicationChannel: React.FC<CommunicationChannelProps> = ({
  mobileRecipients,
  emailRecipents,

  handleInputChange,
  forCustomAlerts,
}) => {
  const [value, setValue] = useState(0); // State to manage selected tab

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue); // Switch to the selected tab
  };

  const handleMediaUpload = (files: any) => {
    if (files.length > 0) {
      const file = files[0];

      // Validate file type (allow images, videos, and documents)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'video/mp4', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Allowed: PNG, JPG, MP4, PDF.');
      }
    }
  };

  return (
    <Box>
      {/* Tabs for switching between communication channels */}
      <Tabs
        value={value}
        onChange={handleTabChange}
        aria-label="Communication Channels"
        sx={{ mb: 2 }}
      >
        <Tab label="Email" />
        <Tab label="SMS" />
        <Tab label="WhatsApp" />
      </Tabs>

      {/* Email Channel */}
      {value === 0 && (
        <>
          <TextField
            label="Email Recipients"
            name="emailRecipients"
            fullWidth
            value={emailRecipents}
            onChange={handleInputChange}
            sx={{ mb: 1 }}
            disabled={forCustomAlerts}
          />
          <TextField
            label="Email Content"
            name="emailContent"
            multiline
            rows={3}
            fullWidth
            value=""
            onChange={handleInputChange}
            sx={{ mb: 1 }}
          />
          <UploadBox
            onDrop={(acceptedFiles) => handleMediaUpload(acceptedFiles)}
            placeholder={
              <Box
                sx={{
                  gap: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.disabled',
                  flexDirection: 'column',
                }}
              >
                <Iconify icon="eva:cloud-upload-fill" width={40} />
                <Typography variant="body2">Upload Document (Optional)</Typography>
              </Box>
            }
            sx={{
              py: 2.5,
              width: '100%',
              height: 'auto',
              borderRadius: 1.5,
            }}
          />
          <Box
            pt="20px"
            display="flex"
            flexDirection="row"
            justifyItems="flex-end"
            justifyContent="flex-end"
          >
            <Button
              startIcon={<Iconify icon="lsicon:send-outline" />}
              variant="outlined"
              color="primary"
              size="small"
              sx={{ mb: 1 }}
            >
              Send
            </Button>
          </Box>
        </>
      )}

      {/* SMS Channel */}
      {value === 1 && (
        <>
          <TextField
            label="SMS Recipients"
            name="smsRecipients"
            fullWidth
            value={mobileRecipients}
            onChange={handleInputChange}
            sx={{ mb: 1 }}
            disabled={forCustomAlerts}
          />
          <TextField
            label="SMS Content"
            name="smsContent"
            multiline
            rows={3}
            fullWidth
            onChange={handleInputChange}
          />
          <Box
            pt="20px"
            display="flex"
            flexDirection="row"
            justifyItems="flex-end"
            justifyContent="flex-end"
          >
            <Button
              startIcon={<Iconify icon="lsicon:send-outline" />}
              variant="outlined"
              color="primary"
              size="small"
              sx={{ mb: 1 }}
            >
              Send
            </Button>
          </Box>
        </>
      )}

      {/* WhatsApp Channel */}
      {value === 2 && (
        <>
          <TextField
            label="WhatsApp Recipients"
            name="whatsappRecipients"
            fullWidth
            value={mobileRecipients}
            onChange={handleInputChange}
            sx={{ mb: 1 }}
            disabled={forCustomAlerts}
          />
          <TextField
            label="WhatsApp Message"
            name="whatsappMessage"
            multiline
            rows={3}
            fullWidth
            onChange={handleInputChange}
            sx={{ mb: 1 }}
          />

          <UploadBox
            onDrop={(acceptedFiles) => handleMediaUpload(acceptedFiles)}
            placeholder={
              <Box
                sx={{
                  gap: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  color: 'text.disabled',
                  flexDirection: 'column',
                }}
              >
                <Iconify icon="eva:cloud-upload-fill" width={40} />
                <Typography variant="body2">Upload Document (Optional)</Typography>
              </Box>
            }
            sx={{
              py: 2.5,
              width: '100%',
              height: 'auto',
              borderRadius: 1.5,
            }}
          />
          <Box
            pt="20px"
            display="flex"
            flexDirection="row"
            justifyItems="flex-end"
            justifyContent="flex-end"
          >
            <Button
              startIcon={<Iconify icon="lsicon:send-outline" />}
              variant="outlined"
              color="primary"
              size="small"
              sx={{ mb: 1 }}
            >
              Send
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default CommunicationChannel;
