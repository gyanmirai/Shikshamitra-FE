import type { TabComponentType } from 'src/screens/hr/leave-request';

import React from 'react';

import {
  Box,
  Card,
  Grid,
  Radio,
  Button,
  Switch,
  Checkbox,
  RadioGroup,
  Typography,
  LinearProgress,
  FormControlLabel,
} from '@mui/material';

import CustomSelect from 'src/components/custom-select';

const UserPreferences = (props: TabComponentType) => (
  <Box sx={{ flexGrow: 1, p: 3 }}>
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
      <Typography variant="h6">Notification Setting</Typography>
    </Box>
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Theme Settings</Typography>
              <CustomSelect
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'auto', label: 'Auto' },
                ]}
                value=""
                label="Select Theme"
                onChange={() => {}}
              />
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Default View For Messages</Typography>
            <RadioGroup
              aria-label="message-view"
              name="message-method"
              defaultValue="allConversation"
            >
              <FormControlLabel
                value="allConversation"
                control={<Radio />}
                label="All Conversation"
              />
              <FormControlLabel
                value="recentConversation"
                control={<Radio />}
                label="Recent Conversation"
              />
              <FormControlLabel
                value="unreadConversation"
                control={<Radio />}
                label="Unread Conversation"
              />
            </RadioGroup>
          </Card>
        </Grid>
      </Grid>
    </Box>
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Typography variant="h6">Display Preferences</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <Switch
                  checked={false}
                  onChange={() => {}}
                  defaultChecked
                  inputProps={{ 'aria-label': 'controlled' }}
                />
                <Typography sx={{ mr: 2 }}>Show Images</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <Switch
                  checked={false}
                  onChange={() => {}}
                  defaultChecked
                  inputProps={{ 'aria-label': 'controlled' }}
                />
                <Typography sx={{ mr: 2 }}>Enable Notifications</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Language Settings</Typography>
              <CustomSelect
                options={[
                  { value: 'light', label: 'Light' },
                  { value: 'dark', label: 'Dark' },
                  { value: 'auto', label: 'Auto' },
                ]}
                value=""
                label="Prefered Language"
                onChange={() => {}}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h6">Accessibility Options</Typography>
              <RadioGroup
                aria-label="accessibility-option"
                name="accessibility-option"
                defaultValue="allConversation"
              >
                <FormControlLabel
                  value="highContactMode"
                  control={<Radio />}
                  label="High Contrast Mode"
                />
                <FormControlLabel
                  value="screenReaderSuppport"
                  control={<Radio />}
                  label="Screen Reader Support"
                />
              </RadioGroup>
              <Box display="flex" alignItems="center">
                <Checkbox size="small" checked />
                <Typography variant="body2">Text Resizing</Typography>
              </Box>
              <Box display="flex" alignItems="center">
                <Checkbox size="small" />
                <Typography variant="body2">Keyabord Navigation</Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          <Card sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box display="flex" alignItems="center">
                <Checkbox size="small" checked />
                <Typography variant="body2">Set this as default for all admin users</Typography>
              </Box>
              <Typography variant="h6">Text to Speech</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', marginTop: 2 }}>
                <Switch
                  checked={false}
                  onChange={() => {}}
                  defaultChecked
                  inputProps={{ 'aria-label': 'controlled' }}
                />
                <Typography sx={{ mr: 2 }}>Enable Text to Speech for Announcement</Typography>
              </Box>
              <Typography variant="h6">Adjust text size for better readability</Typography>
              <Box
                sx={{
                  position: 'relative',
                  height: 15,
                  borderRadius: 10,
                  bgcolor: '#e0e0e0',
                  overflow: 'hidden',
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={75}
                  sx={{
                    height: '100%',
                    borderRadius: 10,
                    backgroundColor: 'transparent',
                    '& .MuiLinearProgress-bar': {
                      borderRadius: 10,
                      backgroundColor: '#3498db',
                      transition: 'transform 0.4s ease-in-out',
                    },
                  }}
                />
                <Typography
                  variant="body2"
                  sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: '#fff',
                    fontWeight: 'bold',
                    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                  }}
                >
                  75%
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Box>
    <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}>
      <Button variant="contained">Reset to Default</Button>
      <Button variant="contained">Apply Changes</Button>
    </Box>
  </Box>
);

export default UserPreferences;
