import React, { useState } from 'react';

import {
  Box,
  Grid,
  Button,
  Checkbox,
  TextField,
  Typography,
  FormControlLabel,
} from '@mui/material';

import { GlobalIcons } from 'src/utils/icons';

import { Iconify } from 'src/components/iconify/iconify';
import { UploadBox } from 'src/components/upload/upload-box';

const SendAlertToOthers = () => {
  const [whatsappMedia, setWhatsappMedia] = useState<any>(null);
  const [isSendAlertCtadisabled, setSendAlertCtadisabled] = useState<any>(true);

  const handleMediaUpload = (files: any) => {
    if (files.length > 0) {
      const file = files[0];

      // Validate file type (allow images, videos, and documents)
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'video/mp4', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Invalid file type. Allowed: PNG, JPG, MP4, PDF.');
        return;
      }

      setWhatsappMedia(file);
    }
  };

  const [selectedMethods, setSelectedMethods] = useState<any>({
    sms: false,
    email: false,
    whatsapp: false,
  });

  const [formData, setFormData] = useState<any>({
    emailRecipients: '',
    ccRecipients: '',
    emailSubject: '',
    emailContent: '',
    phoneRecipients: '',
    smsContent: '',
    whatsappRecipients: '',
    whatsappMessage: '',
    whatsappMedia: null,
  });

  const handleCheckboxChange = (method: any) => {
    setSelectedMethods((prev: any) => ({
      ...prev,
      [method]: !prev[method],
    }));

    const anySelected = Object.values(selectedMethods).some((value) => value === true);

    if (anySelected) {
      setSendAlertCtadisabled(false);
    } else {
      setSendAlertCtadisabled(true);
    }
  };

  const handleInputChange = (event: any) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleFileChange = (event: any) => {
    setFormData({ ...formData, whatsappMedia: event.target.files[0] });
  };

  return (
    <Box p={3} sx={{ margin: 'auto', boxShadow: 3, borderRadius: 2 }}>
      <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" gutterBottom>
            Select Communication channels
          </Typography>

          {/* Alert Method Selection */}
          <Box display="flex" gap={2} mb={2}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedMethods.sms}
                  onChange={() => handleCheckboxChange('sms')}
                />
              }
              label="SMS"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedMethods.email}
                  onChange={() => handleCheckboxChange('email')}
                />
              }
              label="Email"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedMethods.whatsapp}
                  onChange={() => handleCheckboxChange('whatsapp')}
                />
              }
              label="WhatsApp"
            />
          </Box>
        </Box>

        <Box>
          <Button variant="outlined" startIcon={<Iconify icon={GlobalIcons.alertIcon} />} fullWidth>
            Send Alert
          </Button>
        </Box>
      </Box>

      <Grid container spacing={2}>
        {/* Email Fields */}
        {selectedMethods.email && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Recipients (comma-separated)"
                name="emailRecipients"
                value={formData.emailRecipients}
                onChange={handleInputChange}
                placeholder="e.g., user1@example.com, user2@example.com"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="CC Recipients (comma-separated)"
                name="ccRecipients"
                value={formData.ccRecipients}
                onChange={handleInputChange}
                placeholder="e.g., cc1@example.com, cc2@example.com"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Subject"
                name="emailSubject"
                value={formData.emailSubject}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Email Content"
                name="emailContent"
                value={formData.emailContent}
                onChange={handleInputChange}
                placeholder="Enter email message here..."
              />
            </Grid>
          </>
        )}

        {/* SMS Fields */}
        {selectedMethods.sms && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="SMS Recipients (comma-separated)"
                name="phoneRecipients"
                value={formData.phoneRecipients}
                onChange={handleInputChange}
                placeholder="e.g., 9876543210, 9123456789"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="SMS Message"
                name="smsContent"
                value={formData.smsContent}
                onChange={handleInputChange}
                placeholder="Enter SMS message here..."
              />
            </Grid>
          </>
        )}

        {/* WhatsApp Fields */}
        {selectedMethods.whatsapp && (
          <>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="WhatsApp Recipients (comma-separated)"
                name="whatsappRecipients"
                value={formData.whatsappRecipients}
                onChange={handleInputChange}
                placeholder="e.g., 9876543210, 9123456789"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="WhatsApp Message"
                name="whatsappMessage"
                value={formData.whatsappMessage}
                onChange={handleInputChange}
                placeholder="Enter WhatsApp message here..."
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Attach Media (Optional)</Typography>
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
                    <Typography variant="body2">Upload Document</Typography>
                  </Box>
                }
                sx={{
                  py: 2.5,
                  width: '100%',
                  height: 'auto',
                  borderRadius: 1.5,
                }}
              />
            </Grid>

            {/* Show Uploaded File Name */}
            {whatsappMedia && (
              <Grid item xs={12}>
                <Typography variant="body2" color="textSecondary">
                  Selected File: {whatsappMedia.name}
                </Typography>
              </Grid>
            )}
          </>
        )}
      </Grid>

      {/* <Box mt={2}>
                <Button variant="contained" color="primary" fullWidth>
                    Send Alert
                </Button>
            </Box> */}
    </Box>
  );
};

export default SendAlertToOthers;
